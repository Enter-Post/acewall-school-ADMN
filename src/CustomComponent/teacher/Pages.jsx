import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader2 } from "lucide-react"; // Lucide loader icon

const Pages = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [pageData, setPageData] = useState({
    title: "",
    description: "",
    image: null,
    files: [],
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await axiosInstance.get("/course/getindividualcourse");
        setAllCourses(res.data.courses || []);
      } catch (err) {
        toast.error("Failed to fetch courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCreatePage = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      toast.error("Please select a course.");
      return;
    }

    setIsCreating(true);

    const formData = new FormData();
    formData.append("title", pageData.title);
    formData.append("description", pageData.description);
    formData.append("course", selectedCourseId);
    if (pageData.image) formData.append("image", pageData.image);
    pageData.files.forEach((file) => formData.append("files", file));

    try {
      const res = await axiosInstance.post("/pages/createpage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Page created successfully!");
      setOpen(false);
      setPageData({ title: "", description: "", image: null, files: [] });
      setSelectedCourseId("");
      if (onCreated) onCreated(); // ✅ refresh parent
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create page");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 text-white hover:bg-green-700">+ Create Page</Button>
        </DialogTrigger>

        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePage} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                type="text"
                required
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Select Course</Label>
              <Select
                onValueChange={(value) => setSelectedCourseId(value)}
                value={selectedCourseId}
                disabled={loadingCourses}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCourses ? (
                    <SelectItem disabled>Loading...</SelectItem>
                  ) : allCourses.length === 0 ? (
                    <SelectItem disabled>No courses available</SelectItem>
                  ) : (
                    allCourses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.courseTitle}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                required
                value={pageData.description}
                onChange={(e) => setPageData({ ...pageData, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Upload Image (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPageData({ ...pageData, image: e.target.files[0] })}
              />
            </div>

            <div>
              <Label>Upload Files (optional)</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => setPageData({ ...pageData, files: Array.from(e.target.files) })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Page"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Loading Overlay */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">Creating new page...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Pages;

"use client";

import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogFooter,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  BookPlus,
  ChartBarStacked,
  CircleEllipsis,
  Eye,
  Languages,
  LibraryBig,
  Loader,
  Pen,
  Play,
  Settings,
  Users,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { CheckCircle } from "lucide-react";
import CommentSection from "@/CustomComponent/Student/CommentSection";
import DeleteCourseModal from "@/CustomComponent/CreateCourse/DeleteCourseModal";
import ChapterCreationModal from "@/CustomComponent/CreateCourse/CreatChapterModal";
import ChapterDetail from "@/Page/teacher/Courses/QuarterDetail";
import { FinalCourseAssessmentCard } from "@/CustomComponent/CreateCourse/FinalCourseAssessmentCard";
import { toast } from "sonner";
import AssessmentCategoryDialog from "@/CustomComponent/teacher/AssessmentCategoryDialog";
import RatingSection from "@/CustomComponent/teacher/RatingSection";
import { format } from "date-fns";
import { CourseContext } from "@/Context/CoursesProvider";
import { SelectSemAndQuarDialog } from "@/CustomComponent/CreateCourse/SelectSemAndQuarDialog";
import Pages from "@/CustomComponent/teacher/Pages";
import ViewCoursePosts from "@/Page/teacher/ViewCoursePosts";
import ArchiveDialog from "@/CustomComponent/teacher/ArchivedModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { set } from "lodash";
import BackButton from "@/CustomComponent/BackButton";
import CommentsRatingsToggle from "@/CustomComponent/teacher/CommentsRatingsToggle";

export default function TeacherCourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quarters, setQuarters } = useContext(CourseContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [Prevthumbnail, setPrevThumbnail] = useState(null);
  const [newthumbnail, setNewThumbnail] = useState(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleDeleteAssessment = (assessmentID) => {
    setLoading(true);
    axiosInstance
      .delete(`/assessment/delete/${assessmentID}`)
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        fetchCourseDetail();
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response?.data?.message || "Error deleting assessment");
      });
  }; // Delete Assessment
  const fetchCourseDetail = async () => {
    await axiosInstance
      .get(`course/details/${id}`)
      .then((res) => {
        setCourse(res.data.course);
        setQuarters(res.data.course.quarter);

        console.log("course data", res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/jpg"
    ) {
      toast.error("Only JPEG and PNG images are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPrevThumbnail(reader.result);
    };
    reader.readAsDataURL(file);

    setNewThumbnail(file);
  };

  const confirmChange = async () => {
    setLoadingThumbnail(true);
    await axiosInstance
      .put(
        `course/thumbnail/${id}`,
        { thumbnail: newthumbnail },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        console.log(res);
        toast.success(res.data.message || "Thumbnail updated successfully!");
        fetchCourseDetail();
        setPrevThumbnail(null);
        setNewThumbnail(null);
        setLoadingThumbnail(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingThumbnail(false);
      });
  };

  const prevSemesterIds = course?.semester?.map((sem) => sem._id) || [];
  const prevQuarterIds = course?.quarter?.map((quarter) => quarter._id) || [];

  if (!course)
    return (
      <div>
        <section className="flex justify-center items-center h-screen w-full">
          <Loader className={"animate-spin"} />
        </section>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-2 max-w-6xl">
      {course.published === false ? (
        <div className="flex items-center justify-center rounded-md bg-red-200 p-4 mb-4">
          <p className="text-sm ">
            This course is Archived. It will not be visible to students which
            are not enrolled in the course.
          </p>
        </div>
      ) : null}
      <BackButton className="mb-10" />

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-4">
            <img
              src={
                Prevthumbnail
                  ? Prevthumbnail
                  : course.thumbnail.url ||
                    "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80"
              }
              alt="Course thumbnail"
              className="w-full rounded-md object-cover aspect-video"
            />
            {Prevthumbnail ? (
              <div className="flex items-center space-x-2">
                <Button
                  className={"bg-green-600 hover:bg-green-700"}
                  onClick={confirmChange}
                >
                  {loadingThumbnail ? (
                    <Loader className={"animate-spin"} />
                  ) : (
                    "Confirm"
                  )}
                </Button>
                <Button
                  className={"bg-red-600 hover:bg-red-700"}
                  onClick={() => {
                    setPrevThumbnail(null);
                    setNewThumbnail(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  className="hidden"
                  id="thumbnail"
                  onChange={handleThumbnailChange}
                />
                <label
                  htmlFor="thumbnail"
                  className="flex items-center space-x-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-100"
                >
                  <Pen className="h-4 w-4" />
                  <span className="text-sm font-medium">Edit thumbnail</span>
                </label>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                <span>
                  Uploaded:{" "}
                  {course.createdAt
                    ? new Date(course.createdAt).toLocaleDateString("en-US", {
                        year: "2-digit",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "N/A"}
                </span>
                <span>
                  Last Updated:{" "}
                  {course.updatedAt
                    ? new Date(course.updatedAt).toLocaleDateString("en-US", {
                        year: "2-digit",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "N/A"}
                </span>
              </div>

              <h2 className="text-2xl uppercase font-semibold">
                {course.courseTitle || "Course Title"}
              </h2>
              <p className="text-muted-foreground">
                {course.courseDescription || "Course description goes here..."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4">
          <section className="flex justify-between items-center">
            <AssessmentCategoryDialog courseId={id} />
          </section>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition">
                <Settings size={16} className="mr-2" />
                Manage Course Actions
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 rounded-xl shadow-lg border border-gray-200 bg-white dark:bg-neutral-900 dark:border-neutral-700"
              align="start"
              sideOffset={8}
            >
              <DropdownMenuItem
                onClick={() => navigate(`/admin/courses/stdPreview/${id}`)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <Eye size={18} className="text-green-600" />
                Preview as a student
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate(`/admin/gradebook/${id}`)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <BookPlus size={18}  className="text-green-600" />
                Gradebook
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate(`/admin/courses/edit/${id}`)}
                className="flex items-center gap-3 py-2.5 cursor-pointer"
              >
                <Pen size={18} className="text-green-600" />
                <span>Edit Course Info</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Languages className="h-5 w-5 text-orange-500" />}
            value={course.language?.toUpperCase()}
            label="Language"
            bgColor="bg-slate-100 hover:bg-slate-200"
          />
          <StatCard
            icon={<ChartBarStacked className="h-5 w-5 text-orange-500" />}
            value={course.category?.title?.toUpperCase()}
            label="Topic"
            bgColor="bg-slate-100 hover:bg-slate-200"
          />

          <StatCard
            icon={<LibraryBig className="h-5 w-5 text-orange-500" />}
            value={course.semester?.length || 0}
            label="Semesters"
            bgColor="bg-slate-100 hover:bg-slate-200"
          />

          <StatCard
            icon={<Users className="h-5 w-5 text-orange-500" />}
            value={course.enrollments?.length}
            label="Students Enrolled"
            bgColor="bg-slate-100 hover:bg-slate-200"
          />
        </div>
        <SelectSemAndQuarDialog
          prevSelectedSemesters={prevSemesterIds}
          prevSelectedQuarters={prevQuarterIds}
          courseId={id}
          fetchCourseDetail={fetchCourseDetail}
        />
        {course?.semester?.map((semester, index) => (
          <Link
            key={semester._id}
            to={`/admin/courses/${id}/semester/${semester._id}`}
          >
            <div
              key={semester._id}
              className="mb-4 border border-gray-200 p-5 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
            >
              <h3 className="font-semibold text-md">
                Semester {index + 1}: {semester.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(semester.startDate), "MMMM do, yyyy")} -{" "}
                {format(new Date(semester.endDate), "MMMM do, yyyy")}
              </p>
            </div>
          </Link>
        ))}

        {/* Final Assessment Cards */}
        {Array.isArray(course.Assessments) &&
          course.CourseAssessments.map((assessment) => (
            <FinalCourseAssessmentCard
              key={assessment._id} // Use unique id as key
              assessment={assessment}
              handleDeleteAssessment={handleDeleteAssessment}
            />
          ))}
      </div>
      {/* Comments & Ratings Section */}
      <section className="mt-8">
        {/* <CommentsRatingsToggle
          courseId={id}
          role="admin"
          onToggle={(enabled) =>
            setCourse((prev) => ({ ...prev, commentsEnabled: enabled }))
          }
        /> */}

        {typeof course.commentsEnabled === "boolean" ? (
          course.commentsEnabled ? (
            <>
              <RatingSection courseId={id} />
              <CommentSection id={id} />
            </>
          ) : (
            <div className="text-center text-gray-500 my-4">
              Comments & Ratings are currently disabled for this course.
            </div>
          )
        ) : (
          <div className="text-center text-gray-500 my-4">
            Loading comments & ratings status...
          </div>
        )}
      </section>
      <div className="flex justify-end space-x-4 mt-10">
        {/* Archive Dialog */}
        <ArchiveDialog course={course} fetchCourseDetail={fetchCourseDetail} />

        {/* Delete Confirmation Modal */}
        <DeleteCourseModal
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
          fetchCourseDetail={fetchCourseDetail}
          id={id}
          setSuccessOpen={setSuccessOpen}
        />

        {/* ✅ Success Confirmation Modal */}
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
          <DialogContent className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <h3 className="text-lg font-semibold mt-2">
              Course deleted successfully!
            </h3>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, bgColor }) {
  return (
    <Card className={`border-0 shadow-sm ${bgColor}`}>
      <CardContent className="p-2 flex items-center gap-4">
        <div className="p-2 rounded-md bg-white">{icon}</div>
        <div>
          <div className="font-semibold text-lg">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

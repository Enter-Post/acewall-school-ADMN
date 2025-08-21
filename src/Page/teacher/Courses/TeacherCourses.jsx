import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";
import SearchBox from "@/CustomComponent/SearchBox";
import { useContext, useEffect, useState } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Button } from "@/components/ui/button";
import {
  AlignJustify,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader,
} from "lucide-react";
import { GlobalContext } from "@/Context/GlobalProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TeacherCourses = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useContext(GlobalContext);

  console.log(filterTab, "filterTab");

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/course/allupdated", {
        params: {
          search: searchQuery,
          published: filterTab,
          page,
          limit: 6,
        },
      });
      setAllCourses(response.data.courses);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchCourses, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery, filterTab, page]);

  const handleFilterChange = (status) => {
    setFilterTab(status);
    setPage(1); // reset to first page on filter change
  };

  return (
    <section className="p-3 md:p-0">
      <div className="flex flex-col pb-5 gap-5">
        <p className="text-xl py-4 mb-4 pl-6 font-semibold bg-acewall-main text-white rounded-lg">
          All Courses
        </p>

        <SearchBox query={searchQuery} setQuery={setSearchQuery} />

        {/* Filter Dropdown */}
        <div className="relative px-6 flex items-center justify-start mb-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <AlignJustify className="w-5 h-5" />
                <span className="hidden md:inline">
                  {filterTab === true ? "Published" : "Unpublished"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 z-50">
              {[
                { label: "Published", value: true },
                { label: "Unpublished", value: false },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onClick={() => handleFilterChange(item.value)}
                  className="flex items-center justify-between"
                >
                  {item.label}
                  {filterTab === item.value && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader className="animate-spin" />
        </div>
      ) : allCourses?.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          <p className="text-xl">No courses found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => (
              <Link
                key={course._id}
                to={`/admin/courses/courseDetail/${course._id}`}
              >
                <Card className="pb-6 pt-0 w-full overflow-hidden cursor-pointer">
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={course.thumbnail?.url || "/placeholder.svg"}
                      alt={`${course.courseTitle} thumbnail`}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <CardHeader>
                    <div className="uppercase text-indigo-600 bg-indigo-100 text-xs font-medium mb-2 w-fit px-2">
                      {course.category?.title || "Developments"}
                    </div>
                    <CardTitle>{course.courseTitle}</CardTitle>
                    <p className="text-xs">
                      Teacher: {course.createdby?.firstName}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Language: {course.language}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {course.status}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center mt-8 gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-medium transition-colors ${
                    pg === page
                      ? "bg-acewall-main text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {pg}
                </button>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
          </div>
        </>
      )}
    </section>
  );
};

export default TeacherCourses;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TeacherCard } from "@/CustomComponent/Card";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";

const AllTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // committed search term

  const fetchTeachers = async (pageNumber = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/allTeacher?page=${pageNumber}&limit=6&search=${searchQuery}`
      );
      const data = res.data;
      const rawTeachers = Array.isArray(data.teachers) ? data.teachers : [];

      const normalized = rawTeachers.map((t, i) => {
        const cleanName = t.name?.replace(/<[^>]+>/g, "").trim() || "Unknown";
        const nameParts = cleanName.split(/\s+/);
        const firstName = nameParts[0] || "NoName";
        const lastName = nameParts.slice(1).join(" ") || "";

        return {
          id: t._id || t.id || `teacher-${i}`,
          firstName,
          lastName,
          email: t.email || "N/A",
          createdAt: t.joiningDate || new Date().toISOString(),
          courses: Array.from({ length: t.courses ?? 0 }),
          profileImg:
            t.profileImg ||
            `https://randomuser.me/api/portraits/lego/${i % 10}.jpg`,
        };
      });

      setTeachers(normalized);
      setTotalPages(data.totalPages || 1);
      setPage(data.currentPage || 1);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(page, query);
  }, [page, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // reset pagination
    setQuery(search.trim());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-10" />

      <h1 className="text-2xl font-bold mb-6">
        All Teachers{" "}
        <span className="font-normal text-gray-500">({teachers.length})</span>
      </h1>

      {/* 🔍 Search Input */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 mb-6 max-w-md"
      >
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-acewall-main"
        />
        <Button type="submit" className="flex items-center gap-1">
          <Search className="w-4 h-4" /> Search
        </Button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading teachers...</p>
      ) : teachers.length === 0 ? (
        <p className="text-gray-500">No teachers found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-6">
            {teachers.map((teacher) => (
              <Link key={teacher.id} to={`/admin/teacherProfile/${teacher.id}`}>
                <TeacherCard teacher={teacher} />
              </Link>
            ))}
          </div>

          {/* Pagination */}
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
    </div>
  );
};

export default AllTeacher;

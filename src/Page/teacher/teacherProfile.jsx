import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Calendar, Mail, School, Trash2 } from "lucide-react";
import { TeacherProfileStatCard } from "@/CustomComponent/Card";
import { axiosInstance } from "@/lib/AxiosInstance";
import BackButton from "@/CustomComponent/BackButton";

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacherInfo, setTeacherInfo] = useState(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false); // NEW

  // Fetch teacher info
  useEffect(() => {
    const fetchTeacher = async () => {
      setTeacherLoading(true);
      try {
        const res = await axiosInstance.get(`/admin/getTeacherById/${id}`);
        setTeacherInfo(res.data.teacher);
      } catch (err) {
        console.error("Failed to fetch teacher:", err);
        setTeacherInfo(null);
      } finally {
        setTeacherLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  // Fetch teacher's courses
  useEffect(() => {
    if (!id) return;
    setCourseLoading(true);

    const getCourses = async () => {
      try {
        const response = await axiosInstance.get(
          "/course/getCoursesforadminofteacher",
          {
            params: { teacherId: id },
          }
        );
        setTeacherCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setTeacherCourses([]);
      } finally {
        setCourseLoading(false);
      }
    };

    getCourses();
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    setDeleteLoading(true); // NEW
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setShowDeleteModal(false);
      navigate(-1); // Redirect after delete
    } catch (err) {
      console.error("Failed to delete teacher:", err);
    } finally {
      setDeleteLoading(false); // NEW
    }
  };

  // While loading
  if (teacherLoading || courseLoading) {
    return (
      <p className="text-center py-20 text-gray-500">
        Loading profile and courses...
      </p>
    );
  }

  if (!teacherInfo)
    return <p className="text-center py-20 text-red-500">Teacher not found.</p>;

  const [firstName, ...rest] =
    (teacherInfo.firstName
      ? [
          teacherInfo.firstName,
          teacherInfo.middleName,
          teacherInfo.lastName,
        ].filter(Boolean)
      : teacherInfo.name?.split(" ") || []) || [];
  const lastName = rest.length > 1 ? rest.pop() : rest[0] || "";
  const middleName = rest.length > 1 ? rest.join(" ") : "";

  const joinedDate = new Date(
    teacherInfo.joiningDate ?? teacherInfo.createdAt
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>
                {firstName} {lastName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile View */}
      <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <BackButton label="Go Back" />
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Delete Teacher
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-28 h-28 ring-2 ring-gray-300 shadow rounded-full overflow-hidden">
            <AvatarImage
              src={teacherInfo.profileImg?.url}
              alt={`${teacherInfo.firstName} ${teacherInfo.lastName}`}
              className="w-full h-full object-cover rounded-full"
            />
            <AvatarFallback className="w-full h-full bg-gray-200 text-gray-600 text-lg font-semibold flex items-center justify-center rounded-full">
              {teacherInfo.firstName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left space-y-2 mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {teacherInfo.firstName}{" "}
              {teacherInfo.middleName && `${teacherInfo.middleName} `}
              {teacherInfo.lastName}
            </h1>

            <div className="text-gray-600 space-y-1 text-sm">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{teacherInfo.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>
                  Joined: {new Date(teacherInfo.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/admin/account/${id}`)}
              className="mt-4 text-sm inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              View Account Settings
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-center mb-8">
          <TeacherProfileStatCard
            className="max-w-xs"
            icon={<School className="text-green-600" />}
            title="Published Courses"
            value={teacherCourses.length}
          />
        </div>

        {/* Courses Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Courses by {firstName}
          </h2>
          {teacherCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {teacherCourses.map((course, idx) => (
                <Link
                  to={`/admin/courses/courseDetail/${course._id}`}
                  key={idx}
                  className="rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer block"
                >
                  <img
                    src={course?.thumbnail?.url ?? ""}
                    alt={course?.courseTitle ?? "Course Thumbnail"}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course?.courseTitle ?? "Untitled Course"}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No courses published yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

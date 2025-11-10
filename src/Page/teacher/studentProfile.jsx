import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Mail, School, Trash2 } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import {
  StudentProfileCourseCard,
  StudentProfileStatCard,
} from "@/CustomComponent/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import BackButton from "@/CustomComponent/BackButton";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [studentInfo, setStudentInfo] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch student info
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/admin/getStudentById/${id}`, {
          withCredentials: true, // ✅ ensure admin JWT cookie is sent
        });
        setStudentInfo(res.data.user);
      } catch (err) {
        console.error("Error fetching student profile:", err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [id]);

  // Fetch enrolled courses
  useEffect(() => {
    const getEnrolledCourses = async () => {
      try {
        const res = await axiosInstance.get(
          `/admin/student-enrolled-courses/${id}`,
          { withCredentials: true } // ✅ send cookie
        );
        setEnrolledCourses(res.data.enrolledCourses);
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
      }
    };
    getEnrolledCourses();
  }, [id]);

  // Delete student
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/admin/users/${id}`, {
        withCredentials: true, // ✅ send cookie
      });
      setShowDeleteModal(false);
      alert("Student deleted successfully");
      navigate(-1); // redirect back
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading student profile...
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div className="text-center py-10 text-red-500">Student not found.</div>
    );
  }

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
                {studentInfo.firstName} {studentInfo.lastName}
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

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 bg-white rounded-xl shadow-md space-y-10">
        <div className="flex justify-between items-center mb-6">
          <BackButton label="Go Back" />
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Delete Student
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-28 h-28 ring-2 ring-gray-300 shadow rounded-full overflow-hidden">
            <AvatarImage
              src={studentInfo.profileImg?.url}
              alt={`${studentInfo.firstName} ${studentInfo.lastName}`}
              className="w-full h-full object-cover rounded-full"
            />
            <AvatarFallback className="w-full h-full bg-gray-200 text-gray-600 text-lg font-semibold flex items-center justify-center rounded-full">
              {studentInfo.firstName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-2xl font-semibold text-gray-800">
              {studentInfo.firstName}{" "}
              {studentInfo.middleName && `${studentInfo.middleName} `}
              {studentInfo.lastName}
            </h1>

            <div className="text-gray-600 space-y-1 text-sm">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{studentInfo.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>
                  Joined: {new Date(studentInfo.createdAt).toLocaleDateString()}
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
        <div className="flex justify-center">
          <StudentProfileStatCard
            icon={<School />}
            title="Enrolled Courses"
            value={enrolledCourses.length}
          />
        </div>

        {/* Enrolled Courses */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Enrolled Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((item, index) => {
                const course = item.course;
                return (
                  course &&
                  course.thumbnail &&
                  course.courseTitle && (
                    <StudentProfileCourseCard key={index} course={course} />
                  )
                );
              })
            ) : (
              <p className="text-gray-500 col-span-full">
                No enrolled courses.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader, Pen } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import avatar from "@/assets/avatar.png";
import { useParams } from "react-router-dom";
import BackButton from "@/CustomComponent/BackButton";

const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const maxSize = 5 * 1024 * 1024;

const Account = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileImgLoading, setProfileImgLoading] = useState(false);

  // Fetch user data
  const fetchUser = async () => {
    if (!id) {
      toast.error("User ID is missing");
      return;
    }

    try {
      const teacherResponse = await axiosInstance.get(
        `/admin/getTeacherById/${id}`
      );
      console.log("Teacher Response: ", teacherResponse);

      if (teacherResponse.data && teacherResponse.data.user) {
        setUser(teacherResponse.data.user);
      } else {
        throw new Error("Teacher not found or invalid response");
      }
    } catch (err) {
      console.error("Error fetching teacher data:", err);

      try {
        const studentResponse = await axiosInstance.get(
          `/admin/getStudentById/${id}`
        );
        console.log("Student Response: ", studentResponse);

        if (studentResponse.data && studentResponse.data.user) {
          setUser(studentResponse.data.user);
        } else {
          // If no valid student found, show an error
          throw new Error("Student not found or invalid response");
        }
      } catch (e) {
        console.error("Error fetching student data:", e);
        toast.error("User not found or invalid response");
      }
    }
  };

  // In the JSX, ensure the user data is available before rendering links

  useEffect(() => {
    fetchUser();
  }, [id, profileImgLoading]);

  // Handle profile image change
  const handleImg = async () => {
    if (
      !profileImg ||
      !allowedTypes.includes(profileImg.type) ||
      profileImg.size > maxSize
    ) {
      toast.error("Invalid image. Use JPG/PNG/WebP under 5MB.");
      setProfileImg(null);
      return;
    }

    setProfileImgLoading(true);
    const formData = new FormData();
    formData.append("profileImg", profileImg);

    try {
      const res = await axiosInstance.put(
        `/auth/updateUserProfileImgById/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data.message);
      setProfileImg(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setProfileImgLoading(false);
    }
  };

  const displayField = (label, value) => (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base text-gray-900 dark:text-white">{value || "—"}</p>
    </div>
  );

  // Fallback UI if user is null
  if (!user) {
    return (
      <div className="w-full mx-auto p-4 sm:p-6 space-y-8">
        <BackButton />
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6 space-y-8">
      <BackButton />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Account Information
        </h2>
      </div>

      {/* Profile Image */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Profile Image</h3>

        <div className="relative w-32 h-32">
          {/* Profile Image */}
          <div className="w-full h-full rounded-full overflow-hidden border border-gray-300">
            <img
              src={
                profileImg
                  ? URL.createObjectURL(profileImg)
                  : user?.profileImg?.url ?? avatar
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Edit Icon - NOT inside the clipped circle anymore */}
          <label className="absolute bottom-0 right-0  bg-white border border-gray-300 rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition">
            <Pen className="w-4 h-4 text-gray-600" />
            <input
              type="file"
              className="hidden"
              accept={allowedTypes.join(",")}
              onChange={(e) => setProfileImg(e.target.files[0])}
            />
          </label>
        </div>

        {profileImg && (
          <div className="flex gap-2">
            <Button
              onClick={handleImg}
              disabled={profileImgLoading}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              {profileImgLoading ? (
                <div className="flex items-center">
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button onClick={() => setProfileImg(null)} variant="outline">
              Cancel
            </Button>
          </div>
        )}
      </section>

      {/* Edit Buttons */}
      <section className="flex gap-2 justify-end">
        {user && user._id ? (
          <>
            <Link to={`/admin/account/${user._id}/editGeneralInfo`}>
              <Button className="bg-green-500 text-white hover:bg-green-600">
                Edit Info
              </Button>
            </Link>
            <Link to={`/admin/account/${user._id}/editCredentials`}>
              <Button className="bg-green-500 text-white hover:bg-green-600">
                Edit Login Details
              </Button>
            </Link>
          </>
        ) : (
          <p>Loading user data...</p> // Or any other loading indicator
        )}
      </section>

      {/* Info Sections */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayField("First Name", user?.firstName)}
          {displayField("Middle Name", user?.middleName)}
          {displayField("Last Name", user?.lastName)}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold">Identity Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayField("Preferred Pronouns", user?.pronoun)}
          {displayField("Gender Identity", user?.gender)}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayField("Email Address", user?.email)}
          {displayField("Phone Number", user?.phone)}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold">Address Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayField("Home Address", user?.homeAddress)}
          {displayField("Mailing Address", user?.mailingAddress)}
        </div>
      </section>
    </div>
  );
};

export default Account;

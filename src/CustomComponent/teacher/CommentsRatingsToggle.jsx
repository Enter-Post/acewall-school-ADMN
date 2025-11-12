import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

/**
 * CommentsRatingsToggle
 * 
 * Props:
 * - courseId?: string -> ID of a single course (omit for global toggle)
 * - onToggle?: function -> callback when toggle changes
 * - role?: "admin" | "teacher" (default: "admin") -> determines API endpoint
 * - global?: boolean -> if true, toggles all courses
 */
const CommentsRatingsToggle = ({ courseId, onToggle, role = "admin", global = false }) => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Determine API endpoints dynamically
  const getDetailsEndpoint = () => {
    if (global) return `/admin/toggle-all-comments-status`; // new GET for global status
    if (role === "teacher") return `/teacher/course/details/${courseId}`;
    return `/course/details/${courseId}`; // admin single course
  };

  const getToggleEndpoint = () => {
    if (global) return `/admin/toggle-all-comments`; // new PATCH for global toggle
    if (role === "teacher") return `/teacher/course/toggle-comments/${courseId}`;
    return `/admin/${courseId}/toggle-comments`; // admin single course
  };

  // Fetch initial toggle state
  useEffect(() => {
    const fetchToggleState = async () => {
      try {
        const res = await axiosInstance.get(getDetailsEndpoint());
        const state = global
          ? res.data.commentsEnabled ?? false
          : res.data.course?.commentsEnabled ?? false;

        setEnabled(state);
        onToggle?.(state);
      } catch (error) {
        console.error("Failed to fetch toggle state", error);
        toast.error("Failed to load toggle state");
      } finally {
        setFetching(false);
      }
    };

    fetchToggleState();
  }, [courseId, global, role, onToggle]);

  // Handle toggle click
  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch(getToggleEndpoint(), { enable: !enabled });
      const state = res.data.commentsEnabled;
      setEnabled(state);
      onToggle?.(state);
      toast.success(res.data.message || "Comments & Ratings updated");
    } catch (error) {
      console.error("Failed to update toggle", error);
      toast.error("Failed to update toggle");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-gray-500 my-2">Loading toggle state...</div>;
  }

  return (
    <div className="flex items-center gap-4 my-4">
      <span className="font-medium">{global ? "Enable Comments & Ratings for All Courses" : "Enable Comments & Ratings"}</span>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={loading}
        className={`${enabled ? "bg-green-500" : "bg-gray-300"}`}
      />
      {loading && <span className="text-sm text-gray-500">Updating...</span>}
    </div>
  );
};

export default CommentsRatingsToggle;

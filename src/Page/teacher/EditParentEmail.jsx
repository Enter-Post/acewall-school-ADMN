import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const EditParentEmail = ({ studentId, initialEmails = [], onUpdate }) => {
  const [emails, setEmails] = useState([""]);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize emails from props
  useEffect(() => {
    if (initialEmails.length > 0) {
      setEmails(initialEmails);
    }
  }, [initialEmails]);

  const handleEmailChange = (index, value) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const handleAddEmail = () => {
    if (emails.length >= 4) {
      toast.error("You can only add up to 4 emails");
      return;
    }
    setEmails([...emails, ""]);
  };

  const handleRemoveEmail = (index) => {
    const updated = emails.filter((_, i) => i !== index);
    setEmails(updated.length > 0 ? updated : [""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validEmails = emails.map((e) => e.trim()).filter((e) => e.length > 0);

    if (validEmails.length === 0) {
      toast.error("Please enter at least one valid email");
      return;
    }

    if (!studentId) {
      toast.error("Student ID not provided.");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.put(
        `admin/updateParentEmail/${studentId}`,
        { guardianEmails: validEmails },
        { withCredentials: true } // send admin cookie
      );

      toast.success(res?.data?.message || "Emails updated successfully");

      // Update parent component's state
      if (onUpdate) onUpdate(validEmails);
    } catch (err) {
      console.error("❌ API Error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md w-full">
      <h1 className="text-lg font-semibold">Edit Parent/Guardian Emails</h1>
      <p className="text-sm text-gray-600">
        Add or update up to 4 parent/guardian email addresses.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        {emails.map((email, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              className="border p-2 rounded-md w-full"
              placeholder={`Parent/Guardian Email ${index + 1}`}
              required
            />
            {emails.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveEmail(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddEmail}
          className="flex items-center gap-2"
          disabled={emails.length >= 4}
        >
          <Plus className="w-4 h-4" />
          Add Another Email
        </Button>

        {emails.length >= 4 && (
          <p className="text-xs text-red-500">
            You can only add up to 4 parent/guardian emails.
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || emails.every((e) => e.trim().length === 0)}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader className="animate-spin w-4 h-4" /> Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
};

export default EditParentEmail;

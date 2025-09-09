import React, { useState } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BackButton from "@/CustomComponent/BackButton";

const BulkSignupPage = () => {
  const [role, setRole] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Download sample CSV template
  const downloadTemplate = () => {
    const csvContent =
      "firstName,middleName,lastName,email,phone,password\n" +
      "Ali,,Khan,ali@example.com,03001234567,Ali@123\n" +
      "Sara,Noor,Ahmed,sara@example.com,03007654321,Sara@456\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bulk_users_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      toast.error("Please select a role.");
      return;
    }
    if (!file) {
      toast.error("Please upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("role", role);
    formData.append("file", file); // must match upload.single("file")

    try {
      setLoading(true);
      setResult(null);

      const res = await axiosInstance.post("/auth/bulk-signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
      toast.success("Bulk upload completed successfully.");
    } catch (err) {
      console.error("Bulk upload error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to upload users. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex flex-col items-center justify-center bg-gray-50 p-6">
      <BackButton className="mb-6 self-start" />

      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Bulk Upload Users
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector */}
          <div>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger className="w-full p-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border p-2 rounded"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          {/* CSV Template Button */}
          <button
            type="button"
            onClick={downloadTemplate}
            className="w-full py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Download CSV Template
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Users"}
          </button>
        </form>

        {/* Show result */}
        {result && (
          <div className="mt-6 space-y-2">
            <p className="font-semibold text-green-600">
              ✅ Created: {result.createdCount}
            </p>
            <p className="font-semibold text-red-600">
              ❌ Failed: {result.failedCount}
            </p>

            {result.failed?.length > 0 && (
              <div className="mt-2 text-sm text-gray-700 max-h-40 overflow-y-auto border p-2 rounded">
                <p className="font-medium mb-1">Failed Users:</p>
                {result.failed.map((f, idx) => (
                  <p key={idx}>
                    {f.email} - {f.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkSignupPage;

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import avatar from "@/assets/avatar.png";

const AllSubmission = () => {
  const [submission, setSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradedFilter, setGradedFilter] = useState("all");

  const { id } = useParams();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axiosInstance.get(
          `/assessmentSubmission/submission_for_Teacher/${id}`
        );
        setSubmission(response.data.submissions);
      } catch (error) {
        console.error("Error fetching submission:", error);
        setSubmission([]);
      }
    };

    fetchSubmission();
  }, [id]);

  if (!submission) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredSubmissions = submission.filter((item) => {
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchGraded =
      gradedFilter === "all" ||
      (gradedFilter === "graded" && item.graded) ||
      (gradedFilter === "not_graded" && !item.graded);
    return matchStatus && matchGraded;
  });

  if (filteredSubmissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen space-y-4">
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              {statusFilter === "all" ? "All Statuses" : statusFilter}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="before due date">Before Due Date</SelectItem>
              <SelectItem value="after due date">After Due Date</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gradedFilter} onValueChange={setGradedFilter}>
            <SelectTrigger className="w-[180px]">
              {gradedFilter === "all"
                ? "All Grading"
                : gradedFilter === "graded"
                  ? "Graded"
                  : "Not Graded"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grading</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="not_graded">Not Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          No submissions found
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            {statusFilter === "all" ? "All Statuses" : statusFilter}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="before due date">Before Due Date</SelectItem>
            <SelectItem value="after due date">After Due Date</SelectItem>
          </SelectContent>
        </Select>

        <Select value={gradedFilter} onValueChange={setGradedFilter}>
          <SelectTrigger className="w-[180px]">
            {gradedFilter === "all"
              ? "All Grading"
              : gradedFilter === "graded"
                ? "Graded"
                : "Not Graded"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grading</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="not_graded">Not Graded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubmissions.map((item) => (
          <Link
            key={item._id}
            className="w-full"
            to={`/teacher/assessments/${item._id}`}
          >
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={item?.studentId?.profileImg?.url || avatar}
                    alt="Profile Picture"
                  />
                  <AvatarFallback>
                    {item?.studentId?.firstName?.charAt(0)}
                    {item?.studentId?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">
                    {item?.studentId?.firstName} {item?.studentId?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {item?.studentId?.email}
                  </p>
                </div>
              </div>
              <CardContent className="space-y-2 px-0">
                <p>
                  <span className="text-sm">Status:</span>
                  <p
                    className={`${item?.status === "before due date"
                        ? "text-green-500"
                        : "text-red-500"
                      } text-sm font-medium`}
                  >
                    {item?.status}
                  </p>
                </p>
                <p>
                  <span className="text-sm">Grading:</span>{" "}
                  <p
                    className={`${item?.graded ? "text-green-600" : "text-yellow-500"
                      } text-sm font-medium`}
                  >
                    {item?.graded ? "Graded" : "Not Graded"}
                  </p>
                </p>
                <p>
                  <span className="text-sm">Submitted At:</span>{" "}
                  <p className="text-sm">
                    {new Date(item?.submittedAt).toLocaleString()}
                  </p>
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllSubmission;

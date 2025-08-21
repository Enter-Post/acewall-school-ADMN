import { CourseContext } from "@/Context/CoursesProvider";
import BackButton from "@/CustomComponent/BackButton";
import { axiosInstance } from "@/lib/AxiosInstance";
import { format } from "date-fns";
import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";

const SemesterDetail = () => {
  const { id, courseId } = useParams();
  const { quarters } = useContext(CourseContext);
  const [allQuarter, setAllQuarter] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuarters = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`quarter/get/${id}`);
        const fetchedQuarters = res.data.quarters;

        const selectedQuarterIds = new Set(
          quarters.map((quar) => quar?._id.toString())
        );

        const selectedQuarters = fetchedQuarters.filter((q) =>
          selectedQuarterIds.has(q._id?.toString())
        );

        setAllQuarter(selectedQuarters);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuarters();
  }, [id, quarters]);

  return (
    <div className="space-y-4">
      <div className="w-full ">
        <BackButton className="mb-10" />
        <p className="text-lg font-semibold text-black">Quarters</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading quarters...</div>
      ) : allQuarter.length > 0 ? (
        allQuarter.map((quarter) => (
          <Link
            key={quarter._id}
            to={`/admin/courses/${courseId}/quarter/${quarter._id}`}
          >
            <div className="mb-4 border border-gray-200 p-5 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer">
              <h3 className="font-semibold text-md">Quarter: {quarter.title}</h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(quarter.startDate), "MMMM do, yyyy")} -{" "}
                {format(new Date(quarter.endDate), "MMMM do, yyyy")}
              </p>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No quarters selected.</p>
      )}
    </div>
  );
};

export default SemesterDetail;

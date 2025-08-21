import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Check, AlertCircle } from "lucide-react";
import BackButton from "@/CustomComponent/BackButton";



// Detect issues in grading scale
const detectScaleIssues = (grades) => {
  const sorted = [...grades].sort((a, b) => a.min - b.min);
  const EPSILON = 0.001;
  const issues = [];
  let expectedMin = 0;

  for (let i = 0; i < sorted.length; i++) {
    const { min, max } = sorted[i];

    // Gap detection
    if (min - expectedMin > EPSILON) {
      issues.push({ type: "gap", from: expectedMin, to: min });
    }

    // Overlap detection
    if (min < expectedMin - EPSILON) {
      issues.push({ type: "overlap", from: min, to: expectedMin });
    }

    expectedMin = parseFloat((max + 0.01).toFixed(2));
  }

  // Final check: should end at 100%
  if (expectedMin - 100 < -EPSILON) {
    issues.push({ type: "gap", from: expectedMin, to: 100 });
  }

  return {
    isComplete: issues.length === 0,
    issues,
  };
};



export default function ManageGradeScale() {
  const [grades, setGrades] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  console.log(grades, "grades in ManageGradeScale");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      grade: "",
      min: 90,
      max: 100,
    },
  });

  const watchMin = watch("min");
  const { isComplete, issues } = detectScaleIssues(grades);



  const handleCreateGradeScale = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("gradebook/gradingScale", { scale: grades });
      console.log(res);
      toast.success(res.data.message);
      navigate("/admin/gradescale");
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };



 const onSubmit = (data) => {
    const newMin = parseFloat(data.min);
    const newMax = parseFloat(data.max);

    if (newMin >= newMax) {
      toast.error("Min must be less than Max.");
      return;
    }

    if (newMin < 0 || newMax > 100) {
      toast.error("Values must be within 0 to 100.");
      return;
    }

    const hasOverlap = grades.some(
      (g) =>
        (newMin >= g.min && newMin <= g.max) ||
        (newMax >= g.min && newMax <= g.max) ||
        (newMin <= g.min && newMax >= g.max)
    );

    if (hasOverlap) {
      toast.error("This range overlaps with an existing grade.");
      return;
    }

    const newEntry = {
      grade: data.grade.toUpperCase(),
      min: newMin,
      max: newMax,
    };

    const updatedGrades = [...grades, newEntry].sort((a, b) => b.max - a.max);
    setGrades(updatedGrades);
    setSuccessMessage(
      `Grade ${newEntry.grade} added: ${newMax}% to ${newMin}%`
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    // ✅ FIX: Prevent max from going negative
    const nextMin = newMin - 10 >= 0 ? parseFloat((newMin - 10).toFixed(2)) : 0;
    const nextMax =
      nextMin === 0 ? 0 : parseFloat((newMin - 0.01).toFixed(2));

    reset({
      grade: "",
      min: nextMin,
      max: nextMax,
    });
  };



  const handleReset = () => {
    setGrades([]);
    reset({
      grade: "",
      min: 90,
      max: 100,
    });
    setSuccessMessage("");
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold text-center mb-6">Create Grade Scale</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium">Letter Grade</label>
                <Input
                  {...register("grade", {
                    required: "Grade is required",
                    pattern: {
                      value: /^[A-F+-]*$/i,
                      message: "Only letters A-F and +/- symbols allowed",
                    },
                  })}
                  placeholder="e.g., A, B+, C-"
                  className={errors.grade ? "border-red-500" : ""}
                />
                {errors.grade && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.grade.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium">Min %</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("min", {
                      required: "Min is required",
                      min: { value: 0, message: "Min must be at least 0" },
                      max: { value: 99.99, message: "Min must be below 100" },
                    })}
                    className={errors.min ? "border-red-500" : ""}
                  />
                  {errors.min && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.min.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium">Max %</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("max", {
                      required: "Max is required",
                      min: {
                        value: watchMin ? Number(watchMin) + 0.01 : 0.01,
                        message: "Max must be greater than Min",
                      },
                      max: { value: 100, message: "Max cannot exceed 100" },
                    })}
                    className={errors.max ? "border-red-500" : ""}
                  />
                  {errors.max && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.max.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Grade
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </form>

            {successMessage && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Grade Scale Display */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Scale</CardTitle>
          </CardHeader>
          <CardContent>
            {grades.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 font-medium text-sm text-gray-500 mb-2">
                  <div>Grade</div>
                  <div>Range</div>
                  <div>Percentage</div>
                </div>

                {grades.map((grade, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-2 items-center border-b border-gray-100 pb-2"
                  >
                    <Badge className="font-bold text-sm px-3 py-1 bg-green-500">
                      {grade.grade}
                    </Badge>
                    <div className="text-sm">
                      {grade.min}% - {grade.max}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${grade.max - grade.min}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                {issues.length > 0 && (
                  <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-600 space-y-1">
                      <p>Grade scale has issues:</p>
                      {issues.map((issue, i) => (
                        <p key={i}>
                          {issue.type === "gap"
                            ? `🟡 Gap from ${issue.from}% to ${issue.to}%`
                            : `🔴 Overlap from ${issue.from}% to ${issue.to}%`}
                        </p>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}

                {isComplete && (
                  <>
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600">
                        Grade scale completed (0% to 100%)!
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleCreateGradeScale}
                      className="mt-4 w-full bg-green-500 hover:bg-green-600"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create"}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>No grades added yet</p>
                <p className="text-sm">Add grades using the form</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

}

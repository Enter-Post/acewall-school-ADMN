import React from "react";
import { useState, useEffect, useContext } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, FileText, XCircle } from "lucide-react";
const AssessmentResultCard = ({ submission }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  return (
    <div>
      <div className="container mx-auto py-6">
        <Card className="w-full">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full text-right">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      submission?.status === "before due date"
                        ? "success"
                        : "destructive"
                    }
                  >
                    {submission?.status}{" "}
                  </Badge>
                  <Badge variant={submission?.graded ? "outline" : "secondary"}>
                    {submission?.graded ? "Graded" : "Needs Grading"}
                  </Badge>
                </div>
                <CardDescription>
                  Submitted on: {formatDate(submission?.createdAt)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Assessment Summary</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Assessment ID</p>
                  <p className="font-medium">{submission?.assessment}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current {submission?.totalScore > 0 ? "Points" : "Point"}
                  </p>
                  <p className="font-medium">{submission?.totalScore} points</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All Questions ({submission?.answers?.length})
                </TabsTrigger>
                <TabsTrigger value="manual">
                  Needs Grading (
                  {
                    submission?.answers?.filter((a) => a.requiresManualCheck)
                      .length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="auto">
                  Graded (
                  {
                    submission?.answers?.filter((a) => !a.requiresManualCheck)
                      .length
                  }
                  )
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-6">
                  {submission?.answers?.map((answer, index) => (
                    <QuestionCard
                      key={answer._id || index}
                      answer={answer}
                      index={index}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <div className="space-y-6">
                  {submission?.answers
                    ?.filter((a) => a.requiresManualCheck)
                    .map((answer, index) => (
                      <QuestionCard
                        key={answer._id || index}
                        answer={answer}
                        index={index}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="auto">
                <div className="space-y-6">
                  {submission?.answers
                    ?.filter((a) => !a.requiresManualCheck)
                    .map((answer, index) => (
                      <QuestionCard
                        key={answer._id || index}
                        answer={answer}
                        index={index}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const QuestionCard = ({
  answer,
  index,
  manualGrades,
  onGradeChange,
  setError = () => {},
  error = {},
}) => {
  const questionType = answer?.question?.type || "unknown";
  const maxPoints = answer?.question?.points || 0;

  console.log(answer, "answer");
  console.log(questionType, "questionType");

  const handleError = (questionId, message) => {
    setError((prevErrors) => {
      if (!message) {
        const { [questionId]: _, ...rest } = prevErrors;
        return rest;
      }
      return {
        ...prevErrors,
        [questionId]: message,
      };
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">Question {index + 1}</CardTitle>
            <CardDescription>
              {questionType === "mcq"
                ? "Multiple Choice"
                : questionType === "truefalse"
                ? "True/False"
                : questionType === "qa"
                ? "Question & Answer"
                : questionType === "file"
                ? "File"
                : "Unknown"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {answer?.requiresManualCheck ? (
              <Badge
                variant="warning"
                className="bg-amber-100 text-amber-800 hover:bg-amber-100"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Needs Manual Grading
              </Badge>
            ) : answer?.isCorrect ? (
              <Badge
                variant="success"
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Correct
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-800 hover:bg-red-100"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Incorrect
              </Badge>
            )}
            <Badge variant="outline">
              {`${answer?.pointsAwarded || 0}/${maxPoints} points`}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Question:</h4>
            <div
              className="p-3 bg-slate-50 rounded-md"
              dangerouslySetInnerHTML={{
                __html: answer?.question?.question || "",
              }}
            />
          </div>

          <div>
            <h4 className="font-medium mb-2">Student's Answer:</h4>
            <div className="p-3 bg-slate-50 rounded-md">
              {questionType === "truefalse" ? (
                <span className="font-medium">
                  {answer?.selectedAnswer === "true" ? "True" : "False"}
                </span>
              ) : questionType === "mcq" ? (
                <span className="font-medium">
                  Option: {answer?.selectedAnswer}
                </span>
              ) : questionType === "file" ? (
                <div className="space-y-2">
                  {answer?.file?.map((file, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900"
                      >
                        {file.filename}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: answer?.selectedAnswer || "",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentResultCard;

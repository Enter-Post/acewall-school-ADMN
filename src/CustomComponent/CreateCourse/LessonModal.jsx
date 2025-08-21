"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

// Zod schema
const pdfFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "application/pdf", {
    message: "Only PDF files are allowed",
  });

const lessonSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(5).max(200),
  youtubeLinks: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine(
      (val) =>
        !val ||
        /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/)[\w-]{11}(&[^ ]*)?|youtu\.be\/[\w-]{11}(\?[^ ]*)?)$/.test(val),
      {
        message: "Enter a valid YouTube video link",
      }
    ),
  otherLink: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine((val) => !val || /^https?:\/\/.+$/.test(val), {
      message: "Must be a valid URL",
    }),
  pdfFiles: z
    .array(pdfFileSchema)
    .min(1, { message: "At least one PDF is required" })
    .refine(
      (files) =>
        files.reduce((acc, file) => acc + (file?.size || 0), 0) <= 5 * 1024 * 1024,
      {
        message: "Total file size must not exceed 5MB",
      }
    ),
});

const LessonModal = ({ chapterID, fetchQuarterDetail }) => {
  const [open, setOpen] = useState(false);
  const [pdfInputs, setPdfInputs] = useState([{ id: Date.now(), file: null }]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(false);

  const MAX_TITLE_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 200;

  const [titleValue, setTitleValue] = useState("");
  const [descValue, setDescValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      youtubeLinks: "",
      otherLink: "",
      pdfFiles: [],
    },
  });

  const calculateTotalSize = (files) =>
    files.reduce((acc, f) => acc + (f?.size || 0), 0);

  const handleFileChange = (id, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    const updated = pdfInputs.map((input) =>
      input.id === id ? { ...input, file } : input
    );

    const newSize = calculateTotalSize(updated.map((i) => i.file));
    if (newSize > 5 * 1024 * 1024) {
      toast.error("Total file size exceeds 5MB");
      return;
    }

    setPdfInputs(updated);
    setTotalSize(newSize);
    setValue("pdfFiles", updated.map((i) => i.file).filter(Boolean), {
      shouldValidate: true,
    });
  };

  const handleAddField = () => {
    const currentTotal = calculateTotalSize(pdfInputs.map((i) => i.file));
    if (currentTotal >= 5 * 1024 * 1024) {
      toast.error("Cannot add more files. 5MB limit reached.");
      return;
    }

    setPdfInputs((prev) => [...prev, { id: Date.now(), file: null }]);
  };

  const handleRemoveField = (id) => {
    const updated = pdfInputs.filter((input) => input.id !== id);
    const newSize = calculateTotalSize(updated.map((i) => i.file));
    setPdfInputs(updated);
    setTotalSize(newSize);
    setValue("pdfFiles", updated.map((i) => i.file).filter(Boolean), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("youtubeLinks", data.youtubeLinks || "");
    formData.append("otherLink", data.otherLink || "");
    formData.append("chapter", chapterID);

    pdfInputs
      .map((input) => input.file)
      .filter(Boolean)
      .forEach((file) => {
        formData.append("pdfFiles", file);
      });

    try {
      const res = await axiosInstance.post("/lesson/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message);
      fetchQuarterDetail();
      reset();
      setPdfInputs([{ id: Date.now(), file: null }]);
      setTotalSize(0);
      setTitleValue("");
      setDescValue("");
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 ml-auto"
        >
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Lesson</DialogTitle>
          <DialogDescription>
            Fill in the lesson details. Upload only PDF files, max 5MB total.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              {...register("title")}
              value={titleValue}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(e) => {
                if (e.target.value.length <= MAX_TITLE_LENGTH) {
                  setTitleValue(e.target.value);
                  setValue("title", e.target.value);
                }
              }}
            />
            <div className="text-sm text-muted-foreground text-right">
              {titleValue.length}/{MAX_TITLE_LENGTH}
            </div>
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Lesson Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              value={descValue}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(e) => {
                if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                  setDescValue(e.target.value);
                  setValue("description", e.target.value);
                }
              }}
              rows={4}
            />
            <div className="text-sm text-muted-foreground text-right">
              {descValue.length}/{MAX_DESCRIPTION_LENGTH}
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="youtubeLinks">YouTube Link</Label>
            <Input id="youtubeLinks" {...register("youtubeLinks")} />
            {errors.youtubeLinks && (
              <p className="text-red-500 text-sm">{errors.youtubeLinks.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="otherLink">Other Link</Label>
            <Input id="otherLink" {...register("otherLink")} />
            {errors.otherLink && (
              <p className="text-red-500 text-sm">{errors.otherLink.message}</p>
            )}
          </div>

          <div>
            <Label>Lesson PDF Files</Label>
            {pdfInputs.map((input) => (
              <div key={input.id} className="flex items-center gap-2 mt-2">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(input.id, e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveField(input.id)}
                  disabled={pdfInputs.length === 1}
                  className="text-red-500"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAddField}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another File
            </Button>

            <p className="text-gray-600 text-sm mt-1">
              Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB / 5 MB
            </p>

            {errors.pdfFiles && (
              <p className="text-red-500 text-sm mt-2">{errors.pdfFiles.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setPdfInputs([{ id: Date.now(), file: null }]);
                setTitleValue("");
                setDescValue("");
                setTotalSize(0);
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonModal;

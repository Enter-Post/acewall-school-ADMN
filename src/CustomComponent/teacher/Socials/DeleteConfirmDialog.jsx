import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmDialog({ onDelete }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete(); // ✅ Support async deletion
    setOpen(false); // Close dialog after delete
  };

  return (
    <div>
      {/* 🗑️ Button to open dialog */}
      <Trash2
        className="text-red-400 cursor-pointer hover:text-red-600 transition"
        onClick={() => setOpen(true)}
      />

      {/* 🔒 Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            This action cannot be undone. It will permanently delete this post.
          </p>

          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

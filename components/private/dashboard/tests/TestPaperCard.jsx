"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Circle, CircleCheck, Edit, Share, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const TestPaperCard = ({
  test,
  published,
  createdBy,
  creatorName,
  onEditClick,
  onDeleteClick,
  onPublishClick,
}) => {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Format dates
  const formattedCreatedAt = test?.createdAt
    ?.split("T")[0]
    ?.split("-")
    .reverse()
    .join("/");

  const formattedTestDate = test.date.split("-").reverse().join("/");

  // Check if test date is past
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }-${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;

  const isPastTest = test.date < todayDate;

  const handleDelete = async () => {
    if (deleteLoading) return;

    setDeleteLoading(true);
    try {
      if (onDeleteClick) {
        await onDeleteClick();
      } else {
        toast.error("Delete functionality not implemented");
      }
    } catch (error) {
      console.error("Error deleting test paper:", error);
      toast.error("Failed to delete test paper");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
      <div className="bg-secondary text-primary p-4">
        <div className="flex items-center gap-3 mb-3">
          {isPastTest ? (
            <CircleCheck className="text-green-300 h-5 w-5 flex-shrink-0" />
          ) : (
            <Circle className="text-red-300 h-5 w-5 flex-shrink-0" />
          )}
          <h3 className="font-semibold text-lg line-clamp-1">{test.title}</h3>
        </div>

        <div className="text-sm space-y-1 ml-8">
          <p>Subject: {test.subject}</p>
          <p>Created on: {formattedCreatedAt}</p>
          <p>Test on: {formattedTestDate}</p>
          <p>Total marks: {test.totalMarks}</p>
          {creatorName && <p>Created by: {creatorName}</p>}
        </div>
      </div>

      <div className="p-3 flex justify-between items-center">
        <div className="flex gap-2">
          {/* View Test Paper */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                View
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{test.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="flex flex-col gap-1 mb-2">
                    <span>Subject: {test.subject}</span>
                    <span>Created on: {formattedCreatedAt}</span>
                    <span>Test on: {formattedTestDate}</span>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <iframe
                src={test.url}
                className="w-full rounded"
                height="500"
                allowFullScreen
              ></iframe>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Share Test Paper - Only for published tests */}
          {published && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/tests/share/${test.id}`)}
            >
              Share
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Edit Test Paper - Based on onEditClick prop for flexibility */}
          {onEditClick ? (
            <Button
              variant="outline"
              size="icon"
              onClick={onEditClick}
              title="Edit Test"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/dashboard/tests/edit/${test.id}`)}
              title="Edit Test"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {/* Publish button for draft papers */}
          {!published && onPublishClick && (
            <Button variant="outline" size="sm" onClick={onPublishClick}>
              Publish
            </Button>
          )}

          {/* Check Marks - For regular test papers */}
          {published && isPastTest && !onEditClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/tests/${test.id}/marks`)}
            >
              Marks
            </Button>
          )}

          {/* Check Marks - For faculty test papers */}
          {published && isPastTest && onEditClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/tests/faculty/marks/${test.id}`)
              }
            >
              Marks
            </Button>
          )}

          {/* Attendance - For faculty test papers */}
          {published && onEditClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/tests/faculty/attendance/${test.id}`)
              }
            >
              Attendance
            </Button>
          )}

          {/* Delete Test Paper */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                disabled={deleteLoading}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Test Paper</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this test paper? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default TestPaperCard;

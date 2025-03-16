"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";

const RequestReview = ({
  name,
  email,
  ay,
  grade,
  userId,
  feeData,
  academicYear,
}) => {
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const requestReviewHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending Request...");

    if (
      !additionalMessage ||
      !additionalMessage.trim() ||
      !additionalMessage.length ||
      !additionalMessage.trim().length ||
      additionalMessage.trim().length < 10
    ) {
      toast.error("Please add a valid additional message.", {
        id: toastId,
      });
      return;
    }

    // Calculate total fees paid
    const totalFeesPaid = feeData
      ? feeData.reduce((total, fee) => total + fee.feesPaid, 0)
      : 0;

    try {
      // Use the existing /api/review endpoint
      const emailResp = await fetch("/api/review", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          ay,
          grade,
          userId,
          additionalMessage,
          feeData,
          academicYear: academicYear || ay,
          totalFeesPaid,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (emailResp.status !== 200) {
        toast.error("Failed to send message. Please try again.", {
          id: toastId,
        });
        return;
      }

      toast.success("Request sent successfully!", {
        id: toastId,
      });
      setAdditionalMessage("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending review request:", error);
      toast.error(
        "There was an error sending your request. Please try again.",
        {
          id: toastId,
        }
      );
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Request Review</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Request Fee Review {academicYear && `(${academicYear})`}
            </DialogTitle>
            <DialogDescription>
              Found a mistake in the fee addition? No Problem, you can request
              admins to review the fee details.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="addtionalmessage">Additional Message</Label>
            <Textarea
              id="addtionalmessage"
              placeholder="Additional Message Here..."
              rows={8}
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={requestReviewHandler}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestReview;

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

const RequestReview = ({ name, email, ay, grade, userId, feeData }) => {
  const [additionalMessage, setAdditionalMessage] = useState("");

  const requestReviewHandler = async () => {
    const loading = toast.loading("Sending Request...");

    if (
      !additionalMessage ||
      !additionalMessage.trim() ||
      !additionalMessage.length ||
      !additionalMessage.trim().length ||
      additionalMessage.trim().length < 10
    ) {
      toast.error("Please add a valid additional message.", {
        id: loading,
      });
      return;
    }

    // console.log("FEEDATA", feeData);

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
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (emailResp.status !== 200) {
      // console.log("EMAILRESP", emailResp);
      toast.error("Failed to send message. Please try again.", {
        id: loading,
      });
      setAdditionalMessage("");
      return;
    }

    toast.success("Message sent successfully!", {
      id: loading,
    });
    setAdditionalMessage("");
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Request Review</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Fee Review</DialogTitle>
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

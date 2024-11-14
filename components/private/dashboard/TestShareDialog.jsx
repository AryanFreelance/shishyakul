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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOCK_SHARED_WITH_TESTPAPER } from "@/graphql/mutations/testPaper.mutation";
import { GET_TESTPAPER } from "@/graphql/queries/testPaper.query";
import { useMutation } from "@apollo/client";
import { LockOpen, X } from "lucide-react";
import React, { useState } from "react";

const TestShareDialog = ({ sharedWith, setSharedWith, testpaperId }) => {
  const [academicYear, setAcademicYear] = useState(
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  );
  const [grade, setGrade] = useState("");
  const [batch, setBatch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [lockSharedWithTestpaper] = useMutation(LOCK_SHARED_WITH_TESTPAPER, {
    refetchQueries: [
      { query: GET_TESTPAPER, variables: { id: testpaperId, published: true } },
    ],
  });

  const addShareInfo = (e) => {
    // console.log("SHAREDWITH", sharedWith);
    e.preventDefault();
    // Add the students to the test shared Array
    setSharedWith([
      ...sharedWith,
      { academicYear, grade, batch: batch === "" ? "N/A" : batch },
    ]);
    setIsDialogOpen(false);
  };

  const removeShareWithHandler = (e, index) => {
    e.preventDefault();
    // console.log("SHAREDWITH", sharedWith);
    setSharedWith(sharedWith.filter((_, i) => i !== index));
  };

  const lockTestHandler = async (e) => {
    e.preventDefault();
    const confirmLocking = confirm("Are you sure to lock the sharing?");
    // console.log("CONFIRM LOCKING", confirmLocking);
    if (!confirmLocking) {
      alert("No Changes Happened!");
      return;
    }

    const lockResponse = await lockSharedWithTestpaper({
      variables: {
        id: testpaperId,
        lockShareWith: true,
      },
    });

    // console.log("LOCKSHAREDWITHTESTOAOER", lockResponse);

    if (lockResponse?.data?.lockSharedWithTest === "SUCCESS") {
      alert("Locked the Test Sharing!");
    } else {
      alert("OOPS! Some Error Occured while locking test paper!");
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:gap-4 lg:gap-6 mt-4">
        <Label
          htmlFor="share-to"
          className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%] py-3 flex gap-2 items-center"
        >
          <span>Share To</span>{" "}
          <button onClick={lockTestHandler}>
            <LockOpen />
          </button>
        </Label>
        <div className="w-full lg:w-[80%] md:w-[70%] flex flex-col md:gap-6 gap-2">
          <div className="flex gap-2 md:gap-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Share Test Paper</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Share Test Paper</DialogTitle>
                  <DialogDescription>
                    Share the test paper to the students.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="academicYear" className="text-right">
                      AY
                    </Label>
                    <Input
                      id="academicYear"
                      className="col-span-3"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grade" className="text-right">
                      Grade
                    </Label>
                    <Input
                      id="grade"
                      placeholder="8 | 9 | 10 | 11 | 12"
                      className="col-span-3"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="batch" className="text-right">
                      Batch
                    </Label>
                    <Input
                      id="batch"
                      placeholder="Optional"
                      className="col-span-3"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addShareInfo} type="submit">
                    Share
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="flex gap-6 flex-wrap">
        {/* Share With Array */}
        {sharedWith?.map((item, index) => (
          <div
            key={index}
            className="border-2 border-black rounded-md px-4 py-2 flex gap-3 items-center"
          >
            <div>
              <p>AY: {item.academicYear}</p>
              <p>Grade: {item.grade}</p>
              {item.batch !== "N/A" && <p>Batch: {item.batch}</p>}
            </div>
            <button
              className=""
              onClick={(e) => removeShareWithHandler(e, index)}
            >
              <X />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default TestShareDialog;

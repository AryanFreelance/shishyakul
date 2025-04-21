"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "@apollo/client";
import { UPDATE_STUDENT_TOTAL_FEES } from "@/graphql/mutations/fees.mutation";
import { GET_STUDENT_DETAILS } from "@/graphql/queries/students.query";
import { GET_STUDENT_FEES } from "@/graphql/queries/fees.query";
import toast from "react-hot-toast";

const StudentFeesInfoDialog = ({ id, studData, academicYear }) => {
  const [totalFees, setTotalFees] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize with existing total fees if available
  useEffect(() => {
    if (studData?.student?.totalFees) {
      setTotalFees(studData.student.totalFees);
    }
  }, [studData]);

  // Note: This mutation needs to be implemented on the backend
  // If the mutation is not available, this will fail gracefully
  const [updateStudentTotalFees, { loading }] = useMutation(
    UPDATE_STUDENT_TOTAL_FEES,
    {
      refetchQueries: [
        {
          query: GET_STUDENT_DETAILS,
          variables: {
            ay: studData?.student?.ay,
            grade: studData?.student?.grade,
            userId: id,
          },
        },
        {
          query: GET_STUDENT_FEES,
          variables: {
            userId: id,
            academicYear: academicYear,
          },
        },
      ],
      onError: (error) => {
        console.error("GraphQL Error:", error);
      },
    }
  );

  const saveFeeInfoHandler = async () => {
    const toastId = toast.loading("Updating total fees...");
    try {
      // Attempt to use the mutation
      await updateStudentTotalFees({
        variables: {
          userId: id,
          totalFees: parseInt(totalFees),
          academicYear: academicYear,
        },
      });
      toast.success("Total fees updated successfully!", {
        id: toastId,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating total fees:", error);

      // If the mutation fails, show a more informative message
      toast.error(
        "There was an error updating total fees. The backend may need to be updated to support this feature.",
        { id: toastId }
      );

      // Log the required backend changes to the console for developers
      console.info(`
        Backend Changes Required:
        1. Add 'totalFees' field to the Student schema
        2. Implement 'updateStudentTotalFees' mutation resolver
        3. Update the GraphQL schema to include the new mutation
      `);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-2">
          Edit Fee Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Fee Details {academicYear && `(${academicYear})`}
          </DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="total-fees">Total Fees</Label>
          <Input
            id="total-fees"
            placeholder="1000"
            type="number"
            value={totalFees}
            onChange={(e) => setTotalFees(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={saveFeeInfoHandler} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFeesInfoDialog;

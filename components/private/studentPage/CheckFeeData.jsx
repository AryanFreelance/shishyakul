"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import Link from "next/link";
import toast from "react-hot-toast";
import { DELETE_FEE, UPDATE_FEE } from "@/graphql/mutations/fees.mutation";
import { useMutation } from "@apollo/client";
import { GET_STUDENT_DETAILS } from "@/graphql/queries/students.query";
import { MessageCirclePlus, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

const CheckFeeData = ({ isAdmin, studData, id }) => {
  const [remark, setRemark] = useState("");
  const [open, setOpen] = useState(false);

  const [deleteFee] = useMutation(DELETE_FEE, {
    refetchQueries: [
      {
        query: GET_STUDENT_DETAILS,
        variables: {
          ay: studData?.student?.ay,
          grade: studData?.student?.grade,
          userId: id,
        },
      },
    ],
  });

  const [updateFee] = useMutation(UPDATE_FEE, {
    refetchQueries: [
      {
        query: GET_STUDENT_DETAILS,
        variables: {
          ay: studData?.student?.ay,
          grade: studData?.student?.grade,
          userId: id,
        },
      },
    ],
  });

  useEffect(() => {
    if (!open) setRemark("");
  }, [open]);

  const handleMutation = async (
    mutationFn,
    variables,
    loadingMessage,
    successMessage,
    errorMessage
  ) => {
    const toastId = toast.loading(loadingMessage);
    try {
      await mutationFn({ variables });
      toast.success(successMessage, { id: toastId });
    } catch {
      toast.error(errorMessage, { id: toastId });
    }
  };

  const saveRemarkHandler = (e, feeId) => {
    e.preventDefault();
    handleMutation(
      updateFee,
      { id: feeId, userId: id, remark },
      "Updating Remark!",
      "Remark updated successfully!",
      "There was an error updating remark!"
    );
  };

  const deleteFeeHandler = (e, feeid) => {
    e.preventDefault();
    handleMutation(
      deleteFee,
      { userId: id, deleteFeeId: feeid },
      "Deleting Fee...",
      "Fee deleted successfully!",
      "There was an error deleting fee!"
    );
  };

  const dialogOpenChangeHandler = (fee) => {
    setOpen(!open);
    setRemark(fee.remark || "");
  };

  const renderTableRows = () => {
    if (!studData || studData?.student.fees.length === 0) {
      return (
        <TableRow>
          <TableCell
            className="barlow-medium text-center"
            colSpan={isAdmin ? 5 : 4}
          >
            No Fees Paid
          </TableCell>
        </TableRow>
      );
    }

    return studData?.student.fees.map((fee) => (
      <TableRow key={fee.id}>
        <TableCell className="barlow-medium">
          <AlertDialog>
            <AlertDialogTrigger>₹{fee.feesPaid}</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Fee Information</AlertDialogTitle>
                <AlertDialogDescription>
                  Details of the student fee.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col justify-start gap-4">
                <span className="barlow-regular">
                  Fees Paid - ₹{fee.feesPaid}
                </span>
                <span className="barlow-regular">Paid On - {fee.paidOn}</span>
                <span className="barlow-regular">
                  Month - {fee.month}, {fee.year}
                </span>
                <span className="barlow-regular">
                  Mode - {fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1)}
                </span>
                <span className="barlow-regular">
                  Fee Added On - {fee.createdAt.split(",")[0]}
                </span>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
        <TableCell className="barlow-regular">{fee.paidOn}</TableCell>
        <TableCell className="barlow-regular">
          {fee.mode === "cash" || fee.mode === "neft" ? (
            `${fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1)}`
          ) : (
            <Link
              href={fee.mode === "upi" ? fee.upiImgUrl : fee.chequeImgUrl}
              target="_blank"
              className="barlow-bold"
            >
              {fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1)}
            </Link>
          )}
        </TableCell>
        <TableCell className="barlow-regular">
          {fee.month}, {fee.year}
        </TableCell>
        {isAdmin && (
          <TableCell className="flex items-center justify-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger>
                <Button variant="outline">
                  <Trash />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Fee</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this fee?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button onClick={(e) => deleteFeeHandler(e, fee.id)}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Dialog
              open={open}
              onOpenChange={() => dialogOpenChangeHandler(fee)}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageCirclePlus />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Remark</DialogTitle>
                  <DialogDescription>
                    Add remark of the fee below.
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label htmlFor="remark">Remark</Label>
                  <Textarea
                    id="remark"
                    placeholder="Fee Remark Here..."
                    rows={8}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={(e) => saveRemarkHandler(e, fee.id)}
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="barlow-semibold w-[100px]">
              Fees Paid
            </TableHead>
            <TableHead className="barlow-semibold">Paid On</TableHead>
            <TableHead className="barlow-semibold">Paid Via</TableHead>
            <TableHead className="barlow-semibold">Month</TableHead>
            {isAdmin && (
              <TableHead className="barlow-semibold">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>{renderTableRows()}</TableBody>
      </Table>
    </div>
  );
};

export default CheckFeeData;

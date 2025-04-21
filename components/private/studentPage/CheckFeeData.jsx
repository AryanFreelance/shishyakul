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
  AlertDialogAction,
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
import { GET_STUDENT_FEES } from "@/graphql/queries/fees.query";
import { MessageCirclePlus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

const CheckFeeData = ({ isAdmin, studData, id, academicYear }) => {
  const [remark, setRemark] = useState("");
  const [open, setOpen] = useState(false);
  const [currentFeeId, setCurrentFeeId] = useState(null);

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
      {
        query: GET_STUDENT_FEES,
        variables: {
          userId: id,
          academicYear: academicYear,
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
      {
        query: GET_STUDENT_FEES,
        variables: {
          userId: id,
          academicYear: academicYear,
        },
      },
    ],
  });

  useEffect(() => {
    if (!open) {
      setRemark("");
      setCurrentFeeId(null);
    }
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

  const saveRemarkHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving Remark...");
    if (!remark) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      return;
    }

    await updateFee({
      variables: {
        id: currentFeeId,
        userId: id,
        remark,
        academicYear,
      },
    })
      .then((data) => {
        // console.log(data);
        toast.success("Remark added successfully!", {
          id: toastId,
        });
        setOpen(false);
      })
      .catch((error) => {
        // console.log(error);
        toast.error("There was an error adding remark!", {
          id: toastId,
        });
      });
  };

  const deleteFeeHandler = async (feeId) => {
    const toastId = toast.loading("Deleting Fee...");

    await deleteFee({
      variables: {
        deleteFeeId: feeId,
        userId: id,
        academicYear: academicYear,
      },
    })
      .then((data) => {
        // console.log(data);
        toast.success("Fee deleted successfully!", {
          id: toastId,
        });
      })
      .catch((error) => {
        console.error("Error deleting fee:", error);
        toast.error("There was an error deleting fee!", {
          id: toastId,
        });
      });
  };

  const openRemarkDialog = (fee) => {
    setRemark(fee.remark || "");
    setCurrentFeeId(fee.id);
    setOpen(true);
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
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the fee data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteFeeHandler(fee.id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => openRemarkDialog(fee)}>
              <MessageCirclePlus />
            </Button>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Remark</DialogTitle>
            <DialogDescription>Add remark of the fee below.</DialogDescription>
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
            <Button type="submit" onClick={saveRemarkHandler}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

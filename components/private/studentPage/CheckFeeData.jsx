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

  const saveRemarkHandler = async (e, feeId) => {
    e.preventDefault();
    console.log("REMARK", remark);
    const toasting = toast.loading("Updating Remark!");
    console.log(id, feeId, remark);

    await updateFee({
      variables: {
        id: feeId,
        userId: id,
        remark: remark,
      },
    })
      .then((data) => {
        // console.log(data);
        toast.success("Remark updated successfully!", {
          id: toasting,
        });
        console.log("DATA", data);
      })
      .catch((error) => {
        // console.log(error);
        toast.error("There was an error updating remark!", {
          id: toasting,
        });
        console.log("ERROR", error);
      });
  };

  const deleteFeeHandler = async (e, feeid) => {
    e.preventDefault();

    // console.log("Fee Deleting");
    // console.log("FEEID", feeid, id);

    const toastId = toast.loading("Deleting Fee...");

    await deleteFee({
      variables: {
        userId: id,
        deleteFeeId: feeid,
      },
    })
      .then((data) => {
        // console.log(data);
        toast.success("Fee deleted successfully!", {
          id: toastId,
        });
      })
      .catch((error) => {
        // console.log(error);
        toast.error("There was an error deleting fee!", {
          id: toastId,
        });
      });
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
        <TableBody>
          {studData && studData?.student.fees.length === 0 && (
            <TableRow>
              <TableCell className="barlow-medium text-center" colSpan="3">
                No Fees Paid
              </TableCell>
            </TableRow>
          )}
          {studData &&
            studData?.student.fees.length !== 0 &&
            studData?.student.fees.map((fee) => (
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
                        <span className="barlow-regular">
                          Paid On - {fee.paidOn}
                        </span>
                        <span className="barlow-regular">
                          Month - {fee.month}, {fee.year}
                        </span>
                        <span className="barlow-regular">
                          Mode -{" "}
                          {fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1)}
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
                  {fee.mode === "cash" ? (
                    `${fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1)}`
                  ) : (
                    <Link
                      href={
                        fee.mode === "upi" ? fee.upiImgUrl : fee.chequeImgUrl
                      }
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
                  <>
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
                            <Button
                              onClick={(e) => deleteFeeHandler(e, fee.id)}
                            >
                              Delete
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Dialog open={open} onOpenChange={setOpen}>
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
                              defaultValue={fee?.remark}
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
                  </>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CheckFeeData;

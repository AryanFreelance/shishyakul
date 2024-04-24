"use client";

import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import Link from "next/link";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import {
  GET_STUDENTS,
  GET_TEMP_STUDENTS_QUERY,
} from "@/graphql/queries/students.query";
import {
  CreateVerification,
  DELETE_VERIFICATIONS,
} from "@/graphql/mutations/verifications.mutation";
import {
  CreateTempStudent,
  DELETE_STUDENT,
  DELETE_TEMP_STUDENT,
} from "@/graphql/mutations/students.mutation";
import { DELETE_FEES_USERS } from "@/graphql/mutations/fees.mutation";

const page = () => {
  const [studEmail, setStudEmail] = useState("");
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);

  // Queries
  const { data } = useSuspenseQuery(GET_STUDENTS);
  const { data: tempStudents } = useSuspenseQuery(GET_TEMP_STUDENTS_QUERY);

  // Mutations
  const [createVerification] = useMutation(CreateVerification);
  const [createTempStudent] = useMutation(CreateTempStudent, {
    refetchQueries: [{ query: GET_TEMP_STUDENTS_QUERY }],
  });
  const [deleteStudent] = useMutation(DELETE_STUDENT, {
    refetchQueries: [{ query: GET_STUDENTS }],
  });
  const [deleteFeeUsers] = useMutation(DELETE_FEES_USERS);
  const [deleteTempStudent] = useMutation(DELETE_TEMP_STUDENT, {
    refetchQueries: [{ query: GET_TEMP_STUDENTS_QUERY }],
  });
  const [deleteVerification] = useMutation(DELETE_VERIFICATIONS);

  if (data) console.log(data);
  // if (tempStudents) console.log("TEMPSTUDENTS", tempStudents);
  // if (verifications) console.log("VERIFICATIONS", verifications);
  // if (loading) console.log("Submitting...");
  // if (!loading) console.log("MDATA...", mdata);
  // if (error) console.log(`Submission error! ${error.message}`);

  // if (!verificationLoading)
  //   console.log("VERIFICATION LOADING STOPS", verificationData);

  const requestVerificationCode = async () => {
    const result = await createVerification({
      variables: { studentEmail: studEmail },
    });
    const verificationData = result.data.createVerification;
    const verificationDataCode = { code: verificationData.code };

    console.log("VERIFICATION CODE", verificationDataCode);

    return verificationDataCode;
  };

  const addTempStudent = async (verificationDataCode) => {
    console.log("VERIFICATION DATA...", verificationDataCode);
    await createTempStudent({
      variables: {
        email: studEmail,
        verificationCode: verificationDataCode.code,
      },
    });
  };

  const addStudent = async () => {
    const toastId = toast.loading("Adding Student...");
    const verificationDataCode = await requestVerificationCode();
    await addTempStudent(verificationDataCode);

    await emailjs
      .send(
        "service_ic02pwe",
        "template_v53ko4t",
        {
          sign_up_link: `http://localhost:3000/register/${verificationDataCode.code}`,
          sign_up_code: verificationDataCode.code,
          to_email: studEmail,
        },
        "0VNUkTzXWUy3G49zl"
      )
      .then(
        () => {
          console.log("SUCCESS!");
          toast.success("Student Added Successfully!", {
            id: toastId,
          });
        },
        (error) => {
          console.log("FAILED...", error.text);
          toast.error("Failed to add student!", {
            id: toastId,
          });
        }
      );
    setOpenAddStudentDialog(false);
  };

  const deleteStudentHandler = async (studentUserId) => {
    const toastId = toast.loading("Deleting Student...");
    await deleteStudent({ variables: { userId: studentUserId } });
    await deleteFeeUsers({ variables: { userId: studentUserId } });
    toast.success("Student Deleted Successfully!", {
      id: toastId,
    });
  };

  const deletePendingStudentHandler = async (email, verificationCode) => {
    const toastId = toast.loading("Deleting Student...");

    await deleteTempStudent({ variables: { email: email } });
    await deleteVerification({
      variables: { verificationCode: verificationCode },
    });

    toast.success("Student Deleted Successfully!", {
      id: toastId,
    });
  };

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div v className="pb-10">
        <div className="flex justify-between items-center">
          <h2 className="subheading">Manage Students</h2>
          <Dialog
            open={openAddStudentDialog}
            onOpenChange={setOpenAddStudentDialog}
          >
            <DialogTrigger asChild>
              <Button className="flex gap-2 items-center">
                <span className="barlow-regular">Add Student</span> <Plus />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="barlow-semibold">
                  Add Student
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="Enter your email..."
                    className="col-span-3"
                    value={studEmail}
                    onChange={(e) => setStudEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={addStudent}>
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="barlow-semibold w-[100px]">
                  User ID.
                </TableHead>
                <TableHead className="barlow-semibold">Name</TableHead>
                <TableHead className="barlow-semibold">Email</TableHead>
                <TableHead className="barlow-semibold">Phone</TableHead>
                <TableHead className="barlow-semibold">Grade</TableHead>
                <TableHead className="barlow-semibold">Attendance</TableHead>
                <TableHead className="barlow-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students?.map((student, index) => (
                <TableRow key={index}>
                  <TableCell className="barlow-semibold">
                    {student.userId}
                  </TableCell>
                  <TableCell className="barlow-regular">
                    {student.firstname} {student.lastname}
                  </TableCell>
                  <TableCell className="barlow-regular">
                    {student.email}
                  </TableCell>
                  <TableCell className="barlow-regular">
                    {student.phone}
                  </TableCell>
                  <TableCell className="barlow-regular">
                    {student.grade}
                  </TableCell>
                  <TableCell className="barlow-regular">
                    {}

                    {student.attendance.present + student.attendance.absent ===
                    0
                      ? "N/A"
                      : `${Math.round(
                          (student.attendance.present /
                            (student.attendance.present +
                              student.attendance.absent)) *
                            100
                        )} %`}
                  </TableCell>
                  <TableCell className="barlow-regular flex items-center gap-4">
                    <Link
                      href={`/student/${student.userId}`}
                      className="border-2 border-main rounded p-1"
                    >
                      <Eye />
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="border-2 border-main rounded p-1">
                          <Trash />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteStudentHandler(student.userId)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="pb-10">
        <div className="flex justify-between items-center">
          <h2 className="subheading">Students Pending</h2>
        </div>
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="barlow-semibold">Email</TableHead>
                <TableHead className="barlow-semibold">
                  Verification Code
                </TableHead>
                <TableHead className="barlow-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tempStudents.tempStudents?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan="3"
                    className="barlow-semibold text-center"
                  >
                    No pending students
                  </TableCell>
                </TableRow>
              )}
              {tempStudents.tempStudents?.map((tmpstudent, index) => (
                <TableRow key={index}>
                  <TableCell className="barlow-semibold">
                    {tmpstudent.email}
                  </TableCell>
                  <TableCell className="barlow-regular">
                    {tmpstudent.verificationCode}
                  </TableCell>
                  <TableCell className="barlow-regular flex items-center gap-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="border-2 border-main rounded p-1">
                          <Trash />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deletePendingStudentHandler(
                                tmpstudent.email,
                                tmpstudent.verificationCode
                              )
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Container>
  );
};

export default page;

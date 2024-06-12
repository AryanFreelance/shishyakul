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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import {
  DELETE_STUDENT,
  DELETE_TEMP_STUDENT,
  INITIALIZE_STUDENT,
} from "@/graphql/mutations/students.mutation";
import {
  DASHBOARD_GET_STUDENT,
  GET_TEMP_STUDENTS,
} from "@/graphql/queries/students.query";

const page = () => {
  const [studEmail, setStudEmail] = useState("");
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [grades, setGrades] = useState(new Set());
  const [selectedGrades, setSelectedGrades] = useState(new Set());

  // Queries - GET_TEMP_STUDENTS, DASHBOARD_GET_STUDENT
  const {
    data: tempStudents,
    loading: tempStudentsLoading,
    error: tempStudentsError,
  } = useSuspenseQuery(GET_TEMP_STUDENTS);
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = useSuspenseQuery(DASHBOARD_GET_STUDENT);

  // Mutations - INITIALIZE_STUDENT, DELETE_STUDENT, DELETE_TEMP_STUDENT
  const [initializeStudent] = useMutation(INITIALIZE_STUDENT, {
    refetchQueries: [{ query: GET_TEMP_STUDENTS }],
  });
  const [deleteStudent] = useMutation(DELETE_STUDENT, {
    refetchQueries: [{ query: DASHBOARD_GET_STUDENT }],
  });
  const [deleteTempStudent] = useMutation(DELETE_TEMP_STUDENT, {
    refetchQueries: [{ query: GET_TEMP_STUDENTS }],
  });

  if (tempStudents) console.log("tempStudents", tempStudents);
  if (students) console.log("STUDENTS", students);
  if (tempStudentsLoading) console.log("tempStudents LOADING...");
  if (studentsLoading) console.log("STUDENTS LOADING...");
  if (tempStudentsError)
    console.log(`tempStudents ERROR! ${tempStudentsError}`);
  if (studentsError) console.log(`STUDENTS ERROR! ${studentsError}`);

  const deleteStudentHandler = async (userId) => {
    const toastId = toast.loading("Deleting Student...");
    const response = await deleteStudent({ variables: { userId } });

    if (response === "ERROR" || response === null) {
      toast.error("Failed to delete student!", {
        id: toastId,
      });
      return;
    }
    toast.success("Student Deleted Successfully!", {
      id: toastId,
    });
  };

  const addStudentHandler = async () => {
    const toastId = toast.loading("Adding Student...");
    const response = await initializeStudent({
      variables: { email: studEmail },
    });

    if (response === "ERROR" || response === null) {
      toast.error("Failed to add student!", {
        id: toastId,
      });
      return;
    }
    console.log("MAINRESPONSE", response);
    console.log("RESPONSE", response.initializeStudent);

    const domain = window.location.origin;

    await emailjs
      .send(
        "service_ic02pwe",
        "template_v53ko4t",
        {
          sign_up_link: `${domain}/register/${response?.data.initializeStudent}`,
          sign_up_code: response?.data.initializeStudent,
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

  const deleteTempStudentHandler = async (email) => {
    const toastId = toast.loading("Deleting Student...");

    await deleteTempStudent({ variables: { email: email } });

    toast.success("Temporary Student Deleted Successfully!", {
      id: toastId,
    });
  };

  // Extract unique grades from students data
  useEffect(() => {
    if (students) {
      const uniqueGrades = new Set(
        students?.students.map((student) => student.grade)
      );
      setGrades(uniqueGrades);
      setSelectedGrades(uniqueGrades); // Initially, all grades are selected
    }
  }, [students]);

  const handleGradeChange = (grade) => {
    setSelectedGrades((prev) => {
      const newSelectedGrades = new Set(prev);
      if (newSelectedGrades.has(grade)) {
        newSelectedGrades.delete(grade);
      } else {
        newSelectedGrades.add(grade);
      }
      return newSelectedGrades;
    });
  };

  const filteredStudents = students?.students?.filter((student) =>
    selectedGrades.has(student.grade)
  );

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
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
                <Button type="submit" onClick={addStudentHandler}>
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8">
          <div>
            <div>
              <h2 className="subsubheading text-secondary">Grades</h2>
            </div>
            <div className="flex gap-4 max-w-full flex-wrap mt-2 ml-2">
              {Array.from(grades).map((grade, index) => (
                <div
                  key={grade}
                  className="flex gap-1 justify-center items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedGrades.has(grade)}
                    onChange={() => handleGradeChange(grade)}
                    id={`grade${index}`}
                  />
                  <label htmlFor={`grade${index}`} className="font-semibold">
                    {grade}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* {filteredStudents?.length === 0 ? (
            <div className="mt-8">
              <h3 className="barlow-semibold text-center">No students found</h3>
            </div>
          ) : ( */}
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
              {filteredStudents?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="barlow-semibold text-center"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              )}
              {filteredStudents.length > 0 &&
                filteredStudents?.map((student, index) => (
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
                      {student.attendance.present +
                        student.attendance.absent ===
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
                              This action cannot be undone. This will
                              permanently delete your account and remove your
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteStudentHandler(student.userId)
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
          {/* )} */}
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
              {tempStudents.tempStudents?.map((tempStudents, index) => (
                <TableRow key={index}>
                  <TableCell className="barlow-semibold">
                    {tempStudents.email}
                  </TableCell>
                  <TableCell className="barlow-regular">
                    {tempStudents.verificationCode}
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
                              deleteTempStudentHandler(tempStudents.email)
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

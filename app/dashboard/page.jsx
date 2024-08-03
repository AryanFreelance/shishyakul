"use client";

import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Eye, Plus, SearchIcon, Trash } from "lucide-react";
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
import {
  DELETE_STUDENT,
  DELETE_TEMP_STUDENT,
  INITIALIZE_STUDENT,
} from "@/graphql/mutations/students.mutation";
import {
  DASHBOARD_GET_STUDENT,
  GET_TEMP_STUDENTS,
} from "@/graphql/queries/students.query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { unique } from "next/dist/build/utils";

const DashboardPage = () => {
  const [studEmail, setStudEmail] = useState("");
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [grades, setGrades] = useState(new Set());
  const [selectedGrades, setSelectedGrades] = useState();
  const [batch, setBatch] = useState(new Set());
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchParameters, setSearchParameters] = useState({
    studentName: "",
    grade: "",
    batch: "",
  });

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
    try {
      const response = await deleteStudent({ variables: { userId } });

      if (response === "ERROR" || response === null) {
        toast.error("Failed to delete student!", {
          id: toastId,
        });
        return;
      }

      const deleteuserResponse = await fetch("/api/user", {
        method: "DELETE",
        body: JSON.stringify({ uid: userId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("DELETEUSERRESPONSE", deleteuserResponse);

      if (deleteuserResponse.status !== 200) {
        toast.error("Failed to delete student from database!", {
          id: toastId,
        });
        return;
      }

      toast.success("Student Deleted Successfully!", {
        id: toastId,
      });
    } catch (error) {
      toast.error("Failed to delete student!", {
        id: toastId,
      });
    }
  };

  const addStudentHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding Student...");

    if (
      !studEmail ||
      !studEmail.includes("@") ||
      !studEmail.includes(".") ||
      studEmail.length < 5
    ) {
      toast.error("Please enter a valid email!", {
        id: toastId,
      });
      return;
    }

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

    const inviteResp = await fetch("/api/invite", {
      method: "POST",
      body: JSON.stringify({
        email: studEmail,
        r_message: `Sign Up Link - ${domain}/register/${response?.data.initializeStudent}`,
        r_code: response?.data.initializeStudent,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (inviteResp.status !== 200) {
      console.log("Failed to send invite. Please try again.");
      toast.error("Failed to send invite. Please try again.", {
        id: toastId,
      });
      setOpenAddStudentDialog(false);
      return;
    }

    toast.success("Student Added Successfully!", {
      id: toastId,
    });

    setOpenAddStudentDialog(false);
  };

  const deleteTempStudentHandler = async (email) => {
    const toastId = toast.loading("Deleting Student...");

    await deleteTempStudent({ variables: { email: email } });

    toast.success("Temporary Student Deleted Successfully!", {
      id: toastId,
    });
  };

  // Extract unique grades and batches from students data
  useEffect(() => {
    if (students) {
      const uniqueGrades = new Set(
        students?.students.map((student) => student.grade)
      );
      const uniqueBatches = new Set(
        students?.students.map((student) => student.batch)
      );
      setGrades(uniqueGrades);
      setBatch(uniqueBatches);
    }
  }, [students]);

  // Update filtered students based on search parameters
  useEffect(() => {
    if (students) {
      let filtered = students?.students;

      if (searchParameters.studentName) {
        filtered = filtered.filter((student) =>
          `${student.firstname} ${student.lastname}`
            .toLowerCase()
            .includes(searchParameters.studentName.toLowerCase())
        );
      }

      if (searchParameters.grade && searchParameters.grade !== "select-grade") {
        filtered = filtered.filter(
          (student) => student.grade === searchParameters.grade
        );
      }

      if (searchParameters.batch && searchParameters.batch !== "select-batch") {
        filtered = filtered.filter(
          (student) => student.batch === searchParameters.batch
        );
      }

      setFilteredStudents(filtered);
    }
  }, [students, searchParameters]);

  console.log("FILTERED STUDENTS", filteredStudents);

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
              <form onSubmit={(e) => addStudentHandler(e)}>
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
                {/* <DialogFooter> */}
                <div className="flex justify-end items-center">
                  <Button type="submit">Add</Button>
                </div>
                {/* </DialogFooter> */}
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8">
          <div className="flex justify-between items-center flex-wrap w-full gap-2 mb-6">
            {/* Searchbar */}
            <div className=" w-full md:w-[58%]">
              <form className="flex items-center gap-2 border-2 rounded-full md:rounded-r-none px-4 py-2 border-main md:border-r-slate-600">
                <button type="submit" className="border-none outline-none">
                  <SearchIcon />
                </button>
                <input
                  type="text"
                  placeholder="Enter Student Name..."
                  className="w-full py-1 bg-transparent outline-none border-none text-secondary"
                  value={searchParameters.studentName}
                  onChange={(e) =>
                    setSearchParameters({
                      ...searchParameters,
                      studentName: e.target.value,
                    })
                  }
                />
              </form>
            </div>
            {/* Batch Dropdown */}
            <div className="w-[48%] md:w-[20%]">
              <Select
                onValueChange={(value) =>
                  setSearchParameters({ ...searchParameters, batch: value })
                }
                defaultValue="select-batch"
              >
                <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full border-main md:rounded-none md:border-t-main md:border-b-main border-2 md:border-r-slate-600 md:border-l-slate-600 outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-batch">Select A.Y.</SelectItem>
                  {Array.from(batch).map((bch, index) => (
                    <SelectItem key={index} value={bch || index}>
                      {bch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Standard Dropdown */}
            <div className="w-[48%] md:w-[20%]">
              <Select
                onValueChange={(value) =>
                  setSearchParameters({ ...searchParameters, grade: value })
                }
                defaultValue="select-grade"
              >
                <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full md:rounded-none md:rounded-r-full border-main border-2 md:border-l-slate-600 outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-grade">Select Grade</SelectItem>
                  {Array.from(grades).map((grd, index) => (
                    <SelectItem key={index} value={grd || index}>
                      {grd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="barlow-semibold w-[100px]">
                  Student ID
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
              {filteredStudents?.length > 0 &&
                filteredStudents?.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="barlow-semibold">
                      {student.sId}
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

export default DashboardPage;

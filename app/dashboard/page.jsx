"use client";

import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Eye, Plus, SearchIcon, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import { useLazyQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  DELETE_STUDENT,
  INITIALIZE_STUDENT,
} from "@/graphql/mutations/students.mutation";
import {
  DASHBOARD_GET_STUDENT,
  GET_ACADEMIC_YEARS,
  GET_TEMP_STUDENTS,
} from "@/graphql/queries/students.query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TempStudentsComp from "@/components/private/dashboard/TempStudentsComp";

const DashboardPage = () => {
  const [studEmail, setStudEmail] = useState("");
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [grades, setGrades] = useState(["8", "9", "10", "11", "12"]);
  const [batch, setBatch] = useState(new Set());
  const [selectedBatch, setSelectedBatch] = useState("select-batch");
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [searchParameters, setSearchParameters] = useState({
    grade: localStorage.getItem("grade") || "select-grade",
    ay: localStorage.getItem("ay") || "select-ay",
  });

  // Queries - GET_ACADEMIC_YEARS, GET_TEMP_STUDENTS, DASHBOARD_GET_STUDENT
  const { data: ay } = useSuspenseQuery(GET_ACADEMIC_YEARS);

  const [fetchStudents, { data: dStudents }] = useLazyQuery(
    DASHBOARD_GET_STUDENT,
    {
      fetchPolicy: "network-only",
      variables: { ay: searchParameters.ay, grade: searchParameters.grade },
      onCompleted: (data) => {
        setStudents(data.students || []);
        console.log("DATA", data);
      },
    }
  );

  console.log("DSTUDENTS", dStudents);

  // Mutations - INITIALIZE_STUDENT, DELETE_STUDENT, DELETE_TEMP_STUDENT
  const [initializeStudent] = useMutation(INITIALIZE_STUDENT, {
    refetchQueries: [{ query: GET_TEMP_STUDENTS }],
  });
  const [deleteStudent] = useMutation(DELETE_STUDENT, {
    refetchQueries: [{ query: DASHBOARD_GET_STUDENT }],
  });

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

      // console.log("DELETEUSERRESPONSE", deleteuserResponse);

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

  // Update the localStorage whenever the search parameters change
  useEffect(() => {
    localStorage.setItem("grade", searchParameters.grade);
    localStorage.setItem("ay", searchParameters.ay);
  }, [searchParameters]);

  useEffect(() => {
    if (searchParameters.ay && searchParameters.ay !== "select-ay")
      fetchStudents({
        fetchPolicy: "network-only",
        variables: {
          ay: searchParameters.ay,
          grade:
            searchParameters.grade === "select-grade"
              ? null
              : searchParameters.grade,
        },
        onCompleted: (data) => {
          setStudents(data.students || []);
          console.log("DATA", data);
        },
      });
    if (searchParameters.ay === "select-ay") setStudents([]);
  }, [searchParameters]);

  useEffect(() => {
    if (students?.length > 0) {
      const uniqueBatch = Array.from(
        new Set(students.map((student) => student.batch).filter(Boolean))
      );
      setBatch(uniqueBatch);
      console.log("UNIQUE BATCH", uniqueBatch);
    } else {
      setBatch([]);
    }
  }, [students]);

  useEffect(() => {
    if (
      selectedBatch &&
      students?.length > 0 &&
      selectedBatch !== "select-batch"
    ) {
      const selectedBatchStudents = students.filter(
        (student) => student.batch === selectedBatch
      );
      setStudents(selectedBatchStudents);
    }
    if (selectedBatch === "select-batch" || !selectedBatch)
      setStudents(dStudents?.students);
  }, [selectedBatch]);

  useEffect(() => {
    if (studentName.length > 0) {
      let filteredStudents = students.filter((student) =>
        `${student.firstname} ${student.lastname}`
          .toLowerCase()
          .includes(studentName.toLowerCase())
      );
      setStudents(filteredStudents);
    }
    if (studentName.length === 0) setStudents(dStudents?.students);
  }, [studentName]);

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <div className="flex justify-between items-center">
          <h2 className="subheading">Manage Shishya</h2>
          {/* Add Student Dialog Box */}
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
                <div className="flex justify-end items-center">
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8">
          <div className="flex justify-between items-center flex-wrap w-[40%] gap-2 mb-6">
            {/* Academic Year Dropdown */}
            <div className="w-[48%]">
              <Select
                onValueChange={(value) => {
                  setSearchParameters({ ...searchParameters, ay: value });
                }}
                value={searchParameters.ay}
                defaultValue="select-ay"
              >
                <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full border-2 md:rounded-r-none border-main md:border-r-slate-600 outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-ay">Select A.Y.</SelectItem>
                  {Array.from(ay.academicYears).map((acay, index) => (
                    <SelectItem key={index} value={acay}>
                      {acay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Standard Dropdown */}
            <div className="w-[48%]">
              <Select
                onValueChange={(value) =>
                  setSearchParameters({ ...searchParameters, grade: value })
                }
                value={searchParameters.grade}
                defaultValue="select-grade"
              >
                <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full md:rounded-none md:rounded-r-full border-main border-2 md:border-l-slate-600 outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-grade">Select Grade</SelectItem>
                  {grades.map((grd, index) => (
                    <SelectItem key={index} value={grd || index}>
                      {grd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </form>
            </div>
            {/* Batch Dropdown */}
            <div className="w-[40%]">
              <Select
                onValueChange={(value) => setSelectedBatch(value)}
                value={selectedBatch}
                defaultValue="select-batch"
              >
                <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full md:rounded-none md:rounded-r-full border-main border-2 md:border-l-slate-600 outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-batch">Select Batch</SelectItem>
                  {Array.from(batch).map((bth, index) => (
                    <SelectItem key={index} value={bth || index}>
                      {bth}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <span className="mt-3 mb-6 text-lg">
            {students?.length || 0} Students Found
          </span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="barlow-semibold w-[100px]">
                  SR No.
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
              {students?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan="7"
                    className="barlow-semibold text-center"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              )}
              {students?.length > 0 &&
                students?.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="barlow-semibold">
                      {index + 1}
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
                        href={`/student/${student.ay}/${student.grade}/${student.userId}`}
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
        <TempStudentsComp />
      </div>
    </Container>
  );
};

export default DashboardPage;

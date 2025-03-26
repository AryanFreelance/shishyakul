"use client";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Bolt,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  SearchIcon,
  Trash,
} from "lucide-react";
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
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useEffect, useState, useCallback, useMemo } from "react";
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
import SearchBarStudent from "@/components/private/dashboard/SearchBarStudent";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { checkMemberRoles, hasRole } from "@/utils/member-utils";
import { auth } from "@/firebase";

const DashboardPage = () => {
  const [studEmail, setStudEmail] = useState("");
  const [openAddStudentDialog, setOpenAddStudentDialog] = useState(false);
  const [grades, setGrades] = useState(["8", "9", "10", "11", "12"]);
  const [batch, setBatch] = useState(new Set());
  const [selectedBatch, setSelectedBatch] = useState(
    sessionStorage.getItem("selectedBatch") || "select-batch"
  );
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState(
    sessionStorage.getItem("studentName") || ""
  );
  const [schoolName, setSchoolName] = useState(
    sessionStorage.getItem("schoolName") || ""
  );
  const [searchParameters, setSearchParameters] = useState({
    grade: sessionStorage.getItem("grade") || "select-grade",
    ay: sessionStorage.getItem("ay") || "select-ay",
    school: sessionStorage.getItem("school") || "",
  });
  const [pageSize, setPageSize] = useState(
    sessionStorage.getItem("pageSize") || "20"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(sessionStorage.getItem("currentPage") || "0")
  );
  const [tempCurrentPage, setTempCurrentPage] = useState(
    parseInt(sessionStorage.getItem("tempCurrentPage") || "0")
  );
  const [pages, setPages] = useState(0);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [onePageStudents, setOnePageStudent] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    srNo: true,
    name: true,
    email: true,
    phone: true,
    grade: true,
    batch: true,
    school: true,
    attendance: true,
    actions: true,
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [memberRoles, setMemberRoles] = useState(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  // Queries - GET_ACADEMIC_YEARS, GET_TEMP_STUDENTS, DASHBOARD_GET_STUDENT
  const { data: ay, loading: ayLoading } = useSuspenseQuery(GET_ACADEMIC_YEARS);
  const [fetchStudents, { data: dStudents }] = useLazyQuery(
    DASHBOARD_GET_STUDENT,
    {
      fetchPolicy: "network-only",
      variables: { ay: searchParameters.ay, grade: searchParameters.grade },
      onCompleted: (data) => {
        console.log("STUDENTS FULL DATA:", data);
        console.log("FIRST STUDENT EXAMPLE:", data?.students?.[0]);
        setStudents(data?.students || []);
      },
    }
  );
  const [fetchTempStudents] = useLazyQuery(GET_TEMP_STUDENTS, {
    fetchPolicy: "network-only",
  });

  // Mutations - INITIALIZE_STUDENT, DELETE_STUDENT, DELETE_TEMP_STUDENT
  const [deleteStudent] = useMutation(DELETE_STUDENT, {
    refetchQueries: [{ query: DASHBOARD_GET_STUDENT }],
  });

  const deleteStudentHandler = async (pay, pgrade, puserId) => {
    const toastId = toast.loading("Deleting Student...");
    try {
      const response = await deleteStudent({
        variables: {
          ay: pay,
          grade: pgrade,
          userId: puserId,
        },
      });

      const result = response?.data?.deleteStudent;

      if (result === "ERROR" || result === null) {
        toast.error("Failed to delete student!", {
          id: toastId,
        });
        return;
      }

      // If it's a full delete, also delete the user from Firebase Auth
      if (result === "SUCCESS_FULL_DELETE") {
        const deleteuserResponse = await fetch("/api/user", {
          method: "DELETE",
          body: JSON.stringify({ uid: puserId }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (deleteuserResponse.status !== 200) {
          toast.error("Failed to delete student from authentication system!", {
            id: toastId,
          });
          return;
        }

        toast.success("Student completely deleted successfully!", {
          id: toastId,
        });
      } else if (result === "SUCCESS_PARTIAL_DELETE") {
        // For partial delete, we don't delete the user from Firebase Auth
        toast.success("Student removed from this academic year only!", {
          id: toastId,
        });
      }

      // Refresh the student list
      fetchStudents({
        fetchPolicy: "network-only",
        variables: {
          ay: searchParameters.ay,
          grade:
            searchParameters.grade === "select-grade"
              ? null
              : searchParameters.grade,
        },
      });
    } catch (error) {
      console.error("Error deleting student:", error);
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
    const tempStudent = await getDoc(doc(db, "tempstudents", studEmail));
    const tempStudentData = tempStudent.data();
    let verification = {};
    if (tempStudentData) {
      verification = {
        verificationCode: tempStudentData.verificationCode,
        studentEmail: studEmail,
      };
    } else {
      verification = {
        verificationCode: uuidv4(),
        studentEmail: studEmail,
      };
    }
    await setDoc(doc(db, "verifications", verification.verificationCode), {
      ...verification,
    }).catch((error) => {
      toast.error("Failed to create verification code!", {
        id: toastId,
      });
      return;
    });
    const tempstudent = {
      email: studEmail,
      verificationCode: verification.verificationCode,
    };
    await setDoc(doc(db, "tempstudents", tempstudent.email), {
      ...tempstudent,
    }).catch((error) => {
      toast.error("Failed to add student to temp students!", {
        id: toastId,
      });
      return;
    });
    const domain = window.location.origin;
    const inviteResp = await fetch("/api/invite", {
      method: "POST",
      body: JSON.stringify({
        email: studEmail,
        r_message: `Sign Up Link - ${domain}/register/${verification.verificationCode}`,
        r_code: verification.verificationCode,
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
    await fetchTempStudents({
      fetchPolicy: "network-only",
    });
    toast.success("Student Added Successfully!", {
      id: toastId,
    });
    setOpenAddStudentDialog(false);
    setStudEmail("");
  };

  const handleRefreshStudents = async (e) => {
    e.preventDefault();
    await fetchStudents({
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
        setFilteredStudents(data.students || []);

        // Reset filters
        setSelectedBatch("select-batch");
        sessionStorage.setItem("selectedBatch", "select-batch");

        setSchoolName("");
        sessionStorage.setItem("schoolName", "");

        setStudentName("");

        setCurrentPage(0);
        sessionStorage.setItem("currentPage", "0");
      },
    });
    toast.success("Students Refreshed Successfully!");
  };

  useEffect(() => {
    sessionStorage.setItem("grade", searchParameters.grade);
    sessionStorage.setItem("ay", searchParameters.ay);
    sessionStorage.setItem("school", searchParameters.school || "");
  }, [searchParameters]);

  useEffect(() => {
    sessionStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    sessionStorage.setItem("tempCurrentPage", tempCurrentPage.toString());
  }, [tempCurrentPage]);

  useEffect(() => {
    sessionStorage.setItem("pageSize", pageSize);
  }, [pageSize]);

  useEffect(() => {
    sessionStorage.setItem("selectedBatch", selectedBatch);
  }, [selectedBatch]);

  useEffect(() => {
    sessionStorage.setItem("schoolName", schoolName);
  }, [schoolName]);

  useEffect(() => {
    if (searchParameters.ay && searchParameters.ay !== "select-ay") {
      // For faculty users, require both academic year AND grade to be selected
      if (isFaculty && !isAdmin && searchParameters.grade === "select-grade") {
        // Clear students list when only academic year is selected for faculty
        setStudents([]);
        setFilteredStudents([]);
        return;
      }

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
          setStudents(data?.students || []);
          setFilteredStudents(data?.students || []);

          // Apply school filter if it exists
          if (schoolName) {
            const filteredBySchool =
              data?.students?.filter((student) =>
                student?.studentInformation?.school
                  ?.toLowerCase()
                  .includes(schoolName.toLowerCase())
              ) || [];
            setFilteredStudents(filteredBySchool);
          }
        },
      });
    }
    if (searchParameters.ay === "select-ay") {
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [searchParameters]);

  // Filter students based on faculty assignments
  useEffect(() => {
    if (isFaculty && !isAdmin && students.length > 0) {
      // Only show students that match faculty assignments
      const assignedStudents = students.filter((student) => {
        // Check if this student matches any of the faculty's assignments
        return facultyAssignments.some((assignment) => {
          // Match academic year
          const matchesAY = assignment.academicYear === student.ay;
          if (!matchesAY) return false;

          // Match grade if specified
          if (assignment.grade && assignment.grade !== "all") {
            const matchesGrade = assignment.grade === student.grade;
            if (!matchesGrade) return false;
          }

          // Match batch if specified
          if (assignment.batch && assignment.batch !== "all") {
            const matchesBatch = assignment.batch === student.batch;
            if (!matchesBatch) return false;
          }

          return true;
        });
      });

      // Apply school filter if it exists
      if (schoolName) {
        const filteredBySchool = assignedStudents.filter((student) =>
          student?.studentInformation?.school
            ?.toLowerCase()
            .includes(schoolName.toLowerCase())
        );
        setFilteredStudents(filteredBySchool);
      } else {
        setFilteredStudents(assignedStudents);
      }
    } else {
      // Admin or non-faculty sees all students
      if (schoolName) {
        const filteredBySchool = students.filter((student) =>
          student?.studentInformation?.school
            ?.toLowerCase()
            .includes(schoolName.toLowerCase())
        );
        setFilteredStudents(filteredBySchool);
      } else {
        setFilteredStudents(students);
      }
    }
  }, [students, isFaculty, isAdmin, facultyAssignments, schoolName]);

  // Filter academic years dropdown based on faculty assignments
  const filteredAcademicYears = useMemo(() => {
    if (isFaculty && !isAdmin && facultyAssignments.length > 0) {
      // Extract unique academic years from faculty assignments
      return Array.from(
        new Set(facultyAssignments.map((assignment) => assignment.academicYear))
      ).sort((a, b) => b.localeCompare(a)); // Sort in descending order
    }

    // Admin or non-faculty sees all academic years
    return ay?.academicYears || [];
  }, [ay, isFaculty, isAdmin, facultyAssignments]);

  // Filter grades dropdown based on selected academic year and faculty assignments
  const filteredGrades = useMemo(() => {
    if (
      isFaculty &&
      !isAdmin &&
      facultyAssignments.length > 0 &&
      searchParameters.ay !== "select-ay"
    ) {
      // Filter assignments by selected academic year
      const assignmentsForYear = facultyAssignments.filter(
        (assignment) => assignment.academicYear === searchParameters.ay
      );

      // Extract unique grades from filtered assignments
      return Array.from(
        new Set(assignmentsForYear.map((assignment) => assignment.grade))
      ).sort();
    }

    // Admin or non-faculty sees all grades
    return grades;
  }, [grades, searchParameters.ay, isFaculty, isAdmin, facultyAssignments]);

  // Filter batches dropdown based on selected academic year, grade, and faculty assignments
  const filteredBatches = useMemo(() => {
    if (
      isFaculty &&
      !isAdmin &&
      facultyAssignments.length > 0 &&
      searchParameters.ay !== "select-ay" &&
      searchParameters.grade !== "select-grade"
    ) {
      // Filter assignments by selected academic year and grade
      const assignmentsForYearAndGrade = facultyAssignments.filter(
        (assignment) =>
          assignment.academicYear === searchParameters.ay &&
          assignment.grade === searchParameters.grade
      );

      // Extract unique batches from filtered assignments
      return Array.from(
        new Set(
          assignmentsForYearAndGrade.map((assignment) => assignment.batch)
        )
      ).sort();
    }

    // Use the batches from students if not faculty or no assignments match
    return batch ? Array.from(batch) : [];
  }, [
    batch,
    searchParameters.ay,
    searchParameters.grade,
    isFaculty,
    isAdmin,
    facultyAssignments,
  ]);

  useEffect(() => {
    if (students?.length > 0) {
      const uniqueBatch = Array.from(
        new Set(students.map((student) => student?.batch).filter(Boolean))
      );
      setBatch(uniqueBatch);
    } else {
      setBatch([]);
    }
  }, [students]);

  useEffect(() => {
    if (filteredStudents?.length > 0) {
      const startIndex = currentPage * parseInt(pageSize);
      const endIndex = startIndex + parseInt(pageSize);
      const slicedTempStudents = filteredStudents.slice(startIndex, endIndex);
      setOnePageStudent(slicedTempStudents);
      setPages(Math.ceil(filteredStudents.length / parseInt(pageSize)));
    } else {
      setOnePageStudent([]);
      setPages(0);
    }
  }, [filteredStudents, currentPage, pageSize]);

  useEffect(() => {
    if (
      selectedBatch &&
      students?.length > 0 &&
      selectedBatch !== "select-batch"
    ) {
      const selectedBatchStudents = students.filter(
        (student) => student?.batch === selectedBatch
      );
      setFilteredStudents(selectedBatchStudents);
    } else if (schoolName && students?.length > 0) {
      const filteredBySchool = students.filter((student) =>
        student?.studentInformation?.school
          ?.toLowerCase()
          .includes(schoolName.toLowerCase())
      );
      setFilteredStudents(filteredBySchool);
    } else {
      setFilteredStudents(students || []);
    }
  }, [selectedBatch, students, schoolName]);

  useEffect(() => {
    if (studentName.length > 0 && students?.length > 0) {
      let studentsFiltered = students.filter((student) =>
        `${student?.firstname || ""} ${student?.lastname || ""}`
          .toLowerCase()
          .includes(studentName.toLowerCase())
      );

      // Apply school filter if present
      if (schoolName) {
        studentsFiltered = studentsFiltered.filter((student) =>
          student?.studentInformation?.school
            ?.toLowerCase()
            .includes(schoolName.toLowerCase())
        );
      }

      // Apply batch filter if selected
      if (selectedBatch && selectedBatch !== "select-batch") {
        studentsFiltered = studentsFiltered.filter(
          (student) => student?.batch === selectedBatch
        );
      }

      setFilteredStudents(studentsFiltered);
    } else if (studentName.length === 0) {
      // Apply other filters if name search is empty
      let studentsFiltered = [...students] || [];

      // Apply school filter if present
      if (schoolName) {
        studentsFiltered = studentsFiltered.filter((student) =>
          student?.studentInformation?.school
            ?.toLowerCase()
            .includes(schoolName.toLowerCase())
        );
      }

      // Apply batch filter if selected
      if (selectedBatch && selectedBatch !== "select-batch") {
        studentsFiltered = studentsFiltered.filter(
          (student) => student?.batch === selectedBatch
        );
      }

      setFilteredStudents(studentsFiltered);
    }
  }, [studentName, students, schoolName, selectedBatch]);

  // Apply filters when school name changes
  useEffect(() => {
    if (students?.length > 0) {
      let filtered = [...students];

      // Apply faculty filters if applicable
      if (isFaculty && !isAdmin) {
        filtered = filtered.filter((student) => {
          return facultyAssignments.some((assignment) => {
            const matchesAY = assignment.academicYear === student.ay;
            if (!matchesAY) return false;

            if (assignment.grade && assignment.grade !== "all") {
              const matchesGrade = assignment.grade === student.grade;
              if (!matchesGrade) return false;
            }

            if (assignment.batch && assignment.batch !== "all") {
              const matchesBatch = assignment.batch === student.batch;
              if (!matchesBatch) return false;
            }

            return true;
          });
        });
      }

      // Apply batch filter
      if (selectedBatch && selectedBatch !== "select-batch") {
        filtered = filtered.filter(
          (student) => student?.batch === selectedBatch
        );
      }

      // Apply school filter
      if (schoolName) {
        filtered = filtered.filter((student) =>
          student?.studentInformation?.school
            ?.toLowerCase()
            .includes(schoolName.toLowerCase())
        );
      }

      // Apply name filter
      if (studentName) {
        filtered = filtered.filter((student) =>
          `${student?.firstname || ""} ${student?.lastname || ""}`
            .toLowerCase()
            .includes(studentName.toLowerCase())
        );
      }

      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [
    students,
    selectedBatch,
    schoolName,
    studentName,
    isFaculty,
    isAdmin,
    facultyAssignments,
  ]);

  const toggleColumnVisibility = (column) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Add useEffect for checking user roles
  useEffect(() => {
    const checkUserRoles = async () => {
      setIsLoadingPermissions(true);
      try {
        // Check if user is admin
        const user = auth.currentUser;
        if (user) {
          const isAdminUser = user.email === "admin@shishyakul.in";
          setIsAdmin(isAdminUser);

          // Get member roles using utility function
          const { roles, isFaculty: isFacultyMember } =
            await checkMemberRoles();
          setMemberRoles(roles || null);
          setIsFaculty(isFacultyMember || false);

          // Get faculty assignments if user is faculty
          if (isFacultyMember) {
            // You may need to implement a proper function to fetch faculty assignments
            const memberDoc = await getDoc(doc(db, "members", user.email));
            if (memberDoc.exists()) {
              const memberData = memberDoc.data();
              setFacultyAssignments(memberData.assignments || []);
            }
          }
        }
      } catch (error) {
        console.error("Error checking user roles:", error);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserRoles();
      }
    });

    return () => unsubscribe();
  }, []);

  // Loading state for permission check
  if (isLoadingPermissions) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Loading...
      </div>
    );
  }

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <div className="flex justify-between items-center">
          <h2 className="subheading">Manage Shishya</h2>
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
          <div className="flex justify-between items-center flex-wrap w-full md:w-[40%] gap-2 mb-2">
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
                  {ayLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    filteredAcademicYears.map((acay, index) => (
                      <SelectItem key={index} value={acay}>
                        {acay}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[48%]">
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
                  {filteredGrades.map((grd, index) => (
                    <SelectItem key={index} value={grd || index}>
                      {grd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center flex-wrap w-full gap-2 mb-6">
            <div className="w-full md:w-[30%]">
              <SearchBarStudent
                studentName={studentName}
                setStudentName={setStudentName}
              />
            </div>
            <div className="w-full md:w-[30%]">
              <div className="flex items-center gap-2 border-2 rounded-full px-4 py-2 border-main">
                <SearchIcon className="h-5 w-5 text-secondary" />
                <input
                  type="text"
                  placeholder="Search by School Name..."
                  className="w-full py-1 bg-transparent outline-none border-none text-secondary barlow-regular"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-[30%]">
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
                  {filteredBatches.map((bth, index) => (
                    <SelectItem key={index} value={bth || index}>
                      {bth}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <span className="mt-3 mb-6 text-lg flex items-center gap-3">
            <span>{filteredStudents?.length || 0} Students Found</span>
            <button onClick={handleRefreshStudents}>
              <RefreshCw />
            </button>
          </span>

          {/* Instruction for faculty users */}
          {isFaculty &&
            !isAdmin &&
            searchParameters.ay !== "select-ay" &&
            searchParameters.grade === "select-grade" && (
              <div className="mb-6 p-4 border-2 border-main rounded-md bg-yellow-50">
                <p className="text-amber-700 barlow-semibold">
                  Please select a grade to view your assigned students.
                </p>
              </div>
            )}

          {students?.length !== 0 && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
              {/* <div className="flex item-center justify-end"> */}
              <button onClick={() => setShowColumnSettings(true)}>
                <Bolt />
              </button>
              {/* </div> */}

              {showColumnSettings && (
                <Dialog
                  open={showColumnSettings}
                  onOpenChange={setShowColumnSettings}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Customize Columns</DialogTitle>
                    </DialogHeader>
                    <div>
                      {Object.keys(columnVisibility).map((column) => (
                        <div key={column} className="flex gap-2 ">
                          <input
                            type="checkbox"
                            checked={columnVisibility[column]}
                            id={column}
                            onChange={() => toggleColumnVisibility(column)}
                          />
                          <label htmlFor={column}>
                            {column.charAt(0).toUpperCase() + column.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => setShowColumnSettings(false)}>
                      Close
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
              <select
                value={pageSize}
                onChange={(e) => {
                  const newPageSize = e.target.value;
                  setPageSize(newPageSize);
                  setCurrentPage(0);
                  sessionStorage.setItem("pageSize", newPageSize);
                  sessionStorage.setItem("currentPage", "0");
                }}
                className="border-2 border-main bg-transparent px-3 py-1 rounded"
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
              <div className="flex justify-center items-center gap-4 mt-4 md:mt-0">
                <button
                  onClick={() => {
                    if (currentPage !== 0) {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      sessionStorage.setItem("currentPage", newPage.toString());
                    }
                  }}
                  className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
                  disabled={currentPage === 0}
                >
                  <ArrowLeft />
                </button>
                <div className="flex flex-wrap justify-center items-center max-w-[300px] lg:max-w-[600px] gap-4">
                  {new Array(pages).fill(0).map((_, index) => (
                    <button
                      key={index}
                      className={`border-2 px-3 py-1 rounded ${
                        index === currentPage
                          ? "text-black border-main"
                          : "border-black/50 hover:border-black"
                      }`}
                      onClick={() => {
                        setCurrentPage(index);
                        sessionStorage.setItem("currentPage", index.toString());
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (currentPage !== pages - 1) {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      sessionStorage.setItem("currentPage", newPage.toString());
                    }
                  }}
                  className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
                  disabled={currentPage === pages - 1}
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                {columnVisibility.srNo && (
                  <TableHead className="barlow-semibold w-[100px]">
                    SR No.
                  </TableHead>
                )}
                {columnVisibility.name && (
                  <TableHead className="barlow-semibold">Name</TableHead>
                )}
                {columnVisibility.email && (
                  <TableHead className="barlow-semibold">Email</TableHead>
                )}
                {columnVisibility.phone && (
                  <TableHead className="barlow-semibold">Phone</TableHead>
                )}
                {columnVisibility.grade && (
                  <TableHead className="barlow-semibold">Grade</TableHead>
                )}
                {columnVisibility.batch && (
                  <TableHead className="barlow-semibold">Batch</TableHead>
                )}
                {columnVisibility.school && (
                  <TableHead className="barlow-semibold">School</TableHead>
                )}
                {columnVisibility.attendance && (
                  <TableHead className="barlow-semibold">Attendance</TableHead>
                )}
                {columnVisibility.actions && (
                  <TableHead className="barlow-semibold">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan="9"
                    className="barlow-semibold text-center"
                  >
                    {isFaculty && !isAdmin
                      ? searchParameters.ay === "select-ay"
                        ? "Please select an academic year and grade to view students"
                        : searchParameters.grade === "select-grade"
                        ? "Please select a grade to view your assigned students"
                        : "No students found for the selected filters"
                      : searchParameters.ay === "select-ay"
                      ? "Please select an academic year to view students"
                      : "No students found for the selected filters"}
                  </TableCell>
                </TableRow>
              )}
              {students?.length > 0 &&
                onePageStudents?.length > 0 &&
                onePageStudents?.map((student, index) => (
                  <TableRow key={index}>
                    {columnVisibility.srNo && (
                      <TableCell className="barlow-semibold">
                        {currentPage * pageSize + index + 1}
                      </TableCell>
                    )}
                    {columnVisibility.name && (
                      <TableCell className="barlow-regular">
                        {student.firstname} {student.lastname}
                      </TableCell>
                    )}
                    {columnVisibility.email && (
                      <TableCell className="barlow-regular">
                        {student.email}
                      </TableCell>
                    )}
                    {columnVisibility.phone && (
                      <TableCell className="barlow-regular">
                        {student.phone}
                      </TableCell>
                    )}
                    {columnVisibility.grade && (
                      <TableCell className="barlow-regular">
                        {student.grade}
                      </TableCell>
                    )}
                    {columnVisibility.batch && (
                      <TableCell className="barlow-regular">
                        {student?.batch ? student?.batch : "N/A"}
                      </TableCell>
                    )}
                    {columnVisibility.school && (
                      <TableCell className="barlow-regular">
                        {student?.studentInformation?.school
                          ? student?.studentInformation?.school
                          : "N/A"}
                      </TableCell>
                    )}
                    {columnVisibility.attendance && (
                      <TableCell className="barlow-regular">
                        {student?.attendance
                          ? student.attendance.present +
                              student.attendance.absent ===
                            0
                            ? "N/A"
                            : `${Math.round(
                                (student.attendance.present /
                                  (student.attendance.present +
                                    student.attendance.absent)) *
                                  100
                              )} %`
                          : "N/A"}
                      </TableCell>
                    )}
                    {columnVisibility.actions && (
                      <TableCell className="barlow-regular flex items-center gap-4">
                        <Link
                          href={`/student/${student.ay}/${student.grade}/${student.userId}`}
                          className="border-2 border-main rounded p-1"
                        >
                          <Eye />
                        </Link>
                        <Link
                          href={`/student/${student.ay}/${student.grade}/${student.userId}/profile`}
                          className="border-2 border-main rounded p-1"
                        >
                          <Pencil />
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
                                {student.academicYearsHistory &&
                                student.academicYearsHistory.length > 1 ? (
                                  <>
                                    This will remove the student from the
                                    academic year {student.ay} only.
                                    <br />
                                    The student's data for other academic years
                                    will be preserved.
                                  </>
                                ) : (
                                  <>
                                    This action cannot be undone. This will
                                    permanently delete the student and remove
                                    all their data from our servers.
                                  </>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteStudentHandler(
                                    student.ay,
                                    student.grade,
                                    student.userId
                                  )
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {students?.length !== 0 && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
              <div className="flex justify-center items-center gap-4 mt-4 md:mt-0">
                <button
                  onClick={() => {
                    if (currentPage !== 0) {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      sessionStorage.setItem("currentPage", newPage.toString());
                    }
                  }}
                  className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
                  disabled={currentPage === 0}
                >
                  <ArrowLeft />
                </button>
                <div className="flex flex-wrap justify-center items-center max-w-[300px] lg:max-w-[600px] gap-4">
                  {new Array(pages).fill(0).map((_, index) => (
                    <button
                      key={index}
                      className={`border-2 px-3 py-1 rounded ${
                        index === currentPage
                          ? "text-black border-main"
                          : "border-black/50 hover:border-black"
                      }`}
                      onClick={() => {
                        setCurrentPage(index);
                        sessionStorage.setItem("currentPage", index.toString());
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (currentPage !== pages - 1) {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      sessionStorage.setItem("currentPage", newPage.toString());
                    }
                  }}
                  className="border-2 px-3 py-1 rounded border-black/50 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black/50"
                  disabled={currentPage === pages - 1}
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="pb-10">
        <TempStudentsComp
          tempCurrentPage={tempCurrentPage}
          setTempCurrentPage={setTempCurrentPage}
        />
      </div>
    </Container>
  );
};

export default DashboardPage;

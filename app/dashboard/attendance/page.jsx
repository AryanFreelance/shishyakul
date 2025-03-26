"use client";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { dashboardNavLinks } from "@/constants";
import {
  ChevronDown,
  RefreshCw,
  SearchIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import {
  GET_AG_ATTENDANCE,
  GET_ATTENDANCE,
  GET_STUDENTS,
} from "@/graphql/queries/attendance.query";

export const dynamic = "force-dynamic";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useLazyQuery, useMutation } from "@apollo/client";
import { ATTENDANCE_HANDLER } from "@/graphql/mutations/attendance.mutation";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GET_ACADEMIC_YEARS,
  GET_STUDENTS_FOR_ATTENDANCE,
} from "@/graphql/queries/students.query";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { checkMemberRoles, hasRole } from "@/utils/member-utils";
import { auth, db } from "@/firebase";

const Page = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [memberRoles, setMemberRoles] = useState(null);
  const [facultyId, setFacultyId] = useState(null);
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [hasAttendancePermission, setHasAttendancePermission] = useState(false);
  const [user, setUser] = useState(null);

  const [availableAcademicYears, setAvailableAcademicYears] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);

  const [present, setPresent] = useState([]);
  const [absent, setAbsent] = useState([]);
  const today = new Date();
  const [date, setDate] = useState(today);
  const [formattedDate, setFormattedDate] = useState("");
  const [absentEmails, setAbsentEmails] = useState([]);
  const [searchParameters, setSearchParameters] = useState({
    ay: sessionStorage.getItem("a-ay") || "select-ay",
    grade: sessionStorage.getItem("a-grade") || "select-grade",
  });
  const [selectedBatch, setSelectedBatch] = useState(
    sessionStorage.getItem("a-batch") || "select-batch"
  );
  const [studentName, setStudentName] = useState(
    sessionStorage.getItem("a-studentName") || ""
  );
  const [batches, setBatches] = useState(new Set());
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isStudentDataLoading, setIsStudentDataLoading] = useState(false);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const grades = ["8", "9", "10", "11", "12"];
  const todayDate = `${
    today.getDate() < 10 ? "0" + today.getDate() : today.getDate()
  }-${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }-${today.getFullYear()}`;

  const [fetchStudents, { data: studentsData, loading: studDataLoading }] =
    useLazyQuery(GET_STUDENTS_FOR_ATTENDANCE, {
      fetchPolicy: "network-only",
      variables: {
        ay: searchParameters.ay,
        grade: searchParameters.grade,
        facultyId: facultyId,
      },
      onCompleted: (data) => {
        setStudents(data?.gStudents || []);
      },
    });

  const [fetchAttendance, { data: attendanceData }] = useLazyQuery(
    GET_AG_ATTENDANCE,
    {
      fetchPolicy: "network-only",
      variables: {
        ay: searchParameters.ay,
        grade: searchParameters.grade,
        timestamp: formattedDate.split("-").reverse().join("-"),
      },
      onCompleted: (data) => {},
    }
  );

  const { data: ay, loading: ayLoading } = useSuspenseQuery(GET_ACADEMIC_YEARS);

  const [attendanceHandler] = useMutation(ATTENDANCE_HANDLER, {
    onCompleted: (data) => {
      toast.success("Attendance Saved Successfully!");
    },
    onError: (error) => {
      toast.error("Error saving attendance.");
    },
    refetchQueries: [
      {
        query: GET_ATTENDANCE,
        variables: { timestamp: formattedDate.split("-").reverse().join("-") },
      },
    ],
  });

  const radioInputChangeHandler = (e, userID) => {
    const { value } = e.target;
    if (value === "present") {
      setPresent((prev) => [...prev, userID]);
      setAbsent((prev) => prev.filter((item) => item !== userID));
    } else {
      setAbsent((prev) => [...prev, userID]);
      setPresent((prev) => prev.filter((item) => item !== userID));
    }
  };

  useEffect(() => {
    setStudents(studentsData?.gStudents || []);
    setIsStudentDataLoading(studDataLoading);
  }, [studentsData, studDataLoading]);

  useEffect(() => {
    if (
      searchParameters.ay !== "select-ay" &&
      searchParameters.grade !== "select-grade"
    ) {
      fetchStudents({
        variables: {
          ay: searchParameters.ay,
          grade: searchParameters.grade,
          facultyId: facultyId,
        },
      });
      sessionStorage.setItem("a-ay", searchParameters.ay);
      sessionStorage.setItem("a-grade", searchParameters.grade);
    }
  }, [searchParameters.ay, searchParameters.grade, facultyId, fetchStudents]);

  useEffect(() => {
    const sDate = date && date.toString().split(" ");
    let formattedDateStr;

    if (date) {
      if (sDate && sDate.length >= 4) {
        formattedDateStr = `${sDate[2]}-${getMonthNumber(sDate[1])}-${
          sDate[3]
        }`;
      } else {
        const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        const month =
          date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1;
        const year = date.getFullYear();
        formattedDateStr = `${day}-${month}-${year}`;
      }
    } else {
      formattedDateStr = "(select a date)";
    }

    setFormattedDate(formattedDateStr);

    if (
      formattedDateStr !== "(select a date)" &&
      searchParameters.ay !== "select-ay" &&
      searchParameters.grade !== "select-grade"
    ) {
      fetchAttendance({
        variables: {
          ay: searchParameters.ay,
          grade: searchParameters.grade,
          timestamp: formattedDateStr.split("-").reverse().join("-"),
        },
      });
    }

    if (selectedBatch && selectedBatch !== "select-batch") {
      setSelectedBatch("select-batch");
      sessionStorage.setItem("a-batch", "select-batch");
    }
  }, [date, searchParameters.ay, searchParameters.grade, fetchAttendance]);

  useEffect(() => {
    sessionStorage.setItem("a-batch", selectedBatch);
  }, [selectedBatch]);

  useEffect(() => {
    sessionStorage.setItem("a-studentName", studentName);
  }, [studentName]);

  useEffect(() => {
    if (searchParameters.ay && searchParameters.ay !== "select-ay") {
      fetchAttendance({
        fetchPolicy: "network-only",
        variables: {
          ay: searchParameters.ay,
          grade:
            searchParameters.grade === "select-grade"
              ? null
              : searchParameters.grade,
        },
        onCompleted: (data) => {},
      });

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
          setStudents(data.gStudents || []);
        },
      });
    }
    setSelectedBatch("select-batch");
  }, [searchParameters]);

  useEffect(() => {
    if (selectedBatch && selectedBatch !== "select-batch") {
      setStudents(
        studentsData?.gStudents?.filter(
          (student) => student.batch === selectedBatch
        )
      );
    } else {
      setStudents(studentsData?.gStudents || []);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (studentName && students?.length > 0) {
      const filtered = students.filter((student) =>
        `${student?.firstname || ""} ${student?.lastname || ""}`
          .toLowerCase()
          .includes(studentName.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [studentName, students]);

  useEffect(() => {
    if (attendanceData?.attendance) {
      setPresent(attendanceData.attendance.present || []);
      setAbsent(attendanceData.attendance.absent || []);

      if (students && students.length > 0) {
        setAbsentEmails(
          students
            .filter((student) =>
              attendanceData.attendance.absent?.includes(student.userId)
            )
            .map((student) => student.email)
        );
      } else {
        setAbsentEmails([]);
      }
    } else {
      setPresent([]);
      setAbsent([]);
      setAbsentEmails([]);
    }
  }, [attendanceData, students]);

  useEffect(() => {
    if (studentsData?.gStudents?.length > 0) {
      const uniqueBatch = Array.from(
        new Set(
          studentsData?.gStudents
            ?.map((student) => student.batch)
            .filter(Boolean)
        )
      );
      setBatches(uniqueBatch);
    } else {
      setBatches([]);
    }
  }, [studentsData]);

  function getMonthNumber(monthName) {
    const monthIndex = months.indexOf(monthName);
    if (monthIndex === -1) {
      return -1;
    }
    return monthIndex + 1 < 10 ? "0" + (monthIndex + 1) : monthIndex + 1;
  }

  const updateAttendanceHandler = async () => {
    const toastId = toast.loading("Updating Attendance...");

    await attendanceHandler({
      variables: {
        ay: searchParameters.ay,
        grade: searchParameters.grade,
        timestamp: formattedDate.split("-").reverse().join("-"),
        present: present,
        absent: absent,
        date: formattedDate,
        facultyId: facultyId,
      },
    });
    toast.dismiss(toastId);
  };

  const sendEmailsHandler = async () => {
    const toastId = toast.loading("Sending Emails...");

    const emailresponse = await fetch("/api/email", {
      method: "POST",
      body: JSON.stringify({
        u_email: absentEmails,
        u_message: "Your child has been absent today.!",
      }),
    });

    if (emailresponse.status === 200) {
      toast.success("Emails Sent", {
        id: toastId,
      });
    } else {
      toast.error("Mail not sent", {
        id: toastId,
      });
    }
  };

  useEffect(() => {
    if (
      searchParameters.ay !== sessionStorage.getItem("a-ay") ||
      searchParameters.grade !== sessionStorage.getItem("a-grade")
    ) {
      setStudentName("");
      setSelectedBatch("select-batch");
    }
  }, [searchParameters.ay, searchParameters.grade]);

  useEffect(() => {
    if (selectedBatch !== sessionStorage.getItem("a-batch")) {
      setStudentName("");
    }
  }, [selectedBatch]);

  const handleRefreshStudents = () => {
    if (
      searchParameters.ay !== "select-ay" &&
      searchParameters.grade !== "select-grade"
    ) {
      fetchStudents({
        fetchPolicy: "network-only",
        variables: {
          ay: searchParameters.ay,
          grade: searchParameters.grade,
          facultyId: facultyId,
        },
        onCompleted: (data) => {
          setStudents(data.gStudents || []);
          setFilteredStudents(data.gStudents || []);
          setStudentName("");
          setSelectedBatch("select-batch");
          sessionStorage.setItem("a-studentName", "");
          sessionStorage.setItem("a-batch", "select-batch");
          toast.success("Students Refreshed Successfully!");
        },
      });
    } else {
      toast.error("Please select Academic Year and Grade first!");
    }
  };

  useEffect(() => {
    if (isFaculty && facultyAssignments.length > 0) {
      const uniqueAYs = [
        ...new Set(
          facultyAssignments.map((assignment) => assignment.academicYear)
        ),
      ];
      setAvailableAcademicYears(uniqueAYs);

      if (searchParameters.ay !== "select-ay") {
        const gradesForSelectedAY = facultyAssignments
          .filter(
            (assignment) => assignment.academicYear === searchParameters.ay
          )
          .map((assignment) => assignment.grade)
          .filter((grade) => grade && grade !== "all");

        setAvailableGrades([...new Set(gradesForSelectedAY)]);
      } else {
        setAvailableGrades([]);
      }
    }
  }, [isFaculty, facultyAssignments, searchParameters.ay]);

  useEffect(() => {
    if (isFaculty && searchParameters.ay !== "select-ay") {
      const gradesForSelectedAY = facultyAssignments
        .filter((assignment) => assignment.academicYear === searchParameters.ay)
        .map((assignment) => assignment.grade)
        .filter((grade) => grade && grade !== "all");

      setAvailableGrades([...new Set(gradesForSelectedAY)]);

      if (
        searchParameters.grade !== "select-grade" &&
        !gradesForSelectedAY.includes(searchParameters.grade)
      ) {
        setSearchParameters((prev) => ({ ...prev, grade: "select-grade" }));
      }
    }
  }, [searchParameters.ay, isFaculty, facultyAssignments]);

  useEffect(() => {
    if (selectedBatch !== "select-batch" && students.length > 0) {
      const batchFilteredStudents = students.filter(
        (student) => student.batch === selectedBatch
      );
      setFilteredStudents(batchFilteredStudents);
    } else {
      setFilteredStudents(students);
    }
  }, [selectedBatch, students]);

  const displayStudents = studentName
    ? filteredStudents.filter((student) =>
        `${student?.firstname || ""} ${student?.middlename || ""} ${
          student?.lastname || ""
        }`
          .toLowerCase()
          .includes(studentName.toLowerCase())
      )
    : filteredStudents;

  useEffect(() => {
    const checkUserRoles = async () => {
      setIsLoadingPermissions(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);

          const isAdminUser = currentUser.email === "admin@shishyakul.in";
          setIsAdmin(isAdminUser);

          const { roles, isFaculty: isFacultyMember } =
            await checkMemberRoles();
          setMemberRoles(roles || null);
          setIsFaculty(isFacultyMember);

          const hasAttendanceRole = roles && roles.Attendance === true;
          setHasAttendancePermission(
            isAdminUser || isFacultyMember || hasAttendanceRole
          );

          const isFacultyUser = isFacultyMember && !isAdminUser;
          setFacultyId(isFacultyUser ? currentUser.uid : null);

          if (isFacultyMember) {
            const memberDoc = await getDoc(
              doc(db, "members", currentUser.email)
            );
            if (memberDoc.exists()) {
              const memberData = memberDoc.data();
              setFacultyAssignments(memberData.assignments || []);
            }
          }
        } else {
          window.location.href = "/login";
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
      } else {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoadingPermissions) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Loading...
      </div>
    );
  }

  if (!hasAttendancePermission) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-lg text-center max-w-md">
            You don't have permission to access the attendance management page.
            Only administrators, faculty members, and staff with the Attendance
            role can access this page.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4">
          <h2 className="subheading text-center md:text-left">Attendance</h2>
          {students !== null && students?.length > 0 && (
            <div className="flex justify-center md:justify-end items-center">
              <Popover className="w-full">
                <PopoverTrigger
                  asChild
                  className="flex justify-center items-center"
                >
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-center font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-col lg:flex-row gap-10">
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h3 className="subsubheading text-secondary flex flex-col md:flex-row gap-2">
                <span>Attendance marking for </span>{" "}
                <span>{formattedDate}</span>
              </h3>

              {students !== null && students?.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full md:w-auto">
                      Mark All <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setPresent(
                          displayStudents?.map((student) => student.userId)
                        );
                        setAbsent([]);
                      }}
                    >
                      Present
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setAbsent(
                          displayStudents?.map((student) => student.userId)
                        );
                        setPresent([]);
                      }}
                    >
                      Absent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setAbsent([]);
                        setPresent([]);
                      }}
                    >
                      Clear
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="my-4">
              <div className="flex justify-between items-center flex-wrap w-full md:w-[60%] gap-2 mb-2">
                <div className="w-full md:w-[30%]">
                  <Select
                    onValueChange={(value) => {
                      setSearchParameters({ ...searchParameters, ay: value });
                      sessionStorage.setItem("a-ay", value);
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
                      ) : isFaculty && facultyAssignments.length > 0 ? (
                        availableAcademicYears.map((acay, index) => (
                          <SelectItem key={index} value={acay}>
                            {acay}
                          </SelectItem>
                        ))
                      ) : (
                        Array.from(ay?.academicYears)?.map((acay, index) => (
                          <SelectItem key={index} value={acay}>
                            {acay}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[30%]">
                  <Select
                    onValueChange={(value) => {
                      setSearchParameters({
                        ...searchParameters,
                        grade: value,
                      });
                      sessionStorage.setItem("a-grade", value);
                    }}
                    value={searchParameters.grade}
                    defaultValue="select-grade"
                    disabled={searchParameters.ay === "select-ay"}
                  >
                    <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full md:rounded-none border-main border-2 md:border-l-slate-600 md:border-r-slate-600 outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select-grade">Select Grade</SelectItem>
                      {isFaculty && facultyAssignments.length > 0
                        ? availableGrades.map((grade, index) => (
                            <SelectItem key={index} value={grade}>
                              {grade}
                            </SelectItem>
                          ))
                        : grades.map((grd, index) => (
                            <SelectItem key={index} value={grd || index}>
                              {grd}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[30%]">
                  <Select
                    onValueChange={(value) => {
                      setSelectedBatch(value);
                      sessionStorage.setItem("a-batch", value);
                    }}
                    value={selectedBatch}
                    defaultValue="select-batch"
                    disabled={searchParameters.grade === "select-grade"}
                  >
                    <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full md:rounded-none md:rounded-r-full border-main border-2 md:border-l-slate-600 outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                      <SelectValue placeholder="Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select-batch">Select Batch</SelectItem>
                      {Array.from(batches).map((bth, index) => (
                        <SelectItem key={index} value={bth || index}>
                          {bth}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center flex-wrap w-full md:w-[60%] gap-2 mt-4">
                <div className="w-full">
                  <div className="flex items-center gap-2 border-2 rounded-full px-4 py-2 border-main">
                    <SearchIcon className="h-5 w-5 text-secondary" />
                    <input
                      type="text"
                      placeholder="Search by Student Name..."
                      className="w-full py-1 bg-transparent outline-none border-none text-secondary barlow-regular"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="flex items-center gap-3">
                {displayStudents?.length > 0 && displayStudents?.length}{" "}
                Students Found.
                <button onClick={handleRefreshStudents}>
                  <RefreshCw className="h-5 w-5" />
                </button>
              </span>
            </div>

            <div className="mt-6">
              {displayStudents?.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center rounded my-4">
                    <div>{item.firstname + " " + item.lastname}</div>
                    <div className="flex gap-4">
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          name={item.userId}
                          value="present"
                          id={`present-${item.userId}`}
                          onChange={(e) =>
                            radioInputChangeHandler(e, item.userId)
                          }
                          checked={present?.includes(item.userId)}
                        />
                        <label htmlFor={`present-${item.userId}`}>
                          Present
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          id={`absent-${item.userId}`}
                          name={item.userId}
                          value="absent"
                          checked={absent?.includes(item.userId)}
                          onChange={(e) =>
                            radioInputChangeHandler(e, item.userId)
                          }
                        />
                        <label htmlFor={`absent-${item.userId}`}>Absent</label>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mt-8 w-full">
              {isStudentDataLoading && (
                <span className="text-lg text-secondary">
                  Loading! Please Wait...
                </span>
              )}
              {!isStudentDataLoading &&
                (searchParameters.ay === "select-ay" ||
                  searchParameters.grade === "select-grade") && (
                  <span className="text-lg text-secondary">
                    Please select both Academic Year & Grade to view Students.
                  </span>
                )}
              {(displayStudents === null || displayStudents?.length == 0) &&
                !isStudentDataLoading &&
                searchParameters.ay !== "select-ay" &&
                searchParameters.grade !== "select-grade" && (
                  <span className="text-lg text-secondary">
                    No Students Found! Please add students to create
                    attendance!!
                  </span>
                )}
              {displayStudents !== null && displayStudents?.length > 0 && (
                <>
                  <div className="w-full md:w-[50%]">
                    <Button
                      className="w-full"
                      onClick={updateAttendanceHandler}
                    >
                      Save
                    </Button>
                  </div>
                  <div className="w-full md:w-[50%]">
                    {attendanceData?.attendance?.absent &&
                      attendanceData?.attendance.absent.length > 0 &&
                      formattedDate === todayDate && (
                        <Button
                          className="w-full"
                          onClick={() => {
                            sendEmailsHandler();
                          }}
                        >
                          Send Email
                        </Button>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Page;

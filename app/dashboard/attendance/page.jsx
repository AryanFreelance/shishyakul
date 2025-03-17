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
import { usePermission } from "@/app/context/PermissionContext";

const Page = () => {
  const { permissions, user, getFacultyAssignments } = usePermission();
  const isFaculty = permissions.roles?.Faculty && !permissions.isAdmin;
  const facultyId = isFaculty ? user?.uid : null;
  const facultyAssignments = getFacultyAssignments();

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

  // Queries - Get Students, Get Attendance
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
        // console.log("DATA", data);
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
      onCompleted: (data) => {
        // console.log("DATA", data);
      },
    }
  );

  const { data: ay, loading: ayLoading } = useSuspenseQuery(GET_ACADEMIC_YEARS);

  // Mutations - Create Attendance, Update Attendance
  const [attendanceHandler] = useMutation(ATTENDANCE_HANDLER, {
    onCompleted: (data) => {
      // console.log("Attendance Created: ", data);
      toast.success("Attendance Saved Successfully!");
    },
    onError: (error) => {
      // console.log("Error creating attendance: ", error);
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
    // console.log("STUDENTS", studentsData?.gStudents);
  }, [studentsData, studDataLoading]);

  // Fetch students when search parameters change
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
      // Save parameters to session storage
      sessionStorage.setItem("a-ay", searchParameters.ay);
      sessionStorage.setItem("a-grade", searchParameters.grade);
    }
  }, [searchParameters.ay, searchParameters.grade, facultyId, fetchStudents]);

  // Set up formatted date on load
  useEffect(() => {
    const sDate = date && date.toString().split(" ");
    let formattedDateStr;

    if (date) {
      if (sDate && sDate.length >= 4) {
        // Format from Date object string
        formattedDateStr = `${sDate[2]}-${getMonthNumber(sDate[1])}-${
          sDate[3]
        }`;
      } else {
        // Fallback to manual formatting
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

    // Fetch attendance data if parameters are set and date is valid
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

    // Reset batch selection when date changes
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

  // Update the students array whenever the search parameters change
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
        onCompleted: (data) => {
          // setStudents(data?.gStudents || []);
          // setFilteredStudents(data.students || []);
          // console.log("DATA", data);
        },
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
          // setFilteredStudents(data.students || []);
          // console.log("DATA", data);
        },
      });
    }
    // if (searchParameters.ay === "select-ay") console.log("NO STUDENT");
    // console.log("SEARCHPARAMS", searchParameters);
    setSelectedBatch("select-batch");
  }, [searchParameters]);

  useEffect(() => {
    if (selectedBatch && selectedBatch !== "select-batch") {
      // console.log("BATCH MODIFIED", selectedBatch);
      setStudents(
        studentsData?.gStudents?.filter(
          (student) => student.batch === selectedBatch
        )
      );
    } else {
      setStudents(studentsData?.gStudents || []);
    }
    // console.log("SELECTEDBATCH", selectedBatch);
  }, [selectedBatch]);

  // Filter students by name
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

  // Update the present and absent arrays whenever the attendanceData changes
  useEffect(() => {
    if (attendanceData?.attendance) {
      setPresent(attendanceData.attendance.present || []);
      setAbsent(attendanceData.attendance.absent || []);

      // Only try to set absentEmails if students array is populated
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
      // console.log("UNIQUE BATCH", uniqueBatch);
    } else {
      setBatches([]);
    }
  }, [studentsData]);

  // Get the month number from the month name
  function getMonthNumber(monthName) {
    const monthIndex = months.indexOf(monthName);
    if (monthIndex === -1) {
      return -1;
    }
    return monthIndex + 1 < 10 ? "0" + (monthIndex + 1) : monthIndex + 1;
  }

  // Update the attendance data in the database
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

  // Send emails to absent students
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

  // console.log("FORMATTEDDATE", formattedDate);

  // Reset filters when academic year or grade changes
  useEffect(() => {
    if (
      searchParameters.ay !== sessionStorage.getItem("a-ay") ||
      searchParameters.grade !== sessionStorage.getItem("a-grade")
    ) {
      setStudentName("");
      setSelectedBatch("select-batch");
    }
  }, [searchParameters.ay, searchParameters.grade]);

  // Reset name filter when batch changes
  useEffect(() => {
    if (selectedBatch !== sessionStorage.getItem("a-batch")) {
      setStudentName("");
    }
  }, [selectedBatch]);

  // Add a function to handle refreshing the student list
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

  // Filter academic years and grades based on faculty assignments
  useEffect(() => {
    if (isFaculty && facultyAssignments.length > 0) {
      // Extract unique academic years from faculty assignments
      const uniqueAYs = [
        ...new Set(
          facultyAssignments.map((assignment) => assignment.academicYear)
        ),
      ];
      setAvailableAcademicYears(uniqueAYs);

      // Filter grades based on selected academic year
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

  // Update grade options when academic year changes
  useEffect(() => {
    if (isFaculty && searchParameters.ay !== "select-ay") {
      const gradesForSelectedAY = facultyAssignments
        .filter((assignment) => assignment.academicYear === searchParameters.ay)
        .map((assignment) => assignment.grade)
        .filter((grade) => grade && grade !== "all");

      setAvailableGrades([...new Set(gradesForSelectedAY)]);

      // Reset grade if current selection is not in available grades
      if (
        searchParameters.grade !== "select-grade" &&
        !gradesForSelectedAY.includes(searchParameters.grade)
      ) {
        setSearchParameters((prev) => ({ ...prev, grade: "select-grade" }));
      }
    }
  }, [searchParameters.ay, isFaculty, facultyAssignments]);

  // Filter students based on batch selection
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

  // Compute final displayed students based on filters
  const displayStudents = studentName
    ? filteredStudents.filter((student) =>
        `${student?.firstname || ""} ${student?.middlename || ""} ${
          student?.lastname || ""
        }`
          .toLowerCase()
          .includes(studentName.toLowerCase())
      )
    : filteredStudents;

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
              {/* Searchbar */}
              <div className="flex justify-between items-center flex-wrap w-full md:w-[60%] gap-2 mb-2">
                {/* Academic Year Dropdown */}
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
                        // Show only assigned academic years for faculty
                        availableAcademicYears.map((acay, index) => (
                          <SelectItem key={index} value={acay}>
                            {acay}
                          </SelectItem>
                        ))
                      ) : (
                        // Show all academic years for admin
                        Array.from(ay?.academicYears)?.map((acay, index) => (
                          <SelectItem key={index} value={acay}>
                            {acay}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Standard Dropdown */}
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
                        ? // Show only assigned grades for faculty for the selected academic year
                          availableGrades.map((grade, index) => (
                            <SelectItem key={index} value={grade}>
                              {grade}
                            </SelectItem>
                          ))
                        : // Show all grades for admin
                          grades.map((grd, index) => (
                            <SelectItem key={index} value={grd || index}>
                              {grd}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Batch Dropdown */}
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

              {/* Name Search Input */}
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
                            // console.log("ABSENT", absent);
                            // console.log("ABSENT EMAILS", absentEmails);
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

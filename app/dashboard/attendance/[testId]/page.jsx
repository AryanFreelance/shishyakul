"use client";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { dashboardNavLinks } from "@/constants";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { format, set } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GET_TESTPAPER,
  GET_TESTPAPER_ATTENDANCE_STUDENTS,
} from "@/graphql/queries/testPaper.query";
import { useParams } from "next/navigation";
import { MARK_TESTPAPER_ATTENDANCE } from "@/graphql/mutations/testPaper.mutation";

// TODO: Get Test Paper Data First.
// TODO: Fetch all the students who got the testpaper shared.
// TODO: Mutation for updating the attendance.

const TestpaperAttendance = () => {
  const { testId } = useParams();
  const [testpaperStudents, setTestpaperStudents] = useState([]);
  const [attendanceRecordedAt, setAttendanceRecordedAt] = useState(null);

  const { data: testpaperData } = useSuspenseQuery(GET_TESTPAPER, {
    variables: { id: `${testId}`, published: true },
  });

  const {
    data: testpaperStudentsAttendanceData,
    loading: loadingTestpaperStudentAttendancedata,
  } = useSuspenseQuery(GET_TESTPAPER_ATTENDANCE_STUDENTS, {
    variables: { id: `${testId}` },
  });

  const [markTestpaperAttendance] = useMutation(MARK_TESTPAPER_ATTENDANCE, {
    onCompleted: (data) => {
      toast.success("Attendance Saved Successfully!");
    },
    onError: (error) => {
      toast.error("Error Saving attendance.");
      // console.log("ERROR", error);
    },
    refetchQueries: [
      {
        query: GET_TESTPAPER,
        variables: { id: testId, published: true },
      },
    ],
  });

  useEffect(() => {
    if (
      testpaperStudentsAttendanceData &&
      testpaperData &&
      testpaperData?.testpaper
    ) {
      const presentUserIds = new Set(testpaperData?.testpaper?.present);
      const absentUserIds = new Set(testpaperData?.testpaper?.absent);

      setAttendanceRecordedAt(testpaperData?.testpaper?.attendanceDate);

      setTestpaperStudents(
        testpaperStudentsAttendanceData?.testpaperAttendanceStudents.map(
          (student) => {
            if (presentUserIds.has(student.userId)) {
              return { ...student, attendance: "present" };
            } else if (absentUserIds.has(student.userId)) {
              return { ...student, attendance: "absent" };
            }
            return student;
          }
        )
      );
    }
  }, [testpaperStudentsAttendanceData, testpaperData]);

  const radioInputChangeHandler = (e, userID, index) => {
    const { value } = e.target;
    setTestpaperStudents((prevStudents) => {
      const updatedStudents = prevStudents.map((student, i) =>
        i === index ? { ...student, attendance: value } : student
      );
      return updatedStudents;
    });

    // console.log("VALUE", value);
  };

  const markAttendanceHandler = async (e) => {
    e.preventDefault();

    const attendanceData = testpaperStudents
      .filter((student) => student.attendance)
      .map((student) => ({
        userId: student.userId,
        attendance: student.attendance,
      }));
    const presentStudents = attendanceData.filter(
      (student) => student.attendance === "present"
    );
    const absentStudents = attendanceData.filter(
      (student) => student.attendance === "absent"
    );

    // console.log("PRESENT", presentStudents);
    // console.log("ABSENT", absentStudents);
    // console.log("ATTENDANCE", attendanceData);

    await markTestpaperAttendance({
      variables: {
        id: testId,
        date: new Date().toLocaleDateString().toString(),
        present: presentStudents.map((student) => student.userId),
        absent: absentStudents.map((student) => student.userId),
      },
    }).then((data) => {
      // console.log("DATA", data);
    });
  };

  const markAllAsPresent = () => {
    setTestpaperStudents((prev) =>
      prev.map((student) => ({ ...student, attendance: "present" }))
    );
  };

  const markAllAsAbsent = () => {
    setTestpaperStudents((prev) =>
      prev.map((student) => ({ ...student, attendance: "absent" }))
    );
  };

  const markClearAttendance = () => {
    setTestpaperStudents((prev) =>
      prev.map((student) => ({ ...student, attendance: undefined }))
    );
  };

  // console.log("TESTPAPERDATA", testpaperData);
  // console.log(
  //   "testpaperStudentsAttendanceData",
  //   testpaperStudentsAttendanceData
  // );
  // console.log("testpaperStudents", testpaperStudents);

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4">
          <h2 className="subheading text-center md:text-left">
            Attendance for {testpaperData?.testpaper?.title} (Test)
          </h2>
          {/* {students !== null && students?.length > 0 && (
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
          )} */}
        </div>
        <div className="mt-6 flex flex-col lg:flex-row gap-10">
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h3 className="subsubheading text-secondary flex flex-col md:flex-row gap-2">
                <span>Attendance marking for </span>{" "}
              </h3>

              {testpaperStudents !== null && testpaperStudents?.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full md:w-auto">
                      Mark All <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        // setPresent(
                        //   testpaperStudents?.map((student) => student.userId)
                        // );
                        // setAbsent([]);
                        markAllAsPresent();
                      }}
                    >
                      Present
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        // setAbsent(
                        //   testpaperStudents?.map((student) => student.userId)
                        // );
                        // setPresent([]);
                        markAllAsAbsent();
                      }}
                    >
                      Absent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        markClearAttendance();
                      }}
                    >
                      Clear
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <span>
                {!loadingTestpaperStudentAttendancedata &&
                  testpaperStudents?.length > 0 &&
                  `${testpaperStudents?.length} Students Found.`}
              </span>
              <span>
                {attendanceRecordedAt &&
                  `Attendance Recorded At: ${attendanceRecordedAt}`}
              </span>
            </div>

            <div className="mt-6">
              {!loadingTestpaperStudentAttendancedata &&
                testpaperStudents?.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center rounded my-4">
                      <div>
                        ({item.ay}, {item.grade}){" "}
                        <span className="font-semibold">
                          {item.firstname + " " + item.lastname}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex gap-2">
                          <input
                            type="radio"
                            name={item.userId}
                            value="present"
                            id={`present-${item.userId}`}
                            onChange={(e) =>
                              radioInputChangeHandler(e, item.userId, index)
                            }
                            checked={
                              testpaperStudents[index].attendance === "present"
                            }
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
                            checked={
                              testpaperStudents[index].attendance === "absent"
                            }
                            onChange={(e) =>
                              radioInputChangeHandler(e, item.userId, index)
                            }
                          />
                          <label htmlFor={`absent-${item.userId}`}>
                            Absent
                          </label>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mt-8 w-full">
              {loadingTestpaperStudentAttendancedata && (
                <span className="text-lg text-secondary">
                  Loading Students! Please Wait...
                </span>
              )}
              {(testpaperStudents === null || testpaperStudents?.length == 0) &&
                !loadingTestpaperStudentAttendancedata && (
                  <span className="text-lg text-secondary">
                    No Students Found! Please add students to create
                    attendance!!
                  </span>
                )}
              {testpaperStudents !== null && testpaperStudents?.length > 0 && (
                <>
                  <div className="w-full md:w-[50%]">
                    <Button className="w-full" onClick={markAttendanceHandler}>
                      Mark Attendance
                    </Button>
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

export default TestpaperAttendance;

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

import { format } from "date-fns";
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
  GET_ATTENDANCE,
  GET_STUDENTS,
} from "@/graphql/queries/attendance.query";

export const dynamic = "force-dynamic";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  CREATE_ATTENDANCE,
  UPDATE_ATTENDANCE,
} from "@/graphql/mutations/attendance.mutation";
import toast from "react-hot-toast";

const Page = () => {
  const [present, setPresent] = useState([]);
  const [absent, setAbsent] = useState([]);
  const today = new Date();
  const [date, setDate] = useState(today);
  const [formattedDate, setFormattedDate] = useState("");
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
  const todayDate = `${
    today.getDate() < 10 ? "0" + today.getDate() : today.getDate()
  }-${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }-${today.getFullYear()}`;

  // Queries - Get Students, Get Attendance
  const { data: studentsData } = useSuspenseQuery(GET_STUDENTS);

  const [fetchAttendance, { data: attendanceData }] = useLazyQuery(
    GET_ATTENDANCE,
    {
      fetchPolicy: "network-only",
    }
  );

  // Mutations - Create Attendance, Update Attendance
  const [createAttendance] = useMutation(CREATE_ATTENDANCE, {
    onCompleted: (data) => {
      console.log("Attendance Created: ", data);
      toast.success("Attendance Saved Successfully!");
    },
    onError: (error) => {
      console.log("Error creating attendance: ", error);
      toast.error("Error saving attendance.");
    },
    refetchQueries: [
      {
        query: GET_ATTENDANCE,
        variables: { timestamp: formattedDate.split("-").reverse().join("-") },
      },
    ],
  });

  const [updateAttendance] = useMutation(UPDATE_ATTENDANCE, {
    onCompleted: (data) => {
      console.log("Attendance Updated: ", data);
      toast.success("Attendance Updated Successfully!");
    },
    onError: (error) => {
      console.log("Error updating attendance: ", error);
      toast.error("Error updating attendance.");
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
    const sDate = date && date.toString().split(" ");
    const formattedDate =
      date && `${sDate[2]}-${getMonthNumber(sDate[1])}-${sDate[3]}`;
    setFormattedDate(date ? formattedDate : "(select a date)");
    if (formattedDate) {
      fetchAttendance({
        variables: {
          timestamp: formattedDate.split("-").reverse().join("-"),
        },
      });
    }
  }, [date]);

  useEffect(() => {
    if (attendanceData?.attendance) {
      setPresent(attendanceData.attendance.present);
      setAbsent(attendanceData.attendance.absent);
    } else {
      setPresent([]);
      setAbsent([]);
    }
  }, [attendanceData]);

  function getMonthNumber(monthName) {
    const monthIndex = months.indexOf(monthName);
    if (monthIndex === -1) {
      return -1;
    }
    return monthIndex + 1 < 10 ? "0" + (monthIndex + 1) : monthIndex + 1;
  }

  const updateAttendanceHandler = async () => {
    const toastId = toast.loading("Updating Attendance...");

    if (!attendanceData?.attendance) {
      await createAttendance({
        variables: {
          timestamp: formattedDate.split("-").reverse().join("-"),
          present: present,
          absent: absent,
        },
      });
    } else {
      await updateAttendance({
        variables: {
          present: present,
          absent: absent,
          timestamp: formattedDate.split("-").reverse().join("-"),
        },
      });
    }
    toast.dismiss(toastId);
  };

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <h2 className="subheading mb-4 text-center md:text-left">Attendance</h2>
        {studentsData !== null && studentsData?.students.length > 0 && (
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
        <div className="mt-8 flex flex-col lg:flex-row gap-10">
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h3 className="subsubheading text-secondary">
                Attendance marking for {formattedDate}
              </h3>

              {studentsData !== null && studentsData?.students.length > 0 && (
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
                          studentsData?.students.map(
                            (student) => student.userId
                          )
                        );
                        setAbsent([]);
                      }}
                    >
                      Present
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setAbsent(
                          studentsData?.students.map(
                            (student) => student.userId
                          )
                        );
                        setPresent([]);
                      }}
                    >
                      Absent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="mt-6">
              {studentsData?.students.map((item, index) => (
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
                          checked={present.includes(item.userId)}
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
                          checked={absent.includes(item.userId)}
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
              {(studentsData === null ||
                studentsData?.students.length == 0) && (
                <span className="text-lg text-secondary">
                  No Students Found! Please add students to create attendance!!
                </span>
              )}
              {studentsData !== null && studentsData?.students.length > 0 && (
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
                    {formattedDate === todayDate && (
                      // TODO: Add Sending Email/SMS functionality using Render
                      <Button className="w-full">Send SMS/Email</Button>
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

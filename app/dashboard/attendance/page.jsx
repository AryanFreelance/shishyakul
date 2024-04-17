"use client";

import Calendar from "@/components/sections/Calendar";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { dashboardNavLinks } from "@/constants";
import { attendanceStore } from "@/store/attendance";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const page = () => {
  const [attendance, setAttendance] = useState([]);

  const date = attendanceStore((state) => state.date);
  let dateSplit = date.split("-").reverse().join("/");
  const today = new Date();
  const todayDateString = `${
    today.getDate() < 10 ? "0" + today.getDate() : today.getDate()
  }/${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }/${today.getFullYear()}`;

  const radioChangeHandler = (e) => {
    console.log(e.target.value);
    setAttendance((prev) => [...prev, e.target.value]);
    console.log(attendance);
  };

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <h2 className="subheading">Attendance</h2>
        <div className="mt-8 flex flex-col lg:flex-row gap-10">
          <div className="lg:w-[40%]">
            <Calendar />
          </div>
          <div className="lg:w-[60%]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h3 className="subsubheading text-secondary">
                Attendance marking for{" "}
                {date != "" ? dateSplit : todayDateString}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full md:w-auto">
                    Mark All <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator /> */}
                  <DropdownMenuItem>Present</DropdownMenuItem>
                  <DropdownMenuItem>Absent</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  className="flex justify-between items-center rounded my-4"
                  key={item}
                >
                  <div>Aryan Shinde</div>
                  <div className="flex gap-4">
                    <div className="flex gap-2">
                      <input
                        type="radio"
                        name={item}
                        value="present"
                        onChange={radioChangeHandler}
                        id={`present-${item}`}
                      />
                      <label htmlFor={`present-${item}`}>Present</label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="radio"
                        id={`absent-${item}`}
                        name={item}
                        value="absent"
                        onChange={radioChangeHandler}
                      />
                      <label htmlFor={`absent-${item}`}>Absent</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center gap-6 mt-8">
              <div className="w-[50%]">
                <Button className="w-full">Save</Button>
              </div>
              <div className="w-[50%]">
                <Button className="w-full">Send SMS/Email</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default page;

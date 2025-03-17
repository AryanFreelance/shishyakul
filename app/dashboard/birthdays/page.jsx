"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useLazyQuery } from "@apollo/client";
import { GET_ACADEMIC_YEARS } from "@/graphql/queries/students.query";
import {
  GET_TODAYS_BIRTHDAYS,
  GET_BIRTHDAYS_BY_MONTH,
  GET_BIRTHDAYS,
} from "@/graphql/queries/birthdays.query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Gift, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const BirthdaysPage = () => {
  const router = useRouter();
  const [selectedAY, setSelectedAY] = useState(
    typeof window !== "undefined"
      ? sessionStorage.getItem("b-ay") || "select-ay"
      : "select-ay"
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString()
  );
  const [activeTab, setActiveTab] = useState("today");
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Fetch academic years
  const { data: ayData, loading: ayLoading } =
    useSuspenseQuery(GET_ACADEMIC_YEARS);

  // Fetch today's birthdays
  const [fetchTodaysBirthdays, { data: todayData, loading: todayLoading }] =
    useLazyQuery(GET_TODAYS_BIRTHDAYS, {
      fetchPolicy: "network-only",
    });

  // Fetch birthdays by month
  const [
    fetchBirthdaysByMonth,
    { data: monthlyData, loading: monthlyLoading },
  ] = useLazyQuery(GET_BIRTHDAYS_BY_MONTH, {
    fetchPolicy: "network-only",
    variables: {
      month: parseInt(selectedMonth),
      ay: selectedAY === "select-ay" ? null : selectedAY,
    },
  });

  // Fetch all birthdays by academic year
  const [
    fetchBirthdays,
    { data: birthdaysData, loading: birthdaysLoading, error: birthdaysError },
  ] = useLazyQuery(GET_BIRTHDAYS, {
    fetchPolicy: "network-only",
    variables: {
      ay: selectedAY === "select-ay" ? null : selectedAY,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Update sessionStorage when selected academic year changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("b-ay", selectedAY);
    }
  }, [selectedAY]);

  // Fetch today's birthdays on component mount
  useEffect(() => {
    fetchTodaysBirthdays();
  }, [fetchTodaysBirthdays]);

  // Fetch birthdays when academic year changes or when the tab changes to "all"
  useEffect(() => {
    if (activeTab === "all") {
      fetchBirthdays({
        variables: {
          ay: selectedAY === "select-ay" ? null : selectedAY,
        },
      });
    }
  }, [fetchBirthdays, selectedAY, activeTab]);

  // Fetch birthdays by month when month or academic year changes or when tab changes to "monthly"
  useEffect(() => {
    if (activeTab === "monthly" && selectedMonth) {
      fetchBirthdaysByMonth({
        variables: {
          month: parseInt(selectedMonth),
          ay: selectedAY === "select-ay" ? null : selectedAY,
        },
      });
    }
  }, [fetchBirthdaysByMonth, selectedMonth, selectedAY, activeTab]);

  // Format date as "DD Month" from DD-MM-YYYY
  const formatBirthdate = (dob) => {
    if (!dob) return "";
    const parts = dob.split("-");
    if (parts.length < 3) return dob;

    const day = parts[0];
    const month = parseInt(parts[1]) - 1;

    return `${day} ${months[month]?.label || ""}`;
  };

  // Get the age from birthdate (DD-MM-YYYY format)
  const calculateAge = (dob) => {
    if (!dob) return "";
    const parts = dob.split("-");
    if (parts.length < 3) return "";

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);

    const today = new Date();
    const birthDate = new Date(year, month, day);

    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Navigate to student profile - UPDATED URL FORMAT
  const handleStudentClick = (userId, ay, grade) => {
    router.push(`/student/${ay}/${grade}/${userId}`);
  };

  // When academic year changes, reload data for the active tab
  const handleAYChange = (value) => {
    setSelectedAY(value);
    if (activeTab === "monthly") {
      fetchBirthdaysByMonth({
        variables: {
          month: parseInt(selectedMonth),
          ay: value === "select-ay" ? null : value,
        },
      });
    } else if (activeTab === "all") {
      fetchBirthdays({
        variables: {
          ay: value === "select-ay" ? null : value,
        },
      });
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "monthly") {
      fetchBirthdaysByMonth({
        variables: {
          month: parseInt(selectedMonth),
          ay: selectedAY === "select-ay" ? null : selectedAY,
        },
      });
    } else if (value === "all") {
      fetchBirthdays({
        variables: {
          ay: selectedAY === "select-ay" ? null : selectedAY,
        },
      });
    }
  };

  // Initial state for sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAY = sessionStorage.getItem("b-ay");
      if (storedAY) {
        setSelectedAY(storedAY);
      }
    }
  }, []);

  // Group birthdays by month function (for the All tab)
  const groupBirthdaysByMonth = (students) => {
    const grouped = {};
    if (!students) return grouped;

    students.forEach((student) => {
      if (student?.dob) {
        const dobParts = student.dob.split("-");
        if (dobParts.length >= 2) {
          const month = parseInt(dobParts[1]);
          if (!grouped[month]) {
            grouped[month] = [];
          }
          grouped[month].push(student);
        }
      }
    });

    return grouped;
  };

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4">
          <h2 className="subheading text-center md:text-left">
            Birthday Tracker
          </h2>
        </div>

        <div className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 my-4">
            <div className="w-full md:w-1/3">
              <Select
                onValueChange={handleAYChange}
                value={selectedAY}
                defaultValue="select-ay"
              >
                <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full border-2 border-main outline-none focus:border-none focus-outline-none bg-transparent w-full py-6">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-ay">All Academic Years</SelectItem>
                  {ayLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    Array.from(ayData?.academicYears || [])?.map(
                      (ay, index) => (
                        <SelectItem key={index} value={ay}>
                          {ay}
                        </SelectItem>
                      )
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs
            defaultValue="today"
            onValueChange={handleTabChange}
            className="mt-6"
          >
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's birthdays */}
                <Card>
                  <CardHeader className="bg-gray-50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gift className="w-5 h-5" /> Today's Birthdays
                      </CardTitle>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {todayData?.todaysBirthdays?.today?.length || 0}{" "}
                        Students
                      </div>
                    </div>
                    <CardDescription>
                      Students celebrating their birthday today
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {todayLoading ? (
                      <div className="text-center py-6">Loading...</div>
                    ) : todayData?.todaysBirthdays?.today?.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No birthdays today
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {todayData?.todaysBirthdays?.today?.map(
                          (student, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-all"
                              onClick={() =>
                                handleStudentClick(
                                  student.userId,
                                  student.ay,
                                  student.grade
                                )
                              }
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-medium text-blue-900">
                                    {student.firstname} {student.lastname}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {student.ay} | Grade {student.grade}
                                    {student.batch &&
                                      ` | Batch ${student.batch}`}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="inline-flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {student.dob}
                                      <span className="ml-2 text-blue-700">
                                        ({calculateAge(student.dob)} years)
                                      </span>
                                    </span>
                                  </p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-blue-700" />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming birthdays */}
                <Card>
                  <CardHeader className="bg-gray-50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Upcoming Birthdays
                      </CardTitle>
                      <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        Next 7 Days
                      </div>
                    </div>
                    <CardDescription>
                      Students celebrating their birthday in the next 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {todayLoading ? (
                      <div className="text-center py-6">Loading...</div>
                    ) : todayData?.todaysBirthdays?.upcoming?.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No upcoming birthdays in the next 7 days
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {todayData?.todaysBirthdays?.upcoming?.map(
                          (student, index) => (
                            <div
                              key={index}
                              className="p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-all"
                              onClick={() =>
                                handleStudentClick(
                                  student.userId,
                                  student.ay,
                                  student.grade
                                )
                              }
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-medium text-purple-900">
                                    {student.firstname} {student.lastname}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {student.ay} | Grade {student.grade}
                                    {student.batch &&
                                      ` | Batch ${student.batch}`}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="inline-flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatBirthdate(student.dob)}
                                    </span>
                                  </p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-purple-700" />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              <div className="mb-4">
                <Select
                  onValueChange={(value) => {
                    setSelectedMonth(value);
                    fetchBirthdaysByMonth({
                      variables: {
                        month: parseInt(value),
                        ay: selectedAY === "select-ay" ? null : selectedAY,
                      },
                    });
                  }}
                  value={selectedMonth}
                  defaultValue={(new Date().getMonth() + 1).toString()}
                >
                  <SelectTrigger className="px-4 text-secondary barlow-regular rounded-full border-2 border-main outline-none focus:border-none focus-outline-none bg-transparent w-full md:w-1/3 py-6">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {
                        months.find((m) => m.value === selectedMonth)?.label
                      }{" "}
                      Birthdays
                    </CardTitle>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {monthlyData?.studentsBirthdaysByMonth?.length || 0}{" "}
                      Students
                    </div>
                  </div>
                  <CardDescription>
                    {selectedAY === "select-ay"
                      ? "Students from all academic years with birthdays in this month"
                      : `Students from ${selectedAY} with birthdays in this month`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {monthlyLoading ? (
                    <div className="text-center py-6">Loading...</div>
                  ) : monthlyData?.studentsBirthdaysByMonth?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No birthdays found for this month
                      {selectedAY !== "select-ay" && ` in ${selectedAY}`}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {monthlyData?.studentsBirthdaysByMonth?.map(
                        (student, index) => (
                          <div
                            key={index}
                            className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-all"
                            onClick={() =>
                              handleStudentClick(
                                student.userId,
                                student.ay,
                                student.grade
                              )
                            }
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium text-green-900">
                                  {student.firstname} {student.lastname}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {student.ay} | Grade {student.grade}
                                  {student.batch && ` | Batch ${student.batch}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="inline-flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {student.dob}
                                    <span className="ml-2 text-green-700">
                                      ({calculateAge(student.dob)} years)
                                    </span>
                                  </span>
                                </p>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-green-700" />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5" /> All Birthdays
                    </CardTitle>
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                      {birthdaysData?.birthdays?.length || 0} Students
                    </div>
                  </div>
                  <CardDescription>
                    {selectedAY === "select-ay"
                      ? "All students with their birthdays"
                      : `Students from ${selectedAY} with their birthdays`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {birthdaysLoading ? (
                    <div className="text-center py-6">Loading...</div>
                  ) : birthdaysError ? (
                    <div className="text-center py-6 text-red-500">
                      Error loading birthdays. Please try again.
                    </div>
                  ) : !birthdaysData?.birthdays?.length ? (
                    <div className="text-center py-6 text-gray-500">
                      No birthday data found
                      {selectedAY !== "select-ay" && ` in ${selectedAY}`}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Group birthdays by month */}
                      {Object.entries(
                        groupBirthdaysByMonth(birthdaysData.birthdays)
                      ).map(([monthNumber, students]) => {
                        const month = parseInt(monthNumber);
                        if (!students || students.length === 0) return null;

                        return (
                          <div key={month} className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {
                                months.find((m) => parseInt(m.value) === month)
                                  ?.label
                              }{" "}
                              <span className="text-sm font-normal text-gray-500">
                                ({students.length} students)
                              </span>
                            </h3>
                            <Separator className="mb-3" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {students
                                .sort((a, b) => {
                                  return (
                                    parseInt(a?.dob?.split("-")[0] || 0) -
                                    parseInt(b?.dob?.split("-")[0] || 0)
                                  );
                                })
                                .map((student, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-all"
                                    onClick={() =>
                                      handleStudentClick(
                                        student.userId,
                                        student.ay,
                                        student.grade
                                      )
                                    }
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h3 className="font-medium text-amber-900">
                                          {student.firstname} {student.lastname}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                          {student.ay} | Grade {student.grade}
                                          {student.batch &&
                                            ` | Batch ${student.batch}`}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          <span className="inline-flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {student.dob}
                                            <span className="ml-2 text-amber-700">
                                              ({calculateAge(student.dob)}{" "}
                                              years)
                                            </span>
                                          </span>
                                        </p>
                                      </div>
                                      <ArrowUpRight className="w-4 h-4 text-amber-700" />
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>
  );
};

export default BirthdaysPage;

"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation } from "@apollo/client";
import {
  GET_TESTPAPER,
  GET_TESTPAPER_ATTENDANCE_STUDENTS,
} from "@/graphql/queries/testPaper.query";
import { MARK_TESTPAPER_ATTENDANCE } from "@/graphql/mutations/testPaper.mutation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ChevronLeft, Loader } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

const FacultyTestAttendancePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState({
    present: [],
    absent: [],
  });
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Fetch user data and check for proper permissions
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const email = user.email;
        setUserEmail(email);
        setIsAdmin(email === "admin@shishyakul.in");

        // Check for faculty role
        const memberDoc = await getDoc(doc(db, "members", email));
        if (memberDoc.exists()) {
          const hasRoleFaculty = memberDoc.data().roles?.Faculty || false;
          if (!hasRoleFaculty && !isAdmin) {
            // Redirect to dashboard if not a faculty member or admin
            router.push("/dashboard");
            return;
          }
        }

        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, isAdmin]);

  // Get test paper data
  const { data: testData } = useSuspenseQuery(GET_TESTPAPER, {
    variables: { id, published: true },
    onError: (error) => {
      console.error("Error fetching test paper:", error);
      toast.error("Error fetching test paper");
      router.push("/dashboard/tests/faculty");
    },
  });

  // Check if the current user has permission to manage this test
  useEffect(() => {
    if (testData?.testpaper && !loading) {
      // Allow faculty member who created the test or admin to view
      if (testData.testpaper.createdBy !== userEmail && !isAdmin) {
        toast.error("You don't have permission to view this test");
        router.push("/dashboard/tests/faculty");
      }

      // Initialize attendance from test data if available
      if (testData.testpaper.present || testData.testpaper.absent) {
        setAttendance({
          present: testData.testpaper.present || [],
          absent: testData.testpaper.absent || [],
        });
      }

      // Set the selected date from test data if available
      if (testData.testpaper.attendanceDate) {
        setSelectedDate(testData.testpaper.attendanceDate.split("T")[0]);
      }
    }
  }, [testData, userEmail, isAdmin, loading, router]);

  // Get students who are shared with this test paper
  const { data: studentsData } = useSuspenseQuery(
    GET_TESTPAPER_ATTENDANCE_STUDENTS,
    {
      variables: { id },
      onCompleted: (data) => {
        if (data?.testpaperAttendanceStudents) {
          setStudents(data.testpaperAttendanceStudents);
        }
      },
      onError: (error) => {
        console.error("Error fetching students:", error);
        toast.error("Error fetching students");
      },
    }
  );

  // Mutation to mark attendance
  const [markAttendance, { loading: markLoading }] = useMutation(
    MARK_TESTPAPER_ATTENDANCE,
    {
      refetchQueries: [
        { query: GET_TESTPAPER, variables: { id, published: true } },
      ],
      onCompleted: () => {
        toast.success("Attendance marked successfully");
        setIsFormLoading(false);
      },
      onError: (error) => {
        toast.error(`Error marking attendance: ${error.message}`);
        setIsFormLoading(false);
      },
    }
  );

  // Handle attendance change
  const handleAttendanceChange = (studentId, isPresent) => {
    setAttendance((prev) => {
      const updatedAttendance = { ...prev };

      // Remove student from both lists
      updatedAttendance.present = updatedAttendance.present.filter(
        (id) => id !== studentId
      );
      updatedAttendance.absent = updatedAttendance.absent.filter(
        (id) => id !== studentId
      );

      // Add student to the appropriate list
      if (isPresent) {
        updatedAttendance.present.push(studentId);
      } else {
        updatedAttendance.absent.push(studentId);
      }

      return updatedAttendance;
    });
  };

  // Handle save attendance
  const handleSaveAttendance = async () => {
    setIsFormLoading(true);

    try {
      await markAttendance({
        variables: {
          id,
          date: selectedDate,
          present: attendance.present,
          absent: attendance.absent,
        },
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      setIsFormLoading(false);
    }
  };

  // Find out if a student is present
  const isStudentPresent = (studentId) => {
    return attendance.present.includes(studentId);
  };

  // Find out if a student is absent
  const isStudentAbsent = (studentId) => {
    return attendance.absent.includes(studentId);
  };

  // Get the student attendance status
  const getStudentStatus = (studentId) => {
    if (isStudentPresent(studentId)) return "Present";
    if (isStudentAbsent(studentId)) return "Absent";
    return "Not Marked";
  };

  if (loading) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/tests/faculty")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Test Paper Attendance
          </h1>
        </div>

        {testData?.testpaper && (
          <div className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold">
                {testData.testpaper.title}
              </h2>
              <div className="mt-2 text-gray-600">
                <p>
                  <span className="font-medium">Subject:</span>{" "}
                  {testData.testpaper.subject}
                </p>
                <p>
                  <span className="font-medium">Test Date:</span>{" "}
                  {testData.testpaper.date
                    ? new Date(testData.testpaper.date).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">
                Attendance Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border rounded-md"
              />
            </div>
            <Button
              onClick={handleSaveAttendance}
              disabled={
                isFormLoading ||
                markLoading ||
                (!attendance.present.length && !attendance.absent.length)
              }
              className="mt-5"
            >
              {isFormLoading || markLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Attendance"
              )}
            </Button>
          </div>

          <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
          {students.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-500">
                No students are shared with this test paper.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left border">Student Name</th>
                    <th className="p-2 text-left border">Grade</th>
                    <th className="p-2 text-left border">Batch</th>
                    <th className="p-2 text-center border">Present</th>
                    <th className="p-2 text-center border">Absent</th>
                    <th className="p-2 text-center border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.userId} className="border-b">
                      <td className="p-2 border">
                        {student.firstname} {student.middlename}{" "}
                        {student.lastname}
                      </td>
                      <td className="p-2 border">{student.grade}</td>
                      <td className="p-2 border">{student.batch}</td>
                      <td className="p-2 text-center border">
                        <Checkbox
                          checked={isStudentPresent(student.userId)}
                          onCheckedChange={(checked) =>
                            handleAttendanceChange(student.userId, checked)
                          }
                        />
                      </td>
                      <td className="p-2 text-center border">
                        <Checkbox
                          checked={isStudentAbsent(student.userId)}
                          onCheckedChange={(checked) =>
                            handleAttendanceChange(student.userId, !checked)
                          }
                        />
                      </td>
                      <td className="p-2 text-center border">
                        <span
                          className={
                            isStudentPresent(student.userId)
                              ? "text-green-600"
                              : isStudentAbsent(student.userId)
                              ? "text-red-600"
                              : "text-gray-500"
                          }
                        >
                          {getStudentStatus(student.userId)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default FacultyTestAttendancePage;

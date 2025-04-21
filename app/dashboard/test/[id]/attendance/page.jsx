"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation } from "@apollo/client";
import { GET_TESTPAPER } from "@/graphql/queries/testPaper.query";
import { UPDATE_TEST_ATTENDANCE } from "@/graphql/mutations/testPaper.mutation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { ChevronLeft, Loader } from "lucide-react";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

const TestAttendancePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    present: [],
    absent: [],
    attendanceDate: null,
  });
  const [students, setStudents] = useState([]);

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
          setIsFaculty(memberDoc.data().roles?.Faculty || false);
        }

        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Query to fetch the test paper data
  const { data } = useSuspenseQuery(GET_TESTPAPER, {
    variables: { id, published: true },
    onCompleted: (data) => {
      if (data?.testpaper) {
        // Check if current user is the creator or admin
        if (
          data.testpaper.createdBy === userEmail ||
          userEmail === "admin@shishyakul.in"
        ) {
          // Set attendance data if it exists
          if (data.testpaper.present || data.testpaper.absent) {
            setAttendanceData({
              present: data.testpaper.present || [],
              absent: data.testpaper.absent || [],
              attendanceDate: data.testpaper.attendanceDate || null,
            });
          }

          // Fetch students based on sharedWith data
          if (
            data.testpaper.sharedWith &&
            data.testpaper.sharedWith.length > 0
          ) {
            fetchStudents(data.testpaper.sharedWith);
          }
        } else {
          toast.error("You don't have permission to view this test");
          router.push("/dashboard/tests");
        }
      }
    },
    onError: (error) => {
      console.error("Error fetching test paper:", error);
      toast.error("Error fetching test paper");
      router.push("/dashboard/tests");
    },
  });

  // Function to fetch students based on sharedWith data
  const fetchStudents = async (sharedWith) => {
    try {
      const studentsRef = collection(db, "students");
      const studentsQuery = query(
        studentsRef,
        where("academicYear", "==", sharedWith[0].academicYear),
        where("grade", "==", sharedWith[0].grade),
        where("batch", "==", sharedWith[0].batch)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
    }
  };

  // Mutation to update attendance
  const [updateAttendance] = useMutation(UPDATE_TEST_ATTENDANCE, {
    refetchQueries: [
      { query: GET_TESTPAPER, variables: { id, published: true } },
    ],
    onCompleted: () => {
      toast.success("Attendance updated successfully");
      setIsFormLoading(false);
      router.push(`/dashboard/test/${id}/marks`);
    },
    onError: (error) => {
      toast.error(`Error updating attendance: ${error.message}`);
      setIsFormLoading(false);
    },
  });

  // Handler to update attendance
  const handleAttendanceUpdate = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      await updateAttendance({
        variables: {
          id,
          present: attendanceData.present,
          absent: attendanceData.absent,
          attendanceDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      setIsFormLoading(false);
    }
  };

  // Handler to toggle student attendance
  const toggleAttendance = (studentId, isPresent) => {
    setAttendanceData((prev) => {
      const newPresent = isPresent
        ? [...prev.present, studentId]
        : prev.present.filter((id) => id !== studentId);
      const newAbsent = isPresent
        ? prev.absent.filter((id) => id !== studentId)
        : [...prev.absent, studentId];
      return {
        ...prev,
        present: newPresent,
        absent: newAbsent,
      };
    });
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
            onClick={() => router.push(`/dashboard/test/${id}`)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Mark Attendance</h1>
        </div>

        <form onSubmit={handleAttendanceUpdate} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Student Attendance</h2>
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.rollNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`present-${student.id}`}
                        checked={attendanceData.present.includes(student.id)}
                        onCheckedChange={(checked) =>
                          toggleAttendance(student.id, checked)
                        }
                      />
                      <label
                        htmlFor={`present-${student.id}`}
                        className="text-sm font-medium"
                      >
                        Present
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`absent-${student.id}`}
                        checked={attendanceData.absent.includes(student.id)}
                        onCheckedChange={(checked) =>
                          toggleAttendance(student.id, !checked)
                        }
                      />
                      <label
                        htmlFor={`absent-${student.id}`}
                        className="text-sm font-medium"
                      >
                        Absent
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isFormLoading}>
              {isFormLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Save Attendance"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default TestAttendancePage;

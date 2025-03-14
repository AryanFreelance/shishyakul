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
  GET_TESTPAPER_MARKS,
} from "@/graphql/queries/testPaper.query";
import { SAVE_TEST_MARKS } from "@/graphql/mutations/testPaper.mutation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ChevronLeft, Loader } from "lucide-react";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

const FacultyTestMarksPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [marks, setMarks] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
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
          setIsFaculty(memberDoc.data().roles?.Faculty || false);
        }

        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Get test paper data
  const { data: testData } = useSuspenseQuery(GET_TESTPAPER, {
    variables: { id, published: true },
    onError: (error) => {
      console.error("Error fetching test paper:", error);
      toast.error("Error fetching test paper");
      router.push("/dashboard/tests/faculty");
    },
  });

  // Get test paper marks
  const { data: marksData } = useSuspenseQuery(GET_TESTPAPER_MARKS, {
    variables: { id },
    onCompleted: (data) => {
      if (data?.testpaperMarks) {
        setMarks(
          data.testpaperMarks.map((mark) => ({
            ...mark,
            marks: mark.marks.toString(),
          }))
        );
      }
    },
    onError: (error) => {
      console.error("Error fetching test paper marks:", error);
      toast.error("Error fetching test paper marks");
    },
  });

  // Check if user has permission to view this test
  useEffect(() => {
    if (testData?.testpaper && !loading) {
      // Allow faculty member who created the test or admin to view
      if (testData.testpaper.createdBy !== userEmail && !isAdmin) {
        toast.error("You don't have permission to view this test");
        router.push("/dashboard/tests/faculty");
      }
    }
  }, [testData, userEmail, isAdmin, loading, router]);

  // Mutation to save marks
  const [saveMarks, { loading: saveLoading }] = useMutation(SAVE_TEST_MARKS, {
    refetchQueries: [{ query: GET_TESTPAPER_MARKS, variables: { id } }],
    onCompleted: () => {
      toast.success("Marks saved successfully");
      setIsFormLoading(false);
    },
    onError: (error) => {
      toast.error(`Error saving marks: ${error.message}`);
      setIsFormLoading(false);
    },
  });

  // Handle marks change
  const handleMarksChange = (email, value) => {
    const newMarks = marks.map((mark) => {
      if (mark.email === email) {
        return { ...mark, marks: value };
      }
      return mark;
    });
    setMarks(newMarks);
  };

  // Handle save marks
  const handleSaveMarks = async () => {
    setIsFormLoading(true);

    try {
      // Validate marks
      const marksData = marks.map((mark) => ({
        email: mark.email,
        marks: parseInt(mark.marks) || 0,
        name: mark.name,
        grade: mark.grade,
      }));

      await saveMarks({
        variables: {
          testId: id,
          data: marksData,
        },
      });
    } catch (error) {
      console.error("Error saving marks:", error);
      setIsFormLoading(false);
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold">Test Paper Marks</h1>
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
                  <span className="font-medium">Total Marks:</span>{" "}
                  {testData.testpaper.totalMarks}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {testData.testpaper.date
                    ? new Date(testData.testpaper.date).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Student Marks</h2>
          {marks.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-500">
                No students have taken this test yet or no students have been
                shared with.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left border">Student Name</th>
                      <th className="p-2 text-left border">Email</th>
                      <th className="p-2 text-left border">Grade</th>
                      <th className="p-2 text-left border">Marks</th>
                      <th className="p-2 text-left border">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks
                      .sort((a, b) => {
                        const marksA = parseInt(a.marks) || 0;
                        const marksB = parseInt(b.marks) || 0;
                        return marksB - marksA;
                      })
                      .map((mark, index) => (
                        <tr key={mark.email} className="border-b">
                          <td className="p-2 border">{mark.name}</td>
                          <td className="p-2 border">{mark.email}</td>
                          <td className="p-2 border">{mark.grade}</td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              value={mark.marks}
                              onChange={(e) =>
                                handleMarksChange(mark.email, e.target.value)
                              }
                              className="w-24 p-1 border rounded"
                              min="0"
                              max={testData?.testpaper?.totalMarks || 100}
                            />
                          </td>
                          <td className="p-2 border">{mark.rank || "-"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSaveMarks}
                  disabled={isFormLoading || saveLoading}
                >
                  {isFormLoading || saveLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Marks"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default FacultyTestMarksPage;

"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { dashboardNavLinks } from "@/constants";
import { useLazyQuery, useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
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

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  GET_TESTPAPER,
  GET_FACULTY_TESTPAPERS,
} from "@/graphql/queries/testPaper.query";
import {
  DELETE_TESTPAPER,
  PUBLISH_TESTPAPER,
  UPDATE_SHARED_WITH,
  UPDATE_FACULTY_TESTPAPER,
} from "@/graphql/mutations/testPaper.mutation";
import FacultyTestShareDialog from "@/components/private/dashboard/tests/FacultyTestShareDialog";
import { ChevronLeft, Loader, Lock } from "lucide-react";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const FacultyTestDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [testData, setTestData] = useState({
    title: "",
    subject: "",
    date: "",
    totalMarks: 0,
    url: "",
    sharedWith: [],
    lockShareWith: false,
    createdBy: "",
    creatorName: "",
  });

  const [shareInput, setShareInput] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Fetch the current user data and test paper data
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const email = user.email;
        setUserEmail(email);

        // Get user name and faculty assignments from members collection
        const memberDoc = await getDoc(doc(db, "members", email));
        if (memberDoc.exists()) {
          setUserName(memberDoc.data().name || "");

          // Check if user has Faculty role
          const hasRoleFaculty = memberDoc.data().roles?.Faculty || false;
          const isAdmin = email === "admin@shishyakul.in";
          if (!hasRoleFaculty && !isAdmin) {
            // Redirect to dashboard if not a faculty member or admin
            router.push("/dashboard");
            return;
          }

          // Get faculty assignments if user has Faculty role
          if (hasRoleFaculty && memberDoc.data().uid) {
            try {
              const facultyRef = doc(db, "faculties", memberDoc.data().uid);
              const facultyDoc = await getDoc(facultyRef);
              if (facultyDoc.exists()) {
                setFacultyAssignments(facultyDoc.data().assignedStudents || []);
              }
            } catch (error) {
              console.error("Error fetching faculty assignments:", error);
            }
          }
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
    variables: { id, published: false },
    onCompleted: (data) => {
      if (data?.testpaper) {
        // Check if current user is the creator or admin
        if (
          data.testpaper.createdBy === userEmail ||
          userEmail === "admin@shishyakul.in"
        ) {
          setTestData(data.testpaper);
        } else {
          toast.error("You don't have permission to view this test");
          router.push("/dashboard/tests/faculty");
        }
      }
    },
    onError: (error) => {
      console.error("Error fetching test paper:", error);
      toast.error("Error fetching test paper");
      router.push("/dashboard/tests/faculty");
    },
  });

  useEffect(() => {
    if (data?.testpaper) {
      // Check if current user is the creator or admin
      if (
        data.testpaper.createdBy === userEmail ||
        userEmail === "admin@shishyakul.in" ||
        !data.testpaper.createdBy // For backward compatibility with tests that don't have createdBy field
      ) {
        setTestData(data.testpaper);
      } else {
        toast.error("You don't have permission to view this test");
        router.push("/dashboard/tests/faculty");
      }
    }
  }, [data, userEmail, router]);

  // Mutation to update the test paper
  const [updateTestPaper, { loading: updateLoading }] = useMutation(
    UPDATE_FACULTY_TESTPAPER,
    {
      refetchQueries: [
        { query: GET_TESTPAPER, variables: { id, published: false } },
        {
          query: GET_FACULTY_TESTPAPERS,
          variables: { createdBy: userEmail, published: false },
        },
      ],
      onCompleted: () => {
        toast.success("Test paper updated successfully");
        setIsFormLoading(false);
      },
      onError: (error) => {
        toast.error(`Error updating test paper: ${error.message}`);
        setIsFormLoading(false);
      },
    }
  );

  // Mutation to update the shared with list
  const [updateSharedWith, { loading: shareLoading }] = useMutation(
    UPDATE_SHARED_WITH,
    {
      refetchQueries: [
        { query: GET_TESTPAPER, variables: { id, published: true } },
      ],
      onCompleted: () => {
        toast.success("Sharing updated successfully");
      },
      onError: (error) => {
        toast.error(`Error updating sharing: ${error.message}`);
      },
    }
  );

  // Mutation to publish the test paper
  const [publishTestPaper, { loading: publishLoading }] = useMutation(
    PUBLISH_TESTPAPER,
    {
      refetchQueries: [
        {
          query: GET_FACULTY_TESTPAPERS,
          variables: { createdBy: userEmail, published: false },
        },
        {
          query: GET_FACULTY_TESTPAPERS,
          variables: { createdBy: userEmail, published: true },
        },
      ],
      onCompleted: () => {
        toast.success("Test paper published successfully");
        router.push("/dashboard/tests/faculty");
      },
      onError: (error) => {
        toast.error(`Error publishing test paper: ${error.message}`);
      },
    }
  );

  // Mutation to delete the test paper
  const [deleteTestPaper, { loading: deleteLoading }] = useMutation(
    DELETE_TESTPAPER,
    {
      refetchQueries: [
        {
          query: GET_FACULTY_TESTPAPERS,
          variables: { createdBy: userEmail, published: false },
        },
        {
          query: GET_FACULTY_TESTPAPERS,
          variables: { createdBy: userEmail, published: true },
        },
      ],
      onCompleted: () => {
        toast.success("Test paper deleted successfully");
        router.push("/dashboard/tests/faculty");
      },
      onError: (error) => {
        toast.error(`Error deleting test paper: ${error.message}`);
      },
    }
  );

  // Handler to update the test paper
  const updateTestPaperHandler = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      await updateTestPaper({
        variables: {
          id,
          title: testData.title,
          subject: testData.subject,
          date: testData.date,
          totalMarks: parseInt(testData.totalMarks),
          url: testData.url,
          published: false,
          createdBy: userEmail,
          creatorName: userName,
        },
      });
    } catch (error) {
      console.error("Error updating test paper:", error);
      setIsFormLoading(false);
    }
  };

  // Handler to share the test paper
  const handleShareUpdate = async (updatedSharedWith) => {
    try {
      await updateSharedWith({
        variables: {
          id,
          sharedWith: updatedSharedWith,
        },
      });
      setTestData({ ...testData, sharedWith: updatedSharedWith });
    } catch (error) {
      console.error("Error updating shared with:", error);
    }
  };

  // Handler to publish the test paper
  const publishTestPaperHandler = async () => {
    if (testData.sharedWith.length === 0) {
      toast.error("Please share the test paper before publishing");
      return;
    }

    try {
      await publishTestPaper({
        variables: {
          id,
        },
      });
    } catch (error) {
      console.error("Error publishing test paper:", error);
    }
  };

  // Handler to delete the test paper
  const deleteTestPaperHandler = async () => {
    try {
      await deleteTestPaper({
        variables: {
          id,
          published: false,
        },
      });
    } catch (error) {
      console.error("Error deleting test paper:", error);
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
          <h1 className="text-2xl sm:text-3xl font-bold">Test Paper Details</h1>
        </div>

        {/* Test Paper Details Form */}
        <form onSubmit={updateTestPaperHandler} className="space-y-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Test Name</Label>
              <input
                type="text"
                id="title"
                value={testData.title}
                onChange={(e) =>
                  setTestData({ ...testData, title: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <input
                type="text"
                id="subject"
                value={testData.subject}
                onChange={(e) =>
                  setTestData({ ...testData, subject: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <input
                type="date"
                id="date"
                value={testData.date ? testData.date.split("T")[0] : ""}
                onChange={(e) =>
                  setTestData({ ...testData, date: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <input
                type="number"
                id="totalMarks"
                value={testData.totalMarks}
                onChange={(e) =>
                  setTestData({
                    ...testData,
                    totalMarks: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button type="submit" disabled={isFormLoading || updateLoading}>
              {isFormLoading || updateLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Test"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={publishTestPaperHandler}
              disabled={publishLoading || testData.sharedWith.length === 0}
            >
              {publishLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                "Publish Test"
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Test"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Test Paper</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this test paper? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={deleteTestPaperHandler}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>

        {/* View Test Paper */}
        {testData.url && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <iframe
              src={testData.url}
              className="w-full rounded border"
              height="500"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Share With Section */}
        <div className="pt-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Share Test Paper</h2>
          <p className="text-sm text-gray-500 mb-4">
            Share this test paper with students. You can only share with
            students assigned to you.
          </p>

          <FacultyTestShareDialog
            sharedWith={testData.sharedWith || []}
            setSharedWith={handleShareUpdate}
            testpaperId={id}
            facultyAssignments={facultyAssignments}
            lockShareWith={testData.lockShareWith}
          />
        </div>
      </div>
    </Container>
  );
};

export default FacultyTestDetailPage;

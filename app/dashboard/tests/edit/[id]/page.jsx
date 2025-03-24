"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import DropzoneComponent from "react-dropzone";
import { storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { UPDATE_FACULTY_TESTPAPER } from "@/graphql/mutations/testPaper.mutation";
import {
  GET_TESTPAPER,
  GET_FACULTY_TESTPAPERS,
} from "@/graphql/queries/testPaper.query";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const EditTestPage = ({ params }) => {
  // Test Paper Form Fields - Test Name, Subject, Date, Total Marks, Question Paper (PDF)
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    test_name: "",
    subject: "",
    date: "",
    total_marks: "",
    question_paper: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);

  const router = useRouter();

  // Check if user is authenticated and fetch test data
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);

        try {
          // Get user info from members collection
          const memberRef = doc(db, "members", user.email);
          const memberDoc = await getDoc(memberRef);

          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            setUserName(memberData.name || "");
            setFacultyId(memberData.uid || "");

            // Check if user has Faculty role or is admin
            const hasRoleFaculty = memberData.roles?.Faculty || false;
            const isAdmin = user.email === "admin@shishyakul.in";

            if (!hasRoleFaculty && !isAdmin) {
              // Redirect to dashboard if not a faculty member or admin
              router.push("/dashboard");
              return;
            }

            // Fetch test data only after we have the user email
            try {
              // First check if it's a draft or published test
              const draftTestRef = doc(db, "testPapersDraft", params.id);
              const draftTestDoc = await getDoc(draftTestRef);

              if (draftTestDoc.exists()) {
                const data = draftTestDoc.data();

                // Check if current user is the creator or admin
                if (
                  data.createdBy === user.email ||
                  user.email === "admin@shishyakul.in"
                ) {
                  setTestData(data);
                  setIsPublished(false);

                  // Set form data
                  setFormData({
                    test_name: data.title || "",
                    subject: data.subject || "",
                    date: data.date
                      ? new Date(data.date).toISOString().split("T")[0]
                      : "",
                    total_marks: data.totalMarks || "",
                    question_paper: null,
                  });

                  // If there's a URL, mark PDF as uploaded
                  if (data.url) {
                    setIsPdfUploaded(true);
                  }
                } else {
                  // Not the creator, redirect to dashboard
                  toast.error("You don't have permission to edit this test");
                  router.push("/dashboard/tests");
                  return;
                }
              } else {
                // Check if it's a published test
                const publishedTestRef = doc(db, "testPapers", params.id);
                const publishedTestDoc = await getDoc(publishedTestRef);

                if (publishedTestDoc.exists()) {
                  const data = publishedTestDoc.data();

                  // Check if current user is the creator or admin
                  if (
                    data.createdBy === user.email ||
                    user.email === "admin@shishyakul.in"
                  ) {
                    setTestData(data);
                    setIsPublished(true);

                    // Set form data
                    setFormData({
                      test_name: data.title || "",
                      subject: data.subject || "",
                      date: data.date
                        ? new Date(data.date).toISOString().split("T")[0]
                        : "",
                      total_marks: data.totalMarks || "",
                      question_paper: null,
                    });

                    // If there's a URL, mark PDF as uploaded
                    if (data.url) {
                      setIsPdfUploaded(true);
                    }
                  } else {
                    // Not the creator, redirect to dashboard
                    toast.error("You don't have permission to edit this test");
                    router.push("/dashboard/tests");
                    return;
                  }
                } else {
                  // Test not found
                  toast.error("Test paper not found");
                  router.push("/dashboard/tests");
                  return;
                }
              }
            } catch (error) {
              console.error("Error fetching test data:", error);
              toast.error("Error fetching test data");
              router.push("/dashboard/tests");
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          router.push("/login");
          return;
        }

        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

  // Update test mutation
  const [updateTest] = useMutation(UPDATE_FACULTY_TESTPAPER, {
    refetchQueries: [
      {
        query: GET_TESTPAPER,
        variables: { id: params.id, published: isPublished },
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
  });

  // Handler to update the test paper
  const updateTestPaperHandler = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      await updateTest({
        variables: {
          id: params.id,
          title: formData.test_name,
          subject: formData.subject,
          date: formData.date,
          totalMarks: parseInt(formData.total_marks),
          url: testData?.url || "",
          published: isPublished,
          createdBy: userEmail,
          creatorName: userName,
        },
      });
    } catch (error) {
      console.error("Error updating test paper:", error);
      setIsFormLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      question_paper: file,
    }));
    setIsPdfUploaded(true);
  };

  if (loading) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading test data...</p>
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
            onClick={() => router.push("/dashboard/tests")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Test Paper</h1>
        </div>

        <form
          onSubmit={updateTestPaperHandler}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <div className="space-y-2">
            <Label htmlFor="test_name">Test Name</Label>
            <input
              type="text"
              id="test_name"
              name="test_name"
              value={formData.test_name}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter test name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_marks">Total Marks</Label>
            <input
              type="number"
              id="total_marks"
              name="total_marks"
              value={formData.total_marks}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter total marks"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Question Paper (PDF)</Label>
            <DropzoneComponent
              onDrop={handleDrop}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className={cn(
                    "h-52 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer",
                    dragActive && "border-blue-500 bg-blue-50"
                  )}
                >
                  <input {...getInputProps()} accept="application/pdf" />
                  {isPdfUploaded ? (
                    <div className="text-center">
                      <p className="text-green-600 font-semibold">
                        {formData.question_paper
                          ? `File ready: ${formData.question_paper.name}`
                          : "PDF already uploaded (click to replace)"}
                      </p>
                      {!formData.question_paper && (
                        <p className="text-sm text-gray-500 mt-2">
                          Current file will be kept unless you upload a new one
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600">
                        Drag & drop a PDF file here, or click to select one
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Only PDF files are accepted
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DropzoneComponent>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isFormLoading}>
              {isFormLoading ? (
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
              className="flex-1"
              onClick={() => router.push("/dashboard/tests/faculty")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default EditTestPage;

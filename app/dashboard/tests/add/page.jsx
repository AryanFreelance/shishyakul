"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import DropzoneComponent from "react-dropzone";
import { storage, db } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

const page = () => {
  // if (true) {
  //   return (
  //     <>
  //       <Navbar navLinks={dashboardNavLinks} isHome={false} />
  //       <DevelopmentMode />
  //     </>
  //   );
  // }
  // Test Paper Form Fields - Test Name, Subject, Date, Total Marks, Question Paper (PDF)
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    test_name: "",
    subject: "",
    date: "",
    total_marks: "",
    question_paper: null,
  });
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // Move these state declarations to the top before they're used
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isFaculty, setIsFaculty] = useState(false);

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }-${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;

  const maxSize = 20971520;

  const router = useRouter();

  // Queries
  // useSuspenseQuery(GET_TESTPAPERS);

  // Get current user information
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);
        console.log("User email set:", user.email);

        // Get user name and role from members collection
        const memberDoc = await getDoc(doc(db, "members", user.email));
        if (memberDoc.exists()) {
          setUserName(memberDoc.data().name || "");
          // Check if user has Faculty role
          setIsFaculty(memberDoc.data().roles?.Faculty || false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // console.log(isFormLoading);
  }, [isFormLoading]);

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => {
        toast.error("File reading was aborted!");
      };
      reader.onerror = () => toast.error("File reading has failed!");
      reader.onload = async () => await uploadPost(file);
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadPost = async (selectedFile) => {
    if (loading) return;
    const toastId = toast.loading("Uploading Test Paper...");
    setLoading(true);
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file!", {
        id: toastId,
      });
      setLoading(false);
      return;
    }
    try {
      // console.log(selectedFile);
      setFormData({ ...formData, question_paper: selectedFile });
      setUploaded(true);
      toast.success("File Uploaded Successfully!", {
        id: toastId,
      });
    } catch (error) {
      toast.error("Something went wrong!", {
        id: toastId,
      });
    }

    setLoading(false);
  };

  const testPaperAddHandler = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);
    const toastId = toast.loading("Uploading Test Paper...");

    // Log the current email state for debugging
    console.log("Current user email:", userEmail);
    console.log("Current user name:", userName);

    if (!uploaded) {
      toast.error("Please upload the test paper!", {
        id: toastId,
      });
      setIsFormLoading(false);
    } else if (
      formData.test_name === "" ||
      formData.subject === "" ||
      formData.date === "" ||
      formData.total_marks === "" ||
      !userEmail
    ) {
      toast.error("Please fill all the fields and ensure you're logged in!", {
        id: toastId,
      });
      setIsFormLoading(false);
    } else {
      const today = new Date();
      let fileid = `${today.getFullYear()}${
        today.getHours() < 10 ? "0" + today.getHours() : today.getHours()
      }${
        today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()
      }${
        today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds()
      }`;
      // console.log(fileid);
      const storageRef = ref(storage, `test_papers/${fileid}`);

      // Upload the file
      try {
        const snapshot = await uploadBytes(storageRef, formData.question_paper);
        const downloadUrl = await getDownloadURL(storageRef);

        console.log("Creating test paper with email:", userEmail);

        // Ensure valid data for all fields
        const testData = {
          id: fileid,
          title: formData.test_name.trim(),
          subject: formData.subject.trim(),
          date: formData.date,
          totalMarks: parseInt(formData.total_marks) || 0, // Ensure valid integer
          url: downloadUrl,
          createdBy: userEmail.trim(),
          creatorName: userName.trim() || "Faculty", // Provide default if empty
          createdAt: new Date().toISOString(),
          published: false, // Draft by default
          sharedWith: [], // Empty shared list by default
        };

        // Validate required fields again
        if (
          !testData.id ||
          !testData.title ||
          !testData.subject ||
          !testData.date ||
          !testData.url
        ) {
          console.error("Missing required fields:", testData);
          toast.error("Missing required fields for test paper creation", {
            id: toastId,
          });
          setIsFormLoading(false);
          return;
        }

        console.log("Test paper data:", testData);

        try {
          // Save to the testPapersDraft collection
          await setDoc(doc(db, "testPapersDraft", fileid), testData);

          console.log(
            "Test paper created successfully, redirecting to appropriate page"
          );

          toast.success("Test Paper Added Successfully!", {
            id: toastId,
          });

          // Redirect to the appropriate page based on user role
          if (isFaculty && userEmail !== "admin@shishyakul.in") {
            router.push("/dashboard/tests/faculty");
          } else {
            router.push("/dashboard/tests");
          }
        } catch (error) {
          console.error("Exception caught during test paper creation:", error);
          toast.error(
            "Failed to create test paper: " +
              (error.message || "Unknown error"),
            {
              id: toastId,
            }
          );
          setIsFormLoading(false);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(
          "Failed to upload file: " + (error.message || "Unknown error"),
          {
            id: toastId,
          }
        );
        setIsFormLoading(false);
      }
    }
  };

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <h2 className="subheading">Add Test Paper</h2>
        <div className="mt-8 px-[4%] lg:px-[10%]">
          <form onSubmit={testPaperAddHandler}>
            <div className="flex flex-col w-full mb-4">
              <Label
                htmlFor="test-name"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Test Name
              </Label>
              <input
                type="text"
                id="test-name"
                className="input-taking"
                placeholder="Enter Test Name..."
                value={formData.test_name}
                onChange={(e) =>
                  setFormData({ ...formData, test_name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col w-full mb-4">
              <Label
                htmlFor="subject"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Subject
              </Label>
              <input
                type="text"
                id="subject"
                className="input-taking"
                placeholder="Enter Subject Name..."
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-4">
              <div className="flex flex-col w-full lg:w-[50%] mb-4">
                <Label
                  htmlFor="date"
                  className="text-xl text-secondary barlow-medium mb-2"
                >
                  Date
                </Label>
                <input
                  type="date"
                  id="date"
                  // min={new Date().toISOString().split("T")[0]}
                  min={todayDate}
                  className="input-taking"
                  placeholder="Enter Date of Test..."
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col w-full lg:w-[50%] mb-4">
                <Label
                  htmlFor="total-marks"
                  className="text-xl text-secondary barlow-medium mb-2"
                >
                  Total Marks
                </Label>
                <input
                  type="number"
                  id="total-marks"
                  className="input-taking"
                  placeholder="Enter Total Marks..."
                  value={formData.total_marks}
                  onChange={(e) =>
                    setFormData({ ...formData, total_marks: e.target.value })
                  }
                />
              </div>
            </div>

            {/* File Dropper */}
            {uploaded ? (
              <>
                <div className="my-4 mb-8">
                  <iframe
                    src={URL.createObjectURL(formData.question_paper)}
                    className="w-full rounded"
                    height="480"
                    allowFullScreen
                  ></iframe>
                  <Button
                    onClick={() => {
                      setUploaded(false);
                      setFormData({ ...formData, question_paper: null });
                    }}
                    className="mt-4 barlow-semibold"
                  >
                    Remove File
                  </Button>
                </div>
              </>
            ) : (
              <DropzoneComponent minSize={0} maxSize={maxSize} onDrop={onDrop}>
                {({
                  getRootProps,
                  getInputProps,
                  isDragActive,
                  isDragReject,
                  fileRejections,
                }) => {
                  const isFileTooLarge =
                    fileRejections.length > 0 &&
                    fileRejections[0].file.size > maxSize;
                  return (
                    <section className="my-4 mb-8">
                      <div
                        {...getRootProps()}
                        className={cn(
                          "w-full h-52 flex justify-center items-center p-5 border-2 border-secondary rounded-lg text-center",
                          isDragActive
                            ? "bg-main text-secondary animate-pulse"
                            : "bg-slate-100/50 dark:bg-slate-800/80 text-black/80"
                        )}
                      >
                        <input {...getInputProps()} />
                        {!isDragActive &&
                          "Click or drag the test paper here..."}
                        {isDragActive &&
                          !isDragReject &&
                          "Drop to upload this test paper!"}
                        {isDragReject && "File type not accepted, sorry!"}
                        {isFileTooLarge && (
                          <div className="text-danger mt-2">
                            File is too large, try to upload a smaller file!
                          </div>
                        )}
                      </div>
                    </section>
                  );
                }}
              </DropzoneComponent>
            )}

            <div>
              <Button type="submit" className="w-full" disabled={isFormLoading}>
                {isFormLoading ? <Loader /> : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default page;

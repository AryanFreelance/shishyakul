"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import DropzoneComponent from "react-dropzone";
import { errorToast } from "@/utils/toast";
import { storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { CREATE_TEST } from "@/graphql/mutations/testPaper.mutation";
import { GET_TESTPAPERS } from "@/graphql/queries/testPaper.query";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

const page = () => {
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
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${(today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1}-${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;

  const maxSize = 20971520;

  const router = useRouter();

  // Queries
  useSuspenseQuery(GET_TESTPAPERS);

  // Mutations
  const [createTest] = useMutation(CREATE_TEST, {
    refetchQueries: [{ query: GET_TESTPAPERS }],
  });

  useEffect(() => {
    console.log(isFormLoading);
  }, [isFormLoading]);

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => {
        errorToast("File reading was aborted!");
      };
      reader.onerror = () => errorToast("File reading has failed!");
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
      console.log(selectedFile);
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
    if (!uploaded) {
      toast.error("Please upload the test paper!", {
        id: toastId,
      });
      setIsFormLoading(false);
    } else if (
      formData.test_name === "" ||
      formData.subject === "" ||
      formData.date === "" ||
      formData.total_marks === ""
    ) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      setIsFormLoading(false);
    } else {
      const today = new Date();
      let fileid = `${today.getFullYear()}${today.getHours() < 10 ? "0" + today.getHours() : today.getHours()
        }${today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()
        }${today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds()
        }`;
      console.log(fileid);
      const storageRef = ref(storage, `test_papers/${fileid}`);

      // Upload the file
      await uploadBytes(storageRef, formData.question_paper)
        .then(async (snapshot) => {
          const downloadUrl = await getDownloadURL(storageRef);
          console.log("SNAPSHOT", snapshot);
          console.log("DOWNLOAD", downloadUrl);

          await createTest({
            variables: {
              id: fileid,
              title: formData.test_name,
              date: formData.date,
              totalMarks: parseInt(formData.total_marks),
              url: downloadUrl,
              subject: formData.subject,
            },
          });

          toast.success("Test Paper Added Successfully!", {
            id: toastId,
          });
        })
        .catch((error) => {
          toast.error("Something went wrong!", {
            id: toastId,
          });
          console.error(error);
        });
      router.push("/dashboard/tests");

      console.log(formData.question_paper);
      console.log(formData);
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

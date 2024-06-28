"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { dashboardNavLinks } from "@/constants";
import { useLazyQuery, useMutation } from "@apollo/client";
import { X } from "lucide-react";
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
  GET_TESTPAPERS,
} from "@/graphql/queries/testPaper.query";
import {
  DELETE_TESTPAPER,
  PUBLISH_TESTPAPER,
  UPDATE_SHARED_WITH,
  UPDATE_TESTPAPER,
} from "@/graphql/mutations/testPaper.mutation";

const page = () => {
  // Test Paper Fields - Test Name, Subject, Date, Total Marks, Question Paper (PDF)
  let { id } = useParams();
  const [testData, setTestData] = useState({
    title: "",
    subject: "",
    date: "",
    totalMarks: 0,
    url: "",
    sharedWith: [],
  });
  const [shareInput, setShareInput] = useState("");
  const [shareInputEmail, setShareInputEmail] = useState("");
  const [sharedWith, setSharedWith] = useState([]);
  const [testDate, setTestDate] = useState("");
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }-${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;

  // Check if the last digit of the id is 0 or 1, if 0 then published, else draft;
  const published = id[id.length - 1] === "0" ? true : false;
  id = id.slice(0, -1);

  const router = useRouter();

  // Queries - Get Test Paper
  const { data: testpaperData } = useSuspenseQuery(GET_TESTPAPER, {
    variables: { id: `${id}`, published: published },
  });

  // Mutation - Update Test Paper (If Draft), Share Test Paper (If Published), Delete Test Paper, Publish Paper
  const [updateTestPaper] = useMutation(UPDATE_TESTPAPER, {
    refetchQueries: [{ query: GET_TESTPAPERS }],
  });
  const [deleteTestPaper] = useMutation(DELETE_TESTPAPER, {
    refetchQueries: [{ query: GET_TESTPAPERS }],
  });
  const [updateSharedWith] = useMutation(UPDATE_SHARED_WITH, {
    refetchQueries: [{ query: GET_TESTPAPERS }],
  });
  const [publishTestPaper] = useMutation(PUBLISH_TESTPAPER, {
    refetchQueries: [{ query: GET_TESTPAPERS }],
  });

  const updateTestPaperHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating Test Paper...");
    console.log(testData);

    !published &&
      (await updateTestPaper({
        variables: {
          id: id,
          title: testData?.title,
          subject: testData?.subject,
          date: testData?.date,
          totalMarks: parseInt(testData?.totalMarks),
        },
      }));

    published &&
      (await updateSharedWith({
        variables: {
          id: id,
          sharedWith: sharedWith,
        },
      }));

    toast.success("Test Paper Updated Successfully!", { id: toastId });
  };

  const deleteTestPaperHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Deleting Test Paper...");

    await deleteTestPaper({
      variables: { id: id, published: published },
    });

    router.push("/dashboard/tests");

    toast.success("Test Paper Deleted Successfully!", { id: toastId });
  };

  const publishTestPaperHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Publishing Test Paper...");

    // console.log("TESTDATA", testpaperData);
    if (testDate < todayDate) {
      toast.error("Please update the test with a future date.", {
        id: toastId,
      });
      return;
    }

    await publishTestPaper({
      variables: { id: id },
    });

    router.push(`/dashboard/test/${id}0`);

    toast.success("Test Paper Published Successfully!", { id: toastId });
  };

  useEffect(() => {
    if (testpaperData) {
      if (testpaperData?.testpaper === null) router.push("/dashboard/tests");
      setTestDate(testpaperData?.testpaper?.date);

      setTestData({
        title: testpaperData?.testpaper?.title,
        subject: testpaperData?.testpaper?.subject,
        // Convert the date format from 30-10-2027 to supported html date format
        date: testpaperData?.testpaper?.date,
        totalMarks: testpaperData?.testpaper?.totalMarks,
        url: testpaperData?.testpaper?.url,
        sharedWith: testpaperData?.testpaper?.sharedWith,
      });
      console.log(testpaperData);
      console.log("Test Data", testpaperData?.testpaper.date);
      setSharedWith(testpaperData?.testpaper?.sharedWith);
    }

    console.log("DATE", testData?.date >= todayDate);
  }, [testpaperData]);

  const isPastDate = testData?.date < todayDate;

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      {
        // If testpaperData is not available, show a loading spinner
        testpaperData ? (
          <div className="pb-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <h2 className="subheading">
                Manage {testpaperData?.testpaper?.title}
              </h2>
              <span>
                Created on - {testpaperData?.testpaper?.createdAt.split(",")[0]}
              </span>
            </div>
            <div className="mt-8 px-[4%] lg:px-[10%]">
              <form>
                <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center">
                  <Label
                    htmlFor="test-name"
                    className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
                  >
                    Test Name
                  </Label>
                  <input
                    type="text"
                    id="test-name"
                    className="input-taking w-full lg:w-[80%] md:w-[70%]"
                    placeholder="Update Test Name..."
                    value={testData?.title}
                    disabled={published}
                    onChange={(e) =>
                      !published &&
                      setTestData({ ...testData, title: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center mt-4">
                  <Label
                    htmlFor="subject"
                    className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
                  >
                    Subject
                  </Label>
                  <input
                    type="text"
                    id="subject"
                    className="input-taking w-full lg:w-[80%] md:w-[70%]"
                    placeholder="Update Subject Name..."
                    disabled={published}
                    value={testData?.subject}
                    onChange={(e) =>
                      !published &&
                      setTestData({ ...testData, subject: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center mt-4">
                  <Label
                    htmlFor="date"
                    className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
                  >
                    Date
                  </Label>
                  <input
                    type="date"
                    id="date"
                    className="input-taking w-full lg:w-[80%] md:w-[70%]"
                    placeholder="Update Date of Test..."
                    disabled={published}
                    value={testData?.date}
                    min={todayDate}
                    onChange={(e) =>
                      !published &&
                      setTestData({ ...testData, date: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center mt-4">
                  <Label
                    htmlFor="total-marks"
                    className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
                  >
                    Total Marks
                  </Label>
                  <input
                    type="number"
                    id="total-marks"
                    className="input-taking w-full lg:w-[80%] md:w-[70%]"
                    placeholder="Update Total Marks..."
                    disabled={published}
                    value={testData?.totalMarks}
                    onChange={(e) =>
                      !published &&
                      setTestData({ ...testData, totalMarks: e.target.value })
                    }
                  />
                </div>

                {published && !isPastDate && (
                  <>
                    <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 mt-4">
                      <Label
                        htmlFor="share-to"
                        className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%] py-3"
                      >
                        Share To
                      </Label>
                      <div className="w-full lg:w-[80%] md:w-[70%] flex flex-col md:gap-6 gap-2">
                        <div className="flex gap-2 md:gap-6">
                          <input
                            type="number"
                            id="share-to"
                            className="input-taking w-[74%]"
                            placeholder="Enter Grade..."
                            value={shareInput}
                            min={8}
                            max={12}
                            onChange={(e) => setShareInput(e.target.value)}
                          />
                          <Button
                            className="w-[26%] md:mt-0 py-6"
                            disabled={
                              shareInput === "" ||
                              shareInput.includes(".") ||
                              shareInput.includes(" ") ||
                              shareInput.includes(",") ||
                              shareInput.includes(";") ||
                              sharedWith.includes(shareInput)
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setSharedWith([...sharedWith, shareInput]);
                              setShareInput("");
                            }}
                          >
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 mt-4">
                      <Label
                        htmlFor="share-to"
                        className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%] py-3"
                      >
                        Share To Email
                      </Label>
                      <div className="w-full lg:w-[80%] md:w-[70%] flex flex-col md:gap-6 gap-2">
                        <div className="flex gap-2 md:gap-6">
                          <input
                            type="email"
                            id="share-to"
                            className="input-taking w-[74%]"
                            placeholder="Enter Email..."
                            value={shareInputEmail}
                            onChange={(e) => setShareInputEmail(e.target.value)}
                          />
                          <Button
                            className="w-[26%] md:mt-0 py-6"
                            disabled={
                              shareInputEmail === "" ||
                              !shareInputEmail.includes("@") ||
                              !shareInputEmail.includes(".") ||
                              shareInputEmail.includes(" ") ||
                              shareInputEmail.includes(",") ||
                              shareInputEmail.includes(";") ||
                              sharedWith.includes(shareInputEmail)
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setSharedWith([...sharedWith, shareInputEmail]);
                              setShareInputEmail("");
                            }}
                          >
                            Share
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-4">
                          {sharedWith?.map((email, index) => (
                            <div
                              key={index}
                              className="bg-secondary text-primary flex gap-4 rounded px-4 py-2"
                            >
                              <span>{email}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  const updatedSharedWith = sharedWith.filter(
                                    (e) => e !== email
                                  );
                                  setSharedWith(updatedSharedWith);
                                }}
                              >
                                <X />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {published && isPastDate && (
                  <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 mt-4">
                    <Label
                      htmlFor="share-to"
                      className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%] py-3"
                    >
                      Shared With
                    </Label>
                    <div className="flex flex-wrap gap-x-6 gap-y-4 mt-4 w-full lg:w-[80%] md:w-[70%]">
                      {sharedWith?.length === 0 && (
                        <span className="text-secondary">
                          No one has been shared with this test paper yet.
                        </span>
                      )}
                      {sharedWith?.map((email, index) => (
                        <div
                          key={index}
                          className="bg-secondary text-primary flex gap-4 rounded px-4 py-2"
                        >
                          <span>{email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <iframe
                  src={testData?.url}
                  className="w-full rounded my-6"
                  height="480"
                  allowFullScreen
                ></iframe>

                {!isPastDate && (
                  <div className="mt-10">
                    <Button
                      className="w-full"
                      type="submit"
                      onClick={updateTestPaperHandler}
                    >
                      Update Test
                    </Button>
                  </div>
                )}

                {sharedWith?.length !== 0 && published && isPastDate && (
                  <div className="mt-6">
                    <Button
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-primary"
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/dashboard/test/${id}/marks`);
                      }}
                    >
                      Add/Update Marks
                    </Button>
                  </div>
                )}

                {!published && !isPastDate && (
                  <div className="mt-6">
                    <Button
                      className="w-full bg-green-700 hover:bg-green-800 text-primary"
                      type="submit"
                      onClick={publishTestPaperHandler}
                    >
                      Publish Test
                    </Button>
                  </div>
                )}

                <div className="mt-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-red-500 hover:bg-red-600 text-primary">
                        Delete Test
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure to delete?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your the test paper and remove the data from
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteTestPaperHandler}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )
      }
    </Container>
  );
};

export default page;

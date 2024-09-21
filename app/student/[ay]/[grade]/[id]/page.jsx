"use client";

import Container from "@/components/shared/Container";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { onAuthStateChanged, signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { Circle, CircleCheck, InfoIcon } from "lucide-react";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_STUDENT_DETAILS } from "@/graphql/queries/students.query";
import { GET_PUBLISHED_TESTPAPERS_USERS } from "@/graphql/queries/testPaper.query";
import { Separator } from "@/components/ui/separator";
import AddFeeDialog from "@/components/private/studentPage/AddFeeDialog";
import CheckFeeData from "@/components/private/studentPage/CheckFeeData";
import RequestReview from "@/components/private/studentPage/RequestReview";

ChartJS.register(ArcElement, Tooltip, Legend);

const page = () => {
  const { ay, grade, id } = useParams();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chartData, setChartData] = useState({
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "Days",
        data: [12, 19],
        backgroundColor: ["#159a3a", "#d92e39"],
        borderColor: ["#159a3a", "#d92e39"],
        borderWidth: 1,
      },
    ],
  });

  // Details needed for Student Fees:
  // Fees Paid
  // Paid On
  // Paid For (Month & Year)
  // Paid Via [Cash | Cheque | UPI)
  //   If (Cheque)
  //     Cheque Reference Number
  //     Cheque Image
  //   If (UPI)
  //     UPI ID
  //     Payment Screenshot

  // Queries - Get Student, Get Published Papers
  const { data: studData } = useSuspenseQuery(GET_STUDENT_DETAILS, {
    variables: {
      ay,
      grade,
      userId: id,
    },
  });

  const { data: testPaperUsers } = useSuspenseQuery(
    GET_PUBLISHED_TESTPAPERS_USERS,
    {
      variables: {
        id: id,
      },
    }
  );

  if (!studData)
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Loading... <br />
        <small>
          If you are waiting for so long then please contact the admin!
        </small>
      </div>
    );

  console.log("STUDDATA", studData);

  if (!studData?.student) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        No Student Found
      </div>
    );
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user);
        if (user.email === "admin@shishyakul.in") {
          setIsAdmin(true);
        }

        setChartData({
          labels: ["Present", "Absent"],
          datasets: [
            {
              label: "Days",
              data: [
                studData?.student?.attendance.present,
                studData?.student?.attendance.absent,
              ],
              backgroundColor: ["#159a3a", "#d92e39"],
              borderColor: ["#159a3a", "#d92e39"],
              borderWidth: 1,
            },
          ],
        });

        setAuthStatus(true);
      } else {
        setAuthStatus(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  if (authStatus === null) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Loading...
      </div>
    );
  }

  if (!authStatus) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Redirecting...
      </div>
    );
  }

  const logoutHandler = () => {
    const toastId = toast.loading("Logging out...");
    signOut(auth)
      .then(() => {
        toast.success("You logged out successfully!", {
          id: toastId,
        });
        router.push("/login");
      })
      .catch((error) => {
        // console.log(error);
        toast.error("There was an error logging out!", {
          id: toastId,
        });
      });
  };

  return (
    <Container>
      <div className="py-10 flex gap-8 flex-col">
        <div className="flex gap-10 lg:items-center flex-col lg:flex-row">
          <div className="lg:w-[50%]">
            <div>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="text-[16px] mb-8 mr-10 text-center border-2 border-main rounded px-4 py-2"
                >
                  Go Back
                </Link>
              )}
              <Button
                onClick={logoutHandler}
                className="text-[16px] filled-button mb-8"
                variant="navBtn"
              >
                Logout
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <h2 className="subheading">
                Welcome {studData?.student?.firstname}
              </h2>
              <Link
                href={`/student/${ay}/${grade}/${id}/profile`}
                className="barlow-medium border-2 border-main rounded px-4 py-2"
              >
                Profile
              </Link>
            </div>
            <div className="my-8">
              <h3 className="subsubheading text-secondary mb-4">
                Student Details
              </h3>
              <div className="flex flex-col gap-4 ml-6">
                <span>
                  Student Name - {studData?.student?.firstname}{" "}
                  {studData?.student?.middlename} {studData?.student?.lastname}
                </span>
                <span>Student Email - {studData?.student?.email}</span>
                <span>Student Phone - {studData?.student?.phone}</span>
                <span>Student Grade - {studData?.student?.grade}</span>
                <span>Student A.Y. - {studData?.student?.ay}</span>
                <span>
                  Student Batch - {studData?.student?.batch || "Not Assigned"}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center w-full">
                <h3 className="subsubheading text-secondary mb-4">
                  Fees Information
                </h3>
                {isAdmin && <AddFeeDialog id={id} studData={studData} />}
                {!isAdmin && (
                  <RequestReview
                    name={`${studData?.student?.firstname} ${studData?.student?.lastname}`}
                    email={studData?.student?.email}
                    ay={ay}
                    grade={grade}
                    userId={id}
                    feeData={studData?.student?.fee}
                  />
                )}
              </div>
              <CheckFeeData isAdmin={isAdmin} studData={studData} id={id} />
            </div>
          </div>

          <Separator className="my-4 lg:hidden" />

          <div className="lg:w-[50%]">
            {studData?.student.attendance.present === 0 &&
            studData?.student.attendance.absent === 0 ? (
              <div className="flex items-center justify-center text-secondary gap-6 px-6 py-4 rounded">
                <div>
                  <h4 className="smallheading text-secondary flex gap-2 items-center">
                    <InfoIcon />
                    No Attendance Available
                  </h4>
                </div>
              </div>
            ) : (
              <Pie data={chartData} />
            )}
          </div>
        </div>
        <div>
          <h3 className="subsubheading text-secondary mb-6">
            Shared Test Papers
          </h3>
          <div className="flex flex-col gap-4">
            {testPaperUsers?.testpaperUsers.length === 0 && (
              <div className="flex items-center justify-between gap-6 rounded">
                <div>
                  <h4 className="smallheading text-secondary">
                    No Test Papers Available
                  </h4>
                </div>
              </div>
            )}

            {testPaperUsers?.testpaperUsers.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between gap-6 bg-secondary text-primary px-6 py-4 rounded"
              >
                <div className="flex items-center gap-4">
                  {test?.marks !== null ? (
                    <CircleCheck className="text-green-300" />
                  ) : (
                    <Circle className="text-red-300" />
                  )}
                  <div className="flex flex-col">
                    <h4 className="smallheading">{test.title}</h4>
                    <span className="barlow-regular">
                      Created on - {test.createdAt.split(",")[0]}
                    </span>
                    {test?.marks !== null && (
                      <span className="barlow-regular">
                        Rank - {test?.marks[0]?.rank || "No Rank Allocated"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button variant="outline">View</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{test.title}</AlertDialogTitle>

                        <AlertDialogDescription>
                          {/* Created on - {test.createdAt.split(",")[0]} */}
                          Test On - {test.date.split("-").reverse().join("/")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <iframe
                        src={test.url}
                        className="w-full rounded"
                        height="500"
                        allowFullScreen
                      ></iframe>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="subsubheading text-secondary mb-6">
            Completed Test Papers
          </h3>
          <div className="flex flex-col gap-4">
            {testPaperUsers?.testpaperUsers.length === 0 && (
              <div className="flex items-center justify-between gap-6 rounded">
                <div>
                  <h4 className="smallheading text-secondary">
                    No Test Papers have been Completed
                  </h4>
                </div>
              </div>
            )}

            {testPaperUsers?.testpaperUsers.map((test) => {
              if (test?.marks !== null) {
                return (
                  <div
                    key={test.id}
                    className="flex items-center justify-between gap-6 bg-secondary text-primary px-6 py-4 rounded"
                  >
                    <div className="flex items-center gap-4">
                      <CircleCheck className="text-green-300" />
                      <div className="flex flex-col">
                        <h4 className="smallheading">{test.title}</h4>
                        <span className="barlow-regular">
                          {/* Created on - {test.createdAt.split(",")[0]} */}
                          Test On - {test.date.split("-").reverse().join("/")}
                        </span>
                        {test?.marks !== null && (
                          <span className="barlow-regular">
                            Rank - {test?.marks[0]?.rank || "No Rank Allocated"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button variant="outline">View</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{test.title}</AlertDialogTitle>

                            <AlertDialogDescription>
                              Created on - {test.createdAt.split(",")[0]}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <iframe
                            src={test.url}
                            className="w-full rounded"
                            height="500"
                            allowFullScreen
                          ></iframe>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default page;

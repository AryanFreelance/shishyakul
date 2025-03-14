"use client";

import Container from "@/components/shared/Container";
import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
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
import { getAuth } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import AddFeeDialog from "@/components/private/studentPage/AddFeeDialog";
import CheckFeeData from "@/components/private/studentPage/CheckFeeData";
import RequestReview from "@/components/private/studentPage/RequestReview";
import StudentFeesInfoDialog from "@/components/private/studentPage/StudentFeesInfoDialog";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_STUDENT_DETAILS } from "@/graphql/queries/students.query";
import { GET_PUBLISHED_TESTPAPERS_USERS } from "@/graphql/queries/testPaper.query";
import { Separator } from "@/components/ui/separator";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const page = () => {
  const { ay, grade, id } = useParams();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
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
  const [paymentMethodsData, setPaymentMethodsData] = useState({
    labels: [],
    datasets: [
      {
        label: "Amount Paid",
        data: [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });

  // Details needed for Student Fees:
  // Fees Paid
  // Paid On
  // Paid For (Month & Year)
  // Paid Via [Cash | Cheque | UPI | NEFT]
  //   If (Cheque)
  //     Cheque Reference Number
  //     Cheque Image
  //   If (UPI)
  //     UPI ID
  //     Payment Screenshot
  //   If (NEFT)
  //     NEFT Reference Number
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
        ay: ay,
        grade: grade,
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

  // console.log("STUDDATA", studData);

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

        // Process payment methods data for bar chart
        if (studData?.student?.fees && studData.student.fees.length > 0) {
          const paymentMethods = {};

          // Group payments by method and sum amounts
          studData.student.fees.forEach((fee) => {
            const method = fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1);
            if (!paymentMethods[method]) {
              paymentMethods[method] = 0;
            }
            paymentMethods[method] += fee.feesPaid;
          });

          // Convert to chart data format
          setPaymentMethodsData({
            labels: Object.keys(paymentMethods),
            datasets: [
              {
                label: "Amount Paid",
                data: Object.values(paymentMethods),
                backgroundColor: [
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(255, 99, 132, 0.6)",
                  "rgba(255, 206, 86, 0.6)",
                  "rgba(75, 192, 192, 0.6)",
                ],
                borderColor: [
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 99, 132, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                ],
                borderWidth: 1,
              },
            ],
          });
        }

        setAuthStatus(true);
      } else {
        setAuthStatus(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [studData]);

  useEffect(() => {
    // Check if the user is a faculty member
    const checkUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const memberDoc = await getDoc(doc(db, "members", user.email));
        if (memberDoc.exists() && memberDoc.data().roles?.Faculty) {
          setIsFaculty(true);
        }
      }
    };

    checkUserRole();
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

  // Calculate total fees paid
  const calculateTotalFeesPaid = () => {
    if (!studData?.student?.fees || studData.student.fees.length === 0) {
      return 0;
    }

    return studData.student.fees.reduce(
      (total, fee) => total + fee.feesPaid,
      0
    );
  };

  // Get total fees (from database or calculate from existing data)
  const getTotalFees = () => {
    // If totalFees is set in the database, use that value
    if (studData?.student?.totalFees) {
      return studData.student.totalFees;
    }

    // Fallback: Calculate an estimate based on existing fee data
    // This is just a placeholder until the backend is updated
    // You may want to adjust this logic based on your business rules
    const totalPaid = calculateTotalFeesPaid();

    // Assuming fees are paid monthly and there are 12 months in a year
    // This is just an example - adjust based on your actual fee structure
    const estimatedMonthlyFee =
      totalPaid > 0 && studData?.student?.fees.length > 0
        ? Math.round(totalPaid / studData.student.fees.length)
        : 0;

    return Math.max(totalPaid, estimatedMonthlyFee * 12);
  };

  return (
    <Container>
      <div className="py-10 flex gap-8 flex-col">
        <div className="flex flex-col gap-10 lg:items-center w-full">
          <div className="w-full">
            <div>
              <Link
                href="/dashboard"
                className="text-[16px] mb-8 mr-10 text-center border-2 border-main rounded px-4 py-2"
              >
                Go Back
              </Link>
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
              <div className="flex flex-col md:flex-row gap-4 w-full items-start">
                <div className="flex flex-col gap-4 md:w-1/2 w-full">
                  <span>
                    Student Name - {studData?.student?.firstname}{" "}
                    {studData?.student?.middlename}{" "}
                    {studData?.student?.lastname}
                  </span>
                  <span>Student Email - {studData?.student?.email}</span>
                  <span>Student Phone - {studData?.student?.phone}</span>
                  <span>Student Grade - {studData?.student?.grade}</span>
                  <span>Student A.Y. - {studData?.student?.ay}</span>
                  <span>
                    Student Batch - {studData?.student?.batch || "Not Assigned"}
                  </span>
                </div>
                <div className="lg:flex flex-col gap-4 md:w-1/2 w-full hidden">
                  <span>School Name -</span>
                  <span>Board -</span>
                  <span>Medium -</span>
                  <span>DOB -</span>
                  <span>Siblings -</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col-reverse lg:flex-row gap-10 justify-between items-center">
            <div className="lg:w-[70%] w-full">
              <div className="flex justify-between items-center w-full">
                <h3 className="subsubheading text-secondary mb-4">
                  Fees Information
                </h3>
                {isAdmin && !isFaculty && (
                  <div className="flex gap-4 items-center">
                    <AddFeeDialog id={id} studData={studData} />
                    <StudentFeesInfoDialog id={id} studData={studData} />
                  </div>
                )}
                {!isAdmin && !isFaculty && (
                  <RequestReview
                    name={`${studData?.student?.firstname} ${studData?.student?.lastname}`}
                    email={studData?.student?.email}
                    ay={ay}
                    grade={grade}
                    userId={id}
                    feeData={studData?.student?.fees}
                  />
                )}
              </div>

              {/* Fee Summary */}
              <div className="mb-6 p-4 bg-secondary/10 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Total Fees
                    </span>
                    <span className="text-2xl font-bold">
                      ₹{getTotalFees()}
                    </span>
                    {!studData?.student?.totalFees && (
                      <span className="text-xs text-muted-foreground mt-1">
                        (Estimated - Set actual value in Fee Details)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Fees Paid
                    </span>
                    <span className="text-2xl font-bold">
                      ₹{calculateTotalFeesPaid()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Balance
                    </span>
                    <span className="text-2xl font-bold">
                      ₹{getTotalFees() - calculateTotalFeesPaid()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Chart */}
              {studData?.student?.fees && studData.student.fees.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Payment Methods</h4>
                  <div className="h-64">
                    <Bar
                      data={paymentMethodsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Amount (₹)",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Payment Method",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              <CheckFeeData isAdmin={isAdmin} studData={studData} id={id} />
            </div>
            <Separator className="my-4 lg:hidden" />
            <div className="w-full lg:w-[30%] flex items-center justify-center">
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
                  {Number(test?.date.split("-").join("")) <
                  Number(
                    new Date().toISOString().split("T")[0].split("-").join("")
                  ) ? (
                    <CircleCheck className="text-green-300" />
                  ) : (
                    <Circle className="text-red-300" />
                  )}
                  <div className="flex flex-col">
                    <h4 className="smallheading">{test.title}</h4>
                    <span className="barlow-regular">
                      Created on - {test.createdAt.split(",")[0]}
                    </span>
                    <span className="barlow-regular">
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
                          <div className="flex flex-col gap-2">
                            <span>
                              Created on - {test.createdAt.split(",")[0]}
                            </span>
                            <span>
                              Test On -{" "}
                              {test.date.split("-").reverse().join("/")}
                            </span>
                          </div>
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
              // console.log(
              //   "TEST",
              //   test?.date.split("-").join(""),
              //   new Date().toISOString().split("T")[0].split("-").join("")
              // );
              if (
                Number(test?.date.split("-").join("")) <
                Number(
                  new Date().toISOString().split("T")[0].split("-").join("")
                )
              ) {
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
                          Created on - {test.createdAt.split(",")[0]}
                        </span>
                        <span className="barlow-regular">
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
                              <div className="flex flex-col gap-2">
                                <span>
                                  Created on - {test.createdAt.split(",")[0]}
                                </span>
                                <span>
                                  Test On -{" "}
                                  {test.date.split("-").reverse().join("/")}
                                </span>
                              </div>
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

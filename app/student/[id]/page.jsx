"use client";

import Container from "@/components/shared/Container";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { auth, storage } from "@/firebase";
import { Circle, CircleCheck, CloudUpload, InfoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_STUDENT_DETAILS } from "@/graphql/queries/students.query";
import { GET_PUBLISHED_TESTPAPERS_USERS } from "@/graphql/queries/testPaper.query";
import { CREATE_FEE, DELETE_FEE } from "@/graphql/mutations/fees.mutation";
import { useMutation } from "@apollo/client";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";

ChartJS.register(ArcElement, Tooltip, Legend);

const page = () => {
  const { id } = useParams();
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
  const [feeData, setFeeData] = useState({
    feesPaid: "",
    paidOn: "",
    month: "",
    year: "",
    mode: "",
    chequeRefNo: "",
    chequeImgUrl: "",
    upiId: "",
    upiImgUrl: "",
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

  const today = new Date();
  const todayDate = `${
    today.getDate() < 10 ? "0" + today.getDate() : today.getDate()
  }-${
    today.getMonth() + 1 < 10
      ? "0" + (today.getMonth() + 1)
      : today.getMonth() + 1
  }-${today.getFullYear()}`;

  // Queries - Get Student, Get Published Papers
  const { data: studData } = useSuspenseQuery(GET_STUDENT_DETAILS, {
    variables: { userId: id },
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

  console.log(studData);
  console.log("TEST", testPaperUsers?.testpaperUsers);

  // Mutations - Create Fee, Delete Fee
  const [createFee] = useMutation(CREATE_FEE, {
    refetchQueries: [
      {
        query: GET_STUDENT_DETAILS,
        variables: {
          userId: id,
        },
      },
    ],
  });
  const [deleteFee] = useMutation(DELETE_FEE, {
    refetchQueries: [
      {
        query: GET_STUDENT_DETAILS,
        variables: {
          userId: id,
        },
      },
    ],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        if (user.email === "shindearyan179@gmail.com") {
          setIsAdmin(true);
        }

        setChartData({
          labels: ["Present", "Absent"],
          datasets: [
            {
              label: "Days",
              data: [
                studData?.student.attendance.present,
                studData?.student.attendance.absent,
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

  const addFeeHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding Fee...");
    if (
      !feeData.feesPaid ||
      !feeData.paidOn ||
      !feeData.month ||
      !feeData.year ||
      !feeData.mode
    ) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      return;
    }
    console.log(feeData);

    if (
      feeData.mode === "cheque" &&
      (!feeData.chequeRefNo || !feeData.chequeImgUrl)
    ) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      return;
    }
    if (feeData.mode === "upi" && (!feeData.upiId || !feeData.upiImgUrl)) {
      toast.error("Please fill all the fields!", {
        id: toastId,
      });
      return;
    }
    let today = new Date();
    let feeid = `${today.getFullYear()}${
      today.getHours() < 10 ? "0" + today.getHours() : today.getHours()
    }${
      today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()
    }${
      today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds()
    }`;

    const storageRef = ref(storage, `fee/${feeid}`);

    if (feeData.mode === "cheque" || feeData.mode === "upi") {
      await uploadBytes(
        storageRef,
        feeData.mode === "cheque" ? feeData.chequeImgUrl : feeData.upiImgUrl
      )
        .then(async (snapshot) => {
          const downloadUrl = await getDownloadURL(storageRef);
          console.log("SNAPSHOT", snapshot);
          console.log("DOWNLOAD", downloadUrl);
          // feeData.mode === "cheque"
          //   ? setFeeData({ ...feeData, chequeImgUrl: downloadUrl })
          //   : setFeeData({ ...feeData, upiImgUrl: downloadUrl });
          if (feeData.mode === "cheque") {
            // setFeeData({ ...feeData, chequeImgUrl: downloadUrl });
            feeData.chequeImgUrl = downloadUrl;
          } else {
            // setFeeData({ ...feeData, upiImgUrl: downloadUrl });
            feeData.upiImgUrl = downloadUrl;
          }

          console.log("FEE DATA", feeData);

          // toast.success("Test Paper Added Successfully!", {
          //   id: toastId,
          // });
        })
        .catch((error) => {
          toast.error("Something went wrong!", {
            id: toastId,
          });
          console.error(error);
          return;
        });
    }

    console.log("FEE DATA", feeData);
    // toast.success("Fee added successfully!", { id: toastId });
    console.log("FEEINGDATA", {
      id: feeid,
      userId: id,
      email: studData?.student.email,
      feesPaid: parseInt(feeData.feesPaid),
      paidOn: feeData.paidOn,
      month: feeData.month,
      year: feeData.year,
      mode: feeData.mode,
      chequeRefNo: feeData.chequeRefNo || "",
      chequeImgUrl: feeData.chequeImgUrl || "",
      upiId: feeData.upiId || "",
      upiImgUrl: feeData.upiImgUrl || "",
    });

    await createFee({
      variables: {
        id: feeid,
        userId: id,
        email: studData?.student.email,
        feesPaid: parseInt(feeData.feesPaid),
        paidOn: feeData.paidOn,
        month: feeData.month,
        year: feeData.year,
        mode: feeData.mode,
        chequeRefNo: feeData.chequeRefNo || "",
        chequeImgUrl: feeData.chequeImgUrl || "",
        upiId: feeData.upiId || "",
        upiImgUrl: feeData.upiImgUrl || "",
      },
    })
      .then((data) => {
        console.log(data);
        toast.success("Fee added successfully!", {
          id: toastId,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error("There was an error adding fee!", {
          id: toastId,
        });
      });

    setFeeData({
      feesPaid: "",
      paidOn: "",
      month: "",
      year: "",
      mode: "",
      chequeRefNo: "",
      chequeImgUrl: "",
      upiId: "",
      upiImgUrl: "",
    });
  };

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
        console.log(error);
        toast.error("There was an error logging out!", {
          id: toastId,
        });
      });
  };

  const deleteFeeHandler = async (e, feeid) => {
    e.preventDefault();

    console.log("Fee Deleted");

    const toastId = toast.loading("Deleting Fee...");

    await deleteFee({
      variables: {
        userId: id,
        deleteFeeId: feeid,
      },
    })
      .then((data) => {
        console.log(data);
        toast.success("Fee deleted successfully!", {
          id: toastId,
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error("There was an error deleting fee!", {
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
                Welcome {studData?.student.firstname}
              </h2>
              <Link
                href={`/student/${id}/profile`}
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
                  Student Name - {studData?.student.firstname}{" "}
                  {studData?.student.middlename} {studData?.student.lastname}
                </span>
                <span>Student Email - {studData?.student.email}</span>
                <span>Student Phone - {studData?.student.phone}</span>
                <span>Student Grade - {studData?.student.grade}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center w-full">
                <h3 className="subsubheading text-secondary mb-4">
                  Fees Information
                </h3>
                {isAdmin && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-2">
                        Add Fee
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Fee</DialogTitle>
                        <DialogDescription>
                          Add Fee here, and click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="fees-paid" className="text-right">
                            Fees Paid
                          </Label>
                          <Input
                            id="fees-paid"
                            placeholder="1000"
                            className="col-span-3"
                            type="number"
                            value={feeData.feesPaid}
                            onChange={(e) => {
                              setFeeData({
                                ...feeData,
                                feesPaid: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="paid-on" className="text-right">
                            Paid On
                          </Label>
                          <Input
                            id="paid-on"
                            type="date"
                            className="col-span-3"
                            value={feeData.paidOn}
                            onChange={(e) => {
                              setFeeData({
                                ...feeData,
                                paidOn: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="month" className="text-right">
                            Month
                          </Label>
                          <Input
                            id="month"
                            placeholder="January"
                            className="col-span-3"
                            value={feeData.month}
                            onChange={(e) => {
                              setFeeData({
                                ...feeData,
                                month: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="year" className="text-right">
                            Year
                          </Label>
                          <Input
                            id="year"
                            placeholder="2024"
                            className="col-span-3"
                            value={feeData.year}
                            onChange={(e) => {
                              setFeeData({
                                ...feeData,
                                year: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="year" className="text-right">
                            Paid Via
                          </Label>
                          <RadioGroup
                            value={feeData.mode}
                            onValueChange={(e) =>
                              setFeeData({ ...feeData, mode: e })
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash">Cash</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cheque" id="cheque" />
                              <Label htmlFor="cheque">Cheque</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="upi" id="upi" />
                              <Label htmlFor="upi">UPI</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        {
                          // Cheque Details
                          feeData.mode === "cheque" && (
                            <>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="chequeRefNo"
                                  className="text-right"
                                >
                                  Ref No.
                                </Label>
                                <Input
                                  id="chequeRefNo"
                                  className="col-span-3"
                                  value={feeData.chequeRefNo}
                                  onChange={(e) => {
                                    setFeeData({
                                      ...feeData,
                                      chequeRefNo: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Image</Label>
                                {feeData.chequeImgUrl === "" ? (
                                  <>
                                    <Label
                                      htmlFor="chequeImage"
                                      className="flex justify-center items-center col-span-3 bg-secondary text-primary rounded px-4 py-2 cursor-pointer"
                                    >
                                      <CloudUpload /> Upload Image
                                    </Label>
                                    <input
                                      id="chequeImage"
                                      type="file"
                                      accept="image/*"
                                      className="col-span-3 hidden"
                                      onChange={(e) => {
                                        setFeeData({
                                          ...feeData,
                                          chequeImgUrl: e.target.files[0],
                                        });
                                        console.log("FILE", e.target.files[0]);
                                      }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <span className="col-span-3">
                                      {feeData.chequeImgUrl.name}
                                    </span>
                                    <div className="col-span-1"></div>
                                    <Button
                                      variant="nav"
                                      className="col-span-3 test-secondary"
                                      onClick={() =>
                                        setFeeData({
                                          ...feeData,
                                          chequeImgUrl: "",
                                        })
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </>
                                )}
                              </div>
                            </>
                          )
                        }
                        {
                          // UPI Details
                          feeData.mode === "upi" && (
                            <>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="year" className="text-right">
                                  UPI ID
                                </Label>
                                <Input
                                  id="upiId"
                                  className="col-span-3"
                                  value={feeData.upiId}
                                  onChange={(e) => {
                                    setFeeData({
                                      ...feeData,
                                      upiId: e.target.value,
                                    });
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Image</Label>
                                {feeData.upiImgUrl === "" ? (
                                  <>
                                    <Label
                                      htmlFor="upiImage"
                                      className="flex justify-center items-center col-span-3 bg-secondary text-primary rounded px-4 py-2 cursor-pointer"
                                    >
                                      <CloudUpload /> Upload Image
                                    </Label>
                                    <input
                                      id="upiImage"
                                      type="file"
                                      accept="image/*"
                                      className="col-span-3 hidden"
                                      onChange={(e) => {
                                        setFeeData({
                                          ...feeData,
                                          upiImgUrl: e.target.files[0],
                                        });
                                        console.log("FILE", e.target.files[0]);
                                      }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <span className="col-span-3">
                                      {feeData.upiImgUrl.name}
                                    </span>
                                    <div className="col-span-1"></div>
                                    <Button
                                      variant="nav"
                                      className="col-span-3 test-secondary"
                                      onClick={() =>
                                        setFeeData({
                                          ...feeData,
                                          upiImgUrl: "",
                                        })
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </>
                                )}
                              </div>
                            </>
                          )
                        }
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={addFeeHandler}>
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="barlow-semibold w-[100px]">
                      Fees Paid
                    </TableHead>
                    <TableHead className="barlow-semibold">Paid On</TableHead>
                    <TableHead className="barlow-semibold">Month</TableHead>
                    {isAdmin && (
                      <TableHead className="barlow-semibold">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studData?.student.fees.length === 0 && (
                    <TableRow>
                      <TableCell
                        className="barlow-medium text-center"
                        colSpan="3"
                      >
                        No Fees Paid
                      </TableCell>
                    </TableRow>
                  )}
                  {studData?.student.fees.length !== 0 &&
                    studData?.student.fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="barlow-medium">
                          <AlertDialog>
                            <AlertDialogTrigger>
                              ₹{fee.feesPaid}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Fee Information
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Details of the student fee.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="flex flex-col justify-start gap-4">
                                <span className="barlow-regular">
                                  Created At - {fee.createdAt.split(",")[0]}
                                </span>

                                <span className="barlow-regular">
                                  Fees Paid - ₹{fee.feesPaid}
                                </span>

                                <span className="barlow-regular">
                                  Paid On - {fee.paidOn}
                                </span>

                                <span className="barlow-regular">
                                  Month - {fee.month}, {fee.year}
                                </span>

                                <span className="barlow-regular">
                                  Mode - {fee.mode}
                                </span>

                                {fee.mode === "cheque" && (
                                  <>
                                    <span className="barlow-regular">
                                      Cheque Ref No - {fee.chequeRefNo}
                                    </span>
                                    <Image
                                      src={fee.chequeImgUrl}
                                      alt="Cheque Image"
                                      width={1000}
                                      height={1000}
                                      className="w-full rounded"
                                    />
                                  </>
                                )}

                                {fee.mode === "upi" && (
                                  <>
                                    <span className="barlow-regular">
                                      UPI ID - {fee.upiId}
                                    </span>
                                    <Image
                                      src={fee.upiImgUrl}
                                      alt="UPI Image"
                                      width={1000}
                                      height={1000}
                                      className="w-full rounded"
                                    />
                                  </>
                                )}
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                        <TableCell className="barlow-regular">
                          {fee.paidOn}
                        </TableCell>
                        <TableCell className="barlow-regular">
                          {fee.month}, {fee.year}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <Button variant="outline">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Fee
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this fee?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <Button
                                    onClick={(e) => deleteFeeHandler(e, fee.id)}
                                  >
                                    Delete
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
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
                        Rank - {test?.marks[0].rank}
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
                            Rank - {test?.marks[0].rank}
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

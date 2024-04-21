"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
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
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";

ChartJS.register(ArcElement, Tooltip, Legend);

const page = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [chartData, setChartData] = useState({
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "$",
        data: [13, 3],
        backgroundColor: ["#159a3a", "#Bf1924"],
        borderColor: ["#159a3a", "#Bf1924"],
        borderWidth: 1,
        borderRadius: 30,
        spacing: 10,
        cutout: 130,
      },
    ],
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log(user);
        if (user.email === "shindearyan179@gmail.com") {
          setIsAdmin(true);
        }
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
        console.log(error);
        toast.error("There was an error logging out!", {
          id: toastId,
        });
      });
  };

  return (
    <Container>
      {/* <Navbar navLinks={dashboardNavLinks} isHome={false} /> */}

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
              <h2 className="subheading">Student Name</h2>
              <Link
                href="/student/randomid/profile"
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
                <span>Student Name</span>
                <span>Student Email</span>
                <span>Student Phone</span>
              </div>
            </div>
            <div>
              <h3 className="subsubheading text-secondary mb-4">
                Fees Information
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="barlow-semibold w-[100px]">
                      Fees Paid
                    </TableHead>
                    <TableHead className="barlow-semibold">Paid On</TableHead>
                    <TableHead className="barlow-semibold">Month</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="barlow-medium">₹6000</TableCell>
                    <TableCell className="barlow-regular">12/04/2024</TableCell>
                    <TableCell className="barlow-regular">January</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="lg:w-[50%]">
            <Doughnut data={chartData} />
          </div>
        </div>
        <div>
          <h3 className="subsubheading text-secondary mb-6">
            Shared Test Papers
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-6 bg-secondary text-primary px-6 py-4 rounded">
              <div>
                <h4 className="smallheading">Test Name</h4>
                <span className="barlow-regular">Created on - 12/04/2024</span>
              </div>
              <div>
                {/* <Button variant="outline">Upcoming</Button> */}

                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button variant="outline">Upcoming</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Test Paper Name</AlertDialogTitle>

                      <AlertDialogDescription>
                        Created on - 12/04/2024
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2">
                      <span>Test will be available from 12/04/2024!</span>
                      <span>
                        Test Paper will be visible once the test is started!
                      </span>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex items-center justify-between gap-6 bg-secondary text-primary px-6 py-4 rounded">
              <div>
                <h4 className="smallheading">Test Name</h4>
                <span className="barlow-regular">Created on - 12/04/2024</span>
              </div>
              <div>
                {/* <Button variant="outline">View</Button> */}

                <AlertDialog>
                  <AlertDialogTrigger>
                    <Button variant="outline">View</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Test Paper Name</AlertDialogTitle>

                      <AlertDialogDescription>
                        Created on - 12/04/2024
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <iframe
                      src="https://shishyakul.vercel.app/demopdf.pdf"
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
          </div>
        </div>
      </div>
    </Container>
  );
};

export default page;

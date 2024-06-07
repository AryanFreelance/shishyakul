"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import {
  GET_TESTPAPER,
  GET_TESTPAPER_MARKS,
  GET_TESTPAPER_SHARED_USERS,
} from "@/graphql/queries/testPaper.query";
import { Button } from "@/components/ui/button";
import { SAVE_TEST_MARKS } from "@/graphql/mutations/testPaper.mutation";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Medal } from "lucide-react";

export const dynamic = "force-dynamic";

const Page = () => {
  const { id } = useParams();
  const [studMarks, setStudMarks] = useState([]);
  const [marksSaveDialogHandler, setMarksSaveDialogHandler] = useState(false);

  const { data: testpaperData } = useSuspenseQuery(GET_TESTPAPER, {
    variables: { id, published: true },
  });
  const { data: testpaperMarks } = useSuspenseQuery(GET_TESTPAPER_MARKS, {
    variables: { id },
  });
  const { data: sharedTestPaperUsers } = useSuspenseQuery(
    GET_TESTPAPER_SHARED_USERS,
    {
      variables: { id },
    }
  );

  const [saveTestMarks] = useMutation(SAVE_TEST_MARKS, {
    refetchQueries: [
      {
        query: GET_TESTPAPER_MARKS,
        variables: { id },
      },
    ],
  });

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];

  // Assign ranks to the already sorted testpaperMarks
  // let currentRank = 1;
  // let ranks = [];

  // testpaperMarks?.testpaperMarks.forEach((user, index) => {
  //   if (
  //     index > 0 &&
  //     user.marks !== testpaperMarks.testpaperMarks[index - 1].marks
  //   ) {
  //     currentRank += 1;
  //   }
  //   ranks.push({ ...user, rank: currentRank });
  //   console.log("RANKS", ranks);
  // });

  useEffect(() => {
    if (testpaperMarks?.testpaperMarks) {
      const initialMarks = sharedTestPaperUsers?.testAccessedUsers.map(
        (user) => {
          const existingMarks = testpaperMarks.testpaperMarks.find(
            (mark) => mark.email === user.email
          );
          return {
            id: user.userId,
            name: `${user.firstname} ${user.lastname}`,
            email: user.email,
            grade: user.grade,
            marks: existingMarks ? existingMarks.marks : "",
          };
        }
      );
      setStudMarks(initialMarks);
    }
  }, [testpaperMarks, sharedTestPaperUsers]);

  const saveTestMarksHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving marks...");
    if (studMarks.length === 0) {
      toast.error("Please add marks for the students!", { id: toastId });
      return;
    }
    if (studMarks.length !== sharedTestPaperUsers.testAccessedUsers.length) {
      toast.error("Please add marks for all the students!", { id: toastId });
      return;
    }

    const saveTestResponse = await saveTestMarks({
      variables: {
        testId: id,
        data: studMarks,
      },
    });

    setMarksSaveDialogHandler(false);

    if (saveTestResponse === "ERROR") {
      toast.error("Error saving marks!", { id: toastId });
      return;
    }

    toast.success("Marks saved successfully!", { id: toastId });
  };

  if (!testpaperData?.testpaper) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center w-full h-[300px]">
          <h1 className="subsubheading text-secondary">Test not found!</h1>
        </div>
      </Container>
    );
  }

  if (testpaperData.testpaper.date > todayDate) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center w-full h-[300px]">
          <h1 className="subsubheading text-secondary">
            Test is not completed yet!
          </h1>
        </div>
      </Container>
    );
  }

  console.log("TESTPAPER MARKS", testpaperMarks);

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="my-4">
        <div>
          <h1 className="subheading text-secondary">
            Add/Update Student Test Marks
          </h1>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    Marks (Out of {testpaperData.testpaper.totalMarks})
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedTestPaperUsers?.testAccessedUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.firstname} {user.lastname}
                    </TableCell>
                    <TableCell>{user.grade}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <input
                        placeholder="Enter Marks"
                        className="input-taking w-full"
                        type="number"
                        value={studMarks[index]?.marks || ""}
                        onChange={(e) => {
                          e.preventDefault();
                          setStudMarks((prev) => {
                            const newMarks = [...prev];
                            newMarks[index] = {
                              id: user.userId,
                              name: `${user.firstname} ${user.lastname}`,
                              email: user.email,
                              grade: user.grade,
                              marks: Number(e.target.value),
                            };
                            return newMarks;
                          });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center md:justify-end items-center">
            <AlertDialog open={marksSaveDialogHandler}>
              <AlertDialogTrigger
                onClick={() => setMarksSaveDialogHandler(true)}
              >
                <Button className="mt-4 w-[80%] md:w-[200px]">Save</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Do you want to save the marks?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    previous marks from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setMarksSaveDialogHandler(false)}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={saveTestMarksHandler}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mt-6">
          <h1 className="subheading text-secondary">Leaderboard</h1>
          <div className="mt-4">
            {!testpaperMarks?.testpaperMarks.length && (
              <h1 className="text-xl text-secondary">
                Please add the students mark to get the leaderboard!
              </h1>
            )}
            {testpaperMarks?.testpaperMarks.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="flex justify-center items-center">
                      Rank
                    </TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testpaperMarks?.testpaperMarks.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex justify-center items-center">
                        {user.rank == 1 && <Medal className="text-[#D8981F]" />}
                        {user.rank == 2 && <Medal className="text-[#858585]" />}
                        {user.rank == 3 && <Medal className="text-[#892C00]" />}
                        {user.rank > 3 && user.rank}
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.marks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Page;

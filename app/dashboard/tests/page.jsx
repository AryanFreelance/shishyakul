"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
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

export const dynamic = "force-dynamic";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_TESTPAPERS } from "@/graphql/queries/testPaper.query";

const page = () => {
  // Queries
  const { data } = useSuspenseQuery(GET_TESTPAPERS);

  if (data) console.log(data);

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <div className="flex justify-between items-center">
          <h2 className="subheading">Test Papers</h2>
        </div>
        <div className="mt-8">
          {data?.testpapers?.published.length === 0 && (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">No Test Papers Found</h3>
                <p className="text-sm text-gray-500">
                  Create a test paper to get started
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-6">
            {data?.testpapers?.published.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row w-full md:justify-between md:items-center bg-secondary text-primary p-4 rounded"
              >
                <div className="md:w-[84%]">
                  <h3 className="smallheading">{item.title}</h3>
                  {/* Date Format - "21/4/2024, 4:45:02 pm" convert it to "21/04/2024*/}
                  <span>
                    Created on -{" "}
                    {item.createdAt
                      .split(",")[0]
                      .split("/")
                      .map((item) => {
                        return item.length === 1 ? `0${item}` : item;
                      })
                      .join("/")}
                  </span>
                </div>
                <div className="flex w-full md:w-[16%] justify-end mt-4 md:mt-0 items-center gap-4">
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
                        src={item.url}
                        className="w-full rounded"
                        height="480"
                        allowFullScreen
                      ></iframe>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Link href={`/dashboard/test/${item.id}0`}>Manage</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-10">
        <div className="flex justify-between items-center">
          <h2 className="subheading">Drafted Papers</h2>
          <Button asChild>
            <Link
              href="/dashboard/tests/add"
              className="flex gap-2 items-center"
            >
              <span className="barlow-regular">Add Test</span> <Plus />
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          {data?.testpapers?.draft.length === 0 && (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">No Drafted Papers Found</h3>
                <p className="text-sm text-gray-500">
                  Create a test paper to get started
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-6">
            {data?.testpapers?.draft.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row w-full md:justify-between md:items-center bg-secondary text-primary p-4 rounded"
              >
                <div className="md:w-[84%]">
                  <h3 className="smallheading">{item.title}</h3>
                  {/* Date Format - "21/4/2024, 4:45:02 pm" convert it to "21/04/2024*/}
                  <span>
                    Created on -{" "}
                    {item.createdAt
                      .split(",")[0]
                      .split("/")
                      .map((item) => {
                        return item.length === 1 ? `0${item}` : item;
                      })
                      .join("/")}
                  </span>
                </div>
                <div className="flex w-full md:w-[16%] justify-end mt-4 md:mt-0 items-center gap-4">
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
                        src={item.url}
                        className="w-full rounded"
                        height="480"
                        allowFullScreen
                      ></iframe>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Link href={`/dashboard/test/${item.id}1`}>Manage</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default page;

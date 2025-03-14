"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_ALL_FACULTY_TESTPAPERS } from "@/graphql/queries/testPaper.query";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import TestPaperCard from "@/components/private/dashboard/tests/TestPaperCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AllFacultyTestsPage = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);

        // Check if user is admin
        if (user.email === "admin@shishyakul.in") {
          setIsAdmin(true);
        } else {
          // Check member roles
          const memberDoc = await getDoc(doc(db, "members", user.email));
          if (memberDoc.exists() && memberDoc.data().roles?.Members) {
            setIsAdmin(true);
          } else {
            // Not authorized, redirect to dashboard
            router.push("/dashboard");
          }
        }

        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Query all faculty test papers
  const { data, error } = useSuspenseQuery(GET_ALL_FACULTY_TESTPAPERS, {
    skip: !isAdmin,
  });

  if (loading) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-xl">Loading...</p>
        </div>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-xl text-red-500">
            You are not authorized to view this page.
          </p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-xl text-red-500">
            Error loading test papers: {error.message}
          </p>
        </div>
      </Container>
    );
  }

  const facultyTestpapers = data?.allFacultyTestpapers || [];

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            All Faculty Test Papers
          </h1>
          <p className="text-gray-500 mt-2">
            View test papers created by all faculty members
          </p>
        </div>

        {facultyTestpapers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No faculty test papers found.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {facultyTestpapers.map((faculty, index) => (
              <AccordionItem
                key={index}
                value={`faculty-${index}`}
                className="border rounded-lg p-2"
              >
                <AccordionTrigger className="hover:no-underline px-4">
                  <div className="flex flex-col items-start text-left">
                    <h3 className="text-lg font-semibold">
                      {faculty.facultyName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {faculty.facultyEmail}
                    </p>
                  </div>
                  <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {faculty.testpapers.length} test papers
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {faculty.testpapers.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No test papers created by this faculty.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {faculty.testpapers.map((test) => (
                        <TestPaperCard
                          key={test.id}
                          test={test}
                          published={true}
                          createdBy={faculty.facultyEmail}
                          creatorName={faculty.facultyName}
                        />
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Container>
  );
};

export default AllFacultyTestsPage;

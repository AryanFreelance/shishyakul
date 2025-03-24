"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_TESTPAPERS } from "@/graphql/queries/testPaper.query";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import TestPaperCard from "@/components/private/dashboard/tests/TestPaperCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";

const TestsPage = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [facultyId, setFacultyId] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const email = user.email;
        setUserEmail(email);
        setIsAdmin(email === "admin@shishyakul.in");

        // Check for faculty role and get faculty ID
        const memberDoc = await getDoc(doc(db, "members", email));
        if (memberDoc.exists()) {
          const memberData = memberDoc.data();
          setIsFaculty(memberData.roles?.Faculty || false);
          setFacultyId(memberData.uid || "");
          console.log("Faculty data:", {
            isFaculty: memberData.roles?.Faculty,
            facultyId: memberData.uid,
          });
        }

        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Query test papers based on user role
  const {
    data,
    error,
    loading: queryLoading,
  } = useSuspenseQuery(GET_TESTPAPERS, {
    variables: {
      facultyId: isFaculty ? facultyId : null,
      isAdmin,
    },
    skip: loading || (!facultyId && isFaculty),
  });

  useEffect(() => {
    if (data) {
      console.log("Test papers data:", data);
    }
  }, [data]);

  const handleNewTestPaper = () => {
    router.push("/dashboard/tests/new");
  };

  if (loading || queryLoading) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    console.error("Error fetching test papers:", error);
    toast.error("Error fetching test papers");
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Test Papers</h1>
            <Button onClick={handleNewTestPaper}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Test
            </Button>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error loading test papers. Please try again later.
          </div>
        </div>
      </Container>
    );
  }

  const draftTestPapers = data?.testpapers?.draft || [];
  const publishedTestPapers = data?.testpapers?.published || [];

  console.log("Processed test papers:", {
    draftCount: draftTestPapers.length,
    publishedCount: publishedTestPapers.length,
  });

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Test Papers</h1>
          <Button onClick={handleNewTestPaper}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Test
          </Button>
        </div>

        <Tabs defaultValue="drafts" className="w-full">
          <TabsList>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>

          {/* Draft Test Papers */}
          <TabsContent value="drafts" className="mt-6">
            {draftTestPapers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {draftTestPapers.map((test) => (
                  <TestPaperCard
                    key={test.id}
                    test={test}
                    published={false}
                    createdBy={test.createdBy}
                    creatorName={test.creatorName}
                    onEditClick={() =>
                      router.push(`/dashboard/tests/edit/${test.id}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No draft test papers found
                </h3>
                <p className="text-gray-500 mb-4">
                  Create a new test paper to get started
                </p>
                <Button onClick={handleNewTestPaper}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Test
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Published Test Papers */}
          <TabsContent value="published" className="mt-6">
            {publishedTestPapers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publishedTestPapers.map((test) => (
                  <TestPaperCard
                    key={test.id}
                    test={test}
                    published={true}
                    createdBy={test.createdBy}
                    creatorName={test.creatorName}
                    onEditClick={() =>
                      router.push(`/dashboard/tests/edit/${test.id}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No published test papers found
                </h3>
                <p className="text-gray-500">
                  Publish a draft test paper to make it available to students
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default TestsPage;

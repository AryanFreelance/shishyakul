"use client";

import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import TestPaperCard from "@/components/private/dashboard/tests/TestPaperCard";
import { dashboardNavLinks } from "@/constants";
import { PlusCircle, Loader, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db, storage } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query as firestoreQuery,
  where,
  orderBy,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export const dynamic = "force-dynamic";

const FacultyTestsPage = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("drafts");

  // State for test papers
  const [draftTestPapers, setDraftTestPapers] = useState([]);
  const [publishedTestPapers, setPublishedTestPapers] = useState([]);
  const [draftLoading, setDraftLoading] = useState(false);
  const [publishedLoading, setPublishedLoading] = useState(false);

  // Function to fetch test papers from faculty subcollection
  const fetchFacultyTestPapers = async (facultyId) => {
    if (!facultyId) return;

    setDraftLoading(true);
    setPublishedLoading(true);
    try {
      console.log("Fetching test papers for faculty:", facultyId);
      const facultyTestPapersRef = collection(
        db,
        "faculties",
        facultyId,
        "testpapers"
      );
      const querySnapshot = await getDocs(facultyTestPapersRef);

      const draftPapers = [];
      const publishedPapers = [];

      querySnapshot.forEach((doc) => {
        const paperData = doc.data();
        if (paperData.published) {
          publishedPapers.push(paperData);
        } else {
          draftPapers.push(paperData);
        }
      });

      // Sort by createdAt in descending order
      draftPapers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      publishedPapers.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log(`Found ${draftPapers.length} draft test papers`);
      console.log(`Found ${publishedPapers.length} published test papers`);

      setDraftTestPapers(draftPapers);
      setPublishedTestPapers(publishedPapers);
    } catch (error) {
      console.error("Error fetching faculty test papers:", error);
    } finally {
      setDraftLoading(false);
      setPublishedLoading(false);
    }
  };

  // Function to publish a test paper
  const publishTestPaper = async (testId) => {
    try {
      // Get the draft test paper from faculty subcollection
      const testPaperRef = doc(
        db,
        "faculties",
        facultyId,
        "testpapers",
        testId
      );
      const testPaperDoc = await getDoc(testPaperRef);

      if (!testPaperDoc.exists()) {
        console.error("Test paper not found:", testId);
        toast.error("Test paper not found");
        return;
      }

      const testPaperData = testPaperDoc.data();

      // Update the test paper in the faculty subcollection
      await setDoc(testPaperRef, {
        ...testPaperData,
        published: true,
      });

      // Add to published collection
      await setDoc(doc(db, "testPapers", testId), {
        ...testPaperData,
        published: true,
        sharedWith: [],
      });

      // Delete from draft collection
      await deleteDoc(doc(db, "testPapersDraft", testId));

      toast.success("Test paper published successfully");

      // Refresh the test papers
      fetchFacultyTestPapers(facultyId);
    } catch (error) {
      console.error("Error publishing test paper:", error);
      toast.error("Failed to publish test paper");
    }
  };

  // Function to delete a test paper
  const deleteTestPaper = async (testId, isPublished) => {
    try {
      const collectionName = isPublished ? "testPapers" : "testPapersDraft";
      const testPaperRef = doc(db, collectionName, testId);

      // Get the paper first to check if it exists and get the file URL
      const testPaperDoc = await getDoc(testPaperRef);

      if (!testPaperDoc.exists()) {
        console.error("Test paper not found:", testId);
        toast.error("Test paper not found");
        return;
      }

      // Delete the document from Firestore
      await deleteDoc(testPaperRef);

      // Delete the PDF file from storage
      try {
        const fileRef = ref(storage, `test_papers/${testId}`);
        await deleteObject(fileRef);
        console.log("Deleted file from storage:", testId);
      } catch (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with the function even if file deletion fails
      }

      toast.success("Test paper deleted successfully");

      // Refresh the lists
      if (isPublished) {
        fetchFacultyTestPapers(facultyId);
      } else {
        fetchFacultyTestPapers(facultyId);
      }
    } catch (error) {
      console.error("Error deleting test paper:", error);
      toast.error("Failed to delete test paper");
    }
  };

  // Effect to get user info and fetch test papers
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);

        try {
          // Get user info from members collection
          const membersRef = collection(db, "members");
          const q = firestoreQuery(
            membersRef,
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserName(userData.name || "");
            setFacultyId(userData.uid || "");

            // Fetch test papers using faculty ID
            if (userData.uid) {
              fetchFacultyTestPapers(userData.uid);
            }
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log("Manual refresh requested for user:", userEmail);
    fetchFacultyTestPapers(facultyId);
  };

  // Handler for creating a new test paper
  const handleNewTestPaper = () => {
    router.push("/dashboard/tests/add");
  };

  if (loading) {
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

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My Test Papers</h1>
          <div className="flex gap-2">
            <Button onClick={handleManualRefresh} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleNewTestPaper}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Test
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="drafts"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>

          {/* Draft Test Papers */}
          <TabsContent value="drafts" className="mt-6">
            {draftLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading draft test papers...</p>
              </div>
            ) : draftTestPapers?.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {draftTestPapers.map((test) => (
                  <TestPaperCard
                    key={test.id}
                    test={test}
                    published={false}
                    createdBy={test.createdBy || userEmail}
                    creatorName={test.creatorName || userName}
                    onEditClick={() =>
                      router.push(`/dashboard/tests/faculty/${test.id}`)
                    }
                    onPublishClick={() => publishTestPaper(test.id)}
                    onDeleteClick={() => deleteTestPaper(test.id, false)}
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
            {publishedLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading published test papers...</p>
              </div>
            ) : publishedTestPapers?.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publishedTestPapers.map((test) => (
                  <TestPaperCard
                    key={test.id}
                    test={test}
                    published={true}
                    createdBy={test.createdBy || userEmail}
                    creatorName={test.creatorName || userName}
                    onEditClick={() =>
                      router.push(`/dashboard/tests/faculty/${test.id}`)
                    }
                    onDeleteClick={() => deleteTestPaper(test.id, true)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No published test papers found
                </h3>
                <p className="text-gray-500 mb-4">
                  Publish your draft test papers to see them here
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("drafts")}
                >
                  View Drafts
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default FacultyTestsPage;

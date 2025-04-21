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
import {
  Circle,
  CircleCheck,
  InfoIcon,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import AddFeeDialog from "@/components/private/studentPage/AddFeeDialog";
import CheckFeeData from "@/components/private/studentPage/CheckFeeData";
import RequestReview from "@/components/private/studentPage/RequestReview";
import StudentFeesInfoDialog from "@/components/private/studentPage/StudentFeesInfoDialog";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import {
  GET_STUDENT_DETAILS,
  GET_STUDENT_PROFILE,
} from "@/graphql/queries/students.query";
import { GET_STUDENT_FEES } from "@/graphql/queries/fees.query";
import { GET_PUBLISHED_TESTPAPERS_USERS } from "@/graphql/queries/testPaper.query";
import { Separator } from "@/components/ui/separator";
import ProfileCompletionStatus from "@/components/private/studentPage/ProfileCompletionStatus";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  checkMemberRoles,
  hasRole,
  isFacultyMember,
  isMember,
} from "@/utils/member-utils";

export const dynamic = "force-dynamic";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Utility functions to calculate profile completion
const calculateStudentInfoCompletion = (studentInfo) => {
  if (!studentInfo) return { percentage: 0, missingFields: [] };

  const requiredFields = [
    { key: "dob", label: "Date of Birth" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "adhaar", label: "Adhaar Number" },
    { key: "address", label: "Address" },
    { key: "school", label: "School" },
    { key: "board", label: "Board" },
    { key: "medium", label: "Medium" },
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      !studentInfo[field.key] ||
      studentInfo[field.key] === "" ||
      (typeof studentInfo[field.key] === "number" &&
        studentInfo[field.key] === 0)
  );

  const percentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100
  );

  return { percentage, missingFields };
};

const calculateGuardianInfoCompletion = (guardianInfo) => {
  if (!guardianInfo) return { percentage: 0, missingFields: [] };

  const requiredFields = [
    { key: "motherFirstName", label: "Mother's First Name" },
    { key: "motherLastName", label: "Mother's Last Name" },
    { key: "motherOccupation", label: "Mother's Occupation" },
    { key: "motherContactNumber", label: "Mother's Contact Number" },
    { key: "fatherFirstName", label: "Father's First Name" },
    { key: "fatherLastName", label: "Father's Last Name" },
    { key: "fatherOccupation", label: "Father's Occupation" },
    { key: "fatherContactNumber", label: "Father's Contact Number" },
  ];

  const missingFields = requiredFields.filter(
    (field) => !guardianInfo[field.key] || guardianInfo[field.key] === ""
  );

  const percentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100
  );

  return { percentage, missingFields };
};

const calculateSiblingInfoCompletion = (siblingInfo) => {
  // Sibling information is optional, so if there's no sibling, it's considered complete
  if (!siblingInfo || siblingInfo.length === 0)
    return { percentage: 100, missingFields: [] };

  let totalFields = 0;
  let completedFields = 0;
  const missingFields = [];

  siblingInfo.forEach((sibling, index) => {
    const requiredFields = [
      { key: "siblingName", label: `Sibling ${index + 1} Name` },
      { key: "age", label: `Sibling ${index + 1} Age` },
      { key: "status", label: `Sibling ${index + 1} Status` },
      { key: "organization", label: `Sibling ${index + 1} Organization` },
    ];

    totalFields += requiredFields.length;

    requiredFields.forEach((field) => {
      if (
        sibling[field.key] &&
        sibling[field.key] !== "" &&
        !(typeof sibling[field.key] === "number" && sibling[field.key] === 0)
      ) {
        completedFields++;
      } else {
        missingFields.push(field.label);
      }
    });
  });

  const percentage =
    totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;

  return { percentage, missingFields };
};

const calculateParentSectionCompletion = (parentSection) => {
  if (!parentSection) return { percentage: 0, missingFields: [] };

  const requiredFields = [
    {
      key: "expectationsWithShishyakul",
      label: "Expectations with Shishyakul",
    },
    { key: "strengthAndWeakness", label: "Strength and Weakness" },
    {
      key: "medicalAllergiesAndConcerns",
      label: "Medical Allergies and Concerns",
    },
  ];

  const missingFields = requiredFields.filter(
    (field) => !parentSection[field.key] || parentSection[field.key] === ""
  );

  const percentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100
  );

  return { percentage, missingFields };
};

const calculateStudentSectionCompletion = (studentSection) => {
  if (!studentSection) return { percentage: 0, missingFields: [] };

  const requiredFields = [
    { key: "describeYourself", label: "Describe Yourself" },
    { key: "passion", label: "Passion" },
    { key: "skills", label: "Skills" },
    { key: "hobbies", label: "Hobbies" },
    { key: "dreams", label: "Dreams" },
    { key: "achievements", label: "Achievements" },
    { key: "strength", label: "Strength" },
    { key: "weakness", label: "Weakness" },
    { key: "thingsWantToImprove", label: "Things to Improve" },
    {
      key: "expectationsWithShishyakul",
      label: "Expectations with Shishyakul",
    },
  ];

  const missingFields = requiredFields.filter(
    (field) => !studentSection[field.key] || studentSection[field.key] === ""
  );

  const percentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100
  );

  return { percentage, missingFields };
};

const page = () => {
  const { ay, grade, id } = useParams();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);
  const [memberRoles, setMemberRoles] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(ay);
  const [hasFeePermission, setHasFeePermission] = useState(false);
  // const permissionContext = usePermission();
  // const { permissions } = usePermission();

  // useEffect(() => {
  //   console.log("Raw permission context:", permissionContext);
  // }, [permissionContext]);

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
  const [profileCompletionData, setProfileCompletionData] = useState({
    studentInfo: { percentage: 0, missingFields: [] },
    guardianInfo: { percentage: 0, missingFields: [] },
    siblingInfo: { percentage: 0, missingFields: [] },
    parentSection: { percentage: 0, missingFields: [] },
    studentSection: { percentage: 0, missingFields: [] },
    overall: 0,
  });
  const [isProfileStatusOpen, setIsProfileStatusOpen] = useState(true);

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
  const { data: studData, refetch: refetchStudData } = useSuspenseQuery(
    GET_STUDENT_DETAILS,
    {
      variables: { ay, grade, userId: id },
    }
  );

  // Query to get profile data for completion calculation
  const { data: profileData, refetch: refetchProfile } = useSuspenseQuery(
    GET_STUDENT_PROFILE,
    {
      variables: {
        ay,
        grade,
        userId: id,
      },
    }
  );

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

  // Query - Get Student Fees for selected academic year
  const { data: feesData, refetch: refetchFeesData } = useSuspenseQuery(
    GET_STUDENT_FEES,
    {
      variables: { userId: id, academicYear: selectedAcademicYear },
    }
  );

  // Auth state effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === "admin@shishyakul.in") {
          setIsAdmin(true);
        }
        setAuthStatus(true);
      } else {
        setAuthStatus(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Chart data effect
  useEffect(() => {
    if (studData?.student) {
      setChartData({
        labels: ["Present", "Absent"],
        datasets: [
          {
            label: "Days",
            data: [
              studData.student.attendance.present,
              studData.student.attendance.absent,
            ],
            backgroundColor: ["#159a3a", "#d92e39"],
            borderColor: ["#159a3a", "#d92e39"],
            borderWidth: 1,
          },
        ],
      });
    }
  }, [studData]);

  // Payment methods from student data
  useEffect(() => {
    if (studData?.student?.fees && studData.student.fees.length > 0) {
      const paymentMethods = {};

      // Group payments by method and sum amounts
      studData.student.fees.forEach((fee) => {
        // Capitalize first letter of payment method
        const method = fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1);
        if (!paymentMethods[method]) {
          paymentMethods[method] = 0;
        }
        paymentMethods[method] += fee.feesPaid;
      });

      // Update chart data
      setPaymentMethodsData({
        labels: ["Payment Methods"],
        datasets: [
          ...Object.entries(paymentMethods).map(([method, amount], index) => ({
            label: method,
            data: [amount],
            backgroundColor: [
              index === 0
                ? "rgba(54, 162, 235, 0.6)" // Cash
                : index === 1
                ? "rgba(255, 99, 132, 0.6)" // UPI
                : index === 2
                ? "rgba(255, 206, 86, 0.6)" // NEFT
                : "rgba(75, 192, 192, 0.6)", // Cheque
            ],
            borderColor: [
              index === 0
                ? "rgba(54, 162, 235, 1)"
                : index === 1
                ? "rgba(255, 99, 132, 1)"
                : index === 2
                ? "rgba(255, 206, 86, 1)"
                : "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 1,
          })),
        ],
      });
    }
  }, [studData]);

  // Function to check member roles
  const checkRoles = async () => {
    const { roles, isFaculty: facultyStatus } = await checkMemberRoles();
    setMemberRoles(roles);
    setIsFaculty(facultyStatus);
  };

  // Check member roles on component mount
  useEffect(() => {
    checkRoles();
  }, []);

  // Update permission checking function
  const checkPermission = async (role) => {
    // Admin always has access to everything
    if (isAdmin) return true;

    // Check if user has the specific role
    return await hasRole(role);
  };

  // Check fee permission on component mount and when isAdmin changes
  useEffect(() => {
    const checkFeePermission = async () => {
      const hasPermission = await checkPermission("Fees");
      setHasFeePermission(hasPermission);
    };
    checkFeePermission();
  }, [isAdmin]);

  // Profile completion calculation
  useEffect(() => {
    // Calculate profile completion percentages when profile data is available
    if (profileData?.student) {
      const studentInfo = calculateStudentInfoCompletion(
        profileData.student.studentInformation
      );
      const guardianInfo = calculateGuardianInfoCompletion(
        profileData.student.guardianInformation
      );
      const siblingInfo = calculateSiblingInfoCompletion(
        profileData.student.siblingInformation
      );
      const parentSection = calculateParentSectionCompletion(
        profileData.student.parentSection
      );
      const studentSection = calculateStudentSectionCompletion(
        profileData.student.studentSection
      );

      // Calculate overall completion percentage
      const sections = [
        studentInfo,
        guardianInfo,
        siblingInfo,
        parentSection,
        studentSection,
      ];
      const overall = Math.round(
        sections.reduce((sum, section) => sum + section.percentage, 0) /
          sections.length
      );

      setProfileCompletionData({
        studentInfo,
        guardianInfo,
        siblingInfo,
        parentSection,
        studentSection,
        overall,
      });
    }
  }, [profileData]);

  // Profile refetch on focus
  useEffect(() => {
    // Refetch profile data when component mounts or when returning from profile page
    const handleFocus = () => {
      refetchProfile();
    };

    // Add event listener for when the window regains focus
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchProfile]);

  // Academic years setup
  useEffect(() => {
    // Set academic years from the student data
    if (studData?.student?.academicYearsHistory) {
      setAcademicYears(studData.student.academicYearsHistory);
    }
  }, [studData]);

  // Process payment methods data for bar chart from feesData
  useEffect(() => {
    if (feesData?.studentFees && feesData.studentFees.length > 0) {
      const paymentMethods = {};

      // Group payments by method and sum amounts
      feesData.studentFees.forEach((fee) => {
        // Capitalize first letter of payment method
        const method = fee.mode.charAt(0).toUpperCase() + fee.mode.slice(1);
        if (!paymentMethods[method]) {
          paymentMethods[method] = 0;
        }
        paymentMethods[method] += fee.feesPaid;
      });

      // Update chart data
      setPaymentMethodsData({
        labels: ["Payment Methods"],
        datasets: [
          ...Object.entries(paymentMethods).map(([method, amount], index) => ({
            label: method,
            data: [amount],
            backgroundColor: [
              index === 0
                ? "rgba(54, 162, 235, 0.6)" // Cash
                : index === 1
                ? "rgba(255, 99, 132, 0.6)" // UPI
                : index === 2
                ? "rgba(255, 206, 86, 0.6)" // NEFT
                : "rgba(75, 192, 192, 0.6)", // Cheque
            ],
            borderColor: [
              index === 0
                ? "rgba(54, 162, 235, 1)"
                : index === 1
                ? "rgba(255, 99, 132, 1)"
                : index === 2
                ? "rgba(255, 206, 86, 1)"
                : "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 1,
          })),
        ],
      });
    } else {
      // Set default empty chart data when no fees are available
      setPaymentMethodsData({
        labels: ["Payment Methods"],
        datasets: [],
      });
    }
  }, [feesData]);

  // Handle academic year change
  const handleAcademicYearChange = (value) => {
    setSelectedAcademicYear(value);
    // Refetch fees data for the selected academic year
    refetchFeesData({ userId: id, academicYear: value });
  };

  // // Navigate to the selected academic year page
  // const navigateToSelectedYear = () => {
  //   if (selectedAcademicYear) {
  //     router.push(`/student/${selectedAcademicYear}/${grade}/${id}`);
  //   }
  // };

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

  // Calculate total fees paid for the selected academic year
  const calculateTotalFeesPaidForSelectedYear = () => {
    if (!feesData?.studentFees || feesData.studentFees.length === 0) {
      return 0;
    }

    return feesData.studentFees.reduce((total, fee) => total + fee.feesPaid, 0);
  };

  // Get total fees (from database or calculate from existing data)
  const getTotalFees = () => {
    if (studData?.student?.totalFees) {
      return studData.student.totalFees;
    }

    // Return default total fees of 60000 if not set
    return 60000;
  };

  // Loading state
  // if (!studData || permissionContext?.loading) {
  //   return (
  //     <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
  //       Loading... <br />
  //       <small>
  //         If you are waiting for so long then please contact the admin!
  //       </small>
  //     </div>
  //   );
  // }

  // No student found state
  if (!studData?.student) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        No Student Found
      </div>
    );
  }

  // Auth loading state
  if (authStatus === null) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Loading...
      </div>
    );
  }

  // Not authenticated state
  if (!authStatus) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Redirecting...
      </div>
    );
  }

  // Logout handler
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
        <div className="flex flex-col gap-10 lg:items-center w-full">
          <div className="w-full">
            <div>
              {(isAdmin || isFaculty || memberRoles) && (
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
              <div className="flex items-center gap-4">
                {academicYears.length > 1 && (
                  <div className="flex items-center gap-2">
                    {/* <Calendar size={16} /> */}
                    <Select
                      value={selectedAcademicYear}
                      onValueChange={handleAcademicYearChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Academic Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* <Button
                      variant="outline"
                      className="border-2 border-main"
                      onClick={navigateToSelectedYear}
                    >
                      GO
                    </Button> */}
                  </div>
                )}
                <Link
                  href={`/student/${ay}/${grade}/${id}/profile`}
                  className="barlow-medium border-2 border-main rounded px-4 py-2"
                >
                  Profile
                </Link>
              </div>
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
                  <span>
                    School Name -{" "}
                    {profileData?.student?.studentInformation?.school ||
                      "Not Provided"}
                  </span>
                  <span>
                    Board -{" "}
                    {profileData?.student?.studentInformation?.board.toUpperCase() ||
                      "Not Provided"}
                  </span>
                  <span>
                    Medium -{" "}
                    {profileData?.student?.studentInformation?.medium ||
                      "Not Provided"}
                  </span>
                  <span>
                    DOB -{" "}
                    {profileData?.student?.studentInformation?.dob
                      ? new Date(
                          profileData.student.studentInformation.dob
                        ).toLocaleDateString("en-IN")
                      : "Not Provided"}
                  </span>
                  <span>
                    Siblings -{" "}
                    {profileData?.student?.siblingInformation?.length || 0}{" "}
                    {profileData?.student?.siblingInformation?.length === 1
                      ? "Sibling"
                      : "Siblings"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Status */}
          <Collapsible
            open={isProfileStatusOpen}
            onOpenChange={() => setIsProfileStatusOpen(!isProfileStatusOpen)}
            className="w-full bg-gray-200 p-4 rounded-md"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 md:gap-6 md:flex-row flex-col">
              <h3 className="subsubheading text-secondary mb-4 w-full text-left">
                Profile Completion Status
              </h3>
              <div className="mb-4 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium">
                    Overall Completion
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {profileCompletionData.overall}%
                    </span>
                    {isProfileStatusOpen ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
                <Progress
                  value={profileCompletionData.overall}
                  className="h-3"
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProfileCompletionStatus
                  sectionName="Student Information"
                  percentage={profileCompletionData.studentInfo.percentage}
                  missingFields={
                    profileCompletionData.studentInfo.missingFields
                  }
                  ay={ay}
                  grade={grade}
                  id={id}
                />
                <ProfileCompletionStatus
                  sectionName="Guardian Information"
                  percentage={profileCompletionData.guardianInfo.percentage}
                  missingFields={
                    profileCompletionData.guardianInfo.missingFields
                  }
                  ay={ay}
                  grade={grade}
                  id={id}
                />
                <ProfileCompletionStatus
                  sectionName="Sibling Information"
                  percentage={profileCompletionData.siblingInfo.percentage}
                  missingFields={
                    profileCompletionData.siblingInfo.missingFields
                  }
                  ay={ay}
                  grade={grade}
                  id={id}
                  siblingCount={
                    profileData?.student?.siblingInformation?.length || 0
                  }
                />
                <ProfileCompletionStatus
                  sectionName="Parent Section"
                  percentage={profileCompletionData.parentSection.percentage}
                  missingFields={
                    profileCompletionData.parentSection.missingFields
                  }
                  ay={ay}
                  grade={grade}
                  id={id}
                />
                <ProfileCompletionStatus
                  sectionName="Student Section"
                  percentage={profileCompletionData.studentSection.percentage}
                  missingFields={
                    profileCompletionData.studentSection.missingFields
                  }
                  ay={ay}
                  grade={grade}
                  id={id}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="w-full flex flex-col-reverse lg:flex-row gap-10 justify-between items-center">
            <div className="lg:w-[70%] w-full">
              <div className="flex justify-between items-center flex-col md:flex-row gap-2 w-full">
                <h3 className="subsubheading text-secondary mb-4">
                  Fees Information{" "}
                  {selectedAcademicYear && `(${selectedAcademicYear})`}
                </h3>
                {/* Show fee management tools for admins, faculty with access, and members with Fees permission */}
                {(isAdmin || hasFeePermission) && (
                  <>
                    {/* Add this debugging information temporarily */}
                    {/* <div className="text-xs bg-yellow-100 p-2 mb-2 rounded">
                      Debug: isAdmin={isAdmin.toString()}, hasFeePermission=
                      {checkPermission("Fees").toString()}
                    </div> */}
                    <div className="flex gap-4 items-center">
                      <AddFeeDialog
                        id={id}
                        studData={studData}
                        academicYear={selectedAcademicYear}
                        onFeeAdded={() =>
                          refetchFeesData({
                            userId: id,
                            academicYear: selectedAcademicYear,
                          })
                        }
                      />
                      <StudentFeesInfoDialog
                        id={id}
                        studData={studData}
                        academicYear={selectedAcademicYear}
                      />
                    </div>
                  </>
                )}
                {/* Show RequestReview only for students (not admins, faculty, or members) */}
                {!isAdmin && !isFaculty && !memberRoles && (
                  <RequestReview
                    name={`${studData?.student?.firstname} ${studData?.student?.lastname}`}
                    email={studData?.student?.email}
                    ay={ay}
                    grade={grade}
                    userId={id}
                    feeData={feesData?.studentFees}
                    academicYear={selectedAcademicYear}
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
                      ₹{calculateTotalFeesPaidForSelectedYear()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Balance
                    </span>
                    <span className="text-2xl font-bold">
                      ₹
                      {getTotalFees() - calculateTotalFeesPaidForSelectedYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Chart */}
              {feesData?.studentFees && feesData.studentFees.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Payment Methods</h4>
                  <div className="h-64">
                    <Bar
                      data={paymentMethodsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: "top",
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Amount (₹)",
                            },
                          },
                          x: {
                            display: true,
                            text: "Payment Methods",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              <CheckFeeData
                isAdmin={isAdmin}
                studData={{
                  student: {
                    ...studData?.student,
                    fees: feesData?.studentFees,
                  },
                }}
                id={id}
                academicYear={selectedAcademicYear}
              />
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

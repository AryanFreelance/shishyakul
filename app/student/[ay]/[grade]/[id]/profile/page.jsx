"use client";

import Container from "@/components/shared/Container";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_STUDENT_PROFILE } from "@/graphql/queries/students.query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UPDATE_STUDENT } from "@/graphql/mutations/students.mutation";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ProfileStudentInformation from "@/components/private/studentPage/ProfileStudentInformation";
import ProfileGuardianInformation from "@/components/private/studentPage/ProfileGuardianInformation";
import ProfileSiblingInformation from "@/components/private/studentPage/ProfileSiblingInformation";
import ProfileParentSectionInformation from "@/components/private/studentPage/ProfileParentSectionInformation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import ProfileStudentSectionInformation from "@/components/private/studentPage/ProfileStudentSectionInformation";
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
import { Progress } from "@/components/ui/progress";

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
  const [studentInformation, setStudentInformation] = useState({
    dob: "",
    age: 0,
    gender: "",
    adhaar: "",
    address: "",
    school: "",
    board: "",
    medium: "",
  });
  const [guardianInformation, setGuardianInformation] = useState({
    motherFirstName: "",
    motherMiddleName: "",
    motherLastName: "",
    motherOccupation: "",
    motherDesignation: "",
    motherExServiceWomen: false,
    motherContactNumber: "",
    fatherFirstName: "",
    fatherMiddleName: "",
    fatherLastName: "",
    fatherOccupation: "",
    fatherDesignation: "",
    fatherExServiceMen: false,
    fatherContactNumber: "",
  });
  const [siblingInformation, setSiblingInformation] = useState([]);
  const [tempSiblingInformation, setTempSiblingInformation] = useState({
    siblingName: "",
    age: 0,
    status: "",
    organization: "",
  });
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [batch, setBatch] = useState("");
  const [ay, setAy] = useState("");
  const [parentSectionInformation, setParentSectionInformation] = useState({
    expectationsWithShishyakul: "",
    strengthAndWeakness: "",
    medicalAllergiesAndConcerns: "",
  });
  const [studentSectionInformation, setStudentSectionInformation] = useState({
    describeYourself: "",
    passion: "",
    skills: "",
    hobbies: "",
    dreams: "",
    achievements: "",
    strength: "",
    weakness: "",
    thingsWantToImprove: "",
    anythingToShare: "",
    expectationsWithShishyakul: "",
  });

  const [isParentSectionNull, setIsParentSectionNull] = useState(false);
  const [isStudentBasicInfoNull, setIsStudentBasicInfoNull] = useState(false);

  // Add state for Student Information collapsible
  const [isStudentInformationOpen, setIsStudentInformationOpen] =
    useState(true);
  const [isGuardianInformationOpen, setIsGuardianInformationOpen] =
    useState(false);
  const [isSiblingInformationOpen, setIsSiblingInformationOpen] =
    useState(false);
  const [isParentSectionOpen, setIsParentSectionOpen] = useState(false);
  const [isStudentSectionOpen, setIsStudentSectionOpen] = useState(false);

  const { ay: pAy, grade: pGrade, id } = useParams();
  const router = useRouter();

  const [profileCompletionData, setProfileCompletionData] = useState({
    studentInfo: { percentage: 0, missingFields: [] },
    guardianInfo: { percentage: 0, missingFields: [] },
    siblingInfo: { percentage: 0, missingFields: [] },
    parentSection: { percentage: 0, missingFields: [] },
    studentSection: { percentage: 0, missingFields: [] },
    overall: 0,
  });

  // Query - Get Student Profile Information
  const { data, loading, error } = useSuspenseQuery(GET_STUDENT_PROFILE, {
    variables: { ay: pAy, grade: pGrade, userId: id },
  });

  // Mutations - Update Student Details
  const [updateStudent] = useMutation(UPDATE_STUDENT, {
    // onCompleted: () => console.log("COMPLETED"),
    onCompleted: () => {
      // console.log("SUCCESS COMPLETED");
      // toast.success("Updated Successfully");
    },
    refetchQueries: [
      {
        query: GET_STUDENT_PROFILE,
        variables: { userId: id },
      },
    ],
  });

  if (loading) return <div>Loading...</div>;

  if (error) {
    return <div>Error...</div>;
  }

  // console.log("DATA", data);

  useEffect(() => {
    if (data?.student?.studentInformation != null) {
      setStudentInformation({
        dob: data?.student?.studentInformation?.dob,
        age: data?.student?.studentInformation?.age,
        gender: data?.student?.studentInformation?.gender,
        adhaar: data?.student?.studentInformation?.adhaar,
        address: data?.student?.studentInformation?.address,
        school: data?.student?.studentInformation?.school,
        board: data?.student?.studentInformation?.board,
        medium: data?.student?.studentInformation?.medium,
      });
    }
    if (data?.student?.guardianInformation != null) {
      setGuardianInformation({
        motherFirstName: data?.student?.guardianInformation?.motherFirstName,
        motherMiddleName: data?.student?.guardianInformation?.motherMiddleName,
        motherLastName: data?.student?.guardianInformation?.motherLastName,
        motherOccupation: data?.student?.guardianInformation?.motherOccupation,
        motherDesignation:
          data?.student?.guardianInformation?.motherDesignation,
        motherExServiceWomen:
          data?.student?.guardianInformation?.motherExServiceWomen,
        motherContactNumber:
          data?.student?.guardianInformation?.motherContactNumber,
        fatherFirstName: data?.student?.guardianInformation?.fatherFirstName,
        fatherMiddleName: data?.student?.guardianInformation?.fatherMiddleName,
        fatherLastName: data?.student?.guardianInformation?.fatherLastName,
        fatherOccupation: data?.student?.guardianInformation?.fatherOccupation,
        fatherDesignation:
          data?.student?.guardianInformation?.fatherDesignation,
        fatherExServiceMen:
          data?.student?.guardianInformation?.fatherExServiceMen,
        fatherContactNumber:
          data?.student?.guardianInformation?.fatherContactNumber,
      });
    }
    if (data?.student?.siblingInformation != null) {
      let arr = [];
      data?.student.siblingInformation.map((sibling) => {
        arr.push({
          siblingName: sibling?.siblingName,
          age: sibling?.age,
          status: sibling?.status,
          organization: sibling?.organization,
        });
      });
      setSiblingInformation(arr);
    }

    if (data?.student?.parentSection != null) {
      setParentSectionInformation({
        expectationsWithShishyakul:
          data?.student?.parentSection?.expectationsWithShishyakul,
        strengthAndWeakness: data?.student?.parentSection?.strengthAndWeakness,
        medicalAllergiesAndConcerns:
          data?.student?.parentSection?.medicalAllergiesAndConcerns,
      });
    }

    if (data?.student?.studentSection != null) {
      setStudentSectionInformation({
        describeYourself: data?.student?.studentSection?.describeYourself,
        passion: data?.student?.studentSection?.passion,
        skills: data?.student?.studentSection?.skills,
        hobbies: data?.student?.studentSection?.hobbies,
        dreams: data?.student?.studentSection?.dreams,
        achievements: data?.student?.studentSection?.achievements,
        strength: data?.student?.studentSection?.strength,
        weakness: data?.student?.studentSection?.weakness,
        thingsWantToImprove: data?.student?.studentSection?.thingsWantToImprove,
        anythingToShare: data?.student?.studentSection?.anythingToShare,
        expectationsWithShishyakul:
          data?.student?.studentSection?.expectationsWithShishyakul,
      });
    }

    if (data?.student?.firstname != null) setFirstName(data?.student.firstname);
    if (data?.student?.middlename != null)
      setMiddleName(data?.student.middlename);
    if (data?.student?.lastname != null) setLastName(data?.student.lastname);
    if (data?.student?.phone != null) setPhone(data?.student.phone);
    if (data?.student?.grade != null) setGrade(data?.student.grade);
    if (data?.student?.batch != null) setBatch(data?.student.batch);
    if (data?.student?.ay != null) setAy(data?.student.ay);

    if (data?.student?.parentSection === null) {
      setIsParentSectionNull(true);
    }

    if (data?.student?.studentSection === null) {
      setIsStudentBasicInfoNull(true);
    }

    // Calculate profile completion percentages
    if (data?.student) {
      const studentInfo = calculateStudentInfoCompletion(
        data.student.studentInformation
      );
      const guardianInfo = calculateGuardianInfoCompletion(
        data.student.guardianInformation
      );
      const siblingInfo = calculateSiblingInfoCompletion(
        data.student.siblingInformation
      );
      const parentSection = calculateParentSectionCompletion(
        data.student.parentSection
      );
      const studentSection = calculateStudentSectionCompletion(
        data.student.studentSection
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
  }, [data]);

  const updateInformationHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating Information...");

    if (
      firstName == "" ||
      middleName == "" ||
      lastName == "" ||
      phone == "" ||
      grade == "" ||
      ay == ""
    ) {
      toast.error("Please Fill All Required Fields!", {
        id: toastId,
      });
      return;
    }

    let aySplit = ay.split("-");
    if (
      aySplit.length !== 2 ||
      aySplit[0].length !== 4 ||
      aySplit[1].length !== 4 ||
      Number(aySplit[0]) > Number(aySplit[1]) ||
      Number(aySplit[0]) + 1 !== Number(aySplit[1])
    ) {
      toast.error("Enter Correct Academic Year!", {
        id: toastId,
      });
      return;
    }

    // Update Student Details
    const updateResp = await updateStudent({
      variables: {
        userId: id,
        firstname: firstName,
        middlename: middleName,
        lastname: lastName,
        phone: phone,
        ay: pAy,
        newAy: pAy === ay ? null : ay,
        grade: pGrade,
        newGrade: pGrade === grade ? null : grade,
        batch: batch,
        studentInformation: studentInformation,
        guardianInformation: guardianInformation,
        siblingInformation: siblingInformation,
        parentSection: parentSectionInformation,
        studentSection: studentSectionInformation,
      },
    });

    if (updateResp?.data.updateStudent === "SUCCESS") {
      // Recalculate completion percentages
      const studentInfo = calculateStudentInfoCompletion(studentInformation);
      const guardianInfo = calculateGuardianInfoCompletion(guardianInformation);
      const siblingInfo = calculateSiblingInfoCompletion(siblingInformation);
      const parentSection = calculateParentSectionCompletion(
        parentSectionInformation
      );
      const studentSection = calculateStudentSectionCompletion(
        studentSectionInformation
      );

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

      toast.success("Information Updated Successfully!", {
        id: toastId,
      });

      if (pAy !== ay || pGrade !== grade) {
        router.push(`/student/${ay}/${grade}/${id}`);
      }
    } else {
      toast.error(updateResp?.data.updateStudent, {
        id: toastId,
      });
    }
  };

  // Helper component for section completion indicator
  const SectionCompletionIndicator = ({ percentage }) => {
    const getColorClass = () => {
      if (percentage >= 90) return "text-green-600";
      if (percentage >= 50) return "text-amber-500";
      return "text-red-600";
    };

    return (
      <div className="flex items-center gap-2">
        {percentage < 100 && (
          <AlertTriangle className={`h-4 w-4 ${getColorClass()}`} />
        )}
        <span className={`text-sm font-medium ${getColorClass()}`}>
          {percentage}% Complete
        </span>
      </div>
    );
  };

  return (
    <Container>
      <div className="py-10 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <Link
            href={`/student/${pAy}/${pGrade}/${id}`}
            className="flex items-center gap-2 text-[16px] text-center border-2 border-main rounded px-4 py-2"
          >
            <ArrowLeft size={16} /> Go Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">Overall Completion:</span>
            <span className="text-lg font-bold">
              {profileCompletionData.overall}%
            </span>
          </div>
        </div>

        <div className="mb-4">
          <Progress value={profileCompletionData.overall} className="h-3" />
        </div>

        {/* Student Information Section */}
        <Collapsible
          open={isStudentInformationOpen}
          onOpenChange={() =>
            setIsStudentInformationOpen(!isStudentInformationOpen)
          }
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center">
            <span className="barlow-semibold text-xl">Student Information</span>
            <div className="flex items-center gap-2">
              <SectionCompletionIndicator
                percentage={profileCompletionData.studentInfo.percentage}
              />
              {isStudentInformationOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 barlow-regular text-md">
            <ProfileStudentInformation
              firstName={firstName}
              setFirstName={setFirstName}
              middleName={middleName}
              setMiddleName={setMiddleName}
              lastName={lastName}
              batch={batch}
              setBatch={setBatch}
              phone={phone}
              setPhone={setPhone}
              ay={ay}
              setAy={setAy}
              grade={grade}
              setGrade={setGrade}
              studentInformation={studentInformation}
              setStudentInformation={setStudentInformation}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="w-full my-6" />

        {/* Guardian Information Section */}
        <Collapsible
          open={isGuardianInformationOpen}
          onOpenChange={() =>
            setIsGuardianInformationOpen(!isGuardianInformationOpen)
          }
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center">
            <span className="barlow-semibold text-xl">
              Guardian Information
            </span>
            <div className="flex items-center gap-2">
              <SectionCompletionIndicator
                percentage={profileCompletionData.guardianInfo.percentage}
              />
              {isGuardianInformationOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 barlow-regular text-md">
            <ProfileGuardianInformation
              guardianInformation={guardianInformation}
              setGuardianInformation={setGuardianInformation}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="w-full my-6" />

        {/* Sibling Information Section */}
        <Collapsible
          open={isSiblingInformationOpen}
          onOpenChange={() =>
            setIsSiblingInformationOpen(!isSiblingInformationOpen)
          }
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center">
            <span className="barlow-semibold text-xl">
              Siblings Information
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-secondary">
                {siblingInformation.length}{" "}
                {siblingInformation.length === 1 ? "Sibling" : "Siblings"} Added
              </span>
              {isSiblingInformationOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 barlow-regular text-md">
            <ProfileSiblingInformation
              tempSiblingInformation={tempSiblingInformation}
              setTempSiblingInformation={setTempSiblingInformation}
              siblingInformation={siblingInformation}
              setSiblingInformation={setSiblingInformation}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="w-full my-6" />

        {/* Parent Section */}
        <Collapsible
          open={isParentSectionOpen}
          onOpenChange={() => setIsParentSectionOpen(!isParentSectionOpen)}
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center">
            <span className="barlow-semibold text-xl">Parent Section</span>
            <div className="flex items-center gap-2">
              <SectionCompletionIndicator
                percentage={profileCompletionData.parentSection.percentage}
              />
              {isParentSectionNull && (
                <div className="text-red-700">
                  <ShieldAlert />
                </div>
              )}
              {isParentSectionOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 barlow-regular text-md">
            <ProfileParentSectionInformation
              parentSectionInformation={parentSectionInformation}
              setParentSectionInformation={setParentSectionInformation}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="w-full my-6" />

        {/* Student Basic Information Section */}
        <Collapsible
          open={isStudentSectionOpen}
          onOpenChange={() => setIsStudentSectionOpen(!isStudentSectionOpen)}
        >
          <CollapsibleTrigger className="flex w-full justify-between items-center">
            <span className="barlow-semibold text-xl">
              Student Basic Information
            </span>
            <div className="flex items-center gap-2">
              <SectionCompletionIndicator
                percentage={profileCompletionData.studentSection.percentage}
              />
              {isStudentBasicInfoNull && (
                <div className="text-red-700">
                  <ShieldAlert />
                </div>
              )}
              {isStudentSectionOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 barlow-regular text-md">
            <ProfileStudentSectionInformation
              studentSectionInformation={studentSectionInformation}
              setStudentSectionInformation={setStudentSectionInformation}
            />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-end mt-12">
          <Button onClick={updateInformationHandler}>Update Information</Button>
        </div>
      </div>
    </Container>
  );
};

export default page;

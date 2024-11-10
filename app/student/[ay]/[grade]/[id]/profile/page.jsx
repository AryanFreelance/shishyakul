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
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import ProfileStudentSectionInformation from "@/components/private/studentPage/ProfileStudentSectionInformation";

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

  // Collapsible Open States
  // const [isStudentInformationOpen, setIsStudentInformationOpen] =
  //   useState(false);
  const [isGuardianInformationOpen, setIsGuardianInformationOpen] =
    useState(false);
  const [isSiblingInformationOpen, setIsSiblingInformationOpen] =
    useState(false);
  const [isParentSectionOpen, setIsParentSectionOpen] = useState(false);
  const [isStudentSectionOpen, setIsStudentSectionOpen] = useState(false);

  const { ay: pAy, grade: pGrade, id } = useParams();
  const router = useRouter();

  // Query - Get Student Profile Information
  const { data, loading, error } = useSuspenseQuery(GET_STUDENT_PROFILE, {
    variables: { ay: pAy, grade: pGrade, userId: id },
  });

  // Mutations - Update Student Details
  const [updateStudent] = useMutation(UPDATE_STUDENT, {
    // onCompleted: () => console.log("COMPLETED"),
    onCompleted: () => {
      console.log("SUCCESS COMPLETED");
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
    console.log("DATA", data);
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

    // Check if all the parents and students field are filled or not
    if (
      parentSectionInformation.expectationsWithShishyakul === "" ||
      parentSectionInformation.strengthAndWeakness === "" ||
      parentSectionInformation.medicalAllergiesAndConcerns === "" ||
      studentSectionInformation.describeYourself === "" ||
      studentSectionInformation.passion === "" ||
      studentSectionInformation.skills === "" ||
      studentSectionInformation.hobbies === "" ||
      studentSectionInformation.dreams === "" ||
      studentSectionInformation.achievements === "" ||
      studentSectionInformation.strength === "" ||
      studentSectionInformation.weakness === "" ||
      studentSectionInformation.thingsWantToImprove === "" ||
      studentSectionInformation.anythingToShare === ""
    ) {
      toast.error("Please Fill Parents & Student Information First!", {
        id: toastId,
      });
      return;
    }

    const info = {
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
    };

    console.log("INFO", info);

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

    console.log("UPDATERESP", updateResp);

    if (updateResp?.data.updateStudent === "SUCCESS") {
      console.log("AY", ay, pAy, grade, pGrade);

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

  return (
    <Container>
      <div className="flex items-center w-fit">
        <Link href={`/student/${ay}/${grade}/${id}`}>
          <div className="p-4 my-6 text-[20px] w-fit barlow-semibold flex items-center gap-2">
            <ArrowLeft /> Go Back
          </div>
        </Link>
      </div>

      <div className="py-4">
        <h2 className="subheading mb-8">Welcome {firstName}</h2>
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
        {/* </CollapsibleContent>
        </Collapsible> */}

        <Separator className="w-full my-6" />

        <Collapsible
          open={isGuardianInformationOpen}
          onOpenChange={() =>
            setIsGuardianInformationOpen(!isGuardianInformationOpen)
          }
        >
          <CollapsibleTrigger className="flex w-full justify-between">
            <span className="barlow-semibold text-xl">
              Guardian Information
            </span>
            {isGuardianInformationOpen ? <ChevronUp /> : <ChevronDown />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 barlow-regular text-md">
            <ProfileGuardianInformation
              guardianInformation={guardianInformation}
              setGuardianInformation={setGuardianInformation}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="w-full my-6" />

        <Collapsible
          open={isSiblingInformationOpen}
          onOpenChange={() =>
            setIsSiblingInformationOpen(!isSiblingInformationOpen)
          }
        >
          <CollapsibleTrigger className="flex w-full justify-between">
            <span className="barlow-semibold text-xl">
              Sibilings Information
            </span>
            {isSiblingInformationOpen ? <ChevronUp /> : <ChevronDown />}
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

        <Collapsible
          open={isParentSectionOpen}
          onOpenChange={() => setIsParentSectionOpen(!isParentSectionOpen)}
        >
          <CollapsibleTrigger className="flex w-full justify-between">
            <span className="barlow-semibold text-xl">Parent Section</span>
            {isParentSectionOpen ? <ChevronUp /> : <ChevronDown />}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 barlow-regular text-md">
            <ProfileParentSectionInformation
              parentSectionInformation={parentSectionInformation}
              setParentSectionInformation={setParentSectionInformation}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="w-full my-6" />

        <Collapsible
          open={isStudentSectionOpen}
          onOpenChange={() => setIsStudentSectionOpen(!isStudentSectionOpen)}
        >
          <CollapsibleTrigger className="flex w-full justify-between">
            <span className="barlow-semibold text-xl">
              Student Basic Information
            </span>
            {isStudentSectionOpen ? <ChevronUp /> : <ChevronDown />}
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

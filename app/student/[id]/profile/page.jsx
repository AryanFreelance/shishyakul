"use client";

import Container from "@/components/shared/Container";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, TrashIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_STUDENT_PROFILE } from "@/graphql/queries/students.query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { UPDATE_STUDENT } from "@/graphql/mutations/students.mutation";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";

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
  const [isTempSiblingAddDialogOpen, setIsTempSiblingAddDialogOpen] =
    useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");

  const { id } = useParams();

  // Query - Get Student Profile Information
  const { data, loading, error } = useSuspenseQuery(GET_STUDENT_PROFILE, {
    variables: { userId: id },
  });

  // Mutations - Update Student Details
  const [updateStudent] = useMutation(UPDATE_STUDENT);

  console.log(data, loading, error);

  if (loading) return <div>Loading...</div>;

  if (error) {
    console.log(error);
    return <div>Error...</div>;
  }

  useEffect(() => {
    if (data?.student.studentInformation != null) {
      setStudentInformation({
        dob: data?.student.studentInformation.dob,
        age: data?.student.studentInformation.age,
        gender: data?.student.studentInformation.gender,
        adhaar: data?.student.studentInformation.adhaar,
        address: data?.student.studentInformation.address,
        school: data?.student.studentInformation.school,
        board: data?.student.studentInformation.board,
        medium: data?.student.studentInformation.medium,
      });
    }
    if (data?.student.guardianInformation != null) {
      setGuardianInformation({
        motherFirstName: data?.student.guardianInformation.motherFirstName,
        motherMiddleName: data?.student.guardianInformation.motherMiddleName,
        motherLastName: data?.student.guardianInformation.motherLastName,
        motherOccupation: data?.student.guardianInformation.motherOccupation,
        motherDesignation: data?.student.guardianInformation.motherDesignation,
        motherExServiceWomen:
          data?.student.guardianInformation.motherExServiceWomen,
        motherContactNumber:
          data?.student.guardianInformation.motherContactNumber,
        fatherFirstName: data?.student.guardianInformation.fatherFirstName,
        fatherMiddleName: data?.student.guardianInformation.fatherMiddleName,
        fatherLastName: data?.student.guardianInformation.fatherLastName,
        fatherOccupation: data?.student.guardianInformation.fatherOccupation,
        fatherDesignation: data?.student.guardianInformation.fatherDesignation,
        fatherExServiceMen:
          data?.student.guardianInformation.fatherExServiceMen,
        fatherContactNumber:
          data?.student.guardianInformation.fatherContactNumber,
      });
    }
    if (data?.student.siblingInformation != null) {
      let arr = [];
      data?.student.siblingInformation.map((sibling) => {
        arr.push({
          siblingName: sibling.siblingName,
          age: sibling.age,
          status: sibling.status,
          organization: sibling.organization,
        });
      });
      setSiblingInformation(arr);
    }

    if (data?.student.firstname != null) setFirstName(data?.student.firstname);
    if (data?.student.middlename != null)
      setMiddleName(data?.student.middlename);
    if (data?.student.lastname != null) setLastName(data?.student.lastname);
    if (data?.student.phone != null) setPhone(data?.student.phone);
    if (data?.student.grade != null) setGrade(data?.student.grade);
  }, []);

  const updateInformationHandler = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating Information...");

    // Update Student Details
    await updateStudent({
      variables: {
        userId: id,
        firstname: firstName,
        middlename: middleName,
        lastname: lastName,
        phone: phone,
        grade: grade,
        studentInformation: studentInformation,
        guardianInformation: guardianInformation,
        siblingInformation: siblingInformation,
      },
    });

    toast.success("Information Updated Successfully!", {
      id: toastId,
    });
  };

  const addSiblingInformation = (e) => {
    e.preventDefault();
    if (
      tempSiblingInformation.siblingName === "" ||
      tempSiblingInformation.age === 0 ||
      tempSiblingInformation.status === "" ||
      tempSiblingInformation.organization === ""
    ) {
      toast.error("Please fill all the fields!");
      return;
    }
    setSiblingInformation([
      ...siblingInformation,
      {
        siblingName: tempSiblingInformation.siblingName,
        age: parseInt(tempSiblingInformation.age),
        status: tempSiblingInformation.status,
        organization: tempSiblingInformation.organization,
      },
    ]);
    setTempSiblingInformation({
      siblingName: "",
      age: 0,
      status: "",
      organization: "",
    });

    setIsTempSiblingAddDialogOpen(false);
  };

  const deleteSiblingInformationHandler = (e, siblingName) => {
    e.preventDefault();
    const updatedSiblingInformation = siblingInformation.filter(
      (sibling) => sibling.siblingName !== siblingName
    );
    setSiblingInformation(updatedSiblingInformation);
    toast.success("Sibling Deleted! To undo action just reload the page.");
  };

  return (
    <Container>
      <Link href={`/student/${id}`}>
        <div className="py-10 text-[20px] barlow-semibold flex items-center gap-2">
          <ArrowLeft /> Go Back
        </div>
      </Link>

      <div className="py-4">
        <h2 className="subheading mb-8">Student Name</h2>
        <div>
          <h3 className="subsubheading text-secondary">Student Information</h3>
          <div className="mt-6">
            <form className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="first-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    First Name
                  </Label>
                  <input
                    type="text"
                    id="first-name"
                    className="input-taking w-full"
                    placeholder="Update First Name..."
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="middle-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Middle Name
                  </Label>
                  <input
                    type="text"
                    id="middle-name"
                    className="input-taking w-full"
                    placeholder="Update Middle Name..."
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="last-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Last Name
                  </Label>
                  <input
                    type="text"
                    id="last-name"
                    className="input-taking w-full"
                    placeholder="Update Last Name..."
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="dob"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    DOB
                  </Label>
                  <input
                    type="date"
                    id="dob"
                    className="input-taking w-full"
                    placeholder="Update Date of Birth..."
                    value={studentInformation.dob}
                    onChange={(e) => {
                      setStudentInformation({
                        ...studentInformation,
                        dob: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="age"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Age
                  </Label>
                  <input
                    type="number"
                    id="age"
                    className="input-taking w-full"
                    placeholder="Update Age..."
                    value={studentInformation.age}
                    onChange={(e) => {
                      setStudentInformation({
                        ...studentInformation,
                        age: parseInt(e.target.value),
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="gender"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Gender
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setStudentInformation({
                        ...studentInformation,
                        gender: value,
                      })
                    }
                  >
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue placeholder={studentInformation.gender} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="email-id"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Email ID
                  </Label>
                  <input
                    type="email"
                    id="email-id"
                    className="input-taking w-full disabled:bg-black/10"
                    placeholder="Update Email ID..."
                    value={data?.student.email}
                    disabled
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="contact-number"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Contact Number
                  </Label>
                  <input
                    type="tel"
                    id="contact-number"
                    className="input-taking w-full"
                    placeholder="Update Contact Number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="aadhaar-card"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Aadhaar Card
                  </Label>
                  <input
                    type="text"
                    id="aadhaar-card"
                    className="input-taking w-full"
                    placeholder="Update Aadhar Card..."
                    value={studentInformation.adhaar}
                    onChange={(e) => {
                      setStudentInformation({
                        ...studentInformation,
                        adhaar: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="residential-address"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Residential Address
                  </Label>
                  <textarea
                    type="text"
                    id="residential-address"
                    className="input-taking w-full resize-none"
                    placeholder="Update Residential Address..."
                    rows={4}
                    value={studentInformation.address}
                    onChange={(e) =>
                      setStudentInformation({
                        ...studentInformation,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="school-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    School Name
                  </Label>
                  <input
                    type="text"
                    id="school-name"
                    className="input-taking w-full resize-none"
                    placeholder="Update School Name..."
                    value={studentInformation.school}
                    onChange={(e) =>
                      setStudentInformation({
                        ...studentInformation,
                        school: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="current-class"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Current Class
                  </Label>
                  <input
                    type="text"
                    id="current-class"
                    className="input-taking w-full"
                    placeholder="Update Current Class..."
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="board"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Board
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setStudentInformation({
                        ...studentInformation,
                        board: value,
                      })
                    }
                  >
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue placeholder={studentInformation.board} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="state">State Board</SelectItem>
                      <SelectItem value="cbse">CBSE Board</SelectItem>
                      <SelectItem value="icse">ICSE Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="medium"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Medium
                  </Label>
                  <input
                    type="text"
                    id="medium"
                    className="input-taking w-full"
                    placeholder="Update Medium..."
                    value={studentInformation.medium}
                    onChange={(e) =>
                      setStudentInformation({
                        ...studentInformation,
                        medium: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
        <Separator className="w-full my-6" />
        <div>
          <h3 className="subsubheading text-secondary">Guardian Information</h3>
          <div className="mt-6">
            <form className="flex flex-col gap-6">
              {/* Mother's Details */}
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="mother-first-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Mother's First Name
                  </Label>
                  <input
                    type="text"
                    id="mother-first-name"
                    className="input-taking w-full"
                    placeholder="Update Mother's First Name..."
                    value={guardianInformation.motherFirstName}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        motherFirstName: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="mother-middle-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Mother's Middle Name
                  </Label>
                  <input
                    type="text"
                    id="mother-middle-name"
                    className="input-taking w-full"
                    placeholder="Update Mother's Middle Name..."
                    value={guardianInformation.motherMiddleName}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        motherMiddleName: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="mother-last-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Mother's Last Name
                  </Label>
                  <input
                    type="text"
                    id="mother-last-name"
                    className="input-taking w-full"
                    placeholder="Update Mother's Last Name..."
                    value={guardianInformation.motherLastName}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        motherLastName: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="mother-occupation"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Mother's Occupation
                  </Label>
                  <input
                    type="text"
                    id="mother-occupation"
                    className="input-taking w-full"
                    placeholder="Update Mother's Occupation..."
                    value={guardianInformation.motherOccupation}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        motherOccupation: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="mother-designation"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Mother's Designation
                  </Label>
                  <input
                    type="text"
                    id="mother-designation"
                    className="input-taking w-full"
                    placeholder="Update Mother's Designation..."
                    value={guardianInformation.motherDesignation}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        motherDesignation: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label className="text-xl text-secondary barlow-medium mb-2">
                    Ex-Service Women
                  </Label>
                  <Select
                    onChange={(value) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        motherExServiceWomen: value === "Yes" ? true : false,
                      });
                    }}
                  >
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue
                        placeholder={
                          guardianInformation.motherExServiceWomen
                            ? "YES"
                            : "NO"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="mother-contact-number"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Mother's Contact Number
                  </Label>
                  <input
                    type="tel"
                    id="mother-contact-number"
                    className="input-taking w-full"
                    placeholder="Update Mother's Contact Number..."
                    value={guardianInformation.motherContactNumber}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        motherContactNumber: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              {/* Father's Details */}
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="father-first-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Father's First Name
                  </Label>
                  <input
                    type="text"
                    id="father-first-name"
                    className="input-taking w-full"
                    placeholder="Update Father's First Name..."
                    value={guardianInformation.fatherFirstName}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        fatherFirstName: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="father-middle-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Father's Middle Name
                  </Label>
                  <input
                    type="text"
                    id="father-middle-name"
                    className="input-taking w-full"
                    placeholder="Update Father's Middle Name..."
                    value={guardianInformation.fatherMiddleName}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        fatherMiddleName: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="father-last-name"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Father's Last Name
                  </Label>
                  <input
                    type="text"
                    id="father-last-name"
                    className="input-taking w-full"
                    placeholder="Update Father's Last Name..."
                    value={guardianInformation.fatherLastName}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        fatherLastName: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="father-occupation"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Father's Occupation
                  </Label>
                  <input
                    type="text"
                    id="father-occupation"
                    className="input-taking w-full"
                    placeholder="Update Father's Occupation..."
                    value={guardianInformation.fatherOccupation}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        fatherOccupation: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="father-designation"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Father's Designation
                  </Label>
                  <input
                    type="text"
                    id="father-designation"
                    className="input-taking w-full"
                    placeholder="Update Father's Designation..."
                    value={guardianInformation.fatherDesignation}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        fatherDesignation: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label className="text-xl text-secondary barlow-medium mb-2">
                    Ex-Service Man
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        fatherExServiceMen: value === "Yes" ? true : false,
                      });
                    }}
                  >
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue
                        placeholder={
                          guardianInformation.fatherExServiceMen ? "YES" : "NO"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="father-contact-number"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Father's Contact Number
                  </Label>
                  <input
                    type="tel"
                    id="father-contact-number"
                    className="input-taking w-full"
                    placeholder="Update Father's Contact Number..."
                    value={guardianInformation.fatherContactNumber}
                    onChange={(e) => {
                      setGuardianInformation({
                        ...guardianInformation,
                        fatherContactNumber: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
        <Separator className="w-full my-6" />
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h3 className="subsubheading text-secondary">
              Sibilings Information
            </h3>

            <Dialog open={isTempSiblingAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex gap-3 items-center mt-2 md:mt-0"
                  onClick={() => setIsTempSiblingAddDialogOpen(true)}
                >
                  Add <Plus />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Sibling</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter name..."
                      className="col-span-3"
                      value={tempSiblingInformation.siblingName}
                      onChange={(e) =>
                        setTempSiblingInformation({
                          ...tempSiblingInformation,
                          siblingName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right">
                      Age
                    </Label>
                    <Input
                      id="age"
                      placeholder="Enter age..."
                      className="col-span-3"
                      value={tempSiblingInformation.age}
                      onChange={(e) =>
                        setTempSiblingInformation({
                          ...tempSiblingInformation,
                          age: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Input
                      id="status"
                      placeholder="Studying / Working..."
                      className="col-span-3"
                      value={tempSiblingInformation.status}
                      onChange={(e) =>
                        setTempSiblingInformation({
                          ...tempSiblingInformation,
                          status: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="school-org" className="text-right">
                      School / Organization
                    </Label>
                    <Input
                      id="school-org"
                      placeholder="Enter school/organization..."
                      className="col-span-3"
                      value={tempSiblingInformation.organization}
                      onChange={(e) =>
                        setTempSiblingInformation({
                          ...tempSiblingInformation,
                          organization: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={addSiblingInformation}>
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="barlow-semibold w-[100px]">
                    Sr No.
                  </TableHead>
                  <TableHead className="barlow-semibold">Name</TableHead>
                  <TableHead className="barlow-semibold">Age</TableHead>
                  <TableHead className="barlow-semibold">Status</TableHead>
                  <TableHead className="barlow-semibold">
                    School / Organization
                  </TableHead>
                  <TableHead className="barlow-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siblingInformation.map((sibling, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{sibling.siblingName}</TableCell>
                    <TableCell>{sibling.age}</TableCell>
                    <TableCell>{sibling.status}</TableCell>
                    <TableCell>{sibling.organization}</TableCell>
                    <TableCell>
                      <Button
                        onClick={(e) =>
                          deleteSiblingInformationHandler(
                            e,
                            sibling.siblingName
                          )
                        }
                      >
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-12">
              <Button onClick={updateInformationHandler}>
                Update Information
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default page;

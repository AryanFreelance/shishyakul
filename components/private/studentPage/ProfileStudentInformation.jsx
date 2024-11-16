import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const ProfileStudentInformation = ({
  firstName,
  setFirstName,
  middleName,
  setMiddleName,
  lastName,
  setLastName,
  batch,
  setBatch,
  phone,
  setPhone,
  ay,
  setAy,
  grade,
  setGrade,
  studentInformation,
  setStudentInformation,
}) => {
  return (
    <div className="m-2 p-2">
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
                htmlFor="batch"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Batch
              </Label>
              <input
                type="text"
                id="batch"
                // min={1}
                // max={10}
                className="input-taking w-full disabled:bg-black/10"
                placeholder="Update Batch..."
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
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
            <div className="flex flex-col w-full">
              <Label
                htmlFor="ay"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Academic Year
              </Label>
              <input
                type="text"
                id="ay"
                className="input-taking w-full disabled:bg-black/10"
                placeholder="Update A.Y..."
                value={ay}
                onChange={(e) => setAy(e.target.value)}
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
  );
};

export default ProfileStudentInformation;

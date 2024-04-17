import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { Label } from "@/components/ui/label";
import { dashboardNavLinks } from "@/constants";
import React from "react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const page = () => {
  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />

      <div className="pb-10">
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
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="gender"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Gender
                  </Label>
                  <Select>
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue placeholder="Select Gender" />
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
                    className="input-taking w-full"
                    placeholder="Update Email ID..."
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
                    type="number"
                    id="aadhaar-card"
                    className="input-taking w-full"
                    placeholder="Update Aadhar Card..."
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
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="board"
                    className="text-xl text-secondary barlow-medium mb-2"
                  >
                    Board
                  </Label>
                  <Select>
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue placeholder="Select Board" />
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
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Update</Button>
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
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label className="text-xl text-secondary barlow-medium mb-2">
                    Ex-Service Women
                  </Label>
                  <Select>
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue placeholder="Ex-Service Women?" />
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
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex flex-col w-full">
                  <Label className="text-xl text-secondary barlow-medium mb-2">
                    Ex-Service Man
                  </Label>
                  <Select>
                    <SelectTrigger className="input-taking w-full py-6 border-2 border-secondary">
                      <SelectValue placeholder="Ex-Service Man?" />
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
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Update</Button>
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

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex gap-3 items-center mt-2 md:mt-0"
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
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add</Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="barlow-medium">1</TableCell>
                  <TableCell className="barlow-regular">Aryan Shinde</TableCell>
                  <TableCell className="barlow-regular">17</TableCell>
                  <TableCell className="barlow-regular">Studying</TableCell>
                  <TableCell className="barlow-regular">
                    Vidyalankar Polytechnic
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6">
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default page;

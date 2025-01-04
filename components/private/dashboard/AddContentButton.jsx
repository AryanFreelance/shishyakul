"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addTeacher, addTestimonial } from "@/actions/dashboard/addContent";

const AddContentButton = ({ type }) => {
  // Input Fields for type:
  // teacher - name, subject, profileImg
  // testimonial - rating, description, name, designation, grade, percentage

  // Teacher Field States
  const [profileImg, setProfileImg] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [subject, setSubject] = useState("");

  // Testimonial Field States
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [studentName, setStudentName] = useState("");
  const [designation, setDesignation] = useState("");
  const [grade, setGrade] = useState("");
  const [percentage, setPercentage] = useState(0);

  const addContentHandler = () => {
    if (type === "teacher") {
      addTeacher({ profileImg, name: teacherName, subject });
      console.log("TEACHER ADDED SUCCESSFULLY");
    }
    if (type === "testimonial") {
      addTestimonial({
        rating,
        description,
        name: studentName,
        designation,
        grade,
        percentage,
      });
      console.log("TESTIMONIAL ADDED SUCCESSFULLY");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          Add {type.charAt(0).toUpperCase() + type.slice(1)} <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add {type.charAt(0).toUpperCase() + type.slice(1)}.
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {type === "teacher" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Input
                  id="subject"
                  className="col-span-3"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profile" className="text-right">
                  Profile
                </Label>
                <Input
                  id="profile"
                  type="file"
                  className="col-span-3"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => setProfileImg(e.target.files[0])}
                />
              </div>
            </>
          )}
          {type === "testimonial" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">
                  Rating
                </Label>
                <Input
                  id="rating"
                  type="number"
                  className="col-span-3"
                  value={rating}
                  defaultValue="5"
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Testimonial
                </Label>
                <Input
                  id="description"
                  className="col-span-3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="designation" className="text-right">
                  Designation
                </Label>
                <Input
                  id="designation"
                  className="col-span-3"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentage" className="text-right">
                  Percentage
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  className="col-span-3"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                  Grade
                </Label>
                <Input
                  id="grade"
                  className="col-span-3"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={addContentHandler}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentButton;

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
import { Pencil } from "lucide-react";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const EditContentButton = ({ type, id, data }) => {
  // Teacher Field States
  const [teacherName, setTeacherName] = useState(
    type === "teacher" ? data.name : ""
  );
  const [subject, setSubject] = useState(
    type === "teacher" ? data.subject : ""
  );

  // Testimonial Field States
  const [rating, setRating] = useState(
    type === "testimonial" ? data.rating : 0
  );
  const [description, setDescription] = useState(
    type === "testimonial" ? data.description : ""
  );
  const [studentName, setStudentName] = useState(
    type === "testimonial" ? data.name : ""
  );
  const [designation, setDesignation] = useState(
    type === "testimonial" ? data.designation : ""
  );
  const [grade, setGrade] = useState(type === "testimonial" ? data.grade : "");
  const [percentage, setPercentage] = useState(
    type === "testimonial" ? data.percentage : 0
  );

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const editContentHandler = async () => {
    setLoading(true);
    try {
      if (type === "teacher") {
        const teacherRef = doc(db, "teachers", id);
        await updateDoc(teacherRef, {
          name: teacherName,
          subject: subject,
        });
        console.log("TEACHER Edited SUCCESSFULLY");
        toast.success("Teacher edited successfully");
      }
      if (type === "testimonial") {
        const testimonialRef = doc(db, "testimonials", id);
        await updateDoc(testimonialRef, {
          rating: rating,
          description: description,
          studentName: studentName,
          designation: designation,
          grade: grade,
          percentage: percentage,
        });
        console.log("TESTIMONIAL Edited SUCCESSFULLY");
        toast.success("Testimonial edited successfully");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Failed to edit content");
      console.error("Error editing content: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="border-2 border-emerald-900 rounded-sm w-full flex items-center justify-center px-2 py-1 bg-emerald-900 text-white hover:bg-emerald-900/90 hover:text-white transition-all duration-200 ease-in-out cursor-pointer"
        >
          <Pencil />
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
          <Button type="submit" onClick={editContentHandler} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentButton;

"use client";

import { Button } from "@/components/ui/button";
import { Loader, Trash } from "lucide-react";
import React, { useState } from "react";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { db } from "@/firebase";
import toast from "react-hot-toast";

const DeleteContentButton = ({ type, id }) => {
  const [loading, setLoading] = useState(false);

  const deleteHandler = async () => {
    // Add confirmation before proceeding with deletion
    const confirmed = confirm("Are you sure you want to delete this content?");
    if (!confirmed) return; // Exit if not confirmed

    setLoading(true);
    try {
      if (type === "teacher") {
        const teacherDocRef = doc(db, "teachers", id);
        const teacherDoc = await deleteDoc(teacherDocRef);
        console.log("Teacher deleted successfully", teacherDoc);
        toast.success("Teacher deleted successfully");
        const imageRef = ref(storage, `teachers/${id}/profileImage`);

        await deleteObject(imageRef);

        console.log(
          "Teacher and associated profile image deleted successfully."
        );
      }

      if (type === "testimonial") {
        const testimonialDocRef = doc(db, "testimonials", id);
        await deleteDoc(testimonialDocRef);
        console.log("Testimonial deleted successfully.");
        toast.success("Testimonial deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      asChild
      onClick={deleteHandler}
      variant="ghost"
      disabled={loading}
      className={`${
        loading
          ? "opacity-50 cursor-not-allowed"
          : "border-2 border-red-800 rounded-sm w-full flex items-center justify-center px-2 py-1 bg-red-800 text-white hover:bg-red-800/90 hover:text-white transition-all duration-200 ease-in-out cursor-pointer"
      }`}
    >
      <div className="flex items-center">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader className="animate-spin" />
            <span>Deleting...</span>
          </div>
        ) : (
          <Trash />
        )}
      </div>
    </Button>
  );
};

export default DeleteContentButton;

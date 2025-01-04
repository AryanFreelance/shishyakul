"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import React from "react";

const ActionButtonTeachers = ({ type }) => {
  const deleteHandler = () => {
    if (type === "teacher") {
      console.log("delete teacher");
    }
    if (type === "testimonial") {
      console.log("delete testimonial");
    }
  };

  return (
    <div className="flex w-full justify-evenly items-center gap-2 mt-4">
      <div className="border-2 border-emerald-900 rounded-sm w-full flex items-center justify-center px-2 py-1 bg-emerald-900 text-white hover:bg-emerald-900/90 hover:text-white transition-all duration-200 ease-in-out cursor-pointer">
        <Pencil />
      </div>
      <Button asChild onClick={deleteHandler} variant="ghost">
        <div className="border-2 border-red-800 rounded-sm w-full flex items-center justify-center px-2 py-1 bg-red-800 text-white hover:bg-red-800/90 hover:text-white transition-all duration-200 ease-in-out cursor-pointer">
          <Trash />
        </div>
      </Button>
    </div>
  );
};

export default ActionButtonTeachers;

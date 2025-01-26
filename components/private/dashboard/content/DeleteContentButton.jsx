"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import React from "react";

const DeleteContentButton = ({ type, id }) => {
  const deleteHandler = () => {
    if (type === "teacher") {
      console.log("delete teacher");
    }
    if (type === "testimonial") {
      console.log("delete testimonial");
    }
  };
  return (
    <Button asChild onClick={deleteHandler} variant="ghost">
      <div className="border-2 border-red-800 rounded-sm w-full flex items-center justify-center px-2 py-1 bg-red-800 text-white hover:bg-red-800/90 hover:text-white transition-all duration-200 ease-in-out cursor-pointer">
        <Trash />
      </div>
    </Button>
  );
};

export default DeleteContentButton;

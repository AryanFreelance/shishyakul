import { cn } from "@/lib/utils";
import React from "react";

const Container = ({ children, className }) => {
  return (
    // <div className="flex justify-center items-center w-full">
    <div className={cn("flex justify-center items-center w-full", className)}>
      <div className="max-w-7xl w-full px-4 md:px-6">{children}</div>
    </div>
  );
};

export default Container;

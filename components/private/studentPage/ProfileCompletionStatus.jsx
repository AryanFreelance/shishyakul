"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

const ProfileCompletionStatus = ({
  sectionName,
  percentage,
  missingFields,
  ay,
  grade,
  id,
  siblingCount,
}) => {
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Special handling for Sibling Information section
  if (sectionName === "Sibling Information") {
    return (
      <div className="flex flex-col gap-2 p-4 border rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-secondary" />
            <h3 className="font-medium">{sectionName}</h3>
          </div>
          <span className="text-sm font-medium text-secondary">
            {siblingCount} {siblingCount === 1 ? "Sibling" : "Siblings"} Added
          </span>
        </div>
        <Link
          href={`/student/${ay}/${grade}/${id}/profile`}
          className="text-sm text-blue-600 hover:underline mt-1 inline-block"
        >
          View details
        </Link>
      </div>
    );
  }

  // Regular section display
  return (
    <div className="flex flex-col gap-2 p-4 border rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {percentage < 100 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This section is incomplete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          <h3 className="font-medium">{sectionName}</h3>
        </div>
        <span className="text-sm font-medium">{percentage}% Complete</span>
      </div>

      <Progress value={percentage} className="h-2" />

      {percentage < 100 && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            {missingFields.length > 0
              ? `Missing: ${missingFields
                  .slice(0, 3)
                  .map((field) => field.label || field)
                  .join(", ")}${
                  missingFields.length > 3
                    ? ` and ${missingFields.length - 3} more...`
                    : ""
                }`
              : "All fields completed!"}
          </p>
          <Link
            href={`/student/${ay}/${grade}/${id}/profile`}
            className="text-sm text-blue-600 hover:underline mt-1 inline-block"
          >
            Complete profile
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionStatus;

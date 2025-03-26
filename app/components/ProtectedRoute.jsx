"use client";

import React from "react";
import { usePermission } from "@/app/context/PermissionContext";
import InsufficientPermission from "./InsufficientPermission";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { hasPermission, loading } = usePermission();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-2xl barlow-bold">
        Loading...
      </div>
    );
  }

  // Convert old permission names to new ones if necessary
  let normalizedPermission = requiredPermission;
  if (requiredPermission === "ManageStudents") {
    normalizedPermission = "Students";
  } else if (requiredPermission === "Tests") {
    // Faculty can access Tests page
    normalizedPermission = requiredPermission.toLowerCase();
  } else if (requiredPermission === "Members") {
    // Only Content role can access Members page now
    normalizedPermission = "Content";
  }

  if (!hasPermission(normalizedPermission)) {
    return <InsufficientPermission />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

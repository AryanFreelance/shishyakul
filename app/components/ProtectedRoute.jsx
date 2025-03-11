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

  if (!hasPermission(requiredPermission)) {
    return <InsufficientPermission />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

"use client";

import React from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { usePermission } from "@/app/context/PermissionContext";

export default function TestsLayout({ children }) {
  const { permissions } = usePermission();

  // Allow access if user has Tests permission OR Faculty role
  const hasAccess = permissions.roles.Tests || permissions.roles.Faculty;

  if (hasAccess) {
    return <>{children}</>;
  }

  return <ProtectedRoute requiredPermission="Tests">{children}</ProtectedRoute>;
}

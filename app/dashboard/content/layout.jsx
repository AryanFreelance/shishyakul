"use client";

import React from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function ContentLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="Content">{children}</ProtectedRoute>
  );
}

"use client";

import React from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function TestsLayout({ children }) {
  return <ProtectedRoute requiredPermission="Tests">{children}</ProtectedRoute>;
}

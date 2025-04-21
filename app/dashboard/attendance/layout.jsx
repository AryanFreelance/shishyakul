"use client";

import React from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function AttendanceLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="Attendance">{children}</ProtectedRoute>
  );
}

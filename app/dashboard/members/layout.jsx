"use client";

import React from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function MembersLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="Members">{children}</ProtectedRoute>
  );
}

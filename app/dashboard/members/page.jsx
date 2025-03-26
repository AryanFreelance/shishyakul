"use client";
import React, { useEffect, useState } from "react";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import DevelopmentMode from "@/components/shared/DevelopmentMode";
import { MembersManagement } from "@/components/private/dashboard/members/MembersManagement";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { checkMemberRoles } from "@/utils/member-utils";

const MembersPage = () => {
  // Add state for permissions
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasMembersPermission, setHasMembersPermission] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Check user permissions
  useEffect(() => {
    const checkUserPermissions = async () => {
      setIsLoadingPermissions(true);

      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Check if admin
            const isAdminUser = user.email === "admin@shishyakul.in";
            setIsAdmin(isAdminUser);

            // Members management should only be accessible to admins
            // You can add specific role check here if needed
            const { roles } = await checkMemberRoles();
            const hasMembersRole = roles && roles.Members === true;

            // Only admins can manage members
            setHasMembersPermission(isAdminUser || hasMembersRole);
            setIsLoadingPermissions(false);
          } else {
            // Redirect to login if not authenticated
            window.location.href = "/login";
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error checking permissions:", error);
        setIsLoadingPermissions(false);
      }
    };

    checkUserPermissions();
  }, []);

  // Show loading indicator while checking permissions
  if (isLoadingPermissions) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-xl">Checking permissions...</p>
        </div>
      </Container>
    );
  }

  // Show access denied if user doesn't have permission
  if (!hasMembersPermission) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-lg text-center max-w-md">
            Only administrators can access the team management page.
          </p>
        </div>
      </Container>
    );
  }

  if (process.env.ENVIRONMENT === "production") {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <DevelopmentMode />
      </Container>
    );
  }

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      {/* Members Content Here... */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Team Management
      </h1>
      <MembersManagement />
    </Container>
  );
};

export default MembersPage;

import React from "react";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import DevelopmentMode from "@/components/shared/DevelopmentMode";
import { MembersManagement } from "@/components/private/dashboard/members/MembersManagement";

const MembersPage = () => {
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

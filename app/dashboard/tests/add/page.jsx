import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React from "react";
import Dropper from "@/components/Dropper";
import { Button } from "@/components/ui/button";

const page = () => {
  // Test Paper Form Fields - Test Name, Subject, Date, Total Marks, Question Paper (PDF)

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />
      <div className="pb-10">
        <h2 className="subheading">Add Test Paper</h2>
        <div className="mt-8 px-[4%] lg:px-[10%]">
          <form>
            <div className="flex flex-col w-full mb-4">
              <label htmlFor="test-name" className="input-label text-secondary">
                Test Name
              </label>
              <input
                type="text"
                id="test-name"
                className="input-taking"
                placeholder="Enter Test Name..."
              />
            </div>
            <div className="flex flex-col w-full mb-4">
              <label htmlFor="subject" className="input-label text-secondary">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="input-taking"
                placeholder="Enter Subject Name..."
              />
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-4">
              <div className="flex flex-col w-full lg:w-[50%] mb-4">
                <label htmlFor="date" className="input-label text-secondary">
                  Date
                </label>
                <input
                  type="text"
                  id="date"
                  className="input-taking"
                  placeholder="Enter Date of Test..."
                />
              </div>
              <div className="flex flex-col w-full lg:w-[50%] mb-4">
                <label
                  htmlFor="total-marks"
                  className="input-label text-secondary"
                >
                  Total Marks
                </label>
                <input
                  type="text"
                  id="total-marks"
                  className="input-taking"
                  placeholder="Enter Total Marks..."
                />
              </div>
            </div>
            <Dropper />
            <div>
              <Button className="w-full">Save</Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default page;

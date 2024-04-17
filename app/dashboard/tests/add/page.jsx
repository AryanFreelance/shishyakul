import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React from "react";
import Dropper from "@/components/Dropper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
              <Label
                htmlFor="test-name"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Test Name
              </Label>
              <input
                type="text"
                id="test-name"
                className="input-taking"
                placeholder="Enter Test Name..."
              />
            </div>
            <div className="flex flex-col w-full mb-4">
              <Label
                htmlFor="subject"
                className="text-xl text-secondary barlow-medium mb-2"
              >
                Subject
              </Label>
              <input
                type="text"
                id="subject"
                className="input-taking"
                placeholder="Enter Subject Name..."
              />
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-4">
              <div className="flex flex-col w-full lg:w-[50%] mb-4">
                <Label
                  htmlFor="date"
                  className="text-xl text-secondary barlow-medium mb-2"
                >
                  Date
                </Label>
                <input
                  type="date"
                  id="date"
                  className="input-taking"
                  placeholder="Enter Date of Test..."
                />
              </div>
              <div className="flex flex-col w-full lg:w-[50%] mb-4">
                <Label
                  htmlFor="total-marks"
                  className="text-xl text-secondary barlow-medium mb-2"
                >
                  Total Marks
                </Label>
                <input
                  type="number"
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

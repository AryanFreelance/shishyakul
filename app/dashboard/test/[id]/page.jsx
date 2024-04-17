import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { dashboardNavLinks } from "@/constants";
import { X } from "lucide-react";
import React from "react";

const page = () => {
  // Test Paper Fields - Test Name, Subject, Date, Total Marks, Question Paper (PDF)

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />

      <div className="pb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h2 className="subheading">Manage TestName</h2>
          <span>Created on - 12/04/2024</span>
        </div>
        <div className="mt-8 px-[4%] lg:px-[10%]">
          <form>
            <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center">
              <Label
                htmlFor="test-name"
                className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
              >
                Test Name
              </Label>
              <input
                type="text"
                id="test-name"
                className="input-taking w-full lg:w-[80%] md:w-[70%]"
                placeholder="Update Test Name..."
              />
            </div>
            <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center mt-4">
              <Label
                htmlFor="subject"
                className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
              >
                Subject
              </Label>
              <input
                type="text"
                id="subject"
                className="input-taking w-full lg:w-[80%] md:w-[70%]"
                placeholder="Update Subject Name..."
              />
            </div>
            <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center mt-4">
              <Label
                htmlFor="date"
                className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
              >
                Date
              </Label>
              <input
                type="date"
                id="date"
                className="input-taking w-full lg:w-[80%] md:w-[70%]"
                placeholder="Update Date of Test..."
              />
            </div>
            <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 md:items-center mt-4">
              <Label
                htmlFor="total-marks"
                className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%]"
              >
                Total Marks
              </Label>
              <input
                type="number"
                id="total-marks"
                className="input-taking w-full lg:w-[80%] md:w-[70%]"
                placeholder="Update Total Marks..."
              />
            </div>

            <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6 mt-4">
              <Label
                htmlFor="share-to"
                className="text-xl text-secondary barlow-medium mb-2 lg:w-[20%] md:w-[30%] py-3"
              >
                Share To
              </Label>
              <div className="w-full lg:w-[80%] md:w-[70%] flex flex-col md:gap-6 gap-2">
                <div className="flex gap-2 md:gap-6">
                  <input
                    type="email"
                    id="share-to"
                    className="input-taking w-[74%]"
                    placeholder="Enter student's Email..."
                  />
                  <Button className="w-[26%] md:mt-0 py-6">Share</Button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  <div className="bg-secondary text-primary flex gap-4 rounded px-4 py-2">
                    <span>shindearyan179@gmail.com</span>
                    <button>
                      <X />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <iframe
              src="/demopdf.pdf"
              className="w-full rounded my-6"
              height="480"
              allowFullScreen
            ></iframe>

            <div className="mt-10">
              <Button className="w-full">Update</Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default page;

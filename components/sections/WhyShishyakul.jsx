"use client";

import Image from "next/image";
import React from "react";
import bannerImg from "@/assets/banners/whyshishyakul.jpg";
import { Square } from "lucide-react";
import { Button } from "../ui/button";

const WhyShishyakul = () => {
  const goToSection = (id) => () => {
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div
        id="why-shishyakul-wrapper"
        style={{ marginTop: "-100px", paddingTop: "100px" }}
      />
      <div className="flex gap-10 flex-col lg:flex-row px-[1.4rem] md:px-[4rem] pb-[1rem] items-center">
        <div className="md:w-[50%]">
          <div className="global-image-wrapper">
            <Image
              src={bannerImg}
              alt="Why Shishyakul"
              className="w-full h-full rounded-[8px]"
              width={1000}
              height={1000}
            />
          </div>
        </div>
        <div className="md:w-[50%] mt-4 lg:mt-0">
          <h1 className="subheading mb-6">Why Shishyakul?</h1>
          <p className="text-[16px]">
            Shishyakul: Your one-stop platform for online education. Connect
            with expert teachers for classes, tests, and study materials. Start
            learning securely today!
          </p>
          <ul className="list-none mt-6 gap-2 flex flex-col">
            <li className="flex items-center gap-3 md:gap-2">
              <div className="header-list-item">
                <Square size={16} strokeWidth={1.2} />
              </div>{" "}
              Experienced Educators, Quality Instruction
            </li>

            <li className="flex items-center gap-3 md:gap-2">
              <div className="header-list-item">
                <Square size={16} strokeWidth={1.2} />
              </div>{" "}
              Diverse Learning Resources, Convenient Access
            </li>

            <li className="flex items-center gap-3 md:gap-2">
              <div className="header-list-item">
                <Square size={16} strokeWidth={1.2} />
              </div>{" "}
              Trusted, Secure Online Learning Environment
            </li>
          </ul>

          <Button
            variant="fill"
            className="filled-button mt-6"
            onClick={goToSection("teachers-wrapper")}
          >
            Our Teachers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhyShishyakul;

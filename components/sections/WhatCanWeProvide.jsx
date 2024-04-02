"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import bannerImg from "@/assets/banners/whyshishyakul.jpg";
import { Plus } from "lucide-react";
import {
  certificate,
  communication,
  infinity,
  education,
} from "@/assets/icons";

const WhatCanWeProvide = () => {
  const goToSection = (id) => () => {
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="px-[1.4rem] md:px-[4rem] pb-[1rem]">
      <div className="mb-10">
        <div className="flex justify-between">
          <h1 className="subheading mb-4">What Can We Provide?</h1>
          <Button
            className="text-[16px] filled-button"
            variant="fill"
            onClick={goToSection("fees-wrapper")}
          >
            Fees
          </Button>
        </div>
        <div className="lg:w-[70%]">
          <p className="text-[16px]">
            We provide a platform for students to learn from the best teachers
            around the world. We provide a platform for teachers to teach
            students around the world. We provide a platform for students and
            teachers to connect and learn from each other.
          </p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        <div className="lg:w-[46%] mb-8 lg:mb-0">
          <div className="global-image-wrapper">
            <Image
              src={bannerImg}
              alt="Why Shishyakul"
              width={1000}
              height={1000}
              className="w-full h-full rounded-[8px]"
            />
          </div>
        </div>
        <div className="lg:w-[54%]">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="service-card-wrapper">
              <Image
                src={certificate}
                alt="Certificate Icon"
                width={1000}
                height={1000}
              />
              <h2>First Service.</h2>
              <p>
                We provide a platform for students to learn from the best
                teachers around the world.
              </p>
            </div>
            <div className="service-card-wrapper">
              <Image
                src={infinity}
                alt="Certificate Icon"
                width={1000}
                height={1000}
              />
              <h2>Second Service.</h2>
              <p>
                We provide a platform for teachers to teach students around the
                world.
              </p>
            </div>
            <div className="service-card-wrapper">
              <Image
                src={communication}
                alt="Certificate Icon"
                width={1000}
                height={1000}
              />
              <h2>Third Service.</h2>
              <p>
                We provide a platform for students and teachers to connect and
                learn from each other.
              </p>
            </div>
            <div className="service-card-wrapper">
              <Image
                src={education}
                alt="Certificate Icon"
                width={1000}
                height={1000}
              />
              <h2>Fourth Service.</h2>
              <p>
                We provide a platform for students and teachers to connect and
                learn from each other.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatCanWeProvide;

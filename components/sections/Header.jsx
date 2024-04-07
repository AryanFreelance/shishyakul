"use client";

import { ArrowDown } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import headerBanner from "@/assets/header/hero_banner.jpg";

const Header = () => {
  const goToSection = (id) => () => {
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div
        id="header-wrapper"
        style={{ marginTop: "-100px", paddingTop: "100px" }}
      />
      <div>
        <div className="flex flex-col md:flex-row gap-10 py-[4rem] px-[1.4rem] md:p-[4rem] bg-secondary text-primary rounded-2xl items-center">
          <div className="w-full md:w-[56%] text-center md:text-left">
            <span className="text-muted text-sm barlow-regular uppercase">
              Learn from the best teachers
            </span>
            <h1 className="heading my-6">The Best Classes For Your Child.</h1>
            <p className="text-primary text-[16px] md:text-md tracking-wide md:w-[80%]">
              Shishyakul is a platform that connects students with the best
              teachers. We provide offline classes for students looking to
              improve their skills in various subjects. Our teachers are
              experienced and have a proven track record of success.
            </p>
            <div className="mt-10 md:mt-6 flex md:flex-row flex-col justify-center md:justify-normal items-center gap-6">
              <Button
                variant="fill"
                className="w-[70%] md:w-[50%] lg:w-[40%] justify-center filled-button"
                onClick={goToSection("services-wrapper")}
              >
                Our Services
              </Button>
              <Button
                className="flex gap-3 header-pricing-button text-[18px] justify-center barlow-semibold"
                onClick={goToSection("contact-wrapper")}
              >
                Contact Us{" "}
                <span className="p-[6px] border-2 border-primary rounded-full transition-all duration-300 ease-in-out">
                  <ArrowDown />
                </span>
              </Button>
            </div>
          </div>
          <div className="w-full md:w-[44%]">
            <div>
              <Image
                src={headerBanner}
                alt="Header Banner"
                className="h-full w-full object-cover rounded-2xl"
                width={1024}
                height={1180}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

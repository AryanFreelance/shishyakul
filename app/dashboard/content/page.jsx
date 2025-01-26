import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import React from "react";
import mentorsImg from "@/assets/banners/mentor.png";
import Image from "next/image";
import { Pencil, Trash } from "lucide-react";
import ActionButtonTeachers from "@/components/private/dashboard/content/ActionButtonTeachers";
import { FaStar } from "react-icons/fa";
import DevelopmentMode from "@/components/shared/DevelopmentMode";
import AddContentButton from "@/components/private/dashboard/content/AddContentButton";

const teachers = [
  {
    profileImg: mentorsImg,
    name: "Demo Mentor 1",
    subject: "Maths",
  },
  {
    profileImg: mentorsImg,
    name: "Demo Mentor 2",
    subject: "Physics",
  },
  {
    profileImg: mentorsImg,
    name: "Demo Mentor",
    subject: "Science",
  },
];

const ContentPage = () => {
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
      {/* Teachers */}
      <div className="mb-10">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4 mb-6">
          <div>
            <h2 className="subheading text-center md:text-left">Teachers</h2>
          </div>
          <AddContentButton type="teacher" />
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
            {/* Teachers Cards */}
            {teachers.map((teacher, index) => (
              <div
                key={index}
                className="border-2 border-secondary p-6 md:p-8 text-center rounded-2xl hover:border-main transition-all duration-300 ease-in-out"
              >
                <Image
                  src={teacher.profileImg}
                  alt={teacher.name}
                  className="rounded-lg mb-4 border-2 border-main"
                  width={1000}
                  height={1000}
                />
                <h3 className="text-[20px] barlow-semibold">{teacher.name}</h3>
                <p className="text-[18px] barlow-regular">{teacher.subject}</p>
                <ActionButtonTeachers type="teacher" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-10">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4 mb-6">
          <div>
            <h2 className="subheading text-center md:text-left">
              Testimonials
            </h2>
          </div>
          <AddContentButton type="testimonial" />
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Testimonials Cards */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col border-2 border-main hover:bg-main rounded-lg px-[1rem] py-[2rem] duration-300 ease-in-out testimonial-card-wrapper"
              >
                <div className="flex items-center gap-4 mb-4">
                  <FaStar className="text-[22px] star" />
                  <FaStar className="text-[22px] star" />
                  <FaStar className="text-[22px] star" />
                  <FaStar className="text-[22px]" />
                  <FaStar className="text-[22px]" />
                </div>
                <p className="text-[18px] barlow-regular mb-6">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Quisquam, voluptate.
                </p>
                <h3 className="text-[18px] barlow-semibold">Student Name</h3>
                <span className="text-[16px] text-secondary barlow-regular">
                  Ex-Student
                </span>
                <span className="text-[16px] barlow-regular">
                  10<sup>th</sup> Grade - 96%
                </span>
                <ActionButtonTeachers type="testimonial" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ContentPage;

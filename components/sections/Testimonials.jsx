"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { FaStar } from "react-icons/fa";

const Testimonials = () => {
  return (
    <div
      id="testimonial-wrapper"
      className="px-[1.4rem] md:px-[4rem] pb-[4rem]"
    >
      <h2 className="subheading mb-8">What Others Think About Us?</h2>
      <div>
        <Carousel
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="lg:basis-1/2">
                <div className="flex flex-col border-2 border-main hover:bg-main rounded-lg px-[1rem] py-[2rem] duration-300 ease-in-out testimonial-card-wrapper">
                  <div className="flex items-center gap-6 mb-4">
                    <FaStar className="text-[22px]" />
                    <FaStar className="text-[22px]" />
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
                </div>
                {/* <div className="p-1">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </div> */}
              </CarouselItem>
            ))}
          </CarouselContent>
          <div>
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default Testimonials;

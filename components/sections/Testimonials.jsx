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
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "testimonials"),
      (snapshot) => {
        const testimonialsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTestimonials(testimonialsList);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div
        id="testimonial-wrapper"
        style={{ marginTop: "-100px", paddingTop: "100px" }}
      />
      <div className="px-[1.4rem] md:px-[4rem] pb-[4rem]">
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
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="lg:basis-1/2">
                  <div className="flex flex-col border-2 border-main hover:bg-main rounded-lg px-[1rem] py-[2rem] duration-300 ease-in-out testimonial-card-wrapper">
                    <div className="flex items-center gap-6 mb-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FaStar
                          key={index}
                          className={`text-[22px] ${
                            index < (testimonial.rating || 0) ? "star" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[18px] barlow-regular mb-6">
                      {testimonial.description}
                    </p>
                    <h3 className="text-[18px] barlow-semibold">
                      {testimonial.name}
                    </h3>
                    <span className="text-[16px] text-secondary barlow-regular">
                      {testimonial.designation}
                    </span>
                    <span className="text-[16px] barlow-regular">
                      {testimonial.grade} Grade - {testimonial.percentage}%
                    </span>
                  </div>
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
    </div>
  );
};

export default Testimonials;

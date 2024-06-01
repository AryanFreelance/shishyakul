"use client";

import { navLinks } from "@/constants";
import Image from "next/image";

import { Mail, MapPinned, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Container from "./Container";

const Footer = () => {
  const year = new Date().getFullYear();

  const goToSection = (href) => () => {
    document.querySelector(href).scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-secondary py-10 text-white">
      <Container>
        <div className="px-[1.4rem] md:px-[4rem]">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-[40%] flex flex-col items-center lg:items-start">
              <Image
                src="/logo.png"
                alt="Logo"
                width={1000}
                height={1000}
                className="w-[60%] mb-6"
              />
              <p className="barlow-regular text-md">
                Shishyakul connects students with tutors across subjects, aiding
                connections and class enrollment.
              </p>
              <div className="mt-6 flex items-center gap-6">
                <a href="https://instagram.com" target="_blank">
                  <div className="footer-icon">
                    <FaInstagram />
                  </div>
                </a>
                <a href="https://facebook.com" target="_blank">
                  <div className="footer-icon">
                    <FaFacebookF />
                  </div>
                </a>
                <a href="https://twitter.com" target="_blank">
                  <div className="footer-icon">
                    <FaXTwitter />
                  </div>
                </a>
              </div>
            </div>
            <div className="lg:w-[30%]">
              <h3 className="subsubheading mb-6 lg:mb-8">Links</h3>
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <div key={index}>
                    <button
                      className="text-[16px] text-primary underline-offset-4 hover:underline hover:bg-secondary bg-secondary barlow-regular"
                      onClick={goToSection(link.href)}
                    >
                      {link.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-[30%]">
              <h3 className="subsubheading mb-6 lg:mb-8">Contact Us</h3>
              <div className="flex flex-col gap-6">
                <a
                  href="tel:"
                  className="flex gap-4 items-center text-[16px] barlow-regular"
                >
                  <Phone /> Phone Number
                </a>
                <a
                  href="mailto:"
                  className="flex gap-4 items-center text-[16px] barlow-regular"
                >
                  <Mail /> Email Address
                </a>
                <a
                  href="https://maps.app.goo.gl/iQTTuhfomRaWdWPs9"
                  target="_blank"
                  className="flex gap-4 text-[16px] barlow-regular"
                >
                  <MapPinned className="w-[24px] h-[24px]" />{" "}
                  <span className="w-full">
                    First Floor, Dhir corner, plotno-40, Sector 20, Kamothe,
                    Panvel, Navi Mumbai, Maharashtra 410209
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d943.0106602135608!2d73.09621837711212!3d19.01784260825824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7e97c2161ace5%3A0x9561d52a4caf72cd!2sShishyakul!5e0!3m2!1sen!2sin!4v1712476579207!5m2!1sen!2sin"
              className="w-[100%] h-[200px] lg:h-[300px] mt-6 border-2 border-main rounded-md"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div>
            {/* Copyright Text */}
            <p className="text-center mt-10 text-md barlow-regular">
              © {year} Shishyakul. All Rights Reserved.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;

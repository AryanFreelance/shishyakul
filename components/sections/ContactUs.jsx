"use client";

import { LoaderCircle, Mail, MapPinned, Phone } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { errorToast, successToast } from "@/utils/toast";
import emailjs from "@emailjs/browser";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSumbitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSumbitting(true);

    if (!name || !email || !phone) {
      errorToast("Please fill all the required fields.");
      setIsSumbitting(false);
      return;
    }

    await emailjs
      .send(
        "service_ji7yjwy",
        "template_0td209e",
        {
          name,
          email,
          phone,
          message,
        },
        {
          publicKey: "L6tt5i1OBi2QrCoW0",
        }
      )
      .then(
        () => {
          console.log("SUCCESS!");
          successToast(
            "Thank you for contacting us. We'll get back to you soon"
          );
        },
        (error) => {
          console.log("FAILED...", error);
          errorToast("Failed to send message. Please try again.");
        }
      );

    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setIsSumbitting(false);
  };

  return (
    <div>
      <div
        id="contact-wrapper"
        style={{ marginTop: "-100px", paddingTop: "100px" }}
      />
      <div className="px-[1.4rem] md:px-[4rem]">
        <div className="mb-8 ">
          <h2 className="subheading mb-2">Contact Us</h2>
          <p className="barlow-regular text-lg">
            We are here to help you. If you have any questions or need
            assistance, please contact us.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:border-2 lg:border-main lg:rounded-lg p-0">
          <div className="lg:w-[50%] lg:p-4">
            <div className="flex gap-4 mb-4 items-center">
              <Phone className="contact-icon" />
              <h4 className="text-lg barlow-regular w-full">Phone</h4>
            </div>
            <div className="flex gap-4 mb-4 items-center">
              <Mail className="contact-icon" />
              <h4 className="text-lg barlow-regular w-full">Email</h4>
            </div>
            <div className="flex gap-4">
              <MapPinned className="contact-icon" />
              <h4 className="text-lg barlow-regular w-full">
                <a
                  href="https://maps.app.goo.gl/iQTTuhfomRaWdWPs9"
                  target="_blank"
                >
                  First Floor, Dhir corner, plotno-40, Sector 20, Kamothe,
                  Panvel, Navi Mumbai, Maharashtra 410209
                </a>
              </h4>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d943.0106602135608!2d73.09621837711212!3d19.01784260825824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7e97c2161ace5%3A0x9561d52a4caf72cd!2sShishyakul!5e0!3m2!1sen!2sin!4v1712476579207!5m2!1sen!2sin"
              className="w-[100%] h-[200px] lg:h-[300px] mt-6 border-2 border-main rounded-md"
              // style={{ border: "0" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="lg:w-[50%] mb-4 lg:m-0 h-full">
            <form
              method="POST"
              className="bg-main px-6 py-8 flex flex-col gap-4 rounded-md lg:rounded-none h-full"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1">
                <label className="barlow-regular text-lg" htmlFor="name">
                  Your Name
                </label>
                <input
                  className="px-4 py-2 rounded bg-primary text-secondary placeholder:text-black/70 border border-secondary"
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="barlow-regular text-lg" htmlFor="email">
                  Your Email
                </label>
                <input
                  className="px-4 py-2 rounded bg-primary text-secondary placeholder:text-black/70 border border-secondary"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="barlow-regular text-lg" htmlFor="phone">
                  Your Phone
                </label>
                <input
                  className="px-4 py-2 rounded bg-primary text-secondary placeholder:text-black/70 border border-secondary"
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Your phone..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="barlow-regular text-lg" htmlFor="message">
                  Your Message
                </label>
                <textarea
                  className="px-4 py-2 rounded bg-primary text-secondary placeholder:text-black/70 border border-secondary resize-none"
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              <Button
                className="mt-8 tracking-wide text-[18px] justify-center"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle className="animate-spin h-6 w-6 text-primary" />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  Header,
  WhyShishyakul,
  WhatCanWeProvide,
  Statistics,
  OurTeachers,
  FeesForOurServices,
  Testimonials,
  FAQ,
  ContactUs,
} from "@/components/sections";
import { Separator } from "@/components/ui/separator";
import Container from "@/components/shared/Container";

export default function Home() {
  return (
    <Container>
      <>
        <Navbar />
        <Header />
        <Separator className="my-[3rem] lg:my-[4rem]" />
        <WhyShishyakul />
        <Separator className="my-[3rem] lg:my-[4rem]" />
        <WhatCanWeProvide />
        <Statistics />
        <OurTeachers />
        {/* <Separator className="my-[3rem] lg:my-[4rem]" /> */}
        {/* <FeesForOurServices /> */}
        <Separator className="my-[3rem] lg:my-[4rem]" />
        <Testimonials />
        <FAQ />
        <ContactUs />
        <Footer />
      </>
    </Container>
  );
}

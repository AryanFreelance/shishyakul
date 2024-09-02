import React from "react";
import constructionImg from "@/assets/contruction/constructionimg.png";
import Image from "next/image";

const DevelopmentMode = () => {
  return (
    <div className="flex justify-center items-center h-[100svh] flex-col px-8 py-10">
      <Image
        src={constructionImg}
        alt="Construction Image"
        width={1000}
        height={1000}
        className="w-[250px] md:w-[400px] mb-8"
      />
      <h1 className="font-bold text-3xl lg:text-5xl barlow-bold text-center">
        😉 Making the System more Better !!
      </h1>
      <h2 className="font-semibold text-xl md:text-2xl barlow-medium mt-4 text-center">
        Please Wait, for a few more Moments !
      </h2>
    </div>
  );
};

export default DevelopmentMode;

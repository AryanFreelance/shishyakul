import React from "react";

const Statistics = () => {
  return (
    <div className="bg-secondary px-[3rem] md:px-[4rem] py-10 text-white rounded-2xl my-[4rem]">
      <div className="flex flex-col lg:flex-row justify-evenly gap-10">
        <div className="border-b-2 lg:pb-6 pb-4 border-primary md:min-w-[200px]">
          <h2 className="mb-2 counter text-white">1000+</h2>
          <span className="text-[16px]">Student taught till date.</span>
        </div>
        <div className="border-b-2 lg:pb-6 pb-4 border-primary md:min-w-[200px]">
          <h2 className="mb-2 counter text-white">500+</h2>
          <span className="text-[16px]">Lectures arranged.</span>
        </div>
        <div className="border-b-2 lg:pb-6 pb-4 border-primary md:min-w-[200px]">
          <h2 className="mb-2 counter text-white">25:75</h2>
          <span className="text-[16px]">Theory to Practice ratio.</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

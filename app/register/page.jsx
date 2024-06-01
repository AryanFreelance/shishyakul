"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const page = () => {

  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  return (
    <div>
      {/* <Container> */}
      <div className="flex gap-[10rem] items-center justify-center h-[100svh]">
        <div className="">
          <h2 className="subheading mb-10">SHISHYAKUL | Register</h2>
          <div>
            <form className="flex flex-col">
              <div className="flex flex-col w-full mb-4">
                <label
                  htmlFor="firstname"
                  className="input-label text-secondary"
                >
                  Registration Code
                </label>
                <input
                  type="text"
                  id="code"
                  className="input-taking"
                  placeholder="Enter the registration code..."
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <div className="flex justify-center items-center w-full mt-6">
                <Button
                  className="lg:w-full w-[200px] flex justify-center items-center barlow-semibold text-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/register/${verificationCode}`)
                  }}
                >
                  Verify Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* </Container> */}
    </div>
  );
};

export default page;

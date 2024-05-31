"use client";

import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOff, Home } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Container from "@/components/shared/Container";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import toast from "react-hot-toast";
import { VERIFY_CODE } from "@/graphql/mutations/verifications.mutation";

export const dynamic = "force-dynamic";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { CREATE_STUDENT } from "@/graphql/mutations/students.mutation";

function Page() {
  const { id } = useParams();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");
  const [grade, setGrade] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const { data, loading, error } = useSuspenseQuery(VERIFY_CODE, {
    variables: { verificationCode: id },
  });

  const [createStudent] = useMutation(CREATE_STUDENT);

  const router = useRouter();

  useEffect(() => {
    if (data?.verifyStudentCode) {
      setEmail(data.verifyStudentCode);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-xl barlow-semibold animate-pulse">
        Loading...
      </div>
    );
  }

  if (error) {
    console.error(error);
    return (
      <div className="flex justify-center items-center h-[100svh] text-xl barlow-semibold">
        Error loading verification code.
      </div>
    );
  }

  if (data?.verifyStudentCode === "") {
    return (
      <div className="flex justify-center items-center flex-col h-[100svh]">
        <h1 className="subheading">Invalid Verification Code</h1>
        <p className="barlow-regular mt-4">
          The verification code you entered is invalid or expired. Please try again.
        </p>
        <Link
          href="/"
          className="bg-secondary text-primary px-4 py-2 rounded barlow-medium flex gap-2 items-center mt-6"
        >
          Go Home <Home />
        </Link>
      </div>
    );
  }

  const studentRegisterHandler = async (e) => {
    e.preventDefault();

    const registeringToast = toast.loading("Registering...");

    await createStudent({
      variables: {
        firstname,
        middlename,
        lastname,
        email,
        password,
        phone,
        grade,
        verificationCode: id,
      },
    }).then(() => {
      toast.success("Student registered successfully!", { id: registeringToast });
      router.push("/login");
    }).catch((err) => {
      console.log("ERROR REGISTERING STUDENT", err);
      toast.error("Error registering student. Please try again.", { id: registeringToast });
    });
  };

  return (
    <Container>
      <div className="flex gap-[10rem] items-center justify-center">
        <div className="flex gap-6 my-10 flex-col">
          <h2 className="subheading">SHISHYAKUL | Register</h2>
          <div>
            <form className="flex flex-col" onSubmit={studentRegisterHandler}>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="firstname" className="input-label text-secondary">First Name</label>
                <input
                  type="text"
                  id="firstname"
                  className="input-taking"
                  placeholder="Enter your first name..."
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="middlename" className="input-label text-secondary">Middle Name</label>
                <input
                  type="text"
                  id="middlename"
                  className="input-taking"
                  placeholder="Enter your middle name..."
                  value={middlename}
                  onChange={(e) => setMiddlename(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="lastname" className="input-label text-secondary">Last Name</label>
                <input
                  type="text"
                  id="lastname"
                  className="input-taking"
                  placeholder="Enter your last name..."
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="grade" className="input-label text-secondary">Grade</label>
                <input
                  type="number"
                  min={6}
                  max={12}
                  id="grade"
                  className="input-taking"
                  placeholder="Enter your grade..."
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="email" className="input-label text-secondary">Email (Cannot be changed)</label>
                <input
                  type="email"
                  id="email"
                  className="input-taking"
                  placeholder="Enter your email..."
                  value={email}
                  disabled
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="phone" className="input-label text-secondary">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  className="input-taking"
                  placeholder="Enter your phone number..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="password" className="input-label text-secondary">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    className="input-taking pr-[60px]"
                    placeholder="Enter your password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute top-[50%] translate-y-[-50%] right-[20px]">
                    {passwordVisible ? (
                      <EyeOff onClick={() => setPasswordVisible(false)} />
                    ) : (
                      <EyeIcon onClick={() => setPasswordVisible(true)} />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center w-full mt-6">
                <Button
                  className="lg:w-full w-[200px] flex justify-center items-center barlow-semibold text-lg"
                  type="submit"
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Page;

"use client";

import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import headerBanner from "@/assets/header/hero_banner.jpg";
import { EyeIcon, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase";
import { successToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

const page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authStatus, setAuthStatus] = useState(null);

  const router = useRouter();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      console.log(user);
      setAuthStatus(true);
      router.push("/dashboard");
      // ...
    } else {
      // User is signed out
      // ...
      setAuthStatus(false);
    }
  });

  const resetPassword = async (e) => {
    e.preventDefault();

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        successToast("Password reset email sent successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        successToast("User logged in successfully");
        router.push("/dashboard");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (authStatus === null) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Loading...
      </div>
    );
  }

  if (authStatus) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Redirecting...
      </div>
    );
  }

  return (
    <Container>
      <div className="flex gap-[10rem] items-center justify-center h-[100svh]">
        <div className="lg:w-[40%]">
          <h2 className="subheading mb-10">SHISHYAKUL | Login</h2>
          <div>
            <form className="flex flex-col">
              <div className="flex flex-col w-full mb-4">
                <label htmlFor="email" className="input-label text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="input-taking"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col w-full mb-4">
                <label
                  htmlFor="password"
                  className="input-label text-secondary"
                >
                  Password
                </label>
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
              <div className="flex justify-end w-full">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="barlow-semibold text-lg">
                      Forgot Password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Forgot Password</DialogTitle>
                      <DialogDescription>
                        Enter your email here to get a password reset link.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email..."
                          className="col-span-3"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      {/* <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose> */}
                      <Button
                        type="submit"
                        className="flex justify-center items-center"
                        onClick={resetPassword}
                      >
                        Reset Password
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex justify-center items-center w-full mt-6">
                <Button
                  className="lg:w-full w-[200px] flex justify-center items-center barlow-semibold text-lg"
                  onClick={loginHandler}
                >
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden lg:block lg:w-[60%]">
          <Image
            src={headerBanner}
            alt="Login Banner"
            width={1000}
            height={1000}
            className="login-banner rounded-xl"
          />
        </div>
      </div>
    </Container>
  );
};

export default page;

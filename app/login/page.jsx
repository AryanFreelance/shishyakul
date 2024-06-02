"use client";

import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import headerBanner from "@/assets/banners/header/hero_banner.jpg";
import { ChevronLeft, EyeIcon, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState("");
  const [isForgotDialogOpen, setIsForgotDialogOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userid = user.uid;
        setUid(userid);
        setAuthStatus(true);
        if (user.email === "shindearyan179@gmail.com") {
          router.push("/dashboard");
        } else {
          router.push(`/student/${userid}`);
        }
      } else {
        setAuthStatus(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const resetPassword = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending password reset email...");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent successfully", { id: toastId });
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.code === "auth/user-not-found"
          ? "User not found. Please try again."
          : error.code === "auth/invalid-email"
            ? "Invalid email. Please try again."
            : error.code === "auth/missing-email"
              ? "Email is missing. Please try again."
              : error.code === "auth/network-request-failed"
                ? "Network error. Please try again."
                : "An error occurred. Please try again.";
      toast.error(errorMessage, { id: toastId });
    }
    setIsForgotDialogOpen(false);
    setResetEmail("");
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password).then((res) => {
        if (email === "shindearyan179@gmail.com") {
          router.push("/dashboard");
        } else {
          // router.push(`/student/${uid}`);
        }
        toast.success("User logged in successfully");
        console.log("RES", res, email, uid);
      })

    } catch (error) {
      console.log(error.code, error.message);
      const errorMessage =
        error.code === "auth/invalid-credential"
          ? "Invalid credentials. Please try again."
          : error.code === "auth/user-not-found"
            ? "User not found. Please try again."
            : error.code === "auth/wrong-password"
              ? "Wrong password. Please try again."
              : "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
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
                <Dialog
                  open={isForgotDialogOpen}
                  onOpenChange={setIsForgotDialogOpen}
                >
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
              <div className="flex justify-center items-center flex-col md:flex-row-reverse w-full mt-6 gap-4">
                <Button
                  className="lg:w-full w-[200px] flex justify-center items-center barlow-semibold text-lg"
                  onClick={loginHandler}
                >
                  Login
                </Button>
                <Button
                  className="lg:w-full w-[200px] flex justify-center items-center barlow-semibold text-lg gap-2"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push("/")
                  }}
                >
                  <ChevronLeft /> Go Home
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden lg:block lg:w-[60%] lg:px-[6%]">
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

export default Page;

"use client";

import Container from "@/components/shared/Container";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const layout = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  const router = useRouter();

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     const uid = user.uid;
  //     // console.log(user);
  //     setAuthStatus(true);
  //     router.push(`/student/${uid}`);
  //   } else {
  //     setAuthStatus(false);
  //   }
  // });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userid = user.uid;
        setAuthStatus(true);
        if (user.email === "admin@shishyakul.in") {
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

  return <Container>{children}</Container>;
};

export default layout;

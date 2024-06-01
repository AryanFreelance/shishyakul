"use client";

import Container from "@/components/shared/Container";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const layout = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  const router = useRouter();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      console.log(user);
      setAuthStatus(true);
      router.push(`/student/${uid}`);
      // ...
    } else {
      // User is signed out
      // ...
      setAuthStatus(false);
    }
  });

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

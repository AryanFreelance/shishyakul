"use client";

import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const layout = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log(user);
        setAuthStatus(true);
      } else {
        setAuthStatus(false);
        router.push("/login");
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

  if (!authStatus) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Redirecting...
      </div>
    );
  }

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     const uid = user.uid;
  //     console.log(user);
  //     setAuthStatus(true);
  //     setEmail(user.email);
  //     console.log("EMAIL", email);
  //   } else {
  //     router.push(`/login`);
  //     setAuthStatus(false);
  //   }
  // });

  // if (authStatus === null) {
  //   return (
  //     <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
  //       Loading...
  //     </div>
  //   );
  // }

  // if (!authStatus) {
  //   return (
  //     <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
  //       Redirecting...
  //     </div>
  //   );
  // }

  return <div>{children}</div>;
};

export default layout;

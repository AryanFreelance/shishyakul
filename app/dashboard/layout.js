"use client";

import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import DevelopmentMode from "@/components/shared/DevelopmentMode";
import { PermissionProvider } from "@/app/context/PermissionContext";

const Layout = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);
  const router = useRouter();

  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // useEffect(() => {
  //   const handleStatusChange = () => {
  //     setIsOnline(navigator.onLine);
  //   };
  //   window.addEventListener("online", handleStatusChange);
  //   window.addEventListener("offline", handleStatusChange);
  //   return () => {
  //     window.removeEventListener("online", handleStatusChange);
  //     window.removeEventListener("offline", handleStatusChange);
  //   };
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus(true);
      } else {
        setAuthStatus(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

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

  // Development Mode Page
  // if (authStatus) {
  //   return <DevelopmentMode />;
  // }

  // if (!isOnline) {
  //   return (
  //     <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
  //       <h1>You're Offline</h1>
  //     </div>
  //   );
  // }

  return (
    <PermissionProvider>
      <div>{children}</div>
    </PermissionProvider>
  );
};

export default Layout;

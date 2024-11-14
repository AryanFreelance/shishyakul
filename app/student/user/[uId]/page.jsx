"use client";

import { auth } from "@/firebase";
import { GET_STUDENT_INFO } from "@/graphql/queries/students.query";
import { useSuspenseQuery } from "@apollo/client";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const page = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const router = useRouter();
  const { uId } = useParams();
  const { data: studData } = useSuspenseQuery(GET_STUDENT_INFO, {
    variables: {
      userId: uId,
    },
  });

  // console.log("STUDINFO", uId, studData);

  // Redirect to student/<ay>/<grade>/<id> if the studData is not null
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        // console.log(user, uid);
        setAuthStatus(true);
        // if (user.email !== "admin@shishyakul.in") {
        //   router.push(`/student/user/${uid}`);
        // } else {
        //   setAuthStatus(true);
        // }
      } else {
        setAuthStatus(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  if (!authStatus) {
    return (
      <div className="h-[100svh] w-full flex justify-center items-center text-2xl bralow-bold">
        Redirecting...
      </div>
    );
  }

  if (studData?.studentInfo) {
    const { ay, grade } = studData.studentInfo;
    router.push(`/student/${ay}/${grade}/${uId}`);
    return (
      <div className="h-[100svh] w-full flex justify-center items-center text-2xl bralow-bold">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="h-[100svh] w-full flex justify-center items-center text-2xl bralow-bold">
      Loading
    </div>
  );
};

export default page;

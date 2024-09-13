"use client";

import { GET_STUDENT_INFO } from "@/graphql/queries/students.query";
import { useSuspenseQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const router = useRouter();
  const { uId } = useParams();
  const { data: studData } = useSuspenseQuery(GET_STUDENT_INFO, {
    variables: {
      userId: uId,
    },
  });

  console.log("STUDINFO", uId, studData);

  // Redirect to student/<ay>/<grade>/<id> if the studData is not null

  if (studData) {
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

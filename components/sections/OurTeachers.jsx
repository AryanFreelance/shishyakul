"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const OurTeachers = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const teachersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div
        id="teachers-wrapper"
        style={{ marginTop: "-100px", paddingTop: "100px" }}
      />
      <div className="px-[1.4rem] md:px-[4rem] pb-[1rem]">
        <h2 className="subheading mb-8">Our Teachers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {teachers.map((teacher, index) => (
            <div
              key={index}
              className="border-2 border-secondary p-6 md:p-8 text-center rounded-2xl hover:border-main transition-all duration-300 ease-in-out"
            >
              <Image
                src={teacher.profileUrl}
                alt={teacher.name}
                className="rounded-lg mb-4 border-2 border-main"
                width={1000}
                height={1000}
              />
              <h3 className="text-[20px] barlow-semibold">{teacher.name}</h3>
              <p className="text-[18px] barlow-regular">{teacher.subject}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTeachers;

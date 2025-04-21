"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/shared/Container";
import Navbar from "@/components/shared/Navbar";
import { dashboardNavLinks } from "@/constants";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { db, auth } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { checkMemberRoles, hasRole } from "@/utils/member-utils";
import ActionButtonTeachers from "@/components/private/dashboard/content/ActionButtonTeachers";
import DevelopmentMode from "@/components/shared/DevelopmentMode";
import AddContentButton from "@/components/private/dashboard/content/AddContentButton";

const ContentPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [errorTeachers, setErrorTeachers] = useState(null);
  const [errorTestimonials, setErrorTestimonials] = useState(null);

  // Add state for permissions
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasContentPermission, setHasContentPermission] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Check user permissions
  useEffect(() => {
    const checkUserPermissions = async () => {
      setIsLoadingPermissions(true);

      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Check if admin
            const isAdminUser = user.email === "admin@shishyakul.in";
            setIsAdmin(isAdminUser);

            // Check for Content permission using role checking
            const { roles } = await checkMemberRoles();
            const hasContentRole = roles && roles.Content === true;

            // Set permission state - admin or has Content role
            setHasContentPermission(isAdminUser || hasContentRole);
            setIsLoadingPermissions(false);
          } else {
            // Redirect to login if not authenticated
            window.location.href = "/login";
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error checking permissions:", error);
        setIsLoadingPermissions(false);
      }
    };

    checkUserPermissions();
  }, []);

  useEffect(() => {
    /**
     * Subscribes to real-time updates for teachers from Firestore.
     */
    const teachersRef = collection(db, "teachers");
    const teachersQuery = query(teachersRef, orderBy("name", "asc")); // Optional: Order by name
    const unsubscribeTeachers = onSnapshot(
      teachersQuery,
      (querySnapshot) => {
        const teachersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("teachersData", teachersData);
        setTeachers(teachersData);
        setLoadingTeachers(false);
      },
      (error) => {
        console.error("Error fetching teachers:", error);
        setErrorTeachers("Failed to load teachers.");
        setLoadingTeachers(false);
      }
    );

    /**
     * Subscribes to real-time updates for testimonials from Firestore.
     */
    const testimonialsRef = collection(db, "testimonials");
    const testimonialsQuery = query(testimonialsRef, orderBy("rating", "desc")); // Optional: Order by creation date
    const unsubscribeTestimonials = onSnapshot(
      testimonialsQuery,
      (querySnapshot) => {
        const testimonialsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("testimonialsData", testimonialsData);
        setTestimonials(testimonialsData);
        setLoadingTestimonials(false);
      },
      (error) => {
        console.error("Error fetching testimonials:", error);
        setErrorTestimonials("Failed to load testimonials.");
        setLoadingTestimonials(false);
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeTeachers();
      unsubscribeTestimonials();
    };
  }, []);

  // Show loading indicator while checking permissions
  if (isLoadingPermissions) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-xl">Checking permissions...</p>
        </div>
      </Container>
    );
  }

  // Show access denied if user doesn't have permission
  if (!hasContentPermission) {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-lg text-center max-w-md">
            You don't have permission to access this page. Please contact an
            administrator.
          </p>
        </div>
      </Container>
    );
  }

  if (process.env.ENVIRONMENT === "production") {
    return (
      <Container>
        <Navbar navLinks={dashboardNavLinks} isHome={false} />
        <DevelopmentMode />
      </Container>
    );
  }

  return (
    <Container>
      <Navbar navLinks={dashboardNavLinks} isHome={false} />

      {/* Teachers Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4 mb-6">
          <div>
            <h2 className="subheading text-center md:text-left">Teachers</h2>
          </div>
          <AddContentButton type="teacher" />
        </div>
        <div>
          {loadingTeachers ? (
            <p>Loading teachers...</p>
          ) : errorTeachers ? (
            <p className="text-red-500">{errorTeachers}</p>
          ) : teachers.length === 0 ? (
            <div className="text-center">
              <p>No teachers available.</p>
              <AddContentButton type="teacher" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
              {/* Teachers Cards */}
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="border-2 border-secondary p-6 md:p-8 text-center rounded-2xl hover:border-main transition-all duration-300 ease-in-out"
                >
                  <Image
                    src={teacher.profileUrl}
                    alt={teacher.name}
                    className="rounded-lg mb-4 border-2 border-main"
                    width={1000}
                    height={1000}
                  />
                  <h3 className="text-[20px] barlow-semibold">
                    {teacher.name}
                  </h3>
                  <p className="text-[18px] barlow-regular">
                    {teacher.subject}
                  </p>
                  <ActionButtonTeachers
                    type="teacher"
                    id={teacher.id}
                    data={teacher}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center flex-col md:flex-row gap-4 mb-6">
          <div>
            <h2 className="subheading text-center md:text-left">
              Testimonials
            </h2>
          </div>
          <AddContentButton type="testimonial" />
        </div>
        <div>
          {loadingTestimonials ? (
            <p>Loading testimonials...</p>
          ) : errorTestimonials ? (
            <p className="text-red-500">{errorTestimonials}</p>
          ) : testimonials.length === 0 ? (
            <div className="text-center">
              <p>No testimonials available.</p>
              <AddContentButton type="testimonial" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {/* Testimonials Cards */}
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex flex-col border-2 border-main hover:bg-main rounded-lg px-[1rem] py-[2rem] duration-300 ease-in-out testimonial-card-wrapper"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FaStar
                        key={index}
                        className={`text-[22px] ${
                          index < (testimonial.rating || 0) ? "star" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[18px] barlow-regular mb-6">
                    {testimonial.description ||
                      "No testimonial message provided."}
                  </p>
                  <h3 className="text-[18px] barlow-semibold">
                    {testimonial.name || "Anonymous"}
                  </h3>
                  <span className="text-[16px] text-secondary barlow-regular">
                    {testimonial.designation || "Ex-Student"}
                  </span>
                  <span className="text-[16px] barlow-regular">
                    {testimonial.grade || "Grade N/A"} Grade -{" "}
                    {testimonial.percentage || "N/A"}%
                  </span>
                  <ActionButtonTeachers
                    type="testimonial"
                    id={testimonial.id}
                    data={testimonial}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ContentPage;

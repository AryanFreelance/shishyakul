"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { hasPageAccess } from "@/utils/faculty-permissions";

const PermissionContext = createContext();

export const usePermission = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    isAdmin: false,
    isMember: false,
    roles: {
      Students: false,
      Fees: false,
      Content: false,
      Birthdays: false,
      Faculty: false,
      Attendance: false,
    },
    facultyAssignments: [],
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        console.log("authUser", authUser);

        // Check if user is admin
        if (authUser.email === "admin@shishyakul.in") {
          console.log("Admin user detected");
          setPermissions({
            isAdmin: true,
            isMember: true,
            roles: {
              Students: true,
              Fees: true,
              Content: true,
              Birthdays: true,
              Faculty: true,
              Attendance: true,
            },
            facultyAssignments: [], // Admin can see all students, no need for assignments
          });
          setLoading(false);
          return;
        }

        // Check if user is a member
        try {
          const memberRef = doc(db, "members", authUser.email);
          const memberDoc = await getDoc(memberRef);

          if (memberDoc.exists()) {
            const memberData = memberDoc.data();

            // Get faculty assignments if user has Faculty role
            let facultyAssignments = [];
            if (memberData.roles?.Faculty && memberData.uid) {
              try {
                const facultyRef = doc(db, "faculties", memberData.uid);
                const facultyDoc = await getDoc(facultyRef);
                if (facultyDoc.exists()) {
                  facultyAssignments = facultyDoc.data().assignedStudents || [];
                }
              } catch (error) {
                console.error("Error fetching faculty assignments:", error);
              }
            }
            const lPermissions = {
              isAdmin: false,
              isMember: true,
              roles: {
                Students: memberData.roles?.Students || false,
                Fees: memberData.roles?.Fees || false,
                Content: memberData.roles?.Content || false,
                Birthdays: memberData.roles?.Birthdays || false,
                Faculty: memberData.roles?.Faculty || false,
                Attendance: memberData.roles?.Attendance || false,
              },
              facultyAssignments,
            };
            console.log("LPERMISSION", lPermissions);

            setPermissions(lPermissions);
          } else {
            // User is not a member, redirect to student page
            setPermissions({
              isAdmin: false,
              isMember: false,
              roles: {
                Students: false,
                Fees: false,
                Content: false,
                Birthdays: false,
                Faculty: false,
                Attendance: false,
              },
              facultyAssignments: [],
            });
            router.push(`/student/user/${authUser.uid}`);
          }
        } catch (error) {
          console.error("Error fetching member data:", error);
          setPermissions({
            isAdmin: false,
            isMember: false,
            roles: {
              Students: false,
              Fees: false,
              Content: false,
              Birthdays: false,
              Faculty: false,
              Attendance: false,
            },
            facultyAssignments: [],
          });
        }
      } else {
        setUser(null);
        setPermissions({
          isAdmin: false,
          isMember: false,
          roles: {
            Students: false,
            Fees: false,
            Content: false,
            Birthdays: false,
            Faculty: false,
            Attendance: false,
          },
          facultyAssignments: [],
        });
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const hasPermission = (permission) => {
    // Admin always has access to everything
    if (permissions.isAdmin || user?.email === "admin@shishyakul.in")
      return true;
    if (!permissions.isMember) return false;

    // For page permissions, use our utility function
    if (
      [
        "students",
        "fees",
        "content",
        "birthdays",
        "tests",
        "attendance",
      ].includes(permission.toLowerCase())
    ) {
      return hasPageAccess(
        {
          roles: permissions.roles,
          facultyAssignments: permissions.facultyAssignments,
        },
        permission.toLowerCase()
      );
    }

    // For direct role checks (legacy approach)
    return permissions.roles[permission] || false;
  };

  const getFacultyAssignments = () => {
    return permissions.facultyAssignments || [];
  };

  return (
    <PermissionContext.Provider
      value={{
        user,
        permissions,
        loading,
        hasPermission,
        getFacultyAssignments,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

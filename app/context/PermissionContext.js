"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const PermissionContext = createContext();

export const usePermission = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState({
        isAdmin: false,
        isMember: false,
        roles: {
            Attendance: false,
            Tests: false,
            Fees: false,
            ManageStudents: false,
            Content: false,
            Members: false
        }
    });
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                console.log("authUser", authUser);

                // Check if user is admin
                if (authUser.email === "admin@shishyakul.in") {
                    setPermissions({
                        isAdmin: true,
                        isMember: true,
                        roles: {
                            Attendance: true,
                            Tests: true,
                            Fees: true,
                            ManageStudents: true,
                            Content: true,
                            Members: true
                        }
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
                        setPermissions({
                            isAdmin: false,
                            isMember: true,
                            roles: {
                                Attendance: memberData.roles?.Attendance || false,
                                Tests: memberData.roles?.Tests || false,
                                Fees: memberData.roles?.Fees || false,
                                ManageStudents: memberData.roles?.ManageStudents || false,
                                Content: memberData.roles?.Content || false,
                                Members: memberData.roles?.Members || false
                            }
                        });
                    } else {
                        // User is not a member, redirect to student page
                        setPermissions({
                            isAdmin: false,
                            isMember: false,
                            roles: {
                                Attendance: false,
                                Tests: false,
                                Fees: false,
                                ManageStudents: false,
                                Content: false,
                                Members: false
                            }
                        });
                        router.push(`/student/user/${authUser.uid}`);
                    }
                } catch (error) {
                    console.error("Error fetching member data:", error);
                    setPermissions({
                        isAdmin: false,
                        isMember: false,
                        roles: {
                            Attendance: false,
                            Tests: false,
                            Fees: false,
                            ManageStudents: false,
                            Content: false,
                            Members: false
                        }
                    });
                }
            } else {
                setUser(null);
                setPermissions({
                    isAdmin: false,
                    isMember: false,
                    roles: {
                        Attendance: false,
                        Tests: false,
                        Fees: false,
                        ManageStudents: false,
                        Content: false,
                        Members: false
                    }
                });
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const hasPermission = (permission) => {
        if (permissions.isAdmin) return true;
        if (!permissions.isMember) return false;

        return permissions.roles[permission] || false;
    };

    return (
        <PermissionContext.Provider value={{ user, permissions, loading, hasPermission }}>
            {children}
        </PermissionContext.Provider>
    );
}; 
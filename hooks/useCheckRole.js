"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import useRoleStore from '@/store/useRoleStore';

export function useCheckRole() {
    const router = useRouter();
    const { user } = useAuth();
    const { setUserRoles, clearRoles } = useRoleStore();

    useEffect(() => {
        if (!user) {
            clearRoles();
            return;
        }

        // Subscribe to the user's member document
        const unsubscribe = onSnapshot(
            doc(db, 'members', user.email),
            (doc) => {
                if (doc.exists()) {
                    setUserRoles(doc.data().roles);
                } else {
                    clearRoles();
                }
            },
            (error) => {
                console.error('Error fetching user roles:', error);
                clearRoles();
            }
        );

        return () => unsubscribe();
    }, [user, setUserRoles, clearRoles]);

    const requireRole = (role) => {
        const state = useRoleStore.getState();
        if (!state.userRoles || !state.userRoles[role]) {
            router.push('/dashboard');
            return false;
        }
        return true;
    };

    return { requireRole };
} 
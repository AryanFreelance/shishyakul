import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    getDoc,
} from "firebase/firestore";
import { db } from "./index";

// Add or update a member
export const saveMember = async (memberData) => {
    try {
        // Check if this is an update (existing member) or a new member
        const memberRef = doc(db, "members", memberData.email);
        const memberDoc = await getDoc(memberRef);
        const isExistingMember = memberDoc.exists();
        let uid;

        if (!isExistingMember) {
            // For new members, create authentication account
            const response = await fetch('/api/member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: memberData.email }),
            });

            // Parse and return the API response
            const userData = await response.json();
            console.log("USERDATA", userData);
            uid = userData.user.uid;
        } else {
            // For existing members, get the UID from the document
            uid = memberDoc.data().uid;
        }

        // Save member data to Firestore
        await setDoc(memberRef, {
            name: memberData.name,
            email: memberData.email,
            phone: memberData.phone,
            roles: memberData.roles,
            uid: uid,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log("DOCSET");

        // Faculty role management
        const facultyRef = doc(db, "faculties", uid);
        const facultyDoc = await getDoc(facultyRef);

        if (memberData.roles.Faculty) {
            // If faculty role is enabled, save/update faculty assignments
            console.log("Saving faculty assignments for user:", memberData.email, memberData.facultyAssignments);
            await setDoc(facultyRef, {
                assignedStudents: memberData.facultyAssignments || []
            }, { merge: true });
            console.log("Faculty assignments saved successfully");
        } else if (facultyDoc.exists() && !memberData.roles.Faculty) {
            // If faculty role is disabled but the faculty document exists, delete it
            console.log("Removing faculty role and assignments for user:", memberData.email);
            await deleteDoc(facultyRef);
            console.log("Faculty document deleted successfully");
        }

        return { user: { uid } };
    } catch (error) {
        console.error("Error saving member:", error);
        throw error;
    }
};

// Delete a member
export const deleteMember = async (email) => {
    try {
        // Get the member document first to retrieve the UID and check for faculty role
        const memberRef = doc(db, "members", email);
        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {
            console.error("Member not found for deletion:", email);
            throw new Error("Member not found");
        }

        const memberData = memberSnap.data();
        const uid = memberData.uid;

        if (!uid) {
            console.error("Member UID not found for deletion:", email);
            throw new Error("Member UID not found");
        }

        // Delete faculty assignments if the member has a Faculty role
        if (memberData.roles?.Faculty) {
            const facultyRef = doc(db, "faculties", uid);
            try {
                await deleteDoc(facultyRef);
                console.log("Faculty assignments deleted for:", email);
            } catch (error) {
                console.error("Error deleting faculty assignments:", error);
                // Continue with deletion anyway
            }
        }

        // Call the API to delete the user authentication
        const response = await fetch('/api/member', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        // Check response status
        if (!response.ok) {
            const errorData = await response.json();
            console.error("API error deleting member:", errorData);
            throw new Error(`API error: ${errorData.message || 'Unknown error'}`);
        }

        // Parse and log the API response
        const userData = await response.json();
        console.log("User deleted from Auth:", userData);

        // Delete member document from Firestore
        await deleteDoc(memberRef);
        console.log("Member document deleted from Firestore:", email);

        return true;
    } catch (error) {
        console.error("Error deleting member:", error);
        throw error;
    }
};

// Subscribe to members collection
export const subscribeToMembers = (callback) => {
    const membersRef = collection(db, "members");
    const q = query(membersRef);

    return onSnapshot(q, async (snapshot) => {
        const members = [];

        for (const docSnapshot of snapshot.docs) {
            const memberData = docSnapshot.data();
            let facultyAssignments = [];

            // If this member has Faculty role, get their assignments
            if (memberData.roles?.Faculty && memberData.uid) {
                try {
                    const facultyRef = doc(db, "faculties", memberData.uid);
                    const facultySnap = await facultyRef.get();
                    if (facultySnap.exists()) {
                        const facultyData = facultySnap.data();
                        facultyAssignments = facultyData.assignedStudents || [];
                    }
                } catch (error) {
                    console.error("Error fetching faculty assignments:", error);
                }
            }

            members.push({
                id: docSnapshot.id,
                ...memberData,
                facultyAssignments
            });
        }

        callback(members);
    }, (error) => {
        console.error("Error subscribing to members:", error);
    });
}; 
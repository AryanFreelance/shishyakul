import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
} from "firebase/firestore";
import { db } from "./index";

// Add or update a member
export const saveMember = async (memberData) => {
    try {
        // Make a POST request to /api/user with the member's email
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

        const memberRef = doc(db, "members", memberData.email);
        await setDoc(memberRef, {
            name: memberData.name,
            email: memberData.email,
            phone: memberData.phone,
            roles: memberData.roles,
            uid: userData.user.uid,
            updatedAt: new Date().toISOString(),
        });
        console.log("DOCSET");

        return userData;
    } catch (error) {
        console.error("Error saving member:", error);
        throw error;
    }
};

// Delete a member
export const deleteMember = async (email) => {
    try {
        // Make a POST request to /api/user with the member's email
        const response = await fetch('/api/member', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        // Parse and return the API response
        const userData = await response.json();
        console.log("USERDATA", userData);

        const memberRef = doc(db, "members", email);
        await deleteDoc(memberRef);
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

    return onSnapshot(q, (snapshot) => {
        const members = [];
        snapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data() });
        });
        callback(members);
    }, (error) => {
        console.error("Error subscribing to members:", error);
    });
}; 
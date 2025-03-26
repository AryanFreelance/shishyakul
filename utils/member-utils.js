import { getAuth } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Checks if the current user is a member and returns their roles
 * @returns {Promise<{isMember: boolean, roles: Object|null, isFaculty: boolean}>}
 */
export const checkMemberRoles = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return {
      isMember: false,
      roles: null,
      isFaculty: false,
    };
  }

  try {
    const memberDoc = await getDoc(doc(db, "members", user.email));
    if (memberDoc.exists()) {
      const memberData = memberDoc.data();
      return {
        isMember: true,
        roles: memberData.roles || {},
        isFaculty: memberData.roles?.Faculty || false,
      };
    }
    return {
      isMember: false,
      roles: null,
      isFaculty: false,
    };
  } catch (error) {
    console.error("Error checking member roles:", error);
    return {
      isMember: false,
      roles: null,
      isFaculty: false,
    };
  }
};

/**
 * Checks if the current user has a specific role
 * @param {string} role - The role to check for
 * @returns {Promise<boolean>}
 */
export const hasRole = async (role) => {
  const { roles } = await checkMemberRoles();
  return Boolean(roles?.[role]);
};

/**
 * Checks if the current user is a faculty member
 * @returns {Promise<boolean>}
 */
export const isFacultyMember = async () => {
  const { isFaculty } = await checkMemberRoles();
  return isFaculty;
};

/**
 * Checks if the current user is a member
 * @returns {Promise<boolean>}
 */
export const isMember = async () => {
  const { isMember } = await checkMemberRoles();
  return isMember;
};

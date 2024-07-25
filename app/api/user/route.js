// Delete Route to delete the user
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Path to your service account key file
const serviceAccount = require("@/firebase/firebase-sdk.json");

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function DELETE(req, res) {
  const body = await req.json();
  const { uid } = body;

  if (!uid) {
    return Response.json({ message: "UID is required" }, { status: 400 });
  }

  try {
    await getAuth().deleteUser(uid);
    return Response.json(
      { message: `Successfully deleted user with UID: ${uid}` },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `Error deleting user: ${error.message}` },
      { status: 400 }
    );
  }
}

import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";

function formatPrivateKey(key) {
  return key.replace(/\\n/g, "\n");
}

function createFirebaseAdminApp(params) {
  const privateKey = formatPrivateKey(params.privateKey);

  if (admin.apps.length > 0) {
    return admin.app();
  }

  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey,
  });

  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
    storageBucket: params.storageBucket,
  });
}

async function initAdmin() {
  const params = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  };

  return createFirebaseAdminApp(params);
}

export async function DELETE(req, res) {
  const body = await req.json();
  const { uid } = body;

  await initAdmin();

  if (!uid) {
    return Response.json({ message: "UID is required" }, { status: 400 });
  }

  try {
    await getAuth().deleteUser(uid);
    return Response.json(
      { message: `Successfully deleted user with User ID: ${uid}` },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `Error deleting user: ${error.message}` },
      { status: 400 }
    );
  }
}

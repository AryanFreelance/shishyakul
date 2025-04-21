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

export async function POST(req) {
    const body = await req.json();
    const { email } = body;

    await initAdmin();

    if (!email) {
        return Response.json({ message: "Email is required" }, { status: 400 });
    }

    try {
        const userRecord = await getAuth().createUser({
            email: email,
            password: 'shishyakul@2025'
        });

        return Response.json({
            message: "Successfully created user",
            user: userRecord
        }, { status: 201 });
    } catch (error) {
        return Response.json(
            { message: `Error creating user: ${error.message}` },
            { status: 400 }
        );
    }
}

export async function DELETE(req, res) {
    const body = await req.json();
    const { email } = body;

    await initAdmin();

    if (!email) {
        return Response.json({ message: "Email is required" }, { status: 400 });
    }

    try {
        // Get the member document using email
        const db = admin.firestore();
        const memberDoc = await db.collection('members').doc(email).get();

        if (!memberDoc.exists) {
            return Response.json({ message: "Member not found" }, { status: 404 });
        }

        const memberData = memberDoc.data();
        const uid = memberData.uid;

        if (!uid) {
            return Response.json({ message: "UID not found in member document" }, { status: 400 });
        }

        // Delete faculty assignments if member has a Faculty role
        if (memberData.roles?.Faculty) {
            try {
                // Delete faculty document
                await db.collection('faculties').doc(uid).delete();
                console.log(`Deleted faculty document for user ${email} with UID ${uid}`);
            } catch (facultyError) {
                console.error("Error deleting faculty document:", facultyError);
                // Continue with deletion even if faculty cleanup fails
            }
        }

        // Delete user authentication record using the uid from Firestore
        await getAuth().deleteUser(uid);

        // Delete the member document
        await db.collection('members').doc(email).delete();

        return Response.json({
            message: `Successfully deleted user with email: ${email}`
        }, { status: 200 });
    } catch (error) {
        return Response.json(
            { message: `Error deleting user: ${error.message}` },
            { status: 400 }
        );
    }
}

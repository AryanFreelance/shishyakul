import { db, storage } from "@/firebase"; // Ensure Firebase is set up correctly
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const addTeacher = async (data) => {
  try {
    const teachersRef = collection(db, "teachers");
    const newDocRef = doc(teachersRef);

    let profileUrl = "";

    if (data.profileImg) {
      // Create a storage reference
      const storageRef = ref(storage, `teachers/${newDocRef.id}/profileImage`);

      // Upload the file
      await uploadBytes(storageRef, data.profileImg);

      // Get the downloadable URL
      profileUrl = await getDownloadURL(storageRef);
    }

    const teacherData = {
      id: newDocRef.id,
      name: data.name,
      subject: data.subject,
      profileUrl
    };

    await setDoc(newDocRef, teacherData);

    console.log("Teacher added with ID:", newDocRef.id);
    return true; // Return true on success
  } catch (error) {
    console.error("Error adding teacher:", error);
    return false; // Return false on failure
  }
};

export const addTestimonial = async (data) => {
  try {
    const testimonialsRef = collection(db, "testimonials");
    const newDocRef = doc(testimonialsRef);

    const testimonialData = {
      id: newDocRef.id,
      ...data
    };

    await setDoc(newDocRef, testimonialData);

    console.log("Testimonial added with ID:", newDocRef.id);
    return true; // Return true on success
  } catch (error) {
    console.error("Error adding testimonial:", error);
    return false; // Return false on failure
  }
};
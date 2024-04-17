"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import DropzoneComponent from "react-dropzone";
import { errorToast, successToast } from "@/utils/toast";

const Dropper = () => {
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  //   const { isLoaded, isSignedIn, user } = useUser();
  //   const { toast } = useToast();

  //   const totalSize = useAppStore((state) => state.totalSize);
  const maxSize = 20971520;

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => {
        // toast({
        //   variant: "destructive",
        //   title: "File Uploading Error!",
        //   description: "File reading was aborted.",
        // });
        errorToast("File reading was aborted!");
      };
      reader.onerror = () =>
        // toast({
        //   variant: "destructive",
        //   title: "File Uploading Error!",
        //   description: "File reading has failed.",
        // });
        errorToast("File reading has failed!");
      reader.onload = async () => await uploadPost(file);
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadPost = async (selectedFile) => {
    if (loading) return;
    // if (!user) return;
    setLoading(true);

    try {
      console.log(selectedFile);
      // addDoc -> users/user1234/files
      //   const docRef = await addDoc(
      //     collection(db, "droppers", user.id, "files"),
      //     {
      //       userId: user.id,
      //       filename: selectedFile.name,
      //       fullName: user.fullName,
      //       profileImg: user.imageUrl,
      //       timestamp: serverTimestamp(),
      //       type: selectedFile.type,
      //       size: selectedFile.size,
      //     }
      //   );

      //   const imageRef = ref(storage, `droppers/${user.id}/files/${docRef.id}`);

      //   uploadBytes(imageRef, selectedFile).then(async (snapshot) => {
      //     const downloadUrl = await getDownloadURL(imageRef);

      //     await updateDoc(doc(db, "droppers", user.id, "files", docRef.id), {
      //       downloadUrl,
      //     });
      //   });

      //   toast({
      //     description: "File Uploaded Successfully!",
      //   });
      setUploaded(true);
      successToast("File Uploaded Successfully!");
    } catch (error) {
      //   toast({
      //     variant: "destructive",
      //     description: "Something went wrong!",
      //   });
      errorToast("Something went wrong!");
    }

    setLoading(false);
  };

  //   if (totalSize === -1) {
  //     return (
  //       // <div className="h-[200px] bg-primary/50 text-secondary flex justify-center items-center mx-4 my-4 rounded animate-pulse text-2xl md:text-3xl mb-4">
  //       //   Loading
  //       // </div>
  //       <Skeleton className="h-[200px] flex justify-center items-center mx-4 my-4 rounded text-2xl md:text-3xl mb-4" />
  //     );
  //   }

  if (uploaded) {
    return (
      <div className="my-4 mb-8">
        <iframe
          src="/demopdf.pdf"
          className="w-full rounded"
          height="480"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <DropzoneComponent minSize={0} maxSize={maxSize} onDrop={onDrop}>
      {({
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
      }) => {
        const isFileTooLarge =
          fileRejections.length > 0 && fileRejections[0].file.size > maxSize;
        return (
          <section className="my-4 mb-8">
            <div
              {...getRootProps()}
              className={cn(
                "w-full h-52 flex justify-center items-center p-5 border-2 border-secondary rounded-lg text-center",
                isDragActive
                  ? "bg-main text-secondary animate-pulse"
                  : "bg-slate-100/50 dark:bg-slate-800/80 text-black/80"
              )}
            >
              <input {...getInputProps()} />
              {!isDragActive && "Click or drag the test paper here..."}
              {isDragActive &&
                !isDragReject &&
                "Drop to upload this test paper!"}
              {isDragReject && "File type not accepted, sorry!"}
              {isFileTooLarge && (
                <div className="text-danger mt-2">
                  File is too large, try to upload a smaller file!
                </div>
              )}
            </div>
          </section>
        );
      }}
    </DropzoneComponent>
  );
};

export default Dropper;

"use client";

// import { auth } from "@/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/router";
// import React, { useState } from "react";

// const layout = ({ children }) => {
//   const [authStatus, setAuthStatus] = useState(null);

//   const router = useRouter();

//   onAuthStateChanged(auth, (user) => {
//     if (user) {
//       // User is signed in, see docs for a list of available properties
//       // https://firebase.google.com/docs/reference/js/auth.user
//       const uid = user.uid;
//       console.log(user);
//       setAuthStatus(true);
//       // ...
//     } else {
//       // User is signed out
//       // ...
//       setAuthStatus(false);
//       router.push("/login");
//     }
//   });

//   if (authStatus === null) {
//     return (
//       <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
//         Loading...
//       </div>
//     );
//   }

//   if (!authStatus) {
//     return (
//       <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
//         Redirecting...
//       </div>
//     );
//   }

//   return <div>{children}</div>;
// };

// export default layout;

import { auth } from "@/firebase";
// import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

// const client = new ApolloClient({
//   uri: "https://localhost:4000",
//   cache: new InMemoryCache(),
//   // credentials: "include",
// });

const Layout = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log(user);
        setAuthStatus(true);
      } else {
        setAuthStatus(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []); // Empty dependency array to run this effect only once

  if (authStatus === null) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Loading...
      </div>
    );
  }

  if (!authStatus) {
    return (
      <div className="flex justify-center items-center h-[100svh] text-2xl barlow-bold">
        Redirecting...
      </div>
    );
  }

  // return <ApolloProvider client={client}>{children}</ApolloProvider>;
  return <div>{children}</div>;
};

export default Layout;

import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ApolloWrapper } from "@/components/shared/ApolloWrapper";

export const metadata = {
  title: "Shishyakul | Tution Classes",
  description:
    "Welcome to Shishyakul, where we educate students of grade 8 - 12 to be the best version of themselves.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        ></link>
        <link rel="icon" href="/Logo-Minified.png" />
        <link rel="shortcut icon" href="/Logo-Minified.png" type="image/png" />
        <link rel="icon" href="/Logo-Minified.png" type="image/png" />
      </head>
      <body suppressHydrationWarning={true}>
        <ApolloWrapper>{children}</ApolloWrapper>
        <Toaster />
      </body>
    </html>
  );
}

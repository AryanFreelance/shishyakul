"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import Container from "./Container";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon, UserCircle } from "lucide-react";
import { signOut, getAuth } from "firebase/auth";
import { auth, db } from "@/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = ({ navLinks, isHome }) => {
  const [stickyTopClass, setStickyTopClass] = useState(false);
  const [userRoles, setUserRoles] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Get user roles
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);

        // Check if user is admin
        if (user.email === "admin@shishyakul.in") {
          setIsAdmin(true);
        }

        // Get user roles from members collection
        const memberDoc = await getDoc(doc(db, "members", user.email));
        if (memberDoc.exists()) {
          setUserRoles(memberDoc.data().roles || {});
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter navigation links based on user roles
  const filteredNavLinks = navLinks.filter((link) => {
    // If link has restrictFor property, check if user has any of those roles
    if (link.restrictFor) {
      // If user is admin, show all links
      if (isAdmin) return true;

      // Check if user has any of the restricted roles
      return !link.restrictFor.some((role) => userRoles[role]);
    }

    // If link has role property, check if user has that role
    if (link.role) {
      if (link.role === "Admin" && isAdmin) return true;
      if (link.role === "Faculty" && userRoles.Faculty) return true;
      if (!link.role) return true;
      return userRoles[link.role];
    }

    // If no role restrictions, show the link
    return true;
  });

  const goToSection = (href) => () => {
    isHome &&
      document.querySelector(href).scrollIntoView({
        behavior: "smooth",
      });

    !isHome && router.push(href);
  };

  const signoutHandler = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  if (typeof window !== "undefined") {
    window.onscroll = () => {
      if (window.scrollY > 0) {
        setStickyTopClass(true);
      } else {
        setStickyTopClass(false);
      }
    };
  }

  return (
    <Container
      className={`sticky-header ${stickyTopClass ? "h-[90px]" : "h-[110px]"}`}
    >
      <div className="flex justify-between items-center ">
        <div>
          <Link href="/">
            <Image
              src="/logofull.png"
              alt="Logo Image"
              className="h-[80px] object-contain w-fit"
              width={1000}
              height={1000}
            />
          </Link>
        </div>
        <div>
          <div className="hidden md:block">
            {filteredNavLinks.map((link) => (
              <Button
                key={link.title}
                variant="nav"
                onClick={goToSection(link.href)}
              >
                {link.title}
              </Button>
            ))}
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger>
                <span>
                  <MenuIcon />
                </span>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="mt-6">
                  <Image
                    src="/logofull.png"
                    alt="Logo"
                    className="w-full"
                    width={1000}
                    height={1000}
                  />
                </SheetHeader>
                <div className="flex flex-col gap-3 mt-8">
                  {filteredNavLinks.map((link) => (
                    <Button
                      key={link.title}
                      variant="nav"
                      asChild
                      onClick={goToSection(link.href)}
                    >
                      <span>{link.title}</span>
                    </Button>
                  ))}
                  {isHome && (
                    <Button
                      variant="nav"
                      asChild
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/login");
                      }}
                      className="md:hidden"
                    >
                      <span>Login</span>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {isHome && (
          <div className="flex justify-center items-center gap-4">
            <Button
              className="text-[16px] filled-button"
              variant="navBtn"
              onClick={goToSection("#contact-wrapper")}
            >
              Contact
            </Button>
            <Button
              className="text-[16px] filled-button hidden md:block"
              variant="navBtn"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}
            >
              Login
            </Button>
          </div>
        )}
        {!isHome && (
          <div className="flex items-center gap-4">
            {userEmail && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 h-10 w-10 rounded-full"
                  >
                    <UserCircle className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium mb-1">Email:</div>
                    <div className="text-muted-foreground break-all">
                      {userEmail}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium mb-1">Role:</div>
                    <div className="text-muted-foreground">
                      {isAdmin
                        ? "Admin"
                        : Object.entries(userRoles)
                            .filter(([_, value]) => value)
                            .map(([role]) => role)
                            .join(", ") || "Student"}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-500"
                    onClick={signoutHandler}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* <Button
              className="text-[16px] filled-button"
              variant="navBtn"
              onClick={signoutHandler}
            >
              Logout
            </Button> */}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Navbar;

"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import Container from "./Container";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Navbar = ({ navLinks, isHome }) => {
  const [stickyTopClass, setStickyTopClass] = useState(false);
  const router = useRouter();

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
        console.log(error);
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
      <div className={`flex justify-between items-center`}>
        <div>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo Image"
              className="h-[60px] w-full"
              width={1000}
              height={1000}
            />
          </Link>
        </div>
        <div>
          <div className="hidden md:block">
            {navLinks.length > 0 &&
              navLinks.map((link) => (
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
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-[100px] object-contain"
                    width={1000}
                    height={1000}
                  />
                </SheetHeader>
                <div className="flex flex-col gap-3 mt-8">
                  {navLinks.length > 0 &&
                    navLinks.map((link) => (
                      <Button
                        key={link.title}
                        variant="nav"
                        asChild
                        onClick={goToSection(link.href)}
                      >
                        <span>{link.title}</span>
                      </Button>
                    ))}
                  {
                    isHome && (
                      <Button
                        variant="nav"
                        asChild
                        onClick={(e) => {
                          e.preventDefault()
                          router.push("/login")
                        }}
                        className="md:hidden"
                      >
                        <span>Login</span>
                      </Button>
                    )
                  }
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
                e.preventDefault()
                router.push("/login")
              }}
            >
              Login
            </Button>
          </div>
        )}
        {!isHome && (
          <div>
            <Button
              className="text-[16px] filled-button"
              variant="navBtn"
              onClick={signoutHandler}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Navbar;

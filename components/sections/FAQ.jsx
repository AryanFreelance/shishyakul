"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";

const FAQ = () => {
  const [isOpen, setIsOpen] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    console.log(isOpen);
  }, [isOpen]);

  return (
    <div className="px-[1.4rem] md:px-[4rem]">
      <div className="mb-8">
        <h2 className="subheading mb-4">Frequently Asked Questions</h2>
        <p className="barlow-regular text-lg">
          Here are some common questions about the project. If you have any
          other questions, feel free to reach out.
        </p>
      </div>
      <div className="flex gap-10 flex-col lg:flex-row">
        <div className="lg:w-[50%]">
          <Collapsible
            open={isOpen[0]}
            onOpenChange={() =>
              setIsOpen((prev) => {
                const newState = [...prev];
                newState[0] = !newState[0];
                return newState;
              })
            }
          >
            <CollapsibleTrigger className="flex w-full justify-between">
              <span className="barlow-semibold text-xl">
                Can I use this in my project?
              </span>
              {isOpen[0] ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 barlow-regular text-md">
              Yes. Free to use for personal and commercial projects. No
              attribution required.
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-[1.2rem]" />
          <Collapsible
            open={isOpen[1]}
            onOpenChange={() =>
              setIsOpen((prev) => {
                const newState = [...prev];
                newState[1] = !newState[1];
                return newState;
              })
            }
          >
            <CollapsibleTrigger className="flex w-full justify-between">
              <span className="barlow-semibold text-xl">
                Can I use this in my project?
              </span>
              {isOpen[1] ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 barlow-regular text-md">
              Yes. Free to use for personal and commercial projects. No
              attribution required.
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-[1.2rem]" />
          <Collapsible
            open={isOpen[2]}
            onOpenChange={() =>
              setIsOpen((prev) => {
                const newState = [...prev];
                newState[2] = !newState[2];
                return newState;
              })
            }
          >
            <CollapsibleTrigger className="flex w-full justify-between">
              <span className="barlow-semibold text-xl">
                Can I use this in my project?
              </span>
              {isOpen[2] ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 barlow-regular text-md">
              Yes. Free to use for personal and commercial projects. No
              attribution required.
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-[1.2rem]" />
        </div>
        <div className="lg:w-[50%]">
          <Collapsible
            open={isOpen[3]}
            onOpenChange={() =>
              setIsOpen((prev) => {
                const newState = [...prev];
                newState[3] = !newState[3];
                return newState;
              })
            }
          >
            <CollapsibleTrigger className="flex w-full justify-between">
              <span className="barlow-semibold text-xl">
                Can I use this in my project?
              </span>
              {isOpen[3] ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 barlow-regular text-md">
              Yes. Free to use for personal and commercial projects. No
              attribution required.
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-[1.2rem]" />
          <Collapsible
            open={isOpen[4]}
            onOpenChange={() =>
              setIsOpen((prev) => {
                const newState = [...prev];
                newState[4] = !newState[4];
                return newState;
              })
            }
          >
            <CollapsibleTrigger className="flex w-full justify-between">
              <span className="barlow-semibold text-xl">
                Can I use this in my project?
              </span>
              {isOpen[4] ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 barlow-regular text-md">
              Yes. Free to use for personal and commercial projects. No
              attribution required.
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-[1.2rem]" />
          <Collapsible
            open={isOpen[5]}
            onOpenChange={() =>
              setIsOpen((prev) => {
                const newState = [...prev];
                newState[5] = !newState[5];
                return newState;
              })
            }
          >
            <CollapsibleTrigger className="flex w-full justify-between">
              <span className="barlow-semibold text-xl">
                Can I use this in my project?
              </span>
              {isOpen[5] ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 barlow-regular text-md">
              Yes. Free to use for personal and commercial projects. No
              attribution required.
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-[1.2rem]" />
        </div>
      </div>
    </div>
  );
};

export default FAQ;

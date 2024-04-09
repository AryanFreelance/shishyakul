import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center md:justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-[16px] bg-secondary text-primary barlow-semibold",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-main hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-primary text-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        nav: "text-secondary text-[16px] hover:bg-primary barlow-semibold",
        fill: "bg-[#fdb42a] text-[18px] md:text-[16px] text-primary hover:bg-[#fdb42a] text-secondary barlow-semibold duration-300 ease-in-out transition-all hover:translate-y-[-2px] hover:scale-100",
        navBtn:
          "bg-[#fdb42a] text-[16px] text-primary hover:bg-[#fdb42a] text-secondary barlow-semibold duration-300 ease-in-out transition-all hover:translate-y-[-2px] hover:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

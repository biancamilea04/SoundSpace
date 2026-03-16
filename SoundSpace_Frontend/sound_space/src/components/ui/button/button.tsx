import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import "./button.css";

type ButtonVariant =
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "spotify";

type ButtonSize = "default" | "sm" | "lg" | "xl" | "icon";

export const buttonVariants = ({
    variant = "default",
    size = "default",
    className = "",
}: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
} = {}) => cn(`ss-button ss-button--${variant} ss-button--size-${size}`, className);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return <Comp className={buttonVariants({ variant, size, className })} ref={ref} {...props} />;
    },
);
Button.displayName = "Button";

export { Button };

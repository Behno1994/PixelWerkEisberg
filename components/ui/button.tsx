import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  cn(
    "relative inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-300",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-signal text-abyss shadow-glow",
          "hover:-translate-y-0.5 hover:bg-ice hover:shadow-[0_0_50px_-8px_var(--color-signal)]",
        ),
        outline: cn(
          "border border-ice/25 bg-deep/40 text-glacier backdrop-blur-md",
          "hover:border-signal/60 hover:bg-deep/70 hover:text-white",
        ),
        ghost: "text-steel hover:text-glacier",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Wird gesetzt, rendert die Komponente einen `next/link` statt `<button>`. */
    href?: string;
  };

export function Button({ className, variant, size, href, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    const { children, ...rest } = props;
    return (
      <Link href={href} className={classes} {...(rest as React.ComponentPropsWithoutRef<"a">)}>
        {children}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}

export { buttonVariants };

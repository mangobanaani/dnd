import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "premium" | "gold" | "secondary" | "outline" | "ghost" | "ghostGold" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = "",
    variant = "primary",
    size = "md",
    isLoading,
    icon: Icon,
    iconPosition = "left",
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)] disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[1px] active:translate-y-[2px]";

    const variants = {
      primary: "bg-[#9d6fff] hover:bg-[#8b5cf6] text-white shadow-[0_2px_0_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_1px_0_rgba(0,0,0,0.8),0_2px_8px_rgba(0,0,0,0.3)] active:shadow-[0_0_0_rgba(0,0,0,0.8),0_1px_4px_rgba(0,0,0,0.2)]",
      premium: "bg-gradient-to-br from-[#9d6fff] to-[#7c3aed] border border-[#9d6fff]/30 text-white shadow-[0_2px_0_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_1px_0_rgba(0,0,0,0.8),0_2px_8px_rgba(0,0,0,0.3)] active:shadow-[0_0_0_rgba(0,0,0,0.8),0_1px_4px_rgba(0,0,0,0.2)]",
      gold: "bg-gradient-to-br from-[#d4af37] to-[#b8941f] border border-[#d4af37]/30 text-[#0a0a0f] shadow-[0_2px_0_rgba(0,0,0,0.8),0_4px_12px_rgba(212,175,55,0.4)] hover:shadow-[0_1px_0_rgba(0,0,0,0.8),0_2px_8px_rgba(212,175,55,0.3)] active:shadow-[0_0_0_rgba(0,0,0,0.8),0_1px_4px_rgba(212,175,55,0.2)]",
      secondary: "bg-[#1a1a1f] hover:bg-[#27272a] text-white border border-[#1a1a1f]",
      outline: "border border-[#1a1a1f] hover:bg-[#1a1a1f] text-[#f5f5f5]",
      ghost: "hover:bg-[#1a1a1f] text-[#f5f5f5]",
      ghostGold: "border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]",
      danger: "bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_2px_0_rgba(0,0,0,0.8),0_4px_12px_rgba(239,68,68,0.4)] hover:shadow-[0_1px_0_rgba(0,0,0,0.8),0_2px_8px_rgba(239,68,68,0.3)] active:shadow-[0_0_0_rgba(0,0,0,0.8),0_1px_4px_rgba(239,68,68,0.2)]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    const LoadingSpinner = () => (
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon size={iconSizes[size]} />}
            {children}
            {Icon && iconPosition === "right" && <Icon size={iconSizes[size]} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

import { HTMLAttributes, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "gold" | "success" | "warning" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  glow = false,
  icon: Icon,
  iconPosition = "left",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-md font-medium transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)]";

  const variants = {
    default: "bg-[#1a1a1f] text-[#f5f5f5] border border-[#1a1a1f]",
    primary: `bg-[#9d6fff]/20 text-[#9d6fff] border border-[#9d6fff]/30 ${glow ? "shadow-[0_0_12px_rgba(157,111,255,0.4)]" : ""}`,
    gold: `bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 ${glow ? "shadow-[0_0_12px_rgba(212,175,55,0.4)]" : ""}`,
    success: `bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 ${glow ? "shadow-[0_0_12px_rgba(16,185,129,0.4)]" : ""}`,
    warning: `bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 ${glow ? "shadow-[0_0_12px_rgba(245,158,11,0.4)]" : ""}`,
    danger: `bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 ${glow ? "shadow-[0_0_12px_rgba(239,68,68,0.4)]" : ""}`,
    outline: "border border-[#1a1a1f] text-[#f5f5f5] bg-transparent",
    ghost: "text-[#a1a1aa] bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={iconSizes[size]} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={iconSizes[size]} />}
    </span>
  );
}

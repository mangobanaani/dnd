import { HTMLAttributes, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "premium" | "gold";
  hover?: boolean;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconVariant?: "default" | "purple" | "gold";
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function Card({
  children,
  variant = "default",
  hover = true,
  className = "",
  ...props
}: CardProps) {
  const variantClasses = {
    default: "border-[#1a1a1f]",
    premium: "border-[#9d6fff]/20",
    gold: "border-[#d4af37]/20",
  };

  const hoverClasses = hover
    ? "transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)] hover:border-[#9d6fff]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    : "";

  return (
    <div
      className={`glass-card rounded-xl p-6 border ${variantClasses[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  iconVariant = "purple",
}: CardHeaderProps) {
  const iconColors = {
    default: "text-[#f5f5f5]",
    purple: "text-[#9d6fff]",
    gold: "text-[#d4af37]",
  };

  const iconGlow = {
    default: "",
    purple: "drop-shadow-[0_0_8px_rgba(157,111,255,0.6)]",
    gold: "drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]",
  };

  return (
    <div className="border-b border-[#1a1a1f] pb-4 mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            size={24}
            className={`${iconColors[iconVariant]} ${iconGlow[iconVariant]} transition-all duration-200`}
          />
        )}
        <div className="flex-1">
          <h3 className="font-display text-2xl text-[#f5f5f5] text-glow-purple">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[#a1a1aa] mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`pt-4 border-t border-[#1a1a1f] ${className}`}>
      {children}
    </div>
  );
}

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, success, icon: Icon, iconPosition = "left", id, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== null && value !== "";
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;
    const hasFloatingLabel = label && (isFocused || hasValue);

    const getInputClasses = () => {
      const baseClasses = "w-full rounded-lg glass-card transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)] text-[#f5f5f5] placeholder-[#a1a1aa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

      const paddingClasses = label
        ? `pt-6 pb-2 ${Icon ? (iconPosition === "left" ? "pl-12 pr-4" : "pl-4 pr-12") : "px-4"}`
        : `py-3 ${Icon ? (iconPosition === "left" ? "pl-12 pr-4" : "pl-4 pr-12") : "px-4"}`;

      let borderClasses = "border border-[#1a1a1f]";
      let shadowClasses = "";

      if (error) {
        borderClasses = "border-[#ef4444]";
        shadowClasses = "focus:border-[#ef4444] focus:shadow-[0_0_20px_rgba(239,68,68,0.3)]";
      } else if (success) {
        borderClasses = "border-[#10b981]";
        shadowClasses = "focus:border-[#10b981] focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]";
      } else {
        shadowClasses = "focus:border-[#9d6fff] focus:shadow-[0_0_20px_rgba(157,111,255,0.2)]";
      }

      return `${baseClasses} ${paddingClasses} ${borderClasses} ${shadowClasses} ${className}`;
    };

    return (
      <div className="w-full">
        <div className="relative">
          {label && (
            <label
              htmlFor={inputId}
              className={`
                absolute left-4 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0.0,0.2,1)] pointer-events-none
                ${Icon && iconPosition === "left" ? "left-12" : "left-4"}
                ${hasFloatingLabel
                  ? "top-1 text-xs text-[#9d6fff]"
                  : "top-3.5 text-sm text-[#a1a1aa]"
                }
              `}
            >
              {label}
            </label>
          )}
          {Icon && (
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 pointer-events-none
                ${iconPosition === "left" ? "left-4" : "right-4"}
                ${error ? "text-[#ef4444]" : success ? "text-[#10b981]" : "text-[#a1a1aa]"}
              `}
            >
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type="text"
            value={value}
            className={getInputClasses()}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-[#ef4444] flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

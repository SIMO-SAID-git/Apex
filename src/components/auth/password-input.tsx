"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, Label, FieldError } from "@/components/ui/input";

interface PasswordInputProps {
  label: string;
  name: string;
  autoComplete: "new-password" | "current-password";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, name, autoComplete, value, onChange, error, placeholder }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const inputId = useId();
    const errorId = `${inputId}-error`;

    return (
      <div>
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            name={name}
            type={isVisible ? "text" : "password"}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            hasError={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setIsVisible((v) => !v)}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError id={errorId} message={error} />
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

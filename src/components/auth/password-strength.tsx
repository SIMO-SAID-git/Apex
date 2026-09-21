const RULES: { test: (value: string) => boolean; label: string }[] = [
  { test: (v) => v.length >= 8, label: "8+ characters" },
  { test: (v) => /[A-Z]/.test(v), label: "Uppercase letter" },
  { test: (v) => /[a-z]/.test(v), label: "Lowercase letter" },
  { test: (v) => /[0-9]/.test(v), label: "Number" },
];

/**
 * An educational UI aid, not a security guarantee — meeting every rule here
 * satisfies the passwordSchema, but strength itself is inherently fuzzy.
 */
export function PasswordStrength({ password }: { password: string }) {
  const passedCount = RULES.filter((rule) => rule.test(password)).length;
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][passedCount] ?? "Weak";
  const barColor =
    passedCount <= 1 ? "bg-status-peak" : passedCount <= 2 ? "bg-status-moderate" : passedCount === 3 ? "bg-status-moderate" : "bg-status-quiet";

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2" aria-live="polite">
      <div className="flex gap-1">
        {RULES.map((rule, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < passedCount ? barColor : "bg-white/10"}`}
            aria-hidden
          />
        ))}
      </div>
      <p className="text-xs text-white/50">
        {strengthLabel} ·{" "}
        {RULES.filter((rule) => !rule.test(password))
          .map((rule) => rule.label)
          .join(", ") || "Meets all requirements"}
      </p>
    </div>
  );
}

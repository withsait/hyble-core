"use client";

// TODO: Install @marsidev/react-turnstile when needed
// import { Turnstile } from "@marsidev/react-turnstile";

interface Props {
  siteKey?: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
}

export function TurnstileWidget({
  onVerify,
}: Props) {
  // Temporarily disabled - call onVerify with empty token
  // Remove this when @marsidev/react-turnstile is installed
  return (
    <div className="w-full flex justify-center py-2">
      <button
        type="button"
        onClick={() => onVerify("")}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        [Turnstile disabled - click to continue]
      </button>
    </div>
  );
}

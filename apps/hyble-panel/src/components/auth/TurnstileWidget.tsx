"use client";

import { Turnstile } from "@marsidev/react-turnstile";

interface Props {
  siteKey?: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
}

export function TurnstileWidget({
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  onVerify,
  onError,
  theme = "auto",
}: Props) {
  if (!siteKey) {
    console.error("Turnstile site key is missing");
    return <div className="text-red-500 text-sm">Captcha yapılandırma hatası.</div>;
  }

  return (
    <div className="w-full flex justify-center py-2">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        options={{ theme }}
      />
    </div>
  );
}

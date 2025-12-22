"use client";

import { UniversalBar } from "@hyble/ui";

interface HeaderProps {
  user?: {
    name?: string | null;
    email: string;
    image?: string | null;
  } | null;
  credits?: number;
  cartCount?: number;
}

export function Header({ user, credits = 0, cartCount = 0 }: HeaderProps) {
  const handleLogin = () => {
    window.location.href = "https://api.hyble.co/api/auth/signin";
  };

  const handleLogout = () => {
    window.location.href = "https://api.hyble.co/api/auth/signout";
  };

  const handleCartClick = () => {
    window.location.href = "/checkout";
  };

  return (
    <div className="fixed left-64 right-0 top-0 z-30">
      <UniversalBar
        activeApp="console"
        user={user}
        credits={credits}
        cartCount={cartCount}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onCartClick={handleCartClick}
      />
    </div>
  );
}

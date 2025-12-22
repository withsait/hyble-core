"use client";

import { useState } from "react";
import { UniversalBar } from "@hyble/ui";

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // For now, user is null (not authenticated)
  // In production, this would come from session/auth context
  const user = null;
  const credits = 0;
  const cartCount = 0;

  const handleLogin = () => {
    // Redirect to login or show modal
    window.location.href = "https://api.hyble.co/api/auth/signin";
  };

  const handleLogout = () => {
    window.location.href = "https://api.hyble.co/api/auth/signout";
  };

  const handleCartClick = () => {
    window.location.href = "https://console.hyble.co/checkout";
  };

  return (
    <UniversalBar
      activeApp="gateway"
      user={user}
      credits={credits}
      cartCount={cartCount}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onCartClick={handleCartClick}
    />
  );
}

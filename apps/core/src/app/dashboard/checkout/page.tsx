"use client";

import { useRouter } from "next/navigation";
import { CheckoutWizard } from "@/components/cart/CheckoutWizard";

export default function CheckoutPage() {
  const router = useRouter();

  // Mock cart items - will be replaced with cart context/store
  const cartItems = [
    { id: "1", name: "Starter Plan (1 Yıl)", price: 59.99, quantity: 1 },
    { id: "2", name: "Premium Support", price: 9.99, quantity: 1 },
  ];

  const walletBalance = 25.50;

  const handleComplete = (orderId: string) => {
    // Redirect to success page
    router.push(`/dashboard/orders/${orderId}?success=true`);
  };

  const handleCancel = () => {
    router.push("/dashboard/cart");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">Ödeme</h1>
      <CheckoutWizard
        items={cartItems}
        walletBalance={walletBalance}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}

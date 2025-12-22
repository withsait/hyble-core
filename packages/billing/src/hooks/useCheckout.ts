"use client";

import { useState } from "react";
import { CheckoutSession, CheckoutResult, CheckoutStep, CHECKOUT_STEPS, PaymentMethod } from "../checkout";
import { useCart } from "./useCart";

interface UseCheckoutResult {
  session: CheckoutSession | null;
  currentStep: CheckoutStep;
  isProcessing: boolean;
  error: string | null;
  initializeCheckout: () => Promise<void>;
  setPaymentMethod: (method: PaymentMethod) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeCheckout: () => Promise<CheckoutResult>;
}

export function useCheckout(): UseCheckoutResult {
  const { items, total, clearCart } = useCart();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("review");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const initializeCheckout = async () => {
    if (items.length === 0) {
      setError("Cart is empty");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In production, this would create a checkout session via API
      const newSession: CheckoutSession = {
        id: `checkout_${Date.now()}`,
        cartId: `cart_${Date.now()}`,
        status: "pending",
        subtotal: total,
        discount: 0,
        tax: total * 0.2, // 20% VAT
        total: total * 1.2,
        currency: "GBP",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };

      setSession(newSession);
      setCurrentStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < CHECKOUT_STEPS.length - 1) {
      setCurrentStep(CHECKOUT_STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(CHECKOUT_STEPS[currentIndex - 1].id);
    }
  };

  const completeCheckout = async (): Promise<CheckoutResult> => {
    if (!session || !paymentMethod) {
      return { success: false, error: "Invalid checkout state" };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In production, this would process payment via API
      // const response = await fetch('/api/billing/checkout', {
      //   method: 'POST',
      //   body: JSON.stringify({ sessionId: session.id, paymentMethod }),
      // });

      // Mock success
      clearCart();
      setSession({
        ...session,
        status: "completed",
        paymentMethod,
      });
      setCurrentStep("confirm");

      return {
        success: true,
        orderId: `order_${Date.now()}`,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    session,
    currentStep,
    isProcessing,
    error,
    initializeCheckout,
    setPaymentMethod: (method) => setPaymentMethod(method),
    nextStep,
    prevStep,
    completeCheckout,
  };
}

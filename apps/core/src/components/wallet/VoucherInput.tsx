"use client";

import { useState } from "react";
import { Button, Input } from "@hyble/ui";
import { Ticket, Loader2, Check, X, Gift } from "lucide-react";

interface VoucherInputProps {
  onSuccess?: (amount: number) => void;
}

export function VoucherInput({ onSuccess }: VoucherInputProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "valid" | "invalid" | "redeemed">("idle");
  const [voucherInfo, setVoucherInfo] = useState<{ amount: number; type: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // TODO: Replace with tRPC mutations when voucher router is ready
  const handleValidate = async () => {
    if (!code.trim()) return;
    setStatus("validating");
    setIsValidating(true);

    // Mock validation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Demo: accept codes starting with "HYBLE"
    if (code.toUpperCase().startsWith("HYBLE")) {
      setStatus("valid");
      setVoucherInfo({ amount: 10, type: "PROMO" });
      setErrorMessage("");
    } else {
      setStatus("invalid");
      setErrorMessage("Geçersiz kupon kodu");
    }
    setIsValidating(false);
  };

  const handleRedeem = async () => {
    if (!code.trim() || !voucherInfo) return;
    setIsRedeeming(true);

    // Mock redeem
    await new Promise(resolve => setTimeout(resolve, 500));
    setStatus("redeemed");
    onSuccess?.(voucherInfo.amount);

    // Reset after 3 seconds
    setTimeout(() => {
      setCode("");
      setStatus("idle");
      setVoucherInfo(null);
    }, 3000);
    setIsRedeeming(false);
  };

  const handleReset = () => {
    setCode("");
    setStatus("idle");
    setVoucherInfo(null);
    setErrorMessage("");
  };

  const isLoading = isValidating || isRedeeming;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kupon kodunu girin"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (status !== "idle") {
                setStatus("idle");
                setVoucherInfo(null);
                setErrorMessage("");
              }
            }}
            className="pl-9 uppercase"
            disabled={status === "redeemed" || isLoading}
          />
        </div>

        {status === "idle" || status === "validating" ? (
          <Button
            onClick={handleValidate}
            disabled={!code.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Doğrula"
            )}
          </Button>
        ) : status === "valid" ? (
          <Button onClick={handleRedeem} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Kullan
              </>
            )}
          </Button>
        ) : status === "invalid" ? (
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-1" />
            Temizle
          </Button>
        ) : null}
      </div>

      {/* Status Messages */}
      {status === "valid" && voucherInfo && (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="p-2 bg-green-500/20 rounded-full">
            <Gift className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-600">Kupon Geçerli!</p>
            <p className="text-sm text-muted-foreground">
              {voucherInfo.type === "PROMO" ? "Promosyon" : "Bonus"}: €{voucherInfo.amount.toFixed(2)} değerinde
            </p>
          </div>
        </div>
      )}

      {status === "invalid" && errorMessage && (
        <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="p-2 bg-destructive/20 rounded-full">
            <X className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">Geçersiz Kupon</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        </div>
      )}

      {status === "redeemed" && (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="p-2 bg-green-500/20 rounded-full">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-600">Kupon Kullanıldı!</p>
            <p className="text-sm text-muted-foreground">
              Bakiyenize €{voucherInfo?.amount.toFixed(2)} eklendi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Card } from "@hyble/ui";
import { Wallet, Gift, Ticket, TrendingUp, Loader2 } from "lucide-react";

// Mock data - will be replaced with tRPC query when wallet router is implemented
const mockWallet = {
  mainBalance: 125.50,
  bonusBalance: 15.00,
  promoBalance: 5.00,
};

interface BalanceCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
  description?: string;
}

function BalanceCard({ title, amount, icon, color, description }: BalanceCardProps) {
  const colorStyles = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };

  const iconStyles = {
    blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <Card className={`p-4 border ${colorStyles[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">
            €{amount.toFixed(2)}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconStyles[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function BalanceCardSkeleton() {
  return (
    <Card className="p-4 border animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
        <div className="h-10 w-10 bg-muted rounded-lg" />
      </div>
    </Card>
  );
}

export function WalletCard() {
  // TODO: Replace with tRPC query when wallet router is ready
  // const { data: wallet, isLoading, error } = trpc.wallet.getBalance.useQuery();
  const wallet = mockWallet;
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Total Balance Skeleton */}
        <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/20 rounded" />
              <div className="h-10 w-32 bg-white/20 rounded" />
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full" />
          </div>
        </Card>

        {/* Balance Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
        </div>
      </div>
    );
  }


  const mainBalance = typeof wallet?.mainBalance === 'number' ? wallet.mainBalance : parseFloat(String(wallet?.balance || 0));
  const bonusBalance = typeof wallet?.bonusBalance === 'number' ? wallet.bonusBalance : 0;
  const promoBalance = typeof wallet?.promoBalance === 'number' ? wallet.promoBalance : 0;
  const totalBalance = mainBalance + bonusBalance + promoBalance;

  return (
    <div className="space-y-6">
      {/* Total Balance */}
      <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Toplam Bakiye</p>
            <p className="text-4xl font-bold mt-1">
              €{totalBalance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Tüm bakiye türleri dahil
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-full">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </Card>

      {/* Individual Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard
          title="Ana Bakiye"
          amount={mainBalance}
          icon={<Wallet className="h-5 w-5" />}
          color="blue"
          description="Yüklemelerden gelen bakiye"
        />
        <BalanceCard
          title="Bonus Bakiye"
          amount={bonusBalance}
          icon={<Gift className="h-5 w-5" />}
          color="green"
          description="Kampanyalardan kazanılan"
        />
        <BalanceCard
          title="Promosyon"
          amount={promoBalance}
          icon={<Ticket className="h-5 w-5" />}
          color="purple"
          description="Özel tekliflerden gelen"
        />
      </div>
    </div>
  );
}

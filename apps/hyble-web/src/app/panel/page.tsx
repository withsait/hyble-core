import Link from "next/link";

export default function PanelPage() {
  // This page would normally check auth and redirect to id.hyble.co if not logged in
  // For now, it shows a simple redirect message
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-500 mb-4">Hyble Panel</h1>
        <p className="text-zinc-400 mb-8">
          Servislerinizi yönetmek için giriş yapın.
        </p>
        <Link
          href="https://id.hyble.co/login?callbackUrl=https://panel.hyble.co"
          className="inline-block px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
    </div>
  );
}

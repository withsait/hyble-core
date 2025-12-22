// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Globe, Building2 } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // tRPC mutations and queries
  const createOrg = trpc.organization.create.useMutation({
    onSuccess: (data) => {
      router.push(`/organizations/${data.organization.slug}`);
    },
  });

  const { data: slugCheck, isLoading: checkingSlug } = trpc.organization.checkSlugAvailability.useQuery(
    { slug },
    { enabled: slug.length >= 3 }
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || slug.length < 3) return;

    createOrg.mutate({
      name,
      slug,
      description: description || undefined,
      website: website || undefined,
    });
  };

  const isSlugValid = slug.length >= 3 && slugCheck?.available;
  const isSlugTaken = slug.length >= 3 && slugCheck?.available === false;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/organizations"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Yeni Organizasyon
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Ekibiniz için yeni bir organizasyon oluşturun.
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
        <div className="flex gap-3">
          <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Organizasyon Nedir?</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Organizasyonlar, projelerinizi ve ekibinizi bir arada yönetmenize olanak tanır.
              Üyeleri davet edebilir, rolleri yönetebilir ve faturalandırmayı merkezileştirebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Organizasyon Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Acme Inc."
            required
            minLength={2}
            maxLength={100}
          />
          <p className="mt-1 text-xs text-slate-500">{name.length}/100</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l-lg text-slate-500 dark:text-slate-400 text-sm">
              hyble.co/org/
            </span>
            <div className="relative flex-1">
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-r-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                  isSlugTaken
                    ? "border-red-500"
                    : isSlugValid
                    ? "border-green-500"
                    : "border-slate-300 dark:border-slate-600"
                }`}
                placeholder="acme"
                pattern="[a-z0-9-]+"
                required
                minLength={3}
                maxLength={50}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingSlug && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                {!checkingSlug && isSlugValid && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {!checkingSlug && isSlugTaken && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
          <p className={`mt-1 text-xs ${isSlugTaken ? "text-red-500" : "text-slate-500"}`}>
            {isSlugTaken
              ? "Bu slug zaten kullanılıyor. Lütfen başka bir slug seçin."
              : "Sadece küçük harf, rakam ve tire kullanabilirsiniz. En az 3 karakter."}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Web Sitesi (Opsiyonel)
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l-lg text-slate-500 dark:text-slate-400">
              <Globe className="h-4 w-4" />
            </span>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-r-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Açıklama (Opsiyonel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Organizasyonunuz hakkında kısa bir açıklama..."
            maxLength={500}
          />
          <p className="mt-1 text-xs text-slate-500">{description.length}/500</p>
        </div>

        {createOrg.error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {createOrg.error.message || "Bir hata oluştu. Lütfen tekrar deneyin."}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/organizations"
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={createOrg.isPending || !name || !slug || slug.length < 3 || isSlugTaken}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {createOrg.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                Organizasyon Oluştur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

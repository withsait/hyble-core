"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Globe,
} from "lucide-react";

const frameworks = [
  { id: "nextjs", name: "Next.js", icon: "⚡", description: "React framework with SSR" },
  { id: "react", name: "React", icon: "⚛️", description: "SPA with Vite or CRA" },
  { id: "vue", name: "Vue.js", icon: "💚", description: "Progressive framework" },
  { id: "svelte", name: "Svelte", icon: "🔥", description: "Compile-time framework" },
  { id: "static", name: "Static HTML", icon: "📄", description: "Plain HTML/CSS/JS" },
];

type Step = "framework" | "details" | "confirm";

export function CreateSiteWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("framework");
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [siteName, setSiteName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");

  // TODO: Replace with tRPC mutation when cloud router is ready
  // const createSite = trpc.cloud.sites.create.useMutation({...});
  const [isCreating, setIsCreating] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 30);
  };

  const handleNameChange = (name: string) => {
    setSiteName(name);
    if (!siteSlug || siteSlug === generateSlug(siteName)) {
      setSiteSlug(generateSlug(name));
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    // Mock creation - will be replaced with tRPC mutation
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(`/dashboard/cloud/${siteSlug}`);
  };

  const canProceed = () => {
    switch (step) {
      case "framework":
        return !!selectedFramework;
      case "details":
        return siteName.length >= 2 && siteSlug.length >= 2;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step === "framework") setStep("details");
    else if (step === "details") setStep("confirm");
  };

  const prevStep = () => {
    if (step === "details") setStep("framework");
    else if (step === "confirm") setStep("details");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center mb-8">
        {["framework", "details", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : ["framework", "details"].slice(0, i).includes(step as any)
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div className={`h-0.5 w-12 mx-2 ${
                i === 0 && step !== "framework"
                  ? "bg-primary"
                  : i === 1 && step === "confirm"
                  ? "bg-primary"
                  : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-6">
        {step === "framework" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Framework Seçin</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Projenizin türüne uygun framework'ü seçin
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {frameworks.map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => setSelectedFramework(fw.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                    selectedFramework === fw.id
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{fw.icon}</span>
                    <div>
                      <p className="font-medium">{fw.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fw.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Site Detayları</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Sitenizin adını ve adresini belirleyin
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Adı</Label>
                <Input
                  id="name"
                  placeholder="Örn: My Portfolio"
                  value={siteName}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Site Adresi</Label>
                <div className="flex items-center">
                  <Input
                    id="slug"
                    placeholder="my-portfolio"
                    value={siteSlug}
                    onChange={(e) => setSiteSlug(generateSlug(e.target.value))}
                    className="rounded-r-none"
                  />
                  <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm">
                    .hyble.net
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Siteniz https://{siteSlug || "slug"}.hyble.net adresinde yayınlanacak
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Onay</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Bilgilerinizi kontrol edin
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Framework</span>
                <span className="font-medium">
                  {frameworks.find(f => f.id === selectedFramework)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Site Adı</span>
                <span className="font-medium">{siteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adres</span>
                <span className="font-medium">{siteSlug}.hyble.net</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Otomatik SSL Sertifikası
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Siteniz otomatik olarak HTTPS ile güvenli hale getirilecek.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === "framework"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>

          {step === "confirm" ? (
            <Button
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Site Oluştur
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              İleri
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

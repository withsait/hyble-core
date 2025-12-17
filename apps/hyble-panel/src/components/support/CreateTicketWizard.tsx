"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  HelpCircle,
  CreditCard,
  Server,
  ShieldAlert,
  MessageSquare,
  Paperclip,
  X,
  FileText,
} from "lucide-react";

const categories = [
  { id: "technical", nameTr: "Teknik Destek", nameEn: "Technical Support", icon: <Server className="h-6 w-6" />, description: "Sunucu, hosting veya teknik sorunlar" },
  { id: "billing", nameTr: "Fatura & Ödeme", nameEn: "Billing & Payment", icon: <CreditCard className="h-6 w-6" />, description: "Fatura, ödeme veya abonelik sorunları" },
  { id: "security", nameTr: "Güvenlik", nameEn: "Security", icon: <ShieldAlert className="h-6 w-6" />, description: "Güvenlik endişeleri veya şüpheli aktivite" },
  { id: "general", nameTr: "Genel Soru", nameEn: "General Inquiry", icon: <HelpCircle className="h-6 w-6" />, description: "Diğer sorular ve talepler" },
];

type Step = "category" | "details" | "review";
type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export function CreateTicketWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [files, setFiles] = useState<File[]>([]);

  const createTicket = trpc.support.tickets.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/support/${data.referenceNo}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = newFiles.filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (step) {
      case "category":
        return !!selectedCategory;
      case "details":
        return subject.length >= 5 && message.length >= 20;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step === "category") setStep("details");
    else if (step === "details") setStep("review");
  };

  const prevStep = () => {
    if (step === "details") setStep("category");
    else if (step === "review") setStep("details");
  };

  const handleSubmit = () => {
    createTicket.mutate({
      categorySlug: selectedCategory,
      subject,
      message,
      priority,
      // Files would need separate upload handling
    });
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center mb-8">
        {["category", "details", "review"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : ["category", "details"].slice(0, i).includes(step as any)
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div className={`h-0.5 w-12 mx-2 ${
                i === 0 && step !== "category"
                  ? "bg-primary"
                  : i === 1 && step === "review"
                  ? "bg-primary"
                  : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 1: Category */}
        {step === "category" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Kategori Seçin</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Talebinizin türünü seçin
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                    selectedCategory === cat.id
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground">{cat.icon}</div>
                    <div>
                      <p className="font-medium">{cat.nameTr}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Talep Detayları</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Sorununuzu detaylı açıklayın
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Konu</Label>
                <Input
                  id="subject"
                  placeholder="Örn: Sunucu erişim sorunu"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 5 karakter
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Açıklama</Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Sorununuzu detaylı açıklayın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 20 karakter ({message.length}/20)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Öncelik</Label>
                <div className="flex gap-2">
                  {(["LOW", "NORMAL", "HIGH", "CRITICAL"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        priority === p
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {p === "LOW" && "Düşük"}
                      {p === "NORMAL" && "Normal"}
                      {p === "HIGH" && "Yüksek"}
                      {p === "CRITICAL" && "Kritik"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dosya Ekleri (Opsiyonel)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="files"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.log"
                  />
                  <label
                    htmlFor="files"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Dosya eklemek için tıklayın</p>
                    <p className="text-xs text-muted-foreground">
                      Max 5 dosya, 10MB/dosya
                    </p>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Onay</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Bilgilerinizi kontrol edin
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-3">
                {selectedCategoryData?.icon}
                <div>
                  <p className="text-sm text-muted-foreground">Kategori</p>
                  <p className="font-medium">{selectedCategoryData?.nameTr}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Konu</p>
                <p className="font-medium">{subject}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Açıklama</p>
                <p className="text-sm whitespace-pre-wrap">{message}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Öncelik</p>
                <p className="font-medium">
                  {priority === "LOW" && "Düşük"}
                  {priority === "NORMAL" && "Normal"}
                  {priority === "HIGH" && "Yüksek"}
                  {priority === "CRITICAL" && "Kritik"}
                </p>
              </div>

              {files.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Ek Dosyalar</p>
                  <p className="font-medium">{files.length} dosya</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Tahmini Yanıt Süresi
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Destek ekibimiz genellikle 24 saat içinde yanıt verir.
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
            disabled={step === "category"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>

          {step === "review" ? (
            <Button
              onClick={handleSubmit}
              disabled={createTicket.isPending}
            >
              {createTicket.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Talebi Oluştur
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

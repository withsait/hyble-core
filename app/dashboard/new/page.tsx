import { createProject } from "@/app/actions"; // Az önce yazdığımız fonksiyon
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      
      <div className="w-full max-w-2xl">
        {/* Geri Dön Butonu */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Dashboard'a Dön
        </Link>

        {/* Form Kartı */}
        <div className="bg-surface border border-white/10 p-8 rounded-3xl shadow-2xl">
          
          <h1 className="text-3xl font-bold font-display text-white mb-2">Yeni Proje Oluştur</h1>
          <p className="text-gray-400 mb-8">Hyble portföyüne yeni bir başarı hikayesi ekle.</p>

          {/* Form Başlangıcı - action kısmına dikkat! */}
          <form action={createProject} className="space-y-6">
            
            {/* Proje Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">PROJE ADI</label>
              <input 
                name="name"
                type="text" 
                required
                placeholder="Örn: Yvkkova E-Ticaret Sitesi"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>

            {/* Durum Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">DURUM</label>
              <select 
                name="status"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-secondary outline-none appearance-none"
              >
                <option value="PENDING">Beklemede (Pending)</option>
                <option value="ACTIVE">Aktif (Active)</option>
                <option value="COMPLETED">Tamamlandı (Completed)</option>
              </select>
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">AÇIKLAMA</label>
              <textarea 
                name="description"
                rows={4}
                required
                placeholder="Proje detayları, kullanılan teknolojiler..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Kaydet Butonu */}
            <button 
              type="submit"
              className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_#CCFF00]"
            >
              <Save className="w-5 h-5" />
              Projeyi Kaydet ve Yayınla
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası - Hyble",
  description: "Hyble gizlilik politikası. Verilerinizi nasıl topladığımız ve kullandığımız hakkında bilgi.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Gizlilik Politikası
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Son güncelleme: 16 Aralık 2024
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              1. Giriş
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hyble Ltd. ("Hyble", "biz", "bizim") olarak gizliliğinize saygı duyuyor ve
              kişisel verilerinizi korumaya kararlıyız. Bu Gizlilik Politikası, hizmetlerimizi
              kullanırken hangi verileri topladığımızı, nasıl kullandığımızı ve haklarınızı açıklar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              2. Topladığımız Veriler
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Hizmetlerimizi sağlamak için aşağıdaki verileri toplayabiliriz:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Kimlik bilgileri (ad, e-posta adresi)</li>
              <li>Hesap bilgileri (kullanıcı adı, şifre hash)</li>
              <li>Kullanım verileri (IP adresi, tarayıcı türü, erişim zamanları)</li>
              <li>Ödeme bilgileri (fatura adresi, ödeme yöntemi - kredi kartı bilgileri saklanmaz)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              3. Verilerin Kullanımı
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Topladığımız verileri şu amaçlarla kullanırız:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Hizmetlerimizi sağlamak ve iyileştirmek</li>
              <li>Hesabınızı yönetmek ve güvenliğini sağlamak</li>
              <li>Destek taleplerini yanıtlamak</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              4. Veri Güvenliği
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz.
              Tüm veriler 256-bit SSL şifrelemesi ile korunur. Şifreler bcrypt algoritması
              ile hash'lenir ve düz metin olarak asla saklanmaz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              5. GDPR Hakları
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Avrupa Birliği'nde iseniz, GDPR kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Verilerinize erişim hakkı</li>
              <li>Verilerinizi düzeltme hakkı</li>
              <li>Verilerinizi silme hakkı ("unutulma hakkı")</li>
              <li>Veri taşınabilirliği hakkı</li>
              <li>İşlemeye itiraz hakkı</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              6. Çerezler
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hizmetlerimizi iyileştirmek için çerezler kullanıyoruz. Çerezler, oturum
              yönetimi ve tercihlerinizi hatırlamak için kullanılır. Tarayıcı ayarlarınızdan
              çerezleri devre dışı bırakabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              7. İletişim
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Gizlilik politikamız hakkında sorularınız için{" "}
              <a href="mailto:privacy@hyble.co" className="text-blue-600 dark:text-blue-400 hover:underline">
                privacy@hyble.co
              </a>{" "}
              adresinden bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

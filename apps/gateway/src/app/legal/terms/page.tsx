import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları - Hyble",
  description: "Hyble kullanım şartları ve koşulları.",
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Kullanım Şartları
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Son güncelleme: 16 Aralık 2024
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              1. Kabul
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hyble platformunu kullanarak bu Kullanım Şartlarını kabul etmiş olursunuz.
              Bu şartları kabul etmiyorsanız, hizmetlerimizi kullanmamalısınız.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              2. Hesap Oluşturma
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Hizmetlerimizi kullanmak için bir hesap oluşturmanız gerekebilir.
              Hesap oluştururken:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>Hesap güvenliğinizden siz sorumlusunuz</li>
              <li>Hesabınızla yapılan tüm işlemlerden siz sorumlusunuz</li>
              <li>18 yaşından büyük olmalısınız</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              3. Kabul Edilebilir Kullanım
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Hizmetlerimizi kullanırken aşağıdakileri yapmamalısınız:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
              <li>Yasadışı faaliyetlerde bulunmak</li>
              <li>Başkalarının haklarını ihlal etmek</li>
              <li>Zararlı yazılım dağıtmak</li>
              <li>Sistemi kötüye kullanmak veya aşırı yüklemek</li>
              <li>Spam veya istenmeyen içerik göndermek</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              4. Fikri Mülkiyet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hyble markası, logosu ve tüm içerik Hyble Ltd.'nin mülkiyetindedir.
              İzinsiz kullanım yasaktır. Platformda oluşturduğunuz içerikler size aittir,
              ancak bize hizmet sağlamak için gerekli lisansı vermiş olursunuz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Ödeme ve Faturalandırma
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Ücretli hizmetler için geçerli bir ödeme yöntemi sağlamalısınız.
              Abonelikler otomatik olarak yenilenir. İptal için en az 24 saat önceden
              bildirimde bulunmanız gerekir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              6. Hizmet Değişiklikleri
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hizmetlerimizi herhangi bir zamanda değiştirme veya sonlandırma hakkını
              saklı tutarız. Önemli değişiklikler için önceden bildirim yapılacaktır.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              7. Sorumluluk Sınırlaması
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hizmetlerimiz "olduğu gibi" sağlanır. Yasaların izin verdiği ölçüde,
              dolaylı, tesadüfi veya sonuç olarak ortaya çıkan zararlardan sorumlu değiliz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              8. Uygulanacak Hukuk
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Bu şartlar İngiltere ve Galler hukukuna tabidir. Uyuşmazlıklar
              İngiltere mahkemelerinde çözülecektir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              9. İletişim
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Bu şartlar hakkında sorularınız için{" "}
              <a href="mailto:legal@hyble.co" className="text-blue-600 dark:text-blue-400 hover:underline">
                legal@hyble.co
              </a>{" "}
              adresinden bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

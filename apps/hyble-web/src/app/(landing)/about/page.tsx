import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda - Hyble",
  description: "Hyble hakkında daha fazla bilgi edinin. Misyonumuz, vizyonumuz ve ekibimiz.",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
          Hakkımızda
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Misyonumuz
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Geliştiricilerin ve işletmelerin dijital altyapılarını tek bir platformdan
              yönetmelerini sağlamak. Kimlik doğrulama, ödeme sistemleri ve bulut
              hizmetlerini birleştirerek karmaşıklığı ortadan kaldırıyoruz.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Vizyonumuz
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Dünya genelinde yazılım geliştiricilerinin tercih ettiği, güvenilir ve
              yenilikçi dijital ekosistem olmak. Yapay zeka destekli araçlarımızla
              iş süreçlerini otomatikleştirerek değer yaratmak.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Değerlerimiz
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Güvenilirlik</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Verilerinizin güvenliği bizim için en önemli önceliktir.
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Şeffaflık</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Açık iletişim ve dürüstlük her zaman ön plandadır.
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Yenilikçilik</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Sürekli gelişen teknoloji ile hizmetlerimizi iyileştiriyoruz.
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Müşteri Odaklılık</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Kullanıcı deneyimi tüm kararlarımızın merkezindedir.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              İletişim
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Sorularınız veya önerileriniz için{" "}
              <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                iletişim sayfamızı
              </a>{" "}
              ziyaret edebilir veya doğrudan{" "}
              <a href="mailto:hello@hyble.co" className="text-blue-600 dark:text-blue-400 hover:underline">
                hello@hyble.co
              </a>{" "}
              adresine e-posta gönderebilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

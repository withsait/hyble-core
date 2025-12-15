# 📋 BACKLOG - Ertelenen Özellikler

> Bu dosya, her fazın "Dahil Olmayanlar" bölümünden derlenen, gelecek fazlara ertelenen özellikleri içerir.
> Her faz tamamlandığında güncellenir.

**Son Güncelleme:** 2025-12-15
**Güncellenen Faz:** FAZ 3

---

## 📊 ÖZET

| Hedef Faz | Özellik Sayısı | Durum |
|-----------|----------------|-------|
| FAZ 4 | 4 | 🟧 Bekliyor |
| FAZ 5 | 12 | 🟧 Bekliyor |
| FAZ 6 | 25 | 🟧 Bekliyor |
| FAZ 6+ | 2 | 🟧 Bekliyor |

---

## 🟡 FAZ 4 - Hedeflenen Özellikler

| Kaynak Kart | Özellik | Açıklama | Öncelik |
|-------------|---------|----------|---------|
| FAZ3-NOTIFY | Rich Push bildirimleri | Görsel ve buton içeren push notifications | P2 |
| FAZ3-NOTIFY | Slack entegrasyonu | Slack workspace bildirimleri | P2 |
| FAZ3-NOTIFY | Gelişmiş analytics dashboard | Bildirim performans metrikleri | P3 |
| FAZ3-STATUS | Slack/Discord webhook | Status güncellemelerini Slack/Discord'a gönderme | P2 |

---

## 🟠 FAZ 5 - Hedeflenen Özellikler

### FAZ3-NOTIFY Kaynaklı
| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| SMS bildirimleri | Kritik bildirimler için SMS kanalı | P2 |
| Marketing kampanya builder | Toplu bildirim kampanyaları oluşturma | P3 |
| A/B testing | Bildirim içerik testleri | P3 |

### FAZ3-SUPPORT Kaynaklı
| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Makrolar / Canned responses | Hazır yanıt şablonları | P1 |
| İç notlar (Whisper) | Müşterinin görmediği agent notları | P2 |
| Alt kategoriler | Kategori altında alt kategoriler | P2 |
| Ticket templates | Müşteri tarafı hazır formlar (Bug raporu, vb.) | P2 |
| Knowledge base entegrasyonu | Ticket açarken SSS önerisi (deflection) | P2 |

### FAZ3-CLOUD Kaynaklı
| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Git entegrasyonu | GitHub, GitLab webhook bağlantısı | P1 |
| Otomatik deploy | Push to deploy (Git push → auto build) | P1 |
| Gelişmiş build system | Docker multi-stage builds | P2 |
| Team collaborators | Site bazlı ekip erişimi | P2 |

---

## 🔴 FAZ 6 - Hedeflenen Özellikler

### FAZ3-STATUS Kaynaklı
| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Otomatik health check monitoring | Prometheus/Grafana entegrasyonu | P1 |
| Auto-detect incident | Otomatik kesinti tespiti ve incident oluşturma | P1 |
| SLA tracking ve kredi hesaplama | Plan bazlı SLA takibi, otomatik kredi | P1 |
| IP Whitelist / Secret key bypass | Bakım sırasında ekip erişimi | P2 |
| Granular maintenance | Partial, Region-based, Feature-based bakım | P2 |
| Eskalasyon zinciri | SMS, Telefon ile eskalasyon | P2 |
| Panik butonu | Tek tıkla tüm siteyi bakıma alma | P2 |
| Dependency mapping | Servisler arası bağımlılık, cascade status | P3 |
| Custom domain | status.mineble.com gibi özel domainler | P3 |
| Status page analytics | Sayfa görüntüleme, abone metrikleri | P3 |

### FAZ3-SUPPORT Kaynaklı
| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Discord bot entegrasyonu | Discord üzerinden ticket açma/yönetme | P1 |
| Email piping | Gelen email'i otomatik ticket'a çevirme | P1 |
| Ticket birleştirme | Aynı konudaki ticketları birleştirme | P2 |
| Otomasyon kuralları | Trigger-based otomatik aksiyonlar | P2 |
| Proje bazlı ticket | Ticket'ları projelere bağlama | P2 |
| Organization ticket erişimi | Org üyeleri ortak ticket görüntüleme | P2 |
| Plan bazlı SLA | Enterprise için farklı SLA süreleri | P2 |
| Skill-based / Round Robin atama | Gelişmiş ticket atama algoritmaları | P2 |
| Detaylı raporlama dashboard | Agent performans, kategori analizi | P2 |
| CSAT follow-up | Düşük puana özel takip emaili | P3 |

### FAZ3-CLOUD Kaynaklı
| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| Preview deployments | PR bazlı önizleme linkleri | P1 |
| Managed databases | PostgreSQL, MySQL, Redis add-on | P1 |
| Uptime monitoring & alerts | Site uptime takibi, alert kuralları | P1 |
| Metrics/Analytics dashboard | Bandwidth, request, error metrikleri | P2 |
| CLI tool (hyble-cli) | Terminal üzerinden site yönetimi | P2 |
| WordPress optimized hosting | WP için optimize edilmiş hosting | P2 |
| White-label (ajans partner) | Ajanslar için beyaz etiket çözümü | P3 |
| SLA kredileri (otomatik) | Uptime ihlalinde otomatik kredi | P3 |

---

## 🟣 FAZ 6+ - Gelecek Vizyonu

| Kaynak Kart | Özellik | Açıklama | Öncelik |
|-------------|---------|----------|---------|
| FAZ3-CLOUD | Multi-region deployment | Birden fazla bölgede hosting | P3 |
| FAZ3-CLOUD | Serverless functions | Edge/Serverless function desteği | P3 |
| FAZ3-STATUS | Private status pages | Müşteriye özel status sayfaları | P3 |
| FAZ3-SUPPORT | Live chat | Anlık destek chat'i | P3 |

---

## 📝 NOTLAR

### Öncelik Açıklamaları
- **P1 (High):** İş kritik, müşteri beklentisi yüksek
- **P2 (Medium):** Önemli ama ertelenebilir
- **P3 (Low):** Nice-to-have, kaynağa göre değerlendirilecek

### Güncelleme Kuralları
1. Her faz tamamlandığında "Dahil Olmayanlar" bu dosyaya eklenir
2. Faz başlarken bu dosya kontrol edilir
3. İlgili özellikler o fazın kartlarına taşınır
4. Tamamlanan özellikler işaretlenir veya silinir

### Karar Geçmişi
| Tarih | Karar | Sebep |
|-------|-------|-------|
| 2025-12-15 | FAZ6-STATUS → FAZ3-STATUS'a taşındı | MVP olarak sadeleştirildi |
| 2025-12-15 | FAZ6-SUPPORT → FAZ3-SUPPORT'a taşındı | MVP olarak sadeleştirildi |
| 2025-12-15 | FAZ6-CLOUD → FAZ3-CLOUD'a taşındı | MVP olarak sadeleştirildi |

---

## 🔄 FAZ BAZLI KONTROL LİSTESİ

### FAZ 4 Başlarken
- [ ] Bu dosyadan FAZ 4 özelliklerini kontrol et
- [ ] İlgili kartlara ekle veya yeni kart oluştur
- [ ] Öncelikleri tekrar değerlendir

### FAZ 5 Başlarken
- [ ] Bu dosyadan FAZ 5 özelliklerini kontrol et
- [ ] İlgili kartlara ekle veya yeni kart oluştur
- [ ] Öncelikleri tekrar değerlendir

### FAZ 6 Başlarken
- [ ] Bu dosyadan FAZ 6 özelliklerini kontrol et
- [ ] İlgili kartlara ekle veya yeni kart oluştur
- [ ] Öncelikleri tekrar değerlendir

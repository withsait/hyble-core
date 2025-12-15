# 🏗️ FAZ1-INFRA: Hetzner Dedicated Server Setup

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 🚀 FAZ 1: BEDROCK |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ1-INFRA.md` |

---

## 🎯 MODÜL AMACI
Tüm Hyble ve Mineble servislerini barındıracak, yüksek performanslı, güvenli ve yedekli bir altyapı kurmak. "Infrastructure as Code" (IaC) prensibine yakın, script bazlı yönetilebilir bir sistem hedeflenir.

---

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [ ] Hetzner Hesabı (Doğrulanmış)
- [ ] Cloudflare Hesabı (Domain NS yönlendirilmiş)
- [ ] SSH Public Key (`id_ed25519.pub`)

### Dependents (Bu modülü bekleyenler):
- **TÜM FAZLAR:** Sunucu olmadan hiçbir kod canlıya alınamaz.
- **FAZ1-EMAIL:** Mail servisi bu sunucuda (veya buradan tetiklenerek) çalışacak.
- **FAZ3-CLOUD:** Cloud panel bu sunucuyu yönetecek.

---

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `infra/scripts/` | 🟣 Claude | ❌ Gemini |
| `infra/nginx/` | 🟣 Claude | ❌ Gemini |
| `infra/docker-compose.yml` | 🟢 Ortak | 🟢 Ortak |
| `docs/infra/` | 🔵 Gemini | ❌ Claude |

---

## 👥 GÖREV DAĞILIMI

### 🟣 CLAUDE CODE (DevOps & SysAdmin)
*Çalışma Alanı: `infra/` klasörü*

1.  **SYSTEM SETUP:**
    * `setup.sh`: Temel paketler (`curl`, `git`, `htop`, `ncdu`), Timezone (Europe/Istanbul), Swap alanı oluşturma.
    * **Security:** `ufw` kuralları (22, 80, 443 allow), `fail2ban` konfigürasyonu, `sshd_config` hardening.
2.  **DOCKER ENV:**
    * Docker Engine kurulumu (Official Repo).
    * `docker-compose` v2 kurulumu.
    * Log rotation ayarları (`/etc/docker/daemon.json`).
3.  **PROXY:**
    * Nginx konfigürasyonu (Cloudflare IP range whitelist).
    * SSL sertifika yönetimi (Cloudflare Origin CA).
4.  **BACKUP:**
    * PostgreSQL dump scripti.
    * Klasör sıkıştırma ve Storage Box'a transfer scripti.

### 🔵 GEMINI VS CODE (Documentation)
*Çalışma Alanı: `docs/`*

1.  **DOCS:** Sunucuya erişim rehberi, acil durum senaryoları (Disaster Recovery).
2.  **CONFIG HELP:** Nginx config dosyalarındaki syntax hatalarını kontrol etme.

---

## 📐 TEKNİK DETAYLAR

### 1. Sunucu Özellikleri (Hedef)
*Hetzner Server Auction (Bidding) üzerinden alınması maliyet avantajı sağlar.*
* **CPU:** AMD Ryzen 5 3600 veya üzeri (Tercihen Ryzen 5000/7000 serisi)
* **RAM:** Minimum 64 GB DDR4/DDR5
* **Disk:** Minimum 2x NVMe SSD (RAID 1 - Software)
* **Bağlantı:** 1 Gbit/s

### 2. Klasör Yapısı (File System)
Sunucu içinde `/opt/hyble` ana dizin olarak kullanılacaktır.

```bash
/opt/hyble/
├── app/                  # Uygulama kaynak kodları (Git repo)
│   ├── web/
│   ├── api/
│   └── ...
├── data/                 # Docker Volume verileri (Persisted)
│   ├── postgres/         # DB verisi
│   ├── redis/
│   └── uploads/          # Kullanıcı dosyaları
├── infra/                # Altyapı konfigürasyonları
│   ├── nginx/            # Proxy ayarları
│   │   ├── conf.d/
│   │   └── ssl/          # Cloudflare sertifikaları
│   ├── backup/           # Yedekleme scriptleri
│   └── scripts/          # Setup ve maintenance scriptleri
└── logs/                 # Uygulama logları

3. Güvenlik (Hardening) KurallarıFirewall (UFW)Bashufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH (Veya değiştirilen port)
ufw allow 80/tcp  # HTTP (Sadece Cloudflare IP'leri için kısıtlanabilir)
ufw allow 443/tcp # HTTPS
ufw enable
SSH (/etc/ssh/sshd_config)BashPermitRootLogin prohibit-password # Sadece Key
PasswordAuthentication no         # Şifre yok
Port 22                           # Opsiyonel: 2022 gibi bir porta taşınabilir
AddressFamily inet                # Sadece IPv4 (Opsiyonel)
Fail2bansshd jail aktif edilecek.nginx-http-auth jail aktif edilecek (Admin paneli için).4. Reverse Proxy & SSL (Nginx)Cloudflare kullanıldığı için sunucuda "Full (Strict)" SSL modu kullanılacak.SSL: Cloudflare Origin CA sertifikası oluşturulup /opt/hyble/infra/nginx/ssl/ altına .pem ve .key olarak eklenecek.Nginx Config: Sadece Cloudflare IP'lerinden gelen istekleri kabul edecek (Real IP modülü aktif).5. Backup StratejisiHedef: Hetzner Storage Box (Mount point: /mnt/backup).Sıklık:Database: Her 6 saatte bir (Dump).Uploads: Her gece 03:00 (Incremental rsync).Retention: Son 7 gün yerel, son 30 gün Storage Box.✅ KABUL KRİTERLERİ (DoD)[ ] Sunucuya SSH key ile şifresiz erişilebiliyor.[ ] docker run hello-world komutu sorunsuz çalışıyor.[ ] ufw status aktif ve sadece 22, 80, 443 açık.[ ] Nginx, Cloudflare üzerinden gelen isteği karşılayıp "502 Bad Gateway" (App çalışmadığı için) veya statik "Maintenance" sayfası dönüyor.[ ] SSL sertifikası (Cloudflare Origin CA) geçerli ve güvenli (Padlock var).[ ] fail2ban-client status sshd aktif ve çalışıyor.[ ] Yedekleme scripti çalıştırıldığında /mnt/backup altına dosya yazabiliyor.[ ] Sunucu restart edildiğinde Docker servisleri otomatik başlıyor.

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Provisioning | 👤 User | Server Kiralama | ⬜ 0/1 |
| OS Setup | 🟣 Claude | Setup Script | ⬜ 0/1 |
| Docker Setup | 🟣 Claude | Engine Install | ⬜ 0/1 |
| Proxy/SSL | 🟣 Claude | Nginx Config | ⬜ 0/1 |
| Backup | 🟣 Claude | Backup Script | ⬜ 0/1 |
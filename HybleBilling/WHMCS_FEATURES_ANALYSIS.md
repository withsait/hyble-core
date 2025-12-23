# WHMCS Özellik Analizi - HybleBilling Referansı

> **Amaç:** WHMCS'in tüm özelliklerini analiz ederek HybleBilling için yol haritası oluşturmak
> **Tarih:** 2025-01-XX
> **Kaynak:** https://www.whmcs.com

---

## 1. BILLING & ÖDEME SİSTEMİ

### 1.1 Fatura Yönetimi
- [ ] PDF Fatura oluşturma ve gönderme
- [ ] Profesyonel fatura şablonları
- [ ] Fatura taslakları (Draft) - müşteriye gösterilmeden önce hazırlık
- [ ] Fatura numaralandırma sistemi (özelleştirilebilir format)
- [ ] Otomatik fatura oluşturma (recurring billing)
- [ ] Manuel fatura oluşturma
- [ ] Fatura düzenleme ve iptal
- [ ] Fatura klonlama
- [ ] Toplu fatura işlemleri

### 1.2 Ödeme Gateway Entegrasyonları
- [ ] **Kredi Kartı İşlemleri**
  - [ ] Merchant gateway entegrasyonu
  - [ ] Tokenized storage (PCI DSS uyumlu)
  - [ ] Kart bilgisi saklama (token ile)
  - [ ] 3D Secure desteği

- [ ] **PayPal Entegrasyonu**
  - [ ] Website Payments Standard
  - [ ] Express Checkout
  - [ ] Website Payments Pro
  - [ ] PayFlow Pro
  - [ ] PayPal bakiye görüntüleme
  - [ ] Transaction lookup
  - [ ] Refund işlemleri

- [ ] **Off-site Gateway'ler**
  - [ ] 2CheckOut
  - [ ] Stripe
  - [ ] iyzico (TR için)
  - [ ] PayTR (TR için)
  - [ ] Diğer bölgesel gateway'ler

- [ ] **Banka Transferleri**
  - [ ] ACH (US)
  - [ ] SEPA (EU)
  - [ ] Direct Debit (UK)
  - [ ] iDEAL (Hollanda)
  - [ ] Offline check/banka havalesi

### 1.3 Recurring Billing (Tekrarlayan Faturalama)
- [ ] Otomatik fatura oluşturma
- [ ] Otomatik ödeme çekme (auto-capture)
- [ ] Billing cycle seçenekleri:
  - [ ] One-time (tek seferlik)
  - [ ] Monthly (aylık)
  - [ ] Quarterly (3 aylık)
  - [ ] Semi-Annually (6 aylık)
  - [ ] Annually (yıllık)
  - [ ] Biennially (2 yıllık)
  - [ ] Triennially (3 yıllık)
- [ ] Fixed day billing (sabit gün faturalandırma)
- [ ] Proration (gün bazlı hesaplama)

### 1.4 Ödeme Hatırlatmaları
- [ ] Ödeme öncesi hatırlatma
- [ ] Vade günü hatırlatması
- [ ] Gecikmiş ödeme uyarıları
- [ ] Otomatik overdue notice
- [ ] Özelleştirilebilir hatırlatma zamanlamaları

### 1.5 Multi-Currency (Çoklu Para Birimi)
- [ ] Birden fazla para birimi desteği
- [ ] Otomatik kur çevirme
- [ ] Para birimi bazlı fiyatlandırma
- [ ] Müşteri bazlı para birimi atama

### 1.6 Vergi Yönetimi
- [ ] Sales Tax desteği
- [ ] EU VAT desteği
- [ ] VAT numarası doğrulama (VIES)
- [ ] Çoklu vergi seviyesi
- [ ] Inclusive/Exclusive vergi hesaplama
- [ ] Ülke/bölge bazlı vergi kuralları
- [ ] Vergi muafiyeti

### 1.7 Kuponlar ve Promosyonlar
- [ ] Promo kod oluşturma
- [ ] Yüzde bazlı indirim
- [ ] Sabit tutar indirim
- [ ] Kullanım limiti
- [ ] Geçerlilik tarihi
- [ ] Ürün/kategori bazlı kısıtlama
- [ ] Tek kullanımlık kodlar
- [ ] Recurring discount (devam eden indirim)

### 1.8 Teklif (Quote) Sistemi
- [ ] Teklif oluşturma
- [ ] PDF teklif gönderimi
- [ ] Online teklif kabul
- [ ] Teklif → Fatura dönüşümü
- [ ] Teklif geçerlilik süresi

### 1.9 İade ve Dispute
- [ ] Manuel iade işlemi
- [ ] Gateway üzerinden otomatik refund
- [ ] Partial refund (kısmi iade)
- [ ] Payment dispute handling
- [ ] Chargeback yönetimi

### 1.10 Gecikme Ücretleri
- [ ] Fixed late fee (sabit gecikme ücreti)
- [ ] Percentage late fee (yüzdelik)
- [ ] Grace period (tolerans süresi)
- [ ] Otomatik gecikme ücreti ekleme

### 1.11 On-Demand Capture
- [ ] Manuel ödeme çekme
- [ ] Tokenized kart ile tek tıkla ödeme
- [ ] Batch payment processing

---

## 2. MÜŞTERİ YÖNETİMİ

### 2.1 Müşteri Hesapları
- [ ] Müşteri kaydı ve onay
- [ ] Email doğrulama
- [ ] Müşteri profili yönetimi
- [ ] Birden fazla iletişim kişisi
- [ ] Sub-account (alt hesap) desteği
- [ ] Müşteri grupları
- [ ] Custom fields (özel alanlar)

### 2.2 Kimlik Doğrulama
- [ ] Email + şifre login
- [ ] Two-Factor Authentication (2FA)
- [ ] OAuth entegrasyonu
- [ ] Single Sign-On (SSO)
- [ ] API key authentication
- [ ] Şifre politikaları
- [ ] Brute force koruması

### 2.3 Self-Service Portal
- [ ] Dashboard
- [ ] Servis listesi ve yönetimi
- [ ] Fatura görüntüleme ve ödeme
- [ ] Destek ticket açma
- [ ] Domain yönetimi
- [ ] Profil güncelleme
- [ ] Ödeme yöntemi ekleme/güncelleme

### 2.4 Email Bildirimleri
- [ ] Hoşgeldin emaili
- [ ] Fatura bildirimleri
- [ ] Ödeme onayları
- [ ] Servis aktivasyon/suspend bildirimleri
- [ ] Şifre sıfırlama
- [ ] Ticket güncellemeleri
- [ ] Domain yenileme hatırlatmaları
- [ ] Özelleştirilebilir email şablonları
- [ ] HTML ve plain text desteği

---

## 3. ÜRÜN VE SERVİS YÖNETİMİ

### 3.1 Ürün Tanımlama
- [ ] Ürün grupları/kategorileri
- [ ] Ürün açıklamaları
- [ ] Fiyatlandırma (çoklu cycle)
- [ ] Setup fee (kurulum ücreti)
- [ ] Ürün resimleri
- [ ] Featured products
- [ ] Hidden products (gizli ürünler)
- [ ] Stock/availability kontrolü

### 3.2 Configurable Options
- [ ] Dropdown seçenekleri
- [ ] Radio button seçenekleri
- [ ] Checkbox seçenekleri
- [ ] Quantity based seçenekler
- [ ] Seçeneklere göre fiyat değişimi
- [ ] Conditional options

### 3.3 Addons (Eklentiler)
- [ ] Ürün bazlı addon tanımlama
- [ ] Addon fiyatlandırma
- [ ] Recurring addon
- [ ] Tek seferlik addon

### 3.4 Product Bundles
- [ ] Ürün paketleri oluşturma
- [ ] Bundle indirimi
- [ ] Free domain with hosting

### 3.5 Upgrade/Downgrade
- [ ] Mid-cycle upgrade
- [ ] Proration hesaplama
- [ ] Otomatik account güncelleme
- [ ] Upgrade path tanımlama

---

## 4. WEB HOSTING AUTOMATION

### 4.1 Account Provisioning
- [ ] Otomatik hesap oluşturma
- [ ] Otomatik hesap suspend
- [ ] Otomatik hesap unsuspend
- [ ] Otomatik hesap terminate
- [ ] Manuel provisioning tetikleme

### 4.2 Control Panel Entegrasyonları
- [ ] cPanel/WHM
- [ ] Plesk
- [ ] DirectAdmin
- [ ] InterWorx
- [ ] Custom server modülleri

### 4.3 Account Sync
- [ ] Server'dan usage import
- [ ] Disk kullanımı takibi
- [ ] Bandwidth kullanımı takibi
- [ ] Usage-based billing
- [ ] Overage billing (aşım ücreti)

### 4.4 Server Yönetimi
- [ ] Birden fazla server
- [ ] Server grupları
- [ ] Load balancing (round-robin)
- [ ] Server doluluk takibi
- [ ] Server status monitoring

### 4.5 Single Sign-On
- [ ] WHMCS → cPanel SSO
- [ ] Müşteri tek login ile panel erişimi

---

## 5. DOMAIN YÖNETİMİ

### 5.1 Domain Kayıt
- [ ] Real-time domain availability check
- [ ] Domain namespinning (öneri sistemi)
- [ ] Spotlight TLD'ler
- [ ] Premium domain desteği
- [ ] Otomatik domain kayıt
- [ ] Bulk domain check

### 5.2 Domain Registrar Entegrasyonları
- [ ] Enom
- [ ] ResellerClub
- [ ] OpenSRS
- [ ] Nominet
- [ ] CentralNic Reseller
- [ ] Custom registrar modülleri

### 5.3 Domain Yönetimi
- [ ] Nameserver değişikliği
- [ ] WHOIS bilgi güncelleme
- [ ] DNS record yönetimi
- [ ] Domain kilitleme/unlock
- [ ] EPP code görüntüleme
- [ ] Auto-renew ayarları

### 5.4 Domain Transfer
- [ ] Transfer sipariş akışı
- [ ] EPP code talebi
- [ ] Otomatik transfer başlatma
- [ ] Transfer status polling
- [ ] Transfer tamamlanma bildirimi

### 5.5 Domain Syncing
- [ ] Günlük due date senkronizasyonu
- [ ] Transfer-away tespiti
- [ ] Expiry date güncelleme
- [ ] Status senkronizasyonu

### 5.6 Ek Domain Servisleri
- [ ] ID Protection (WHOIS gizleme)
- [ ] Email forwarding
- [ ] DNS hosting
- [ ] Free domain with hosting

---

## 6. DESTEK SİSTEMİ

### 6.1 Ticket Sistemi
- [ ] Ticket açma (web + email)
- [ ] Departman yönetimi
- [ ] Ticket önceliklendirme
- [ ] Ticket atama (staff'a)
- [ ] Ticket durumları
- [ ] Internal notes
- [ ] Dosya ekleme
- [ ] Ticket birleştirme
- [ ] Ticket taşıma (departman değişikliği)

### 6.2 Email Piping
- [ ] Email'den ticket oluşturma
- [ ] Email ile ticket yanıtlama
- [ ] Email parsing
- [ ] Spam filtreleme
- [ ] Auto-response

### 6.3 Escalation Rules
- [ ] SLA tanımlama
- [ ] Otomatik escalation
- [ ] Time-based kurallar
- [ ] Notification kuralları

### 6.4 Canned Responses
- [ ] Hazır yanıt şablonları
- [ ] Variable desteği
- [ ] Kategori bazlı organizasyon

### 6.5 Knowledgebase
- [ ] Makale yönetimi
- [ ] Kategori sistemi
- [ ] Arama fonksiyonu
- [ ] Ticket açarken otomatik öneri
- [ ] Public/private makaleler
- [ ] Görüntülenme istatistikleri

### 6.6 Announcements (Duyurular)
- [ ] Duyuru oluşturma
- [ ] Yayın tarihi zamanlama
- [ ] Social sharing entegrasyonu
- [ ] Email ile duyuru gönderimi
- [ ] Client area'da gösterim

### 6.7 Downloads
- [ ] Dosya yükleme ve paylaşım
- [ ] Kategori sistemi
- [ ] Ürüne bağlı download kısıtlaması
- [ ] Download sayacı

### 6.8 Network Status
- [ ] Server bazlı status sayfası
- [ ] Maintenance duyuruları
- [ ] Incident raporlama
- [ ] Müşteriye otomatik bildirim
- [ ] Status geçmişi

---

## 7. ADMIN PANELİ

### 7.1 Dashboard
- [ ] Özet istatistikler
- [ ] Gelir grafikleri
- [ ] To-do listesi
- [ ] Son aktiviteler
- [ ] Özelleştirilebilir widget'lar

### 7.2 Staff Yönetimi
- [ ] Admin hesapları
- [ ] Role/Permission sistemi
- [ ] Departman bazlı erişim
- [ ] Activity logging
- [ ] IP kısıtlama

### 7.3 Raporlama
- [ ] Gelir raporları
- [ ] Müşteri raporları
- [ ] Ürün satış raporları
- [ ] Ticket raporları
- [ ] Custom report builder
- [ ] CSV/PDF export

### 7.4 Automation Tasks
- [ ] Cron job yönetimi
- [ ] Task scheduling
- [ ] Otomatik işlem logları
- [ ] Failed task alertleri

### 7.5 System Settings
- [ ] Genel ayarlar
- [ ] Billing ayarları
- [ ] Domain ayarları
- [ ] Support ayarları
- [ ] Email ayarları
- [ ] Security ayarları

---

## 8. SİPARİŞ VE CHECKOUT

### 8.1 Order Forms
- [ ] Birden fazla order form template
- [ ] Özelleştirilebilir tasarım
- [ ] Product comparison görünümü
- [ ] Slider görünümü
- [ ] Cart sistemi

### 8.2 Checkout Akışı
- [ ] Tek sayfa checkout
- [ ] Çok adımlı checkout
- [ ] Guest checkout
- [ ] Kayıtlı müşteri checkout
- [ ] Upsell/cross-sell önerileri

### 8.3 Fraud Protection
- [ ] MaxMind entegrasyonu
- [ ] Risk score hesaplama
- [ ] Otomatik order hold
- [ ] Manuel review akışı
- [ ] Blacklist yönetimi

---

## 9. ADDON MODÜLLER

### 9.1 Project Management
- [ ] Proje oluşturma
- [ ] Task listesi ve takibi
- [ ] Task atama
- [ ] Time tracking (start/stop timer)
- [ ] Due date takibi
- [ ] Staff messageboard
- [ ] File sharing
- [ ] Ticket entegrasyonu
- [ ] Time → Invoice dönüşümü
- [ ] Proje bazlı faturalama
- [ ] Müşteri portalı erişimi
- [ ] Raporlama

### 9.2 SSL Automation (MarketConnect)
- [ ] DigiCert/RapidSSL/GeoTrust entegrasyonu
- [ ] Otomatik SSL provisioning
- [ ] cPanel/Plesk/DirectAdmin auto-install
- [ ] DV/OV/EV sertifika desteği
- [ ] Wildcard SSL
- [ ] Renewal automation
- [ ] Landing page şablonları

### 9.3 Software Licensing
- [ ] License key generation
- [ ] Özelleştirilebilir key format
- [ ] Remote key validation API
- [ ] Local key caching
- [ ] License reissue
- [ ] Abuse detection
- [ ] Download restrictions
- [ ] License addons
- [ ] PHP SDK
- [ ] Self-service portal

---

## 10. GELİŞTİRİCİ ÖZELLİKLERİ

### 10.1 API
- [ ] RESTful API
- [ ] Full CRUD operations
- [ ] Authentication (API credentials)
- [ ] Rate limiting
- [ ] Webhook desteği
- [ ] API documentation

### 10.2 Hooks System
- [ ] Pre/Post action hooks
- [ ] Custom hook points
- [ ] Hook priority
- [ ] Hook logging

### 10.3 Module Development
- [ ] Server module framework
- [ ] Payment gateway module framework
- [ ] Registrar module framework
- [ ] Addon module framework
- [ ] Report module framework
- [ ] Widget framework

### 10.4 Template System
- [ ] Smarty template engine
- [ ] Theme customization
- [ ] Email template customization
- [ ] PDF template customization

### 10.5 Database
- [ ] ORM (Eloquent)
- [ ] Database schema
- [ ] Migration support
- [ ] Query logging

---

## 11. GÜVENLİK

### 11.1 Authentication Security
- [ ] Password hashing
- [ ] 2FA (TOTP)
- [ ] Session management
- [ ] Remember me tokens
- [ ] Login attempt limiting
- [ ] IP whitelist/blacklist

### 11.2 Data Security
- [ ] PCI DSS compliance
- [ ] Credit card tokenization
- [ ] Data encryption at rest
- [ ] SSL/TLS enforcement
- [ ] Sensitive data masking

### 11.3 Admin Security
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Admin 2FA
- [ ] Session timeout
- [ ] IP restriction

---

## 12. ENTEGRASYONLAR

### 12.1 Web Hosting (200+ entegrasyon)
- [ ] cPanel/WHM
- [ ] Plesk
- [ ] DirectAdmin
- [ ] InterWorx
- [ ] CloudLinux
- [ ] LiteSpeed
- [ ] Softaculous

### 12.2 Cloud/VPS
- [ ] SolusVM
- [ ] Proxmox
- [ ] Virtualizor
- [ ] VMware
- [ ] OpenStack
- [ ] AWS
- [ ] DigitalOcean

### 12.3 Domains
- [ ] 50+ registrar entegrasyonu

### 12.4 Payments
- [ ] 100+ payment gateway

### 12.5 Marketing
- [ ] Mailchimp
- [ ] Campaign Monitor
- [ ] Newsletter entegrasyonları

### 12.6 Messaging
- [ ] SMS gateway'ler
- [ ] Slack
- [ ] Discord (3rd party)

---

## 13. HYBLE-SPECIFIC EKLENTİLER

> Bu bölüm WHMCS'de yok, HybleBilling için eklenmesi gereken özellikler

### 13.1 Gaming Server Entegrasyonu
- [ ] Pickaxe (custom daemon) entegrasyonu
- [ ] Minecraft server provisioning
- [ ] Real-time resource monitoring
- [ ] Console access
- [ ] Plugin/mod management
- [ ] Backup automation
- [ ] Server templates

### 13.2 Hyble Credits (Wallet)
- [ ] Credit satın alma
- [ ] Cross-vertical kullanım (B2B SaaS + Gaming)
- [ ] Credit transfer
- [ ] Auto top-up
- [ ] Credit expiry (opsiyonel)
- [ ] Detailed transaction history

### 13.3 Hyble ID (Unified Auth)
- [ ] Tek kimlik sistemi
- [ ] Cross-domain SSO
- [ ] OAuth provider olma
- [ ] Brand switcher

### 13.4 Modern UI/UX
- [ ] Next.js 14 client area
- [ ] Real-time dashboard
- [ ] Mobile-first tasarım
- [ ] Dark mode
- [ ] Tailwind + shadcn/ui

### 13.5 AI Features
- [ ] AI destekli ticket yanıtlama
- [ ] Smart resource suggestions
- [ ] Predictive analytics
- [ ] Chatbot entegrasyonu

---

## 14. ROADMAP PRİORİTELENDİRME

### P0 - MVP (İlk 2-3 ay)
1. Customer Management (kayıt, login, profil)
2. Product/Service Management
3. Basic Billing (fatura, ödeme)
4. Payment Gateway (Stripe + iyzico)
5. Admin Panel temeli

### P1 - Core Features (3-4 ay)
1. Recurring Billing
2. Multi-currency
3. Tax Management
4. Email Notifications
5. Basic Support (ticket)

### P2 - Automation (4-5 ay)
1. Server Provisioning (Pickaxe)
2. Automation Tasks
3. Webhooks
4. API v1

### P3 - Advanced (5-6 ay)
1. Domain Management
2. Knowledgebase
3. Project Management
4. Advanced Reporting

### P4 - Polish (6-7 ay)
1. Hyble Credits
2. AI Features
3. Mobile App
4. Marketplace

---

## 15. TEKNİK MİMARİ ÖNERİSİ

```
HybleBilling/
├── apps/
│   ├── admin/          # Admin Panel (Next.js)
│   ├── client/         # Client Area (Next.js)
│   └── api/            # API Server (tRPC)
├── packages/
│   ├── db/             # Prisma schema & client
│   ├── billing/        # Billing logic
│   ├── payments/       # Payment gateway adapters
│   ├── provisioning/   # Server modules
│   ├── domains/        # Registrar modules
│   ├── support/        # Ticketing system
│   ├── notifications/  # Email/SMS
│   ├── auth/           # Authentication
│   └── ui/             # Shared components
└── services/
    ├── cron/           # Background jobs
    └── webhooks/       # Webhook handlers
```

---

## 16. KAYNAKLAR

- WHMCS Ana Sayfa: https://www.whmcs.com
- WHMCS Docs: https://docs.whmcs.com
- WHMCS API: https://developers.whmcs.com
- WHMCS Marketplace: https://marketplace.whmcs.com

---

**Son Güncelleme:** Bu dosya Claude Code tarafından güncellenecektir.


---

## EKLER - EKSİK KALAN ÖZELLİKLER

> Bu bölüm sonradan eklendi - ilk analiz sırasında kaçan özellikler

---

## A1. WHMCS 9.0 YENİ ÖZELLİKLER

### A1.1 Credit Note Sistemi (Yeni!)
- [ ] Credit note (alacak dekontu) oluşturma
- [ ] Debit note (borç dekontu) oluşturma
- [ ] Tax-compliant kredi notları
- [ ] Refund/adjustment için otomatik credit note
- [ ] Audit trail koruması

### A1.2 Yeni Sipariş Deneyimi (Nexus Cart)
- [ ] Modernize edilmiş cart tasarımı
- [ ] Daha hızlı checkout akışı
- [ ] Conversion-optimized UX
- [ ] Mobile-first tasarım

### A1.3 AI Domain Namespinning
- [ ] AI destekli domain önerileri
- [ ] Natural language input desteği
- [ ] Akıllı alternativ domain önerileri
- [ ] Drop-off azaltma optimizasyonu

### A1.4 E-Faturalama (Peppol BIS Billing 3.0)
- [ ] Peppol BIS 3.0 uyumlu e-fatura
- [ ] Otomatik e-fatura oluşturma
- [ ] Regional compliance desteği
- [ ] B2B/B2G e-fatura entegrasyonu

### A1.5 Genişletilmiş REST API
- [ ] Modern RESTful endpoints
- [ ] Cart ve checkout API
- [ ] Scalable API tasarımı
- [ ] Frontend flexibility

### A1.6 CSV ImportAssist
- [ ] CSV dosyasından müşteri import
- [ ] Third-party sistem migrasyonu
- [ ] Bulk data import
- [ ] Field mapping

### A1.7 Gelişmiş VAT Compliance
- [ ] VAT-inclusive pricing
- [ ] Otomatik VAT numarası doğrulama
- [ ] Regional VAT kuralları
- [ ] Checkout'ta tax clarity

---

## A2. AFFILIATE (ORTAKLIK) SİSTEMİ

### A2.1 Affiliate Program
- [ ] Affiliate kaydı
- [ ] Unique referral link
- [ ] Cookie tracking
- [ ] Affiliate dashboard

### A2.2 Komisyon Yönetimi
- [ ] Global komisyon oranı
- [ ] Ürün bazlı komisyon oranı
- [ ] Yüzde veya sabit komisyon
- [ ] Recurring komisyon (ilk satış vs sürekli)
- [ ] Minimum payout threshold

### A2.3 Affiliate Ödemeleri
- [ ] Payout request
- [ ] Manuel payout onayı
- [ ] PayPal mass payment
- [ ] Banka transferi
- [ ] Payout history

### A2.4 Raporlama
- [ ] Affiliate performans raporu
- [ ] Conversion tracking
- [ ] Click tracking
- [ ] Revenue attribution

---

## A3. MARKETCONNECT (MARKETPLACE)

### A3.1 SSL Certificates (DigiCert)
- [ ] RapidSSL
- [ ] GeoTrust
- [ ] DigiCert
- [ ] Auto-provisioning
- [ ] Auto-renewal
- [ ] Ready-made landing pages

### A3.2 Website Builders
- [ ] Sitejet Builder entegrasyonu
- [ ] Weebly entegrasyonu
- [ ] Otomatik site builder provisioning

### A3.3 Email Services
- [ ] SpamExperts email filtering
- [ ] Email security services

### A3.4 Marketing Tools
- [ ] SocialBee entegrasyonu
- [ ] Social media management
- [ ] Marketing automation

### A3.5 MarketConnect Infrastructure
- [ ] Backward-compatible product launches
- [ ] Remote product updates
- [ ] Landing page şablonları
- [ ] Upsell integration

---

## A4. EKSİK ADMIN ÖZELLİKLER

### A4.1 Server Health Monitoring
- [ ] Automated health checks
- [ ] Successful/Warning/Danger status
- [ ] Server connectivity test
- [ ] Performance metrics

### A4.2 To-Do System (Gelişmiş)
- [ ] To-do status kategorileri (New, Pending, In Progress, Completed)
- [ ] Due date tracking
- [ ] Staff assignment
- [ ] Priority levels

### A4.3 IP Ban/Block Sistemi
- [ ] IP adresi engelleme
- [ ] IP range engelleme
- [ ] Subnet restrictions
- [ ] Whitelist/blacklist

### A4.4 Getting Started Wizard
- [ ] İlk kurulum sihirbazı
- [ ] Step-by-step setup
- [ ] Configuration guidance

### A4.5 Admin Invitations
- [ ] Yeni admin davet etme
- [ ] Email invitation link
- [ ] Role pre-assignment

---

## A5. EKSİK TICKET ÖZELLİKLERİ

### A5.1 Ticket Scheduling
- [ ] Scheduled actions (WHMCS 8.12+)
- [ ] Delayed responses
- [ ] Future date actions
- [ ] Auto-follow-up

### A5.2 Ticket Pinning
- [ ] Önemli ticketları pinleme
- [ ] Pin to top
- [ ] Pin notification

### A5.3 Client Ticket Controls
- [ ] Müşterinin ticket kapatmasını engelleme
- [ ] Close restriction rules
- [ ] Admin-only close

---

## A6. EKSİK ÜRÜN ÖZELLİKLERİ

### A6.1 Cross-Selling
- [ ] Product cross-sells tanımlama
- [ ] Related products önerisi
- [ ] Checkout upsells
- [ ] Drag-drop sıralama

### A6.2 Friendly URLs
- [ ] SEO-friendly product URLs
- [ ] Custom URL slugs
- [ ] Direct product links

### A6.3 Stock Control
- [ ] Stok miktarı takibi
- [ ] Out of stock handling
- [ ] Stock alerts

### A6.4 Overage Billing (Detay)
- [ ] Disk space overage
- [ ] Bandwidth overage
- [ ] Soft limits tanımlama
- [ ] Overage cost configuration
- [ ] Usage-based billing

### A6.5 On-Demand Renewals
- [ ] Early renewal izni
- [ ] Product addon renewals (8.8+)
- [ ] Renewal window configuration

### A6.6 Auto Terminate / Fixed Term
- [ ] Trial period süresi
- [ ] Fixed term products
- [ ] Auto-termination
- [ ] Termination email

### A6.7 Prorata Billing (Gelişmiş)
- [ ] Specific day billing
- [ ] First month prorata
- [ ] Proration calculation

---

## A7. EKSİK INVOICE ÖZELLİKLERİ

### A7.1 Invoice Logging (Detay)
- [ ] Detailed invoice audit trail
- [ ] Change history
- [ ] Who changed what

### A7.2 Auto-Cancel Overdue
- [ ] Gecikmiş faturaları otomatik iptal (8.10+)
- [ ] Cancel threshold (days)
- [ ] Cancel notification

---

## A8. CPANEL/WHM ENTEGRASYON (DETAY)

### A8.1 cPanel OpenID Integration
- [ ] OpenID Connect login
- [ ] Unified authentication

### A8.2 WHMCS Connect
- [ ] WHM'e tek tıkla erişim
- [ ] Server listesinden login
- [ ] No re-authentication

### A8.3 Package Synchronization
- [ ] WHM package import
- [ ] WHMCS-WHM package sync
- [ ] Cleanup tool

### A8.4 cPanel App Links
- [ ] cPanel içinde billing link
- [ ] cPanel içinde support link
- [ ] Seamless experience

---

## A9. DEVELOPER ÖZELLİKLER (DETAY)

### A9.1 Module Types
- [ ] Server Provisioning Modules
- [ ] Payment Gateway Modules:
  - [ ] Third Party (offsite redirect)
  - [ ] Merchant (API direct)
  - [ ] Tokenised (stored cards)
- [ ] Domain Registrar Modules
- [ ] Addon Modules
- [ ] Report Modules
- [ ] Mail Provider Modules

### A9.2 Hooks System
- [ ] Pre/Post action hooks
- [ ] Event-based triggers
- [ ] Hook priority
- [ ] Hook debugging

### A9.3 Module Class Autoloading
- [ ] PSR-4 autoloading
- [ ] Automatic class loading

### A9.4 API Types
- [ ] Internal API
- [ ] External API
- [ ] REST API (9.0+)
- [ ] OAuth support

---

## A10. SECURITY (DETAY)

### A10.1 CAPTCHA Options
- [ ] reCAPTCHA v2
- [ ] reCAPTCHA v3
- [ ] hCaptcha
- [ ] Custom CAPTCHA

### A10.2 Fraud Protection
- [ ] MaxMind integration
- [ ] Risk scoring
- [ ] Auto-hold orders
- [ ] Manual review queue
- [ ] Country blocking

---

## A11. MOBILE APPS (WHMCS Resmi)

### A11.1 iOS/Android Admin App
- [ ] Dashboard görüntüleme
- [ ] Ticket yanıtlama
- [ ] Order yönetimi
- [ ] Push notifications

---

## GÜNCELLEME NOTU

Bu ek bölüm, aşağıdaki kaynaklardan elde edilen bilgilerle oluşturulmuştur:
- WHMCS 9.0 What's New sayfası
- WHMCS Documentation
- WHMCS Developer Documentation
- cPanel Integration sayfası

**Orijinal analiz + Bu ekler = Kapsamlı WHMCS özellik listesi**

---

**Toplam Ek Özellik: ~150+ checkbox**
**Güncellenmiş Toplam: ~450+ özellik**


---

## A12. PAYPAL ENTEGRASYON DETAYLARI

> WHMCS Billing Automation sayfasından elde edilen detaylar

### A12.1 PayPal Gateway Tipleri
- [ ] PayPal Website Payments Standard
- [ ] PayPal Express Checkout
- [ ] PayPal Website Payments Pro
- [ ] PayFlow Pro

### A12.2 PayPal Yönetim Özellikleri
- [ ] PayPal hesap bakiyesi görüntüleme (WHMCS içinden)
- [ ] PayPal transaction lookup (işlem sorgulama)
- [ ] PayPal üzerinden refund işlemi (WHMCS'den tetikleme)
- [ ] PayPal IPN (Instant Payment Notification) handling
- [ ] PayPal webhook entegrasyonu

---

## A13. BILLING CYCLES DETAY

### A13.1 Desteklenen Periyotlar
- [ ] One-Time (tek seferlik)
- [ ] Monthly (aylık)
- [ ] Quarterly (3 aylık)
- [ ] Semi-Annually (6 aylık)
- [ ] Annually (yıllık)
- [ ] Biennially (2 yıllık)
- [ ] Triennially (3 yıllık)
- [ ] Custom cycle (özel periyot)

---

## A14. PAYMENT GATEWAY KATEGORILER

### A14.1 Merchant Gateways (On-site)
- [ ] Kredi kartı bilgisi WHMCS'de girilir
- [ ] API ile doğrudan işlem
- [ ] PCI DSS compliance gerektirir
- [ ] Örnekler: Stripe, Authorize.net, Braintree

### A14.2 Third Party Gateways (Off-site)
- [ ] Müşteri gateway sitesine yönlendirilir
- [ ] PCI compliance gateway'de
- [ ] Örnekler: PayPal Standard, 2Checkout

### A14.3 Tokenised Gateways
- [ ] Kart bilgisi gateway'de saklanır
- [ ] WHMCS'de sadece token tutulur
- [ ] Recurring billing için ideal
- [ ] PCI DSS yükü azalır
- [ ] Örnekler: Stripe, PayPal Pro, Braintree

---

## A15. BANK TRANSFER / DIRECT DEBIT DETAY

### A15.1 ACH (US)
- [ ] US bank account desteği
- [ ] Routing number + Account number
- [ ] eCheck processing

### A15.2 SEPA (EU)
- [ ] IBAN desteği
- [ ] SEPA Direct Debit
- [ ] EU banka hesaplarından çekim

### A15.3 Direct Debit (UK)
- [ ] UK bank account
- [ ] Sort code + Account number
- [ ] GoCardless entegrasyonu

### A15.4 iDEAL (Netherlands)
- [ ] Dutch banking integration
- [ ] Bank selection
- [ ] Real-time payment

### A15.5 Offline Payments
- [ ] Check (çek) ile ödeme
- [ ] Bank/Wire transfer
- [ ] Mail-in payments
- [ ] Manuel ödeme kaydı

---

## ÖZET: BİLLİNG AUTOMATION SAYFA KONTROLÜ

| Kategori | Özellik Sayısı | Durum |
|----------|---------------|-------|
| Invoice Management | 15+ | ✅ Tamamlandı |
| Payment Gateways | 20+ | ✅ Tamamlandı |
| PayPal Detayları | 5+ | ✅ Eklendi |
| Recurring Billing | 8+ | ✅ Tamamlandı |
| Multi-Currency | 5+ | ✅ Tamamlandı |
| Tax/VAT | 6+ | ✅ Tamamlandı |
| Coupons | 10+ | ✅ Tamamlandı |
| Quotes | 5+ | ✅ Tamamlandı |
| Proration | 4+ | ✅ Tamamlandı |
| Refunds/Disputes | 5+ | ✅ Tamamlandı |
| Late Fees | 4+ | ✅ Tamamlandı |
| Bank Transfers | 10+ | ✅ Eklendi |

**Bu sayfa için toplam: ~100+ özellik**

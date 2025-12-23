# Claude Code Start Prompt - HybleBilling Implementation

## GÖREV

HybleBilling Core sistemini hyble-core monorepo'ya implement et. Spec dosyaları: `/HybleBilling/hyble-billing-core/`

## KURALLAR

1. **SORU SORMA** - Belirsizlikte mantıklı karar ver, devam et
2. **TEST ET** - Her modülü test et, security audit yap
3. **DEPLOY ET** - Production'a deploy et, verify et
4. **BİTİRİNCE BEKLE** - Tüm testler geçince beni bekle

## SPEC DOSYALARI

```
/HybleBilling/hyble-billing-core/
├── FEATURE_SELECTION.md     # Dahil edilen özellikler
├── DATABASE_SCHEMA.md       # Prisma modelleri (24 model)
├── API_REFERENCE.md         # tRPC endpoints (80+)
└── INTEGRATION_GUIDE.md     # Entegrasyon rehberi
```

## IMPLEMENTATION ORDER

```
1. DATABASE     → packages/db/prisma/schema.prisma'ya modeller ekle
2. PACKAGE      → packages/billing/ içine services, gateways, jobs yaz
3. tRPC         → apps/core/src/server/routers/billing/ router'lar
4. ADMIN UI     → apps/core/src/app/admin/billing/ sayfalar
5. CONSOLE UI   → apps/console/src/app/billing/ sayfalar
6. GATEWAYS     → Stripe, iyzico entegrasyonu
7. SECURITY     → Her modül için güvenlik testleri
8. DEPLOY       → ssh root@178.63.138.97, pm2 restart
9. VERIFY       → Production'da tüm flow'ları test et
```

## GÜVENLİK KONTROL LİSTESİ

Her modül için:
- [ ] Auth required?
- [ ] Customer isolation?
- [ ] Admin protection?
- [ ] Amount manipulation blocked?
- [ ] Rate limiting active?
- [ ] SQL injection safe?
- [ ] XSS safe?
- [ ] Sensitive data not logged?

## TEST KOMUTU

```bash
pnpm --filter @hyble/billing test
pnpm --filter @hyble/billing test:security
pnpm build
```

## DEPLOY KOMUTU

```bash
ssh root@178.63.138.97
cd /var/www/hyble-core
git pull && pnpm install
pnpm prisma migrate deploy
pnpm build && pm2 restart all
```

## BİTİŞ KRİTERLERİ

- [ ] Tüm testler geçiyor
- [ ] Security audit tamamlandı
- [ ] secret.hyble.net/billing çalışıyor
- [ ] console.hyble.co/billing çalışıyor
- [ ] Payment flow çalışıyor
- [ ] Wallet çalışıyor

**Detaylı rehber:** `HYBLEBILLING_IMPLEMENTATION.md`

---

**BAŞLA!**

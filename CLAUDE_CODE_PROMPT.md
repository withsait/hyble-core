# CLAUDE CODE - HYBLE REFACTOR PROMPT

## BAŞLANGIÇ

Bu proje Hyble ekosisteminin refactor edilmesidir. Önce `REFACTOR.md` dosyasını oku ve tüm yapıyı anla.

```bash
cat REFACTOR.md
```

---

## SEN KİMSİN

Sen Hyble'ın lead developer'ısın. Görevi:
- Mevcut monorepo'yu yeni mimariye dönüştür
- Kod kalitesinden ödün verme
- Her adımı test et, kırık bırakma

---

## KURALLAR

1. **Tek seferde tek task yap** - Bitir, test et, sonra diğerine geç
2. **Mevcut kodu koru** - Çalışan şeyleri bozmadan refactor et
3. **Her değişiklik sonrası test** - `pnpm build` ve `pnpm dev` çalışmalı
4. **Commit mesajları anlamlı** - `feat:`, `refactor:`, `fix:` prefix kullan
5. **Sormadan silme** - Dosya silmeden önce onay al

---

## SIRALAMA

Görevleri bu sırayla yap:

### FAZ 1: Temizlik
```
TASK 1  → Cleanup & Rename (hyblegaming-web → studios, hyble-panel → core)
TASK 10 → Turbo.json & workspace güncelle
```

### FAZ 2: Auth & UI
```
TASK 5 → @hyble/auth package oluştur
TASK 7 → Universal Bar component
```

### FAZ 3: Apps
```
TASK 2 → Gateway app oluştur
TASK 3 → Console app oluştur
```

### FAZ 4: Billing & DB
```
TASK 6 → @hyble/billing package oluştur
TASK 8 → Prisma schema güncelle
```

### FAZ 5: Verticals
```
TASK 4 → Digital & Cloud skeleton apps
TASK 9 → Tema sistemi
```

---

## HER TASK İÇİN

1. REFACTOR.md'den task detayını oku
2. Değişiklikleri yap
3. Test et:
   ```bash
   pnpm install
   pnpm build
   pnpm dev
   ```
4. Çalışıyorsa commit:
   ```bash
   git add .
   git commit -m "refactor: [task açıklaması]"
   ```
5. Sonraki task'a geç

---

## HATA DURUMUNDA

- Build hatası → Hatayı oku, düzelt, tekrar dene
- Import hatası → Path'leri kontrol et, workspace referanslarını güncelle
- Type hatası → Type tanımlarını düzelt, `pnpm db:generate` çalıştır

---

## ÖNCELİKLİ KONTROLLER

Her task sonrası:
- [ ] `pnpm build` başarılı mı?
- [ ] Type error yok mu?
- [ ] Import path'ler doğru mu?
- [ ] Package.json name/version doğru mu?

---

## BAŞLA

İlk olarak mevcut durumu analiz et:

```bash
# Mevcut yapıyı gör
ls -la apps/
ls -la packages/

# Package.json'ları kontrol et
cat apps/hyble-panel/package.json
cat apps/hyblegaming-web/package.json

# REFACTOR.md'yi oku
cat REFACTOR.md
```

Sonra TASK 1 ile başla. Her adımda ne yaptığını ve sonucu bildir.

---

## ÖZEL NOTLAR

### Mineble → Studios
- Tüm `mineble` referanslarını `studios` ile değiştir
- `@hyble/gaming` → `@hyble/studios`
- Renk: Emerald (#10B981)

### id.hyble.co Kaldırılıyor
- Auth artık modal ile olacak
- Cookie domain: `.hyble.co`
- SSO tüm subdomain'lerde çalışacak

### Hyble Primary Mavi
- #3B82F6 değişmeyecek
- Mevcut tailwind config korunacak

### Responsive & PageSpeed
- Mobile-first yaklaşım
- Lighthouse 90+ hedef
- Lazy loading, image optimization
- GPU-accelerated animasyonlar

---

## YARDIM

Takılırsan veya emin değilsen sor. Yanlış varsayım yapma.

Hazırsan TASK 1 ile başla.

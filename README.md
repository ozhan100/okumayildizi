# Okuma Yıldızı 📚⭐

2. sınıf öğrencileri için **cümle okuma antrenmanı** uygulaması. Çocuk cümleyi
yüksek sesle okur, mikrofon dinler, kelimeler doğru/yanlış olarak canlı boyanır.
5 hatasız cümle = 1 yıldız.

## Canlı adres

**https://ozhan100.github.io/okumayildizi/**

## Nasıl çalışır

- **Tek mod:** Cümle Oku — mikrofonla okuma (Chrome, internet ister).
- **5000 cümle:** 104 kısa cümleden üretilen 5000 benzersiz 10 kelimelik cümle,
  kolaydan zora sıralı (★☆☆ / ★★☆ / ★★★).
- **Yıldız kuralı:** 10 kelimenin tamamı yeşil (10'da 10) olan her 5 cümle = 1 yıldız.
- **Günlük görev:** 10 yıldız = günde 50 hatasız cümle. Günlük sayaçlar gece yarısı
  sıfırlanır, toplamlar korunur.
- **Uyarlanır zorluk:** Üst üste 5 hatasızda liste 2 adım zorlaşır; üst üste 2 kez
  %60 altı doğrulukta 2 adım kolaylaşır.
- **Otomatik geçiş:** 10'da 10 olunca sonuç 4 saniye gösterilir, sonra yeni cümle gelir.
  "Durdur" ile otomatik geçiş iptal edilir, "⏭️ Atla" ile ilerlenir.

## Dosyalar

| Dosya | Görev |
|---|---|
| `index.html` | Arayüz iskeleti (başlangıç + mikrofon ekranı) |
| `app.js` | Cümle üretimi, konuşma tanıma, yıldız/zorluk mantığı |
| `style.css` | Görsel tasarım, animasyonlar |
| `manifest.json` | PWA tanımı (ana ekrana ekleme) |
| `sw.js` | Service worker — çevrimdışı önbellek |
| `icon.svg` | Uygulama simgesi |

## Kurulum (telefon)

1. Tarayıcıdan **https://ozhan100.github.io/okumayildizi/** adresini aç (Android Chrome).
2. Menü (⋮) → **Ana ekrana ekle**.
3. İlk mikrofon kullanımında **İzin ver**.
4. Sessiz odada, telefona 20-30 cm yakın oku.

> Mikrofon yalnızca **HTTPS** üzerinden çalışır; GitHub Pages HTTPS sağladığı için
> bilgisayarda yerel sunucu açmaya gerek yoktur.

## Veriler

Tüm ilerleme cihazda `localStorage` içinde tutulur, sunucuya gönderilmez:
`okumaYildiz`, `okumaGun`, `okumaGunYildiz`, `okumaGunHatasiz`, `okumaHatasiz`,
`okumaParaSira`, `okumaSeriBasari`, `okumaSeriZor`.

## Geliştirme notu

Yeni cümle eklemek için `app.js` içindeki `CUMLE_HAVUZU` listesine ekleyin.
Uygulama güncellendiğinde `sw.js` içindeki `CACHE` sürümünü artırın
(örn. `okuma-yildizi-v2`), aksi hâlde cihazlar eski sürümü önbellekten gösterir.

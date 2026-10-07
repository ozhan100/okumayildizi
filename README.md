# Okuma Yıldızı 📚⭐

2. sınıf öğrencileri için **kısa öykü okuma antrenmanı**. Çocuk öyküyü yüksek sesle
okur, mikrofon dinler, kelimeler doğru/yanlış olarak canlı boyanır.
**5 hatasız öykü = 1 yıldız.**

## Canlı adres

**https://ozhan100.github.io/okumayildizi/**

## Nasıl çalışır

- **1000 kısa öykü:** Her öykü 45-55 kelime (ortalama 49), 5 cümle.
- **Yıldız kuralı:** Öyküyü **sonuna kadar** ve **en az %90 doğrulukla** oku.
  Bu, öykü uzunluğuna göre **en fazla 4-5 hata** demektir (ekranda tam sayı yazar).
- **Yıldız kazanma:** Hedefi tutan her **5 öykü = 1 yıldız**.
- **Günlük görev:** 10 yıldız = günde 50 öykü. Günlük sayaçlar gece yarısı
  sıfırlanır, toplamlar korunur.
- **5 kollu yıldız:** Her hatasız öyküde bir kol altın olur, 5'te yıldız parlar.
- **Otomatik geçiş:** Hedef tutulunca sonuç 4 saniye gösterilir, sonra yeni öykü gelir.
  "Durdur" ile otomatik geçiş iptal edilir, "⏭️ Atla" ile ilerlenir.
- **Zorluk göstergesi:** ★☆☆ / ★★☆ / ★★★ — öykünün kendi metnine göre hesaplanır
  (konuma göre değil).

### Öykü sırası hakkında

Kaynak belgedeki 1000 öykü, 10 şablon cümlenin kombinasyonudur: belgedeki sırayla
**100 öykü boyunca ilk iki cümle birebir aynıdır**. Bu tekrarı önlemek için öyküler
`_uret.py` tarafından yeniden sıralanır: **ardışık iki öykü asla aynı şablon
cümlelerini paylaşmaz** (999 ardışık çiftin 0'ında ortak şablon var). Böylece çocuk
her öyküde farklı bir metinle karşılaşır.

## Dosyalar

| Dosya | Görev |
|---|---|
| `index.html` | Arayüz iskeleti (başlangıç + öykü ekranı) |
| `oykuler.js` | **1000 öykünün verisi** (üretilen dosya) |
| `app.js` | Öykü akışı, konuşma tanıma, yıldız/durum mantığı |
| `style.css` | Görsel tasarım, animasyonlar |
| `manifest.json` | PWA tanımı (ana ekrana ekleme) |
| `sw.js` | Service worker — çevrimdışı önbellek |
| `icon.svg` | Uygulama simgesi |
| `1000_kisa_oyku.docx` | **Kaynak belge** (1000 öykü) |
| `_uret.py` | docx → `oykuler.js` üreteci + sıralama |
| `_test.js` | Değerlendirme mantığı testi (Node) |

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
`okumaParaSira`.

## Geliştirme

### Öyküleri güncelleme

`1000_kisa_oyku.docx` değişirse `oykuler.js`'i yeniden üretin:

```bash
python _uret.py
```

Üreteç şunları yapar: docx'i okur, 1000 öyküyü doğrular (numara boşluğu/tekrar
kontrolü), çeşitlendirilmiş sırayı kurar, `oykuler.js`'i yazar ve kalite raporu basar.
`oykuler.js` elle düzenlenmemelidir.

### Mantık testi

```bash
node _test.js
```

Yıldız kuralını doğrular: %90 sınırı, izin verilen hata sayısı, "sonuna kadar okuma"
koruması (erken bırakmada yıldız verilmemesi).

### Yayına alma

```bash
git add -A && git commit -m "aciklama" && git push
```

Site 1-2 dakikada güncellenir.

> ⚠️ **ÖNEMLİ:** Uygulama dosyaları değiştiğinde `sw.js` içindeki
> `CACHE = "okuma-yildizi-v2"` sürümünü artırın (v3, v4...). Aksi hâlde çocuğun
> cihazı eski sürümü önbellekten göstermeye devam eder. (`sw.js` eski önbellekleri
> otomatik siler, ancak sürüm numarası artırılmalıdır.)

# Okuma Yıldızı 📚⭐

2. sınıf öğrencileri için **kısa öykü okuma antrenmanı**. Çocuk öyküyü yüksek sesle
okur, mikrofon dinler, kelimeler doğru/yanlış/okunmadı olarak canlı boyanır.
**Bir öyküyü %90 doğrulukla bitiren 1 tam yıldız kazanır.**

## Canlı adres

**https://ozhan100.github.io/okumayildizi/**

## Nasıl çalışır

- **1000 kısa öykü:** Her öykü 45-55 kelime (ortalama 49), 5 cümle.
- **Kelime renkleri:**
  - 🟩 **yeşil** = kelime tam doğru okundu
  - 🟥 **kırmızı** = kelime yanlış okundu
  - 🟨 **sarı** = kelime henüz okunmadı / atlandı
- **Tam eşleşme:** Kelimenin birebir doğru okunması gerekir. Yaklaşık/benzer
  eşleşme yoktur; bir harf eksik ya da farklıysa kelime kırmızı olur.
- **Öykü ne zaman biter:** **Son kelime** sarı olmaktan çıkıp yeşil ya da kırmızı
  olduğu anda öykü kilitlenir. Çocuk isterse öykünün **%100'ünü** okuyabilir;
  uygulama %90'da okumayı kesmez. (Arada sarı kalan atlanmış kelimeler olsa bile
  öykü, son kelime okununca biter.)
- **Yıldız kuralı:** Öykü bittiğinde doğruluk **en az %90** ise **1 tam yıldız**.
  Yıldız parça parça verilmez — her başarılı öykü tam 1 yıldızdır.
  %90'ın altındaysa yıldız verilmez, sonuç "olmadı" olarak gösterilir.
- **İzin verilen hata:** Öykü uzunluğuna göre **4-5 hata** (ekranda tam sayı yazar).
  Eşik yuvarlanmış yüzdeye göre değil, gerçek orana göre uygulanır: 43/48 = %89,58
  ekranda %89 görünür ve yıldız vermez.
- **Günlük görev:** 10 yıldız = günde 10 öykü. Günlük sayaçlar gece yarısı
  sıfırlanır, toplamlar korunur.
- **Otomatik geçiş:** Öykü kilitlenince sonuç gösterilir (başarılıda 4 sn,
  başarısızda 6 sn) ve kendiliğinden sıradaki öyküye geçilir.
- **Zorluk göstergesi:** ★☆☆ / ★★☆ / ★★★ — öykünün kendi metnine göre hesaplanır
  (konuma göre değil).

> **Not:** Mikrofon konuşma tanıma kusursuz değildir. Tam eşleşme istendiği için
> tanımanın yanlış duyduğu bir kelime kırmızı görünebilir. %90 eşiği (4-5 hata
> payı) bunu bir ölçüde telafi eder.

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
`okumaYildiz` (toplam yıldız), `okumaGun` (son gün), `okumaGunYildiz` (günlük yıldız),
`okumaOyku` (toplam okunan öykü), `okumaGunOyku` (bugün okunan öykü),
`okumaParaSira` (sıradaki öykü).

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

Yıldız kuralını doğrular: %90 sınırı, izin verilen hata sayısı, yuvarlama şişirmesi,
"sonuna kadar okuma" koruması, tam kelime eşleşmesi ve **kayma hatası koruması**
(tek bir eksik/fazla kelimenin öykünün geri kalanını kırmızıya çevirmemesi).

### Yayına alma

```bash
git add -A && git commit -m "aciklama" && git push
```

Site 1-2 dakikada güncellenir.

> ⚠️ **ÖNEMLİ:** Uygulama dosyaları değiştiğinde `sw.js` içindeki
> `CACHE = "okuma-yildizi-v3"` sürümünü artırın (v4, v5...). Aksi hâlde çocuğun
> cihazı eski sürümü önbellekten göstermeye devam eder. (`sw.js` eski önbellekleri
> otomatik siler, ancak sürüm numarası artırılmalıdır.)

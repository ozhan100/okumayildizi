// Okuma Yıldızı - 2. Sınıf | Paragraf Modu (mikrofonla takip)
// Kural: 10'da 10 (hepsi doğru) -> 1 yıldız. Günlük görev: 10 yıldız.
// Mikrofon Chrome konuşma tanıma kullanır (internet ister).

const GUNLUK_HEDEF = 10;
const HATASIZ_HEDEF = 5; // her 5 hatasız (10'da 10) cümle = 1 yıldız

// ---------- 2. sınıf cümle havuzu (5000 cümle buradan üretilir) ----------
const CUMLE_HAVUZU = [
  // Sabah / günlük rutin
  "Sabah uyandım.", "Elimi yüzümü yıkadım.", "Kahvaltıda süt içtim.",
  "Dişlerimi fırçaladım.", "Çantamı hazırladım.", "Okula koştum.",
  "Ayakkabılarımı giydim.", "Saçımı taradım.", "Kahvaltıda ekmek yedim.",
  "Suyumu içtim.",
  // Okul
  "Okulda öğretmenim masal okudu.", "Hepimiz sessizce dinledik.", "Masal çok güzeldi.",
  "Sınıfta resim yaptık.", "Defterime yazı yazdım.", "Teneffüste oynadık.",
  "Öğretmenimi seviyorum.", "Kitabımı okudum.", "Kalemim kırmızı.", "Sıram temiz.",
  // Aile / ev
  "Annem kek yaptı.", "Babam top aldı.", "Kokusu eve yayıldı.",
  "Hep birlikte yedik.", "Kardeşimle oynadım.", "Evimiz sıcak.",
  "Annem masal anlattı.", "Babamla parka gittik.", "Odamı topladım.", "Ailemle güldük.",
  // Hayvanlar
  "Kedim Pamuk çok tatlı.", "Onunla bahçede oynadım.", "Sütünü içince mırıldandı.",
  "Kuş gökte uçar.", "Balık suda yüzer.", "Köpeğim topu getirdi.",
  "Kelebek çiçeğe kondu.", "Arılar çiçeklere kondu.", "Tavşan havuç yedi.", "Civcivler koşuyor.",
  "Kuşlar ötüyor.", "Kedi süt içti.",
  // Doğa
  "Elma ağacı çiçek açmış.", "Babam elma topladı.", "Deniz mavi ve temiz.",
  "Dalgalar kıyıya vuruyor.", "Martılar uçuyor.", "Yıldızlar parlıyor.",
  "Güneş açtı.", "Çiçekler kokuyor.", "Ağaçlar yeşerdi.", "Bulutlar geziyor.",
  // Oyun / park
  "Parkta top oynadık.", "Arkadaşım topu attı.", "Ben de yakaladım.",
  "Salıncakta sallandım.", "Kaydıraktan kaydım.", "Arkadaşımla oynadım.",
  "Top havaya uçtu.", "Hepimiz güldük.", "Oyunu ben kazandım.", "Tekrar oynadık.",
  // Yemek
  "Elma ağaçta büyür.", "Armut tatlı.", "Ekmek sıcak.", "Süt sağlıklı.",
  "Kek çok lezzetli.", "Portakal sulu.", "Çorba sıcak.", "Peynir beyaz.",
  // Mevsim / hava
  "Bugün hava güneşli.", "Kış geldi.", "Kar yağdı.", "Kardan adam yaptık.",
  "Yağmur yağıyor.", "Gökkuşağı çıktı.", "Rüzgar esiyor.", "Sonbaharda yapraklar düştü.",
  // Taşıt / gezi
  "Tren istasyona geldi.", "Düdüğünü çaldı.", "Yolcular trene bindi.",
  "Tren hızlı gidiyor.", "Uçak gökte uçuyor.", "Arabayla gezdik.",
  "Vapurda martılara baktık.", "Bisikletime bindim.",
  // Arkadaşlık / duygular
  "Arkadaşımı seviyorum.", "Birlikte şarkı söyledik.", "Paylaşmak güzel.",
  "Yardıma koştum.", "Teşekkür ettim.", "Özür diledim.",
  "Mutlu oldum.", "Gurur duydum.", "Heyecanlandım.", "Sevinçten zıpladım.",
  // Kısa ek cümleler
  "Bebek uyudu.", "Pencere açık.", "Kapı kapalı.", "Lamba yanıyor.",
  "Saat çalışıyor.", "Deve yürüyor.", "Tilki koşuyor.", "Kuzular otluyor."
];

// ---------- Cümle zorluğu: harf sayısı + uzun kelime cezası (2. sınıf Türkçesi) ----------
function cumleZorluk(c) {
  const temiz = c.replace(/[.,!?;:…"“”'()]/g, "");
  const kelimeler = temiz.split(/\s+/).filter(Boolean);
  let skor = temiz.replace(/\s/g, "").length;
  kelimeler.forEach(w => {
    if (w.length >= 7) skor += 6;
    else if (w.length >= 5) skor += 2;
  });
  skor += kelimeler.length;
  return skor;
}

// ---------- 5000 cümle üret (her biri 3 farklı kısa cümleden ~10 kelime), kolaydan zora sıralı ----------
function karistir(dizi) {
  const a = [...dizi];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const _URETIM = (() => {
  const set = new Map(); // metin -> zorluk (tekrarları ele)
  let guard = 0;
  while (set.size < 5000 && guard < 90000) {
    guard++;
    const uc = karistir(CUMLE_HAVUZU).slice(0, 3);
    const metin = uc.join(" ");
    if (!set.has(metin)) set.set(metin, uc.reduce((t, c) => t + cumleZorluk(c), 0));
  }
  return [...set.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([metin, zorluk]) => ({ metin, zorluk }));
})();
const PARAGRAFLAR = _URETIM.map(o => o.metin);

// listedeki konuma göre zorluk bandı (başlar kolay, azar azar zorlaşır)
function zorlukBand(idx) {
  const oran = idx / PARAGRAFLAR.length;
  if (oran < 0.4) return { yildiz: "★☆☆", ad: "Kolay" };
  if (oran < 0.75) return { yildiz: "★★☆", ad: "Orta" };
  return { yildiz: "★★★", ad: "Zor" };
}

// ---------- Günlük + toplam yıldız ----------
function bugunStr() {
  const d = new Date();
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${ay}-${gun}`;
}

let toplamYildiz = parseInt(localStorage.getItem("okumaYildiz") || "0", 10);
let kayitliGun = localStorage.getItem("okumaGun") || "";
let gunlukYildiz = parseInt(localStorage.getItem("okumaGunYildiz") || "0", 10);
let gunlukHatasiz = parseInt(localStorage.getItem("okumaGunHatasiz") || "0", 10);
let toplamHatasiz = parseInt(localStorage.getItem("okumaHatasiz") || "0", 10);
let paraSira = parseInt(localStorage.getItem("okumaParaSira") || "0", 10);
// Uyarlanabilir zorluk: üst üste başarı/kolaylaştırma sayaçları (yumuşak geçiş için)
let ustUsteBasari = parseInt(localStorage.getItem("okumaSeriBasari") || "0", 10);
let ustUsteZorlanma = parseInt(localStorage.getItem("okumaSeriZor") || "0", 10);

if (kayitliGun !== bugunStr()) {
  kayitliGun = bugunStr();
  gunlukYildiz = 0;
  gunlukHatasiz = 0;
  localStorage.setItem("okumaGun", kayitliGun);
  localStorage.setItem("okumaGunYildiz", "0");
  localStorage.setItem("okumaGunHatasiz", "0");
}

const $ = (id) => document.getElementById(id);
const screens = { start: $("screen-start"), mic: $("screen-mic") };

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

// 5 kollu yıldız: her hatasız cümlede bir kol altın olur, 5'te yıldız tamamlanır
function yildizDoldur(svg, dolu) {
  if (!svg || typeof svg.querySelectorAll !== "function") return;
  let kollar = svg.querySelectorAll("polygon.star-arm");
  if (!kollar.length) {
    if (typeof document.createElementNS !== "function") return;
    const NS = "http://www.w3.org/2000/svg";
    const CX = 60, CY = 60, R = 52, r = 22;
    const nokta = (yaricap, derece) => {
      const a = derece * Math.PI / 180;
      return `${(CX + yaricap * Math.cos(a)).toFixed(2)},${(CY + yaricap * Math.sin(a)).toFixed(2)}`;
    };
    for (let k = 0; k < 5; k++) {
      const dis = -90 + 72 * k;
      const p = document.createElementNS(NS, "polygon");
      p.setAttribute("class", "star-arm");
      p.setAttribute("points", `${CX},${CY} ${nokta(r, dis - 36)} ${nokta(R, dis)} ${nokta(r, dis + 36)}`);
      svg.appendChild(p);
    }
    kollar = svg.querySelectorAll("polygon.star-arm");
  }
  kollar.forEach((p, i) => {
    if (i < dolu) p.classList.add("dolu");
    else p.classList.remove("dolu");
  });
}

function yildizParlat() {
  ["yildiz-mic", "yildiz-start"].forEach(id => {
    const svg = $(id);
    if (!svg || !svg.classList) return;
    svg.classList.remove("kazandi");
    svg.classList.add("kazandi");
    setTimeout(() => svg.classList.remove("kazandi"), 900);
  });
}

function guncelleYildiz() {
  localStorage.setItem("okumaYildiz", String(toplamYildiz));
  localStorage.setItem("okumaGunYildiz", String(gunlukYildiz));
  localStorage.setItem("okumaGun", kayitliGun);
  localStorage.setItem("okumaParaSira", String(paraSira));
  localStorage.setItem("okumaSeriBasari", String(ustUsteBasari));
  localStorage.setItem("okumaSeriZor", String(ustUsteZorlanma));
  localStorage.setItem("okumaGunHatasiz", String(gunlukHatasiz));
  localStorage.setItem("okumaHatasiz", String(toplamHatasiz));

  $("total-stars-start").textContent = toplamYildiz;
  $("daily-start").textContent = gunlukYildiz;
  $("daily-mic").textContent = gunlukYildiz;
  $("hatasiz-start").textContent = `${gunlukHatasiz % HATASIZ_HEDEF}/${HATASIZ_HEDEF}`;
  $("hatasiz-mic").textContent = `${gunlukHatasiz % HATASIZ_HEDEF}/${HATASIZ_HEDEF}`;
  yildizDoldur($("yildiz-mic"), gunlukHatasiz % HATASIZ_HEDEF);
  yildizDoldur($("yildiz-start"), gunlukHatasiz % HATASIZ_HEDEF);
  $("daily-bar-start").style.width = Math.min(100, gunlukYildiz / GUNLUK_HEDEF * 100) + "%";
  $("daily-bar-mic").style.width = Math.min(100, gunlukYildiz / GUNLUK_HEDEF * 100) + "%";

  const kalan = GUNLUK_HEDEF - gunlukYildiz;
  $("daily-msg-start").textContent =
    kalan <= 0 ? "🎉 Bugünkü görev tamamlandı! Harikasın!" :
    kalan === GUNLUK_HEDEF ? "Haydi başla!" :
    `Devam et, ${kalan} yıldız kaldı! 💪`;
}

function yildizKazan() {
  toplamYildiz++;
  gunlukYildiz++;
  guncelleYildiz();
  if (gunlukYildiz === GUNLUK_HEDEF) {
    $("mic-feedback").textContent = "🎉🎉 GÜNLÜK GÖREV TAMAMLANDI! 10 yıldız topladın! Yarın yine beklerim!";
    try {
      const u = new SpeechSynthesisUtterance("Tebrikler! Bugünkü görevi tamamladın!");
      u.lang = "tr-TR";
      speechSynthesis.speak(u);
    } catch (e) { /* yok say */ }
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function seslendir(metin) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(metin);
    u.lang = "tr-TR";
    u.rate = 0.85;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  } catch (e) {
    alert("Ses açılamadı. Telefonun sesini kontrol et.");
  }
}

// ---------- Paragraf + mikrofon takibi ----------
let hedefParagraf = "";
let hedefKelimeler = [];
let recognition = null;
let dinleniyor = false;
let finalMetin = "";
let paragrafYildizVerildi = false;
let sonTranskript = "";
let otoGecisTimer = null;
const OTO_GECIS_SURESI = 4000; // ms: 10/10 olunca sonucu gösterip otomatik geç

function normalizeKelime(k) {
  return k.toLocaleLowerCase("tr-TR")
    .replace(/[.,!?;:…"“”'()"-]/g, "")
    .trim();
}
function normalizeMetin(m) {
  return m.toLocaleLowerCase("tr-TR")
    .replace(/[.,!?;:…"“”'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  return d[a.length][b.length];
}
function kelimeEslesme(hedef, duyulan) {
  if (hedef === duyulan) return true;
  if (!hedef || !duyulan) return false;
  const tolerans = hedef.length <= 3 ? 0 : (hedef.length <= 6 ? 1 : 2);
  return levenshtein(hedef, duyulan) <= tolerans;
}

function yeniParagraf() {
  micDurdur(true);
  hedefParagraf = PARAGRAFLAR[paraSira % PARAGRAFLAR.length];
  const numara = (paraSira % PARAGRAFLAR.length) + 1;
  paraSira++;
  hedefKelimeler = hedefParagraf.split(/\s+/);
  finalMetin = "";
  sonTranskript = "";
  paragrafYildizVerildi = false;
  $("para-text").innerHTML = hedefKelimeler
    .map((w, i) => `<span class="w" id="pw-${i}">${escapeHtml(w)}</span>`)
    .join(" ");
  $("para-label").textContent = `Cümle #${numara} / ${PARAGRAFLAR.length} • ${zorlukBand(paraSira % PARAGRAFLAR.length).yildiz} ${zorlukBand(paraSira % PARAGRAFLAR.length).ad} 👇 Yüksek sesle oku`;
  $("mic-transcript").textContent = "—";
  $("mic-score").textContent = `Doğruluk: — (${hedefKelimeler.length} kelime • 5 hatasız = 1⭐)`;
  $("mic-feedback").textContent = "🎤'ye bas ve cümleyi oku. Bitince Durdur'a bas, sonucu gör. Hazır olunca ⏭️ Atla ile yeni cümleye geç.";
  guncelleYildiz();
}

// final=true ise (mikrofon durdurulmuşsa) yıldız verilebilir
function degerlendir(duyulanMetin, final = false) {
  const duyulan = normalizeMetin(duyulanMetin).split(" ").filter(Boolean);
  const hedefN = hedefKelimeler.map(normalizeKelime);
  let j = 0, dogru = 0;
  const sonuc = new Array(hedefN.length).fill(false);

  for (let i = 0; i < hedefN.length; i++) {
    let bulundu = -1;
    for (let k = j; k < Math.min(j + 4, duyulan.length); k++) {
      if (kelimeEslesme(hedefN[i], duyulan[k])) { bulundu = k; break; }
    }
    if (bulundu >= 0) { sonuc[i] = true; dogru++; j = bulundu + 1; }
  }

  let ilkYanlis = -1;
  hedefKelimeler.forEach((_, i) => {
    const el = $("pw-" + i);
    if (!el) return;
    el.classList.remove("w-ok", "w-bad", "w-next");
    if (!duyulan.length) return;
    if (sonuc[i]) el.classList.add("w-ok");
    else { el.classList.add("w-bad"); if (ilkYanlis < 0) ilkYanlis = i; }
  });
  if (ilkYanlis >= 0) {
    const el = $("pw-" + ilkYanlis);
    if (el) el.classList.add("w-next");
  }

  const yuzde = hedefN.length ? Math.round(dogru / hedefN.length * 100) : 0;
  $("mic-score").textContent = `Doğruluk: %${yuzde} (${dogru}/${hedefN.length} kelime)`;

  const tamPuan = dogru === hedefN.length && hedefN.length > 0;

  if (!duyulan.length) {
    $("mic-feedback").textContent = "Henüz ses duyamadım, biraz daha yüksek sesle oku. 🎤";
  } else if (tamPuan) {
    $("mic-feedback").textContent = "🌟 10'da 10! Mükemmel okudun!";
    if (final && !paragrafYildizVerildi) {
      paragrafYildizVerildi = true;
      gunlukHatasiz++;
      toplamHatasiz++;
      // Uyarlanabilir zorluk: üst üste her 5 hatasızda bir tık ileri sar (fazla değil: +2)
      ustUsteBasari++;
      ustUsteZorlanma = 0;
      let ekstra = "";
      if (ustUsteBasari % 5 === 0) {
        paraSira += 2;
        ekstra = " 🚀 Üst üste başarı! Cümleler bir tık zorlaşıyor.";
      }
      const yildizHakki = (gunlukHatasiz % HATASIZ_HEDEF === 0);
      if (yildizHakki) { yildizKazan(); yildizParlat(); }
      guncelleYildiz();
      if (gunlukYildiz === GUNLUK_HEDEF && yildizHakki) {
        // yildizKazan() kutlama mesajını yazdı, geçiş notunu ekle
        $("mic-feedback").textContent += " Hazır olunca ⏭️ Atla'ya bas." + ekstra;
      } else if (yildizHakki) {
        const hedef = gunlukYildiz > GUNLUK_HEDEF ? "Bonus ⭐ kazandın!" : `⭐ kazandın! (${gunlukYildiz}/${GUNLUK_HEDEF})`;
        $("mic-feedback").textContent = `🌟 10'da 10! ${hedef} Hazır olunca ⏭️ Atla'ya bas.${ekstra}`;
      } else {
        const yapilan = gunlukHatasiz % HATASIZ_HEDEF;
        $("mic-feedback").textContent = `🌟 10'da 10! Hatasız: ${yapilan}/${HATASIZ_HEDEF} — ${HATASIZ_HEDEF - yapilan} tane daha yaparsan ⭐ gelir! Hazır olunca ⏭️ Atla'ya bas.${ekstra}`;
      }
    } else if (!final) {
      $("mic-feedback").textContent = "🌟 Hepsi yeşil görünüyor! Durdur'a bas, sonucu kesinleştir.";
    }
  } else if (yuzde >= 60) {
    if (final) {
      // İdare eder: seri sıfırlanmaz ama artmaz, zorlanma da sayılmaz (yumuşak)
      ustUsteZorlanma = 0;
      guncelleYildiz();
    }
    $("mic-feedback").textContent = final
      ? `👍 ${dogru}/${hedefN.length} doğru. Yıldız için 10'da 10 gerek. Hazır olunca ⏭️ Atla'ya bas.`
      : `👍 ${dogru}/${hedefN.length} doğru. Kırmızılara dikkat, yıldız için 10'da 10 gerek!`;
  } else if (yuzde >= 30) {
    if (final) {
      // Üst üste 2 zorlanmada bir tık geri al (fazla değil: -2, en az 0)
      ustUsteBasari = 0;
      ustUsteZorlanma++;
      let kolay = "";
      if (ustUsteZorlanma >= 2) {
        paraSira = Math.max(0, paraSira - 2);
        ustUsteZorlanma = 0;
        kolay = " 🐢 Merak etme, sıradaki cümle bir tık kolaylaşıyor.";
      }
      guncelleYildiz();
      $("mic-feedback").textContent = `💪 ${dogru}/${hedefN.length} doğru. Sonuç burada duruyor. Hazır olunca ⏭️ Atla'ya bas.${kolay}`;
    } else {
      $("mic-feedback").textContent = "💪 Devam et, kırmızılar düzelecek.";
    }
  } else {
    if (final) {
      ustUsteBasari = 0;
      ustUsteZorlanma++;
      let kolay = "";
      if (ustUsteZorlanma >= 2) {
        paraSira = Math.max(0, paraSira - 2);
        ustUsteZorlanma = 0;
        kolay = " 🐢 Merak etme, sıradaki cümle bir tık kolaylaşıyor.";
      }
      guncelleYildiz();
      $("mic-feedback").textContent = `🔊 ${dogru}/${hedefN.length} doğru. Örnek ile dinleyebilirsin. Hazır olunca ⏭️ Atla'ya bas.${kolay}`;
    } else {
      $("mic-feedback").textContent = "🔊 Örnek düğmesiyle dinle, sonra tekrar dene.";
    }
  }
  return yuzde;
}

function tanimaDestegiVarMi() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// 10/10 olunca: sonucu birkaç saniye göster, sonra otomatik yeni cümleye geç
function otoGecisPlanla() {
  let kalan = Math.ceil(OTO_GECIS_SURESI / 1000);
  $("mic-feedback").textContent += " ⏭️ Birazdan otomatik geçecek.";
  $("mic-status").textContent = `🌟 Hepsi doğru! ${kalan} sn sonra yeni cümle geliyor...`;
  const adim = setInterval(() => {
    kalan--;
    if (kalan > 0 && otoGecisTimer) {
      $("mic-status").textContent = `🌟 Hepsi doğru! ${kalan} sn sonra yeni cümle geliyor...`;
    } else {
      clearInterval(adim);
    }
  }, 1000);
  otoGecisTimer = setTimeout(() => {
    clearInterval(adim);
    otoGecisTimer = null;
    micDurdur(true);
    // Sonuç zaten kesinleşti (canlı 10/10'da sayıldı), sadece yeni cümleye geç
    yeniParagraf();
    $("mic-status").textContent = "Yeni cümle hazır! 🎤 Başla'ya bas.";
  }, OTO_GECIS_SURESI);
}

function micBaslat() {
  if (!tanimaDestegiVarMi()) {
    $("mic-status").textContent = "❌ Bu tarayıcı desteklemiyor. Android Chrome kullan.";
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!recognition) {
    recognition = new SR();
    recognition.lang = "tr-TR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      let ara = "";
      finalMetin = "";
      for (let i = 0; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalMetin += txt + " ";
        else ara += txt + " ";
      }
      const toplam = (finalMetin + " " + ara).trim();
      sonTranskript = toplam;
      $("mic-transcript").textContent = toplam || "Dinliyorum...";
      if (otoGecisTimer) return; // sonuç kesinleşti, geri sayım bitene kadar tabloyu dondur
      const yuzde = degerlendir(toplam, false);
      if (toplam && yuzde === 100 && dinleniyor && !paragrafYildizVerildi) {
        degerlendir(toplam, true); // hatasız sayacı + yıldız hemen işlensin, sonuç görünsün
        otoGecisPlanla();          // birkaç saniye sonra otomatik yeni cümle
      }
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        $("mic-status").textContent = "❌ Mikrofon izni verilmedi. Adres çubuğundaki 🎤 simgesinden izin ver.";
        micDurdur(true);
      } else if (e.error === "no-speech") {
        $("mic-status").textContent = "🔇 Ses duyamadım, telefona yaklaş ve tekrar oku.";
      } else if (e.error === "network") {
        $("mic-status").textContent = "🌐 İnternet gerekli: tanıma Google'a bağlanır. Wi-Fi'yi aç.";
      } else {
        $("mic-status").textContent = "⚠️ Hata: " + e.error;
      }
    };
    recognition.onend = () => {
      if (dinleniyor) { try { recognition.start(); } catch (err) { /* yok say */ } }
    };
  }
  finalMetin = "";
  sonTranskript = "";
  paragrafYildizVerildi = false;
  if (otoGecisTimer) { clearTimeout(otoGecisTimer); otoGecisTimer = null; }
  dinleniyor = true;
  try {
    recognition.start();
    $("mic-status").textContent = "🔴 Dinliyorum... Cümleyi oku!";
    const btn = $("btn-mic");
    btn.classList.add("listening");
    btn.innerHTML = "⏹️<small>Durdur</small>";
  } catch (err) {
    $("mic-status").textContent = "⚠️ Mikrofon başlatılamadı, tekrar dene.";
  }
}

function micDurdur(sessiz) {
  const okumaVardi = dinleniyor;
  dinleniyor = false;
  if (otoGecisTimer) { clearTimeout(otoGecisTimer); otoGecisTimer = null; }
  try { if (recognition) recognition.stop(); } catch (err) { /* yok say */ }
  const btn = $("btn-mic");
  if (btn) { btn.classList.remove("listening"); btn.innerHTML = "🎤<small>Başla</small>"; }
  if (!sessiz) {
    $("mic-status").textContent = "Mikrofon kapalı. Sonuç yukarıda duruyor.";
    const metin = (finalMetin.trim() || sonTranskript.trim());
    if (metin && okumaVardi && !paragrafYildizVerildi) degerlendir(metin, true);
    else if (okumaVardi && !paragrafYildizVerildi) $("mic-feedback").textContent = "🔇 Ses duyamadım. Tekrar 🎤 Başla'ya bas ve oku.";
  }
}

// ---------- Olaylar ----------
$("btn-start-mic").onclick = () => {
  try { speechSynthesis.cancel(); } catch(e){}
  show("mic");
  guncelleYildiz();
  if (!hedefParagraf) yeniParagraf();
};
$("btn-mic-home").onclick = () => { micDurdur(true); show("start"); guncelleYildiz(); };
$("btn-new-para").onclick = () => yeniParagraf();
$("btn-listen-para").onclick = () => { if (hedefParagraf) seslendir(hedefParagraf); };
$("btn-mic").onclick = () => { dinleniyor ? micDurdur(false) : micBaslat(); };

// PWA service worker (offline - paragraflar gömülü olduğu için liste offline çalışır)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

$("para-count-start").textContent = PARAGRAFLAR.length;
guncelleYildiz();

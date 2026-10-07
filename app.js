// Okuma Yıldızı - 2. Sınıf | Kısa Öykü Okuma (mikrofonla takip)
// Kaynak: 1000 kısa öykü (oykuler.js)
//
// KURAL: Öyküyü SONUNA KADAR oku. En az %90 doğruysa 1 TAM yıldız. Günlük görev: 10 yıldız.
// KELİME RENKLERİ:
//   yeşil  = kelime tam doğru okundu
//   kırmızı = kelime yanlış okundu
//   sarı    = kelime henüz okunmadı / atlandı
// Öykü, SON KELİME sarı olmaktan çıkınca (yeşil ya da kırmızı olunca) kilitlenir;
// sonuç olumluysa yıldız verilir, sonra kendiliğinden sıradaki öyküye geçilir.

const GUNLUK_HEDEF = 10;          // günlük 10 yıldız = 10 öykü
const HEDEF_DOGRULUK = 0.90;      // yıldız için gereken en düşük doğruluk
const SONUC_SURESI_OLUMLU = 4000; // ms: başarılı sonucu göster, sonra yeni öykü
const SONUC_SURESI_OLUMSUZ = 6000;// ms: başarısızda hataları görebilmek için daha uzun

// %90 doğruluk için izin verilen en fazla hata sayısı
function izinHata(uzunluk) {
  return uzunluk - Math.ceil(uzunluk * HEDEF_DOGRULUK);
}

// ---------- Öykü zorluğu: harf sayısı + uzun kelime cezası (2. sınıf Türkçesi) ----------
function metinZorluk(m) {
  const temiz = m.replace(/[.,!?;:…"“”'()]/g, "");
  const kelimeler = temiz.split(/\s+/).filter(Boolean);
  let skor = temiz.replace(/\s/g, "").length;
  kelimeler.forEach(w => {
    if (w.length >= 7) skor += 6;
    else if (w.length >= 5) skor += 2;
  });
  skor += kelimeler.length;
  return skor;
}

// Öyküler hazır geldiği için zorlukları bir kez hesaplanır.
const OYKU_ZORLUK = OYKULAR.map(metinZorluk);

// Zorluk bandı: öykülerin kendi metnine göre (konuma göre değil)
const _SIRALI = [...OYKU_ZORLUK].sort((a, b) => a - b);
const _ESIK_ORTA = _SIRALI[Math.floor(_SIRALI.length * 0.4)];
const _ESIK_ZOR = _SIRALI[Math.floor(_SIRALI.length * 0.75)];
function zorlukBand(idx) {
  const s = OYKU_ZORLUK[idx];
  if (s <= _ESIK_ORTA) return { yildiz: "★☆☆", ad: "Kolay" };
  if (s <= _ESIK_ZOR) return { yildiz: "★★☆", ad: "Orta" };
  return { yildiz: "★★★", ad: "Zor" };
}

// ---------- Günlük + toplam sayaçlar ----------
function bugunStr() {
  const d = new Date();
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${ay}-${gun}`;
}

let toplamYildiz = parseInt(localStorage.getItem("okumaYildiz") || "0", 10);
let kayitliGun = localStorage.getItem("okumaGun") || "";
let gunlukYildiz = parseInt(localStorage.getItem("okumaGunYildiz") || "0", 10);
let toplamOyku = parseInt(localStorage.getItem("okumaOyku") || "0", 10);
let gunlukOyku = parseInt(localStorage.getItem("okumaGunOyku") || "0", 10);
let paraSira = parseInt(localStorage.getItem("okumaParaSira") || "0", 10);

if (kayitliGun !== bugunStr()) {
  kayitliGun = bugunStr();
  gunlukYildiz = 0;
  gunlukOyku = 0;
  localStorage.setItem("okumaGun", kayitliGun);
  localStorage.setItem("okumaGunYildiz", "0");
  localStorage.setItem("okumaGunOyku", "0");
}

const $ = (id) => document.getElementById(id);
const screens = { start: $("screen-start"), mic: $("screen-mic") };

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

function guncelleYildiz() {
  localStorage.setItem("okumaYildiz", String(toplamYildiz));
  localStorage.setItem("okumaGunYildiz", String(gunlukYildiz));
  localStorage.setItem("okumaGun", kayitliGun);
  localStorage.setItem("okumaParaSira", String(paraSira));
  localStorage.setItem("okumaOyku", String(toplamOyku));
  localStorage.setItem("okumaGunOyku", String(gunlukOyku));

  $("total-stars-start").textContent = toplamYildiz;
  $("daily-start").textContent = gunlukYildiz;
  $("daily-mic").textContent = gunlukYildiz;
  $("bugun-oyku-start").textContent = gunlukOyku;
  $("toplam-oyku-start").textContent = toplamOyku;
  $("daily-bar-start").style.width = Math.min(100, gunlukYildiz / GUNLUK_HEDEF * 100) + "%";
  $("daily-bar-mic").style.width = Math.min(100, gunlukYildiz / GUNLUK_HEDEF * 100) + "%";

  const kalan = GUNLUK_HEDEF - gunlukYildiz;
  $("daily-msg-start").textContent =
    kalan <= 0 ? "🎉 Bugünkü görev tamamlandı! Harikasın!" :
    kalan === GUNLUK_HEDEF ? "Haydi başla!" :
    `Devam et, ${kalan} yıldız kaldı! 💪`;
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

// ---------- Öykü + mikrofon durumu ----------
let hedefOyku = "";
let hedefKelimeler = [];
let recognition = null;
let dinleniyor = false;
let finalMetin = "";
let sonTranskript = "";
let oykuKilitlendi = false;   // bu öykünün sonucu kesinleşti mi
let otoGecisTimer = null;
let sonDegerlendirme = { dogru: 0, toplam: 0, yuzde: 0 };

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

// Tam eşleşme: kelimenin birebir doğru okunmuş olması gerekir (yaklaşık eşleşme yok).

// ---------- Hizalama: her hedef kelimeye renk atar ----------
// İki diziyi (hedef kelimeler <-> duyulan kelimeler) en az maliyetle hizalar.
//   eşleşme        -> yeşil  (tam doğru okundu)
//   değiştirme     -> kırmızı (yanlış okundu)
//   hedef atlama   -> sarı   (okunmadı / atlandı)
//   fazla duyulan  -> yok sayılır (tanıma fazladan kelime üretirse kayma olmasın)
// Bu sayede tek bir eksik/fazla kelime öykünün geri kalanını bozmaz.
function hizala(hedefN, duyulan) {
  const N = hedefN.length, H = duyulan.length;
  if (!N) return [];
  const D = Array.from({ length: N + 1 }, () => new Array(H + 1).fill(0));
  for (let i = 1; i <= N; i++) D[i][0] = i;
  for (let k = 1; k <= H; k++) D[0][k] = k;

  for (let i = 1; i <= N; i++) {
    for (let k = 1; k <= H; k++) {
      const esit = hedefN[i - 1] === duyulan[k - 1];
      const capraz = D[i - 1][k - 1] + (esit ? 0 : 1); // eşleşme ya da yanlış okuma
      const atlaHedef = D[i - 1][k] + 1;               // hedef kelime okunmadı
      const fazlaDuyulan = D[i][k - 1] + 1;            // duyulan kelime fazladan
      D[i][k] = Math.min(capraz, atlaHedef, fazlaDuyulan);
    }
  }

  const durum = new Array(N).fill("sari");
  let i = N, k = H;
  while (i > 0 || k > 0) {
    if (i > 0 && k > 0) {
      const esit = hedefN[i - 1] === duyulan[k - 1];
      if (D[i][k] === D[i - 1][k - 1] + (esit ? 0 : 1)) {
        durum[i - 1] = esit ? "yesil" : "kirmizi";
        i--; k--; continue;
      }
    }
    if (i > 0 && D[i][k] === D[i - 1][k] + 1) { durum[i - 1] = "sari"; i--; continue; }
    k--; // fazladan duyulan kelime: yok say
  }
  return durum;
}

function yeniOyku() {
  micDurdur(false);
  const idx = paraSira % OYKULAR.length;
  hedefOyku = OYKULAR[idx];
  const band = zorlukBand(idx);
  paraSira++;
  hedefKelimeler = hedefOyku.split(/\s+/);
  finalMetin = "";
  sonTranskript = "";
  oykuKilitlendi = false;
  sonDegerlendirme = { dogru: 0, toplam: hedefKelimeler.length, yuzde: 0 };

  // Başlangıçta bütün kelimeler sarı: "henüz okunmadı"
  $("para-text").innerHTML = hedefKelimeler
    .map((w, i) => `<span class="w w-yellow${i === 0 ? " w-next" : ""}" id="pw-${i}">${escapeHtml(w)}</span>`)
    .join(" ");
  $("para-label").textContent =
    `Öykü #${idx + 1} / ${OYKULAR.length} • ${hedefKelimeler.length} kelime • ${band.yildiz} ${band.ad} 👇 Yüksek sesle oku`;
  $("mic-transcript").textContent = "—";
  $("mic-score").textContent = `Doğruluk: — (${hedefKelimeler.length} kelime • en fazla ${izinHata(hedefKelimeler.length)} hata)`;
  $("mic-feedback").textContent = "🎤'ye bas ve öyküyü baştan sona oku. Son kelimeyi de okuyunca sonuç kesinleşir.";
  $("mic-status").textContent = "Mikrofon kapalı.";
  guncelleYildiz();
}

// Renkleri ekrana uygula
function renkleriCiz(durum) {
  let ilkSari = -1;
  for (let i = 0; i < durum.length; i++) {
    if (ilkSari < 0 && durum[i] === "sari") ilkSari = i;
    const el = $("pw-" + i);
    if (!el) continue;
    el.classList.remove("w-ok", "w-bad", "w-yellow", "w-next");
    if (durum[i] === "yesil") el.classList.add("w-ok");
    else if (durum[i] === "kirmizi") el.classList.add("w-bad");
    else el.classList.add("w-yellow");
    if (i === ilkSari) el.classList.add("w-next");
  }
}

// ---------- Öyküyü kilitle: sonucu belirle, yıldızı ver, sıradakine geç ----------
function kilitle(dogru, toplam) {
  if (oykuKilitlendi) return;
  oykuKilitlendi = true;

  // Mikrofonu kapat (yeni sonuç gelmesin)
  dinleniyor = false;
  if (otoGecisTimer) { clearTimeout(otoGecisTimer); otoGecisTimer = null; }
  try { if (recognition) recognition.stop(); } catch (e) { /* yok say */ }
  micButonuYaz(false);

  const yuzde = toplam ? Math.floor(dogru / toplam * 100) : 0;
  // Eşik, yuvarlanmış yüzdeye göre DEĞİL, gerçek orana göre uygulanır:
  // %89,6 ekranda %90 görünse bile yıldız vermemeli.
  const basarili = toplam > 0 && dogru >= toplam - izinHata(toplam);

  toplamOyku++;
  gunlukOyku++;

  let mesaj;
  if (basarili) {
    toplamYildiz++;
    gunlukYildiz++;
    if (gunlukYildiz === GUNLUK_HEDEF) {
      mesaj = `🎉🎉 GÜNLÜK GÖREV TAMAMLANDI! %${yuzde} doğru, ${GUNLUK_HEDEF} yıldız topladın!`;
      try {
        const u = new SpeechSynthesisUtterance("Tebrikler! Bugünkü görevi tamamladın!");
        u.lang = "tr-TR";
        speechSynthesis.speak(u);
      } catch (e) { /* yok say */ }
    } else {
      mesaj = `🌟 %${yuzde} doğru! 1 TAM yıldız kazandın! (${gunlukYildiz}/${GUNLUK_HEDEF})`;
    }
  } else {
    mesaj = `💪 %${yuzde} doğru (${dogru}/${toplam}). Yıldız için en az %90 gerek.`;
  }
  guncelleYildiz();

  const sure = basarili ? SONUC_SURESI_OLUMLU : SONUC_SURESI_OLUMSUZ;
  let kalan = Math.ceil(sure / 1000);
  const yaz = (sn) => {
    $("mic-feedback").textContent = `${mesaj} ⏭️ ${sn} sn sonra yeni öykü...`;
  };
  yaz(kalan);
  $("mic-status").textContent = basarili ? "🌟 Öykü tamamlandı!" : "Öykü tamamlandı, sonucu incele.";

  const adim = setInterval(() => {
    kalan--;
    if (kalan > 0 && otoGecisTimer) yaz(kalan);
    else clearInterval(adim);
  }, 1000);

  otoGecisTimer = setTimeout(() => {
    clearInterval(adim);
    otoGecisTimer = null;
    yeniOyku();
    $("mic-status").textContent = "Yeni öykü hazır! 🎤 Başla'ya bas.";
  }, sure);
}

// ---------- Değerlendirme ----------
function degerlendir(duyulanMetin) {
  const duyulan = normalizeMetin(duyulanMetin).split(" ").filter(Boolean);
  const hedefN = hedefKelimeler.map(normalizeKelime);
  const N = hedefN.length;
  const durum = hizala(hedefN, duyulan);

  let dogru = 0;
  for (let i = 0; i < N; i++) if (durum[i] === "yesil") dogru++;
  renkleriCiz(durum);

  const yuzde = N ? Math.floor(dogru / N * 100) : 0;
  sonDegerlendirme = { dogru, toplam: N, yuzde };
  $("mic-score").textContent = `Doğruluk: %${yuzde} (${dogru}/${N} kelime doğru • en fazla ${izinHata(N)} hata)`;

  if (oykuKilitlendi) return sonDegerlendirme;

  // Öykü, SON KELİME sarı olmaktan çıkınca kilitlenir.
  // (Arada sarı kalan atlanmış kelimeler olsa bile öykü biter.)
  const sonKelimeCozuldu = N > 0 && durum[N - 1] !== "sari";

  if (sonKelimeCozuldu) {
    kilitle(dogru, N);
  } else if (!duyulan.length) {
    $("mic-feedback").textContent = "🎤'ye bas ve öyküyü baştan sona oku.";
  } else {
    const kalanSari = durum.filter(d => d === "sari").length;
    $("mic-feedback").textContent =
      `👍 ${dogru}/${N} doğru (%${yuzde}). Öykünün sonuna kadar oku — ${kalanSari} kelime kaldı.`;
  }
  return sonDegerlendirme;
}

function tanimaDestegiVarMi() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function micButonuYaz(dinliyor) {
  const btn = $("btn-mic");
  if (!btn) return;
  if (dinliyor) { btn.classList.add("listening"); btn.innerHTML = "⏹️<small>Durdur</small>"; }
  else { btn.classList.remove("listening"); btn.innerHTML = "🎤<small>Başla</small>"; }
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
      if (oykuKilitlendi) return;           // sonuç kesinleşti
      degerlendir(toplam);                  // son kelime çözülünce kilitle() çağrılır
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        $("mic-status").textContent = "❌ Mikrofon izni verilmedi. Adres çubuğundaki 🎤 simgesinden izin ver.";
        micDurdur(false);
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
  if (!oykuKilitlendi) {
    // Aynı öyküde yeniden okumaya izin ver: renkleri sıfırla
    hedefKelimeler.forEach((_, i) => {
      const el = $("pw-" + i);
      if (el) { el.classList.remove("w-ok", "w-bad"); el.classList.add("w-yellow"); }
    });
    sonDegerlendirme = { dogru: 0, toplam: hedefKelimeler.length, yuzde: 0 };
    $("mic-score").textContent = `Doğruluk: — (${hedefKelimeler.length} kelime • en fazla ${izinHata(hedefKelimeler.length)} hata)`;
  }
  dinleniyor = true;
  try {
    recognition.start();
    $("mic-status").textContent = "🔴 Dinliyorum... Öyküyü baştan sona oku!";
    micButonuYaz(true);
  } catch (err) {
    $("mic-status").textContent = "⚠️ Mikrofon başlatılamadı, tekrar dene.";
  }
}

// manuel=true: çocuk Durdur'a bastı -> sonucu kesinleştir
function micDurdur(manuel) {
  const okumaVardi = dinleniyor;
  dinleniyor = false;
  if (otoGecisTimer) { clearTimeout(otoGecisTimer); otoGecisTimer = null; }
  try { if (recognition) recognition.stop(); } catch (err) { /* yok say */ }
  micButonuYaz(false);
  if (!manuel || oykuKilitlendi) return;

  const metin = (finalMetin.trim() || sonTranskript.trim());
  if (!metin) {
    $("mic-status").textContent = "Mikrofon kapalı.";
    if (okumaVardi) $("mic-feedback").textContent = "🔇 Ses duyamadım. 🎤 Başla'ya bas ve öyküyü oku.";
    return;
  }
  $("mic-status").textContent = "Mikrofon kapalı.";
  const bilgi = degerlendir(metin);
  // Son kelime hâlâ sarıysa bile çocuk bitirdiğini söylüyorsa sonucu kesinleştir.
  if (!oykuKilitlendi) kilitle(bilgi.dogru, bilgi.toplam);
}

// ---------- Olaylar ----------
$("btn-start-mic").onclick = () => {
  try { speechSynthesis.cancel(); } catch(e){}
  show("mic");
  guncelleYildiz();
  if (!hedefOyku) yeniOyku();
};
$("btn-mic-home").onclick = () => { micDurdur(false); show("start"); guncelleYildiz(); };
$("btn-new-para").onclick = () => yeniOyku();
$("btn-listen-para").onclick = () => { if (hedefOyku) seslendir(hedefOyku); };
$("btn-mic").onclick = () => {
  if (oykuKilitlendi) return;            // sonuç kesinleşti, sıradaki öykü beklenir
  dinleniyor ? micDurdur(true) : micBaslat();
};

// PWA service worker (offline - öyküler gömülü olduğu için liste offline çalışır)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

$("para-count-start").textContent = OYKULAR.length;
guncelleYildiz();

// Okuma Yıldızı - 2. Sınıf | Kısa Öykü Okuma (mikrofonla takip)
// Kaynak: 1000 kısa öykü (oykuler.js)
// Kural: öyküyü en az %90 doğrulukla, sonuna kadar oku -> 1 yıldız. Günlük görev: 10 yıldız.
// Mikrofon Chrome konuşma tanıma kullanır (internet ister).

const GUNLUK_HEDEF = 10;
const HATASIZ_HEDEF = 5;      // her 5 hatasız öykü = 1 yıldız
const HEDEF_DOGRULUK = 0.90;  // yıldız için gereken en düşük doğruluk

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

// Öyküler hazır geldiği için zorlukları bir kez hesaplanır (sıralama değişmez).
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

// %90 doğruluk için izin verilen en fazla hata sayısı
function izinHata(uzunluk) {
  return uzunluk - Math.ceil(uzunluk * HEDEF_DOGRULUK);
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

// 5 kollu yıldız: her hatasız öyküde bir kol altın olur, 5'te yıldız tamamlanır
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

// ---------- Öykü + mikrofon takibi ----------
let hedefOyku = "";
let hedefKelimeler = [];
let recognition = null;
let dinleniyor = false;
let finalMetin = "";
let oykuYildizVerildi = false;
let sonTranskript = "";
let otoGecisTimer = null;
const OTO_GECIS_SURESI = 4000; // ms: hedef tutulunca sonucu gösterip otomatik geç

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

function yeniOyku() {
  micDurdur(true);
  const idx = paraSira % OYKULAR.length;
  hedefOyku = OYKULAR[idx];
  const band = zorlukBand(idx);
  paraSira++;
  hedefKelimeler = hedefOyku.split(/\s+/);
  finalMetin = "";
  sonTranskript = "";
  oykuYildizVerildi = false;
  $("para-text").innerHTML = hedefKelimeler
    .map((w, i) => `<span class="w" id="pw-${i}">${escapeHtml(w)}</span>`)
    .join(" ");
  $("para-label").textContent =
    `Öykü #${idx + 1} / ${OYKULAR.length} • ${hedefKelimeler.length} kelime • ${band.yildiz} ${band.ad} 👇 Yüksek sesle oku`;
  $("mic-transcript").textContent = "—";
  $("mic-score").textContent = `Doğruluk: — (${hedefKelimeler.length} kelime • hedef en az %90)`;
  $("mic-feedback").textContent = "🎤'ye bas ve öyküyü baştan sona oku. Bitince Durdur'a bas, sonucu gör.";
  guncelleYildiz();
}

// final=true ise (mikrofon durdurulmuşsa) yıldız verilebilir
function degerlendir(duyulanMetin, final = false) {
  const duyulan = normalizeMetin(duyulanMetin).split(" ").filter(Boolean);
  const hedefN = hedefKelimeler.map(normalizeKelime);
  const izin = izinHata(hedefN.length);
  let j = 0, dogru = 0, sonEslesme = -1;
  const eslesmeler = new Array(hedefN.length).fill(false);

  for (let i = 0; i < hedefN.length; i++) {
    let bulundu = -1;
    for (let k = j; k < Math.min(j + 4, duyulan.length); k++) {
      if (kelimeEslesme(hedefN[i], duyulan[k])) { bulundu = k; break; }
    }
    if (bulundu >= 0) { eslesmeler[i] = true; dogru++; j = bulundu + 1; sonEslesme = i; }
  }

  let ilkYanlis = -1;
  hedefKelimeler.forEach((_, i) => {
    const el = $("pw-" + i);
    if (!el) return;
    el.classList.remove("w-ok", "w-bad", "w-next");
    if (!duyulan.length) return;
    if (eslesmeler[i]) el.classList.add("w-ok");
    else { el.classList.add("w-bad"); if (ilkYanlis < 0) ilkYanlis = i; }
  });
  if (ilkYanlis >= 0) {
    const el = $("pw-" + ilkYanlis);
    if (el) el.classList.add("w-next");
  }

  const yuzde = hedefN.length ? Math.round(dogru / hedefN.length * 100) : 0;
  $("mic-score").textContent = `Doğruluk: %${yuzde} (${dogru}/${hedefN.length} kelime • en fazla ${izin} hata)`;

  // Yıldız için: yeterli doğruluk VE öykünün sonuna kadar okunmuş olması.
  // (Yoksa baştan birkaç kelimeyi okuyup bırakmak %90'ı tuttururdu.)
  const yeterliDogru = dogru >= hedefN.length - izin;
  const sonaUlasildi = sonEslesme >= hedefN.length - 1 - izin;
  const hedefTutuldu = yeterliDogru && sonaUlasildi;
  const sonucBilgi = { yuzde, dogru, toplam: hedefN.length, izin, hedefTutuldu, sonaUlasildi };

  if (!duyulan.length) {
    $("mic-feedback").textContent = "Henüz ses duyamadım, biraz daha yüksek sesle oku. 🎤";
  } else if (hedefTutuldu) {
    if (final && !oykuYildizVerildi) {
      oykuYildizVerildi = true;
      gunlukHatasiz++;
      toplamHatasiz++;
      const yildizHakki = (gunlukHatasiz % HATASIZ_HEDEF === 0);
      if (yildizHakki) { yildizKazan(); yildizParlat(); }
      guncelleYildiz();
      if (gunlukYildiz === GUNLUK_HEDEF && yildizHakki) {
        $("mic-feedback").textContent += " Hazır olunca ⏭️ Atla'ya bas.";
      } else if (yildizHakki) {
        const hedef = gunlukYildiz > GUNLUK_HEDEF ? "Bonus ⭐ kazandın!" : `⭐ kazandın! (${gunlukYildiz}/${GUNLUK_HEDEF})`;
        $("mic-feedback").textContent = `🌟 %${yuzde} doğru! ${hedef} Hazır olunca ⏭️ Atla'ya bas.`;
      } else {
        const yapilan = gunlukHatasiz % HATASIZ_HEDEF;
        $("mic-feedback").textContent = `🌟 %${yuzde} doğru! Hatasız: ${yapilan}/${HATASIZ_HEDEF} — ${HATASIZ_HEDEF - yapilan} öykü daha okursan ⭐ gelir! Hazır olunca ⏭️ Atla'ya bas.`;
      }
    } else if (!final) {
      $("mic-feedback").textContent = "🌟 Hedefi tuttun! Durdur'a bas, sonucu kesinleştir.";
    }
  } else if (yeterliDogru && !sonaUlasildi) {
    $("mic-feedback").textContent = `👍 ${dogru}/${hedefN.length} doğru. Ama öykü bitmemiş — sonuna kadar okumalısın!`;
  } else if (yuzde >= 60) {
    $("mic-feedback").textContent = final
      ? `👍 ${dogru}/${hedefN.length} doğru (%${yuzde}). Yıldız için en az %90 gerek. Hazır olunca ⏭️ Atla'ya bas.`
      : `👍 ${dogru}/${hedefN.length} doğru. Kırmızılara dikkat, yıldız için en az %90 gerek!`;
  } else if (yuzde >= 30) {
    $("mic-feedback").textContent = final
      ? `💪 ${dogru}/${hedefN.length} doğru. Sonuç burada duruyor. Hazır olunca ⏭️ Atla'ya bas.`
      : "💪 Devam et, kırmızılar düzelecek.";
  } else {
    $("mic-feedback").textContent = final
      ? `🔊 ${dogru}/${hedefN.length} doğru. Örnek ile dinleyebilirsin. Hazır olunca ⏭️ Atla'ya bas.`
      : "🔊 Örnek düğmesiyle dinle, sonra tekrar dene.";
  }
  return sonucBilgi;
}

function tanimaDestegiVarMi() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Hedef tutulunca: sonucu birkaç saniye göster, sonra otomatik yeni öyküye geç
function otoGecisPlanla() {
  let kalan = Math.ceil(OTO_GECIS_SURESI / 1000);
  $("mic-feedback").textContent += " ⏭️ Birazdan otomatik geçecek.";
  $("mic-status").textContent = `🌟 Hedefi tuttun! ${kalan} sn sonra yeni öykü geliyor...`;
  const adim = setInterval(() => {
    kalan--;
    if (kalan > 0 && otoGecisTimer) {
      $("mic-status").textContent = `🌟 Hedefi tuttun! ${kalan} sn sonra yeni öykü geliyor...`;
    } else {
      clearInterval(adim);
    }
  }, 1000);
  otoGecisTimer = setTimeout(() => {
    clearInterval(adim);
    otoGecisTimer = null;
    micDurdur(true);
    yeniOyku();
    $("mic-status").textContent = "Yeni öykü hazır! 🎤 Başla'ya bas.";
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
      const bilgi = degerlendir(toplam, false);
      if (toplam && bilgi.hedefTutuldu && dinleniyor && !oykuYildizVerildi) {
        degerlendir(toplam, true);        // yıldızı/sayacı hemen işle
        if (oykuYildizVerildi) otoGecisPlanla(); // birkaç saniye sonra otomatik yeni öykü
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
  oykuYildizVerildi = false;
  if (otoGecisTimer) { clearTimeout(otoGecisTimer); otoGecisTimer = null; }
  dinleniyor = true;
  try {
    recognition.start();
    $("mic-status").textContent = "🔴 Dinliyorum... Öyküyü baştan sona oku!";
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
    if (metin && okumaVardi && !oykuYildizVerildi) degerlendir(metin, true);
    else if (okumaVardi && !oykuYildizVerildi) $("mic-feedback").textContent = "🔇 Ses duyamadım. Tekrar 🎤 Başla'ya bas ve oku.";
  }
}

// ---------- Olaylar ----------
$("btn-start-mic").onclick = () => {
  try { speechSynthesis.cancel(); } catch(e){}
  show("mic");
  guncelleYildiz();
  if (!hedefOyku) yeniOyku();
};
$("btn-mic-home").onclick = () => { micDurdur(true); show("start"); guncelleYildiz(); };
$("btn-new-para").onclick = () => yeniOyku();
$("btn-listen-para").onclick = () => { if (hedefOyku) seslendir(hedefOyku); };
$("btn-mic").onclick = () => { dinleniyor ? micDurdur(false) : micBaslat(); };

// PWA service worker (offline - öyküler gömülü olduğu için liste offline çalışır)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

$("para-count-start").textContent = OYKULAR.length;
guncelleYildiz();

// Okuma Yıldızı - 2. Sınıf | Kısa Öykü Okuma (mikrofonla takip)
// Kaynak: 1000 kısa öykü (oykuler.js)
//
// KURAL: Öyküyü SONUNA KADAR oku. Tamamı hatasızsa (%100) 1 TAM yıldız. Günlük görev: 10 yıldız.
// KELİME RENKLERİ:
//   yeşil  = kelime tam doğru okundu
//   kırmızı = kelime yanlış okundu
//   sarı    = kelime henüz okunmadı / atlandı
// Öykü, SON KELİME sarı olmaktan çıkınca (yeşil ya da kırmızı olunca) kilitlenir;
// sonuç olumluysa yıldız verilir, sonra kendiliğinden sıradaki öyküye geçilir.

const GUNLUK_HEDEF = 10;          // günlük 10 yıldız = 10 hatasız öykü
// ALTIN KURAL (yıldız): BÜTÜN kelimeler doğru olmalı — tek yanlışta yıldız YOK.
// (Eşik hesabı yok; dogru === toplam aranır.)
const SONUC_SURESI_OLUMLU = 4000; // ms: başarılı sonucu göster, sonra yeni öykü
const SONUC_SURESI_OLUMSUZ = 6000;// ms: başarısızda hataları görebilmek için daha uzun

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

if (kayitliGun !== bugunStr()) {
  kayitliGun = bugunStr();
  gunlukYildiz = 0;
  gunlukOyku = 0;
  localStorage.setItem("okumaGun", kayitliGun);
  localStorage.setItem("okumaGunYildiz", "0");
  localStorage.setItem("okumaGunOyku", "0");
}

// ---------- Öykü havuzu: sıra her açılışta karışık, öykü tekrar etmez ----------
// Öyküler sabit bir sırayla (1,2,3...) değil, "okunmamış havuzdan rastgele çekme"
// yöntemiyle gösterilir. Böylece uygulama ertesi gün açıldığında sıra farklı olur;
// buna karşılık bir öykü, bütün öyküler okunana kadar tekrar karşımıza çıkmaz.
// Havuz bitince otomatik olarak yeni bir tur başlar.
function tamHavuz() {
  return Array.from({ length: OYKULAR.length }, (_, i) => i);
}
function havuzOku() {
  try {
    const ham = localStorage.getItem("okumaHavuz");
    if (!ham) return null;
    const d = JSON.parse(ham);
    if (Array.isArray(d) && d.length &&
        d.every(n => Number.isInteger(n) && n >= 0 && n < OYKULAR.length)) return d;
  } catch (e) { /* bozuk kayıt: aşağıda yeniden kurulur */ }
  return null;
}
let havuz = havuzOku() || tamHavuz();
let hedefIdx = -1;          // gösterilmekte olan öykünün numarası
let yeniTurBasladi = false; // havuz bu öyküde yenilendi mi

function havuzKaydet() {
  try { localStorage.setItem("okumaHavuz", JSON.stringify(havuz)); } catch (e) { /* yok say */ }
}

// Havuzdan rastgele bir öykü çeker (her öykü yalnızca bir kez).
function siradakiOykuIndeksi() {
  if (!havuz.length) { havuz = tamHavuz(); yeniTurBasladi = true; }
  const k = Math.floor(Math.random() * havuz.length);
  return havuz.splice(k, 1)[0];
}

// Eski sürümden kalan sabit sayaç artık kullanılmıyor.
try { localStorage.removeItem("okumaParaSira"); } catch (e) { /* yok say */ }

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
  localStorage.setItem("okumaOyku", String(toplamOyku));
  localStorage.setItem("okumaGunOyku", String(gunlukOyku));

  $("total-stars-start").textContent = toplamYildiz;
  $("daily-start").textContent = gunlukYildiz;
  $("daily-mic").textContent = gunlukYildiz;
  $("bugun-oyku-start").textContent = gunlukOyku;
  $("toplam-oyku-start").textContent = toplamOyku;
  $("kalan-oyku-start").textContent = havuz.length;
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
let yenidenDeneme = 0;    // onend sonrası yeniden başlatma deneme sayacı
let sonTranskript = "";     // ekranda gösterilen tam metin
let birikmisMetin = "";     // tamamlanmış tanıma oturumlarından biriken metin
let oturumFinal = "";       // şu anki oturumun kesinleşmiş metni
let mikrofonIzniAlindi = false;
let baslatiliyor = false;   // izin istenirken buton tekrar basılmasın
let oykuKilitlendi = false;   // bu öykünün sonucu kesinleşti mi
let gecisZamani = 0;          // son öykü geçiş anı (eski sesin yenisini kirletmesini engeller)
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
  const BASLANGIC_CEZASI = 100;  // Başta atlama çok maliyetli -> en başa eşleşme zorlanır
  for (let i = 1; i <= N; i++) D[i][0] = i * BASLANGIC_CEZASI;
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
  // DİKKAT: mikrofon KAPATILMAZ — kullanıcı Durdur'a basana kadar dinleme sürer.
  // Sadece bekleyen otomatik geçiş sayacı temizlenir (manuel Atla durumu).
  if (otoGecisTimer) { clearTimeout(otoGecisTimer); otoGecisTimer = null; }
  gecisZamani = Date.now(); // geçiş anındaki eski ses yeni öyküyü kirletmesin (500ms koruma)
  yeniTurBasladi = false;
  const idx = siradakiOykuIndeksi();
  hedefIdx = idx;
  hedefOyku = OYKULAR[idx];
  const band = zorlukBand(idx);
  havuzKaydet();
  hedefKelimeler = hedefOyku.split(/\s+/);
  birikmisMetin = "";
  oturumFinal = "";
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
  $("mic-score").textContent = `Doğruluk: — (${hedefKelimeler.length} kelime • yıldız için hatasız)`;
  $("mic-feedback").textContent = "🎤'ye bas ve öyküyü baştan sona oku. Son kelimeyi de okuyunca sonuç kesinleşir.";
  $("mic-status").textContent = yeniTurBasladi
    ? `🎉 ${OYKULAR.length} öykünün hepsi okundu! Yeni tur başladı, sıra yeniden karıştırıldı.`
    : "Mikrofon kapalı.";
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
// ALTIN KURAL: son kelime sarı dışında bir renk olunca kilitlenir.
// Mikrofon KAPANMAZ — kullanıcı Durdur'a basana kadar dinlemeye devam eder.
// (Kilit sonrası gelen sonuçlar bu öyküyü değiştirmez; yeni öyküye temiz başlanır.)
function kilitle(dogru, toplam) {
  if (oykuKilitlendi) return;
  oykuKilitlendi = true;

  const yuzde = toplam ? Math.floor(dogru / toplam * 100) : 0;
  // Yıldız SADECE hatasız okumada: tek yanlışta yıldız yok.
  const basarili = toplam > 0 && dogru === toplam;

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
    mesaj = `💪 %${yuzde} doğru (${dogru}/${toplam}). Yıldız için bütün kelimeler doğru olmalı (hatasız).`;
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
    // Kilitte mikrofon kapatılmadığı için burada da açık olmalı;
    // yine de tanımanın gerçekten çalıştığından emin ol.
    mikrofonuSurdur();
    $("mic-status").textContent = dinleniyor ? "🔴 Dinliyorum... Yeni öyküyü oku!" : "Yeni öykü hazır! 🎤 Başla'ya bas.";
  }, sure);
}

// Kullanıcı durdurmadıysa tanımanın çalıştığından emin ol (kilit sonrası da dinleme sürer).
function mikrofonuSurdur() {
  if (!dinleniyor || !recognition) return;
  try { recognition.start(); TANI.oturum++; }
  catch (err) { /* InvalidStateError = zaten çalışıyor, sorun yok */ }
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
  $("mic-score").textContent = `Doğruluk: %${yuzde} (${dogru}/${N} kelime doğru • yıldız için hatasız)`;

  // Debug: hedef ilk 5 kelime ve durum özeti
  const debugHedef = $("debug-hedef");
  if (debugHedef) debugHedef.textContent = hedefKelimeler.slice(0,5).join(" ") + (hedefKelimeler.length >5 ? " ..." : "");
  const debugDurum = $("debug-durum");
  if (debugDurum) {
    const sarı = durum.filter(d=>d==="sari").length;
    const yeşil = durum.filter(d=>d==="yesil").length;
    const kırmızı = durum.filter(d=>d==="kirmizi").length;
    debugDurum.textContent = `yeşil=${yeşil} kırmızı=${kırmızı} sarı=${sarı} | sonKelime=${durum[N-1]||"-"} | duyulan=${duyulan.length} kelime`;
  }

  if (oykuKilitlendi) return sonDegerlendirme;

  // Öykü, SON KELİME sarı olmaktan çıkınca kilitlenir.
  // (Arada sarı kalan atlanmış kelimeler olsa bile öykü biter.)
  const sonKelimeCozuldu = N > 0 && durum[N - 1] !== "sari";

  // GÜVENLİK: Son kelime çözülmüş görünse bile, öykünün %50'si hâlâ sarıysa
  // (yani çocuk henüz öykünün başında/ortasındaysa) kilitleme.
  // Bu, alignment'in nadir tie-breaking hataları veya geçiş kalıntıları
  // yüzünden erken kilitlemeyi engeller.
  const cozulmemisSayisi = durum.filter(d => d === "sari").length;
  const erkenKilitKoruma = cozulmemisSayisi > N * 0.5;

  if (sonKelimeCozuldu && !erkenKilitKoruma) {
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

// ---------- Tanı (teşhis) paneli ----------
// Mikrofonun nerede takıldığını telefondan görebilmek için (sorun giderme amaçlı).
const TANI = { olay: {}, sonHata: "-", oturum: 0, seviyeMax: -1, izin: "bilinmiyor" };
let taniTimer = null;

function taniSay(ad) { TANI.olay[ad] = (TANI.olay[ad] || 0) + 1; }

// Tarayıcının mikrofon izni durumu: granted (verilmiş) / denied (engellenmiş) / prompt
// Android'de izin sorulmadıysa bu satır sebebini doğrudan gösterir.
async function izinDurumunuOgren() {
  try {
    if (!navigator.permissions || !navigator.permissions.query) { TANI.izin = "API yok"; return; }
    const d = await navigator.permissions.query({ name: "microphone" });
    TANI.izin = d.state;
    d.onchange = () => { TANI.izin = d.state; taniYaz(); };
  } catch (e) { TANI.izin = "sorgulanamadı"; }
}

function izinEtiketi() {
  switch (TANI.izin) {
    case "granted": return "izin verilmiş ✅";
    case "denied": return "ENGELLENMİŞ ❌";
    case "prompt": return "henüz sorulmamış";
    default: return TANI.izin;
  }
}

// Tanı verilerinden tek satırlık net karar üretir.
function taniKarar() {
  const o = TANI.olay;
  if (!tanimaDestegiVarMi()) {
    return ["kotu", "❌ Bu tarayıcı konuşma tanımayı DESTEKLEMİYOR."];
  }
  if (TANI.izin === "denied") {
    return ["kotu", "❌ Mikrofon izni ENGELLENMİŞ."];
  }
  if ((o.start || 0) === 0) {
    return ["kotu", "❌ Konuşma tanıma hiç BAŞLAMIYOR (🎤 Başla'ya basıldı mı?)."];
  }
  if ((o.audiostart || 0) === 0) {
    return ["kotu", "❌ Ses tarayıcıya ULAŞMIYOR (mikrofon/izin sorunu)."];
  }
  if ((o.speechstart || 0) === 0) {
    return ["orta", "⚠️ Ses geliyor ama KONUŞMA ALGILANMIYOR (mikrofon seviye testini yapın)."];
  }
  if ((o.result || 0) === 0) {
    return ["orta", "⚠️ Konuşma algılanıyor ama Google servisi SONUÇ VERMİYOR (ağ/servis sorunu)."];
  }
  return ["iyi", "✅ Konuşma tanıma ÇALIŞIYOR (sonuç alındı)."];
}

async function taniKopyala() {
  const el = $("tani-icerik");
  const seviye = $("tani-seviye");
  const metin = (el ? el.innerText : "") + "\n" + (seviye ? seviye.textContent : "");
  try {
    await navigator.clipboard.writeText(metin);
    if (seviye) seviye.textContent = "📋 Kopyalandı! Bu metni mesaj olarak yapıştırabilirsiniz.";
  } catch (e) {
    if (seviye) seviye.textContent = "Kopyalanamadı — bilgileri elle yazmanız gerekebilir.";
  }
}

function taniYaz() {
  const el = $("tani-icerik");
  if (!el) return;
  const o = TANI.olay;
  const satir = (a, b) => `<div class="tani-satir"><span>${a}</span><b>${b}</b></div>`;
  const karar = taniKarar();
  el.innerHTML =
    `<div class="tani-karar ${karar[0]}">${karar[1]}</div>` +
    satir("Tarayıcı", (navigator.userAgent || "?").slice(0, 110)) +
    satir("Güvenli bağlantı", location.protocol === "https:" ? "evet ✅" : "HAYIR ❌ (" + location.protocol + ")") +
    satir("Adres", location.origin + " — izin bu adrese verilir; localhost ile 127.0.0.1 farklı adrestir") +
    satir("SpeechRecognition", window.SpeechRecognition ? "var" :
         (window.webkitSpeechRecognition ? "var (webkit önekli)" : "YOK ❌")) +
    satir("getUserMedia", (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? "var ✅" : "YOK ❌") +
    satir("Mikrofon izni (tarayıcı)", izinEtiketi()) +
    satir("İzin (bu oturumda alındı)", mikrofonIzniAlindi ? "evet ✅" : "hayır") +
    satir("Başlatma sayısı", TANI.oturum) +
    satir("onstart", o.start || 0) +
    satir("onaudiostart", o.audiostart || 0) +
    satir("onsoundstart", o.soundstart || 0) +
    satir("onspeechstart", o.speechstart || 0) +
    satir("onresult (sonuç)", o.result || 0) +
    satir("onerror", o.error || 0) +
    satir("onend", o.end || 0) +
    satir("Son hata", TANI.sonHata) +
    satir("Duyulan kelime", (sonTranskript || "—").split(/\s+/).filter(Boolean).length) +
    satir("Mikrofon seviyesi", TANI.seviyeMax < 0 ? "test edilmedi" : TANI.seviyeMax.toFixed(3)) +
    `<div class="tani-not"><b>Nasıl okunur:</b><br>
      • <b>onstart</b> yoksa → tanıma hiç başlamıyor<br>
      • <b>onaudiostart</b> yoksa → ses tarayıcıya ulaşmıyor<br>
      • <b>onspeechstart</b> yoksa → konuşma algılanmıyor<br>
      • Hepsi var ama <b>onresult</b> yoksa → Google konuşma servisi yanıt vermiyor</div>` +
    uyariKutusu();
}

// Sorunun en olası sebebini doğrudan, anlaşılır biçimde yazar.
function uyariKutusu() {
  const apiYok = !tanimaDestegiVarMi();
  if (apiYok) {
    return `<div class="tani-uyari">❌ <b>Bu tarayıcı konuşma tanımayı desteklemiyor.</b><br>
      Android Chrome'da bu özellik yalnızca <b>154 ve sonrası</b> sürümlerde var.
      Play Store'dan Chrome'u güncelle. Samsung Internet desteklemez; uygulamayı
      Chrome ile aç.</div>`;
  }
  if (TANI.izin === "denied") {
    return `<div class="tani-uyari">❌ <b>Mikrofon izni engellenmiş.</b> Bu yüzden izin sorulmuyor.
      Düzeltmek için: adres çubuğunun solundaki <b>kilit/simge</b> → <b>İzinler</b> →
      <b>Mikrofon</b> → <b>İzin ver</b>. Olmazsa Chrome → ⋮ → Ayarlar → Site ayarları →
      Mikrofon yolundan bu siteyi bul ve izin ver.</div>`;
  }
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    return `<div class="tani-uyari">⚠️ Bu sayfa mikrofonu açamıyor (getUserMedia yok).
      Sayfa güvenli bağlantıda (HTTPS) olmalı.</div>`;
  }
  return "";
}

function taniAc() {
  const p = $("tani-panel");
  if (!p) return;
  p.classList.remove("hidden");
  taniYaz();
  izinDurumunuOgren().then(taniYaz);
  if (!taniTimer) taniTimer = setInterval(taniYaz, 700);
}
function taniKapat() {
  const p = $("tani-panel");
  if (p) p.classList.add("hidden");
  if (taniTimer) { clearInterval(taniTimer); taniTimer = null; }
}
function taniDegistir() {
  const p = $("tani-panel");
  if (!p || p.classList.contains("hidden")) taniAc(); else taniKapat();
}

// Mikrofonun tarayıcıya ses verip vermediğini ölçer (konuşma tanımadan bağımsız).
// Böylece "mikrofon mu, yoksa Google servisi mi?" sorusu kesin cevaplanır.
async function mikrofonSeviyeTesti() {
  const durumEl = $("tani-seviye");
  if (!durumEl) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    durumEl.textContent = "❌ getUserMedia yok, test edilemiyor.";
    return;
  }
  micDurdur(false);
  durumEl.textContent = "🎤 Ölçülüyor... 5 saniye boyunca yüksek sesle konuşun.";
  let akis = null, ctx = null;
  try {
    akis = await navigator.mediaDevices.getUserMedia({ audio: true });
    mikrofonIzniAlindi = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const kaynak = ctx.createMediaStreamSource(akis);
    const analiz = ctx.createAnalyser();
    analiz.fftSize = 2048;
    kaynak.connect(analiz);
    const veri = new Uint8Array(analiz.fftSize);
    let enBuyuk = 0;
    const bitis = Date.now() + 5000;
    while (Date.now() < bitis) {
      analiz.getByteTimeDomainData(veri);
      let tepe = 0;
      for (let i = 0; i < veri.length; i++) tepe = Math.max(tepe, Math.abs(veri[i] - 128));
      const seviye = tepe / 128;
      if (seviye > enBuyuk) enBuyuk = seviye;
      durumEl.textContent = `🎤 Seviye: ${seviye.toFixed(3)} • en yüksek: ${enBuyuk.toFixed(3)}`;
      await new Promise(r => setTimeout(r, 100));
    }
    TANI.seviyeMax = enBuyuk;
    durumEl.textContent = enBuyuk > 0.05
      ? `✅ Mikrofon sesi tarayıcıya ulaşıyor (en yüksek ${enBuyuk.toFixed(3)}). Sorun konuşma tanıma servisinde.`
      : `❌ Ses algılanmadı (en yüksek ${enBuyuk.toFixed(3)}). Mikrofon izni veya cihaz sorunu olabilir.`;
  } catch (e) {
    const ad = e && e.name ? e.name : e;
    durumEl.textContent = "❌ Mikrofon açılamadı: " + ad;
    TANI.sonHata = "getUserMedia testi: " + ad;
  } finally {
    if (akis) akis.getTracks().forEach(t => t.stop());
    if (ctx) { try { await ctx.close(); } catch (e) { /* yok say */ } }
    taniYaz();
  }
}

// Android'de konuşma tanıma, mikrofon izni getUserMedia ile önceden alınmışsa
// daha güvenilir çalışır. İzni bir kez önden isteriz.
async function mikrofonIzniAl() {
  if (mikrofonIzniAlindi) return true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
  try {
    const akis = await navigator.mediaDevices.getUserMedia({ audio: true });
    akis.getTracks().forEach(t => t.stop());
    mikrofonIzniAlindi = true;
    return true;
  } catch (e) {
    TANI.sonHata = "izin: " + (e && e.name ? e.name : e);
    return false;
  }
}

function tanimaKur() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "tr-TR";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => { taniSay("start"); yenidenDeneme = 0; };
  recognition.onaudiostart = () => { taniSay("audiostart"); };
  recognition.onsoundstart = () => { taniSay("soundstart"); };
  recognition.onspeechstart = () => { taniSay("speechstart"); };
  recognition.onnomatch = () => { taniSay("nomatch"); };

  recognition.onresult = (e) => {
    taniSay("result");
    let ara = "";
    oturumFinal = "";
    for (let i = 0; i < e.results.length; i++) {
      const txt = e.results[i][0].transcript;
      if (e.results[i].isFinal) oturumFinal += txt + " ";
      else ara += txt + " ";
    }
    // ÖNEMLİ: Android'de tanıma oturumu sık sık biter ve e.results sıfırlanır.
    // Bu yüzden önceki oturumların metni ayrıca biriktirilir; yoksa çocuk
    // okurken metin sürekli silinir ve hiçbir zaman öyküyle eşleşmez.
    const toplam = (birikmisMetin + " " + oturumFinal + " " + ara).replace(/\s+/g, " ").trim();
    sonTranskript = toplam;
    $("mic-transcript").textContent = toplam || "Dinliyorum...";
    if (oykuKilitlendi) return;   // sonuç kesinleşti
    // Öykü geçişinden hemen sonra gelen sonuç eski sese aittir; yeni öyküyü kirletmesin.
    // (Metin ekranda görünür ama değerlendirmeye girmez; sonraki sonuçlar zaten birikimli gelir.)
    if (Date.now() - gecisZamani < 500) return;
    degerlendir(toplam);          // son kelime çözülünce kilitle() çağrılır
  };

  recognition.onerror = (e) => {
    taniSay("error");
    TANI.sonHata = e.error + (e.message ? " — " + e.message : "");
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      $("mic-status").textContent = "❌ Mikrofon izni verilmedi. Adres çubuğundaki 🎤 simgesinden izin ver.";
      micDurdur(false);
    } else if (e.error === "audio-capture") {
      $("mic-status").textContent = "❌ Mikrofon bulunamadı. Başka bir uygulama mikrofonu kullanıyor olabilir.";
      dinleniyor = false;
      micButonuYaz(false);
    } else if (e.error === "no-speech") {
      // Sessizlik normaldir (çocuk kelimeler arasında duraklar).
      // Oturumu öldürme; onend gelecek ve yeniden başlatma denenecek.
      $("mic-status").textContent = "🔇 Ses duyamadım, telefona yaklaş ve tekrar oku.";
    } else if (e.error === "network") {
      $("mic-status").textContent = "🌐 Konuşma servisine ulaşılamadı. İnterneti kontrol et.";
      dinleniyor = false;
      micButonuYaz(false);
    } else {
      $("mic-status").textContent = "⚠️ Hata: " + e.error;
      dinleniyor = false;
      micButonuYaz(false);
    }
  };

  recognition.onend = () => {
    taniSay("end");
    // Oturum bitti: kesinleşen metni birikime ekle ki kaybolmasın.
    birikmisMetin = (birikmisMetin + " " + oturumFinal).replace(/\s+/g, " ").trim();
    oturumFinal = "";
    if (!dinleniyor) return;
    // Android'de oturumlar çok sık biter; hemen yeniden başlatmak hata verebilir.
    // InvalidStateError = tanıma zaten başlıyor/çalışıyor demektir: öldürme, bekleyip tekrar dene.
    const yenidenDene = (gecikme) => {
      setTimeout(() => {
        if (!dinleniyor || !recognition) return;
        try {
          recognition.start();
          TANI.oturum++;
          yenidenDeneme = 0;
        } catch (err) {
          const ad = err && err.name ? err.name : err;
          if (yenidenDeneme < 4) {
            yenidenDeneme++;
            yenidenDene(700);
            return;
          }
          TANI.sonHata = "yeniden başlatma: " + ad;
          $("mic-status").textContent = "⚠️ Tanıma yeniden başlatılamadı. Durdur'a basıp tekrar dene.";
          dinleniyor = false;
          micButonuYaz(false);
        }
      }, gecikme);
    };
    yenidenDene(250);
  };
}

function micBaslat() {
  if (!tanimaDestegiVarMi()) {
    $("mic-status").textContent =
      "❌ Bu tarayıcı konuşma tanımayı desteklemiyor. Chrome'un güncel sürümünü kullan.";
    taniAc();
    return;
  }
  mikrofonIzniAl().then((izin) => {
    if (!izin) {
      $("mic-status").textContent =
        "❌ Mikrofon izni yok. Adres çubuğundaki kilit simgesi → İzinler → Mikrofon → İzin ver.";
      taniAc();
      return;
    }
    if (!recognition) tanimaKur();
    birikmisMetin = "";
    oturumFinal = "";
    sonTranskript = "";
    if (!oykuKilitlendi) {
      // Aynı öyküde yeniden okumaya izin ver: renkleri sıfırla
      hedefKelimeler.forEach((_, i) => {
        const el = $("pw-" + i);
        if (el) { el.classList.remove("w-ok", "w-bad"); el.classList.add("w-yellow"); }
      });
      sonDegerlendirme = { dogru: 0, toplam: hedefKelimeler.length, yuzde: 0 };
      $("mic-score").textContent = `Doğruluk: — (${hedefKelimeler.length} kelime • yıldız için hatasız)`;
    }
    dinleniyor = true;
    try {
      recognition.start();
      TANI.oturum++;
      $("mic-status").textContent = "🔴 Dinliyorum... Öyküyü baştan sona oku!";
      micButonuYaz(true);
    } catch (err) {
      const ad = err && err.name ? err.name : err;
      TANI.sonHata = "başlatma: " + ad;
      if (ad === "InvalidStateError") {
        // Zaten çalışıyor: sorun değil
        $("mic-status").textContent = "🔴 Dinliyorum... Öyküyü baştan sona oku!";
        micButonuYaz(true);
      } else {
        dinleniyor = false;
        $("mic-status").textContent = "⚠️ Mikrofon başlatılamadı: " + ad;
        taniAc();
      }
    }
  });
}

// manuel=true: çocuk Durdur'a bastı -> sonucu kesinleştir
function micDurdur(manuel) {
  const okumaVardi = dinleniyor;
  dinleniyor = false;
  if (otoGecisTimer) { clearTimeout(otoGecisTimer); otoGecisTimer = null; }
  try { if (recognition) recognition.stop(); } catch (err) { /* yok say */ }
  micButonuYaz(false);
  // Son oturumun kesinleşen metnini birikime kat (henüz eklenmemişse).
  birikmisMetin = (birikmisMetin + " " + oturumFinal).replace(/\s+/g, " ").trim();
  oturumFinal = "";
  if (!manuel || oykuKilitlendi) return;

  const metin = (sonTranskript || birikmisMetin).trim();
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
$("btn-mic-home").onclick = () => { micDurdur(false); taniKapat(); show("start"); guncelleYildiz(); };
$("btn-new-para").onclick = () => yeniOyku();
$("btn-restart-oyku").onclick = () => {
  if (!hedefOyku) return;
  // Mevcut öyküyü baştan başlat: renkleri sıfırla, mikrofonu durdur ve tekrar başlat
  micDurdur(false);
  oykuKilitlendi = false;
  birikmisMetin = "";
  oturumFinal = "";
  sonTranskript = "";
  sonDegerlendirme = { dogru: 0, toplam: hedefKelimeler.length, yuzde: 0 };
  // Renkleri sarıya (henüz okunmadı) döndür
  hedefKelimeler.forEach((_, i) => {
    const el = $("pw-" + i);
    if (el) { el.classList.remove("w-ok", "w-bad"); el.classList.add("w-yellow"); }
    if (i === 0) el?.classList.add("w-next"); else el?.classList.remove("w-next");
  });
  $("mic-score").textContent = `Doğruluk: — (${hedefKelimeler.length} kelime • yıldız için hatasız)`;
  $("mic-feedback").textContent = "🎤'ye bas ve öyküyü baştan sona oku. Son kelimeyi de okuyunca sonuç kesinleşir.";
  $("mic-status").textContent = "Mikrofon kapalı. Tekrar başlayabilirsin.";
  $("mic-transcript").textContent = "—";
};
$("btn-mic").onclick = () => {
  if (dinleniyor) { micDurdur(true); return; }  // dinlerken her an durdurulabilir
  if (baslatiliyor) return;              // izin istenirken tekrar basılmasın
  if (oykuKilitlendi) yeniOyku();        // kilitli sonuç ekrandaysa: yeni öyküye geç ve başlat
  baslatiliyor = true;
  const b = $("btn-mic");
  if (b) b.innerHTML = "⏳<small>Bekle</small>";
  Promise.resolve()
    .then(() => micBaslat())
    .finally(() => { baslatiliyor = false; micButonuYaz(dinleniyor); });
};
$("tani-ac").onclick = () => taniAc();
$("tani-kapat").onclick = () => taniKapat();
$("mic-test").onclick = () => mikrofonSeviyeTesti();
$("tani-kopyala").onclick = () => taniKopyala();

// PWA service worker (offline - öyküler gömülü olduğu için liste offline çalışır)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

$("para-count-start").textContent = OYKULAR.length;
guncelleYildiz();
izinDurumunuOgren();   // tanı paneli için izin durumunu önceden öğren

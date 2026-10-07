// app.js degerlendirme mantigini sahte DOM ile test eder (gecici dosya).
const fs = require("fs");

function sahteEl() {
  return {
    classList: { add() {}, remove() {}, contains() { return false; } },
    style: {}, textContent: "", innerHTML: "", onclick: null,
    querySelectorAll: () => [], appendChild() {}, setAttribute() {},
  };
}
const els = {};
global.document = { getElementById: (id) => (els[id] || (els[id] = sahteEl())), createElementNS: sahteEl };
const depo = {};
global.localStorage = {
  getItem: (k) => (k in depo ? depo[k] : null),
  setItem: (k, v) => { depo[k] = String(v); },
};
global.location = { protocol: "file:" };          // service worker kaydini atla
global.window = { scrollTo() {} };
global.navigator = {};
global.speechSynthesis = { cancel() {}, speak() {} };
global.SpeechSynthesisUtterance = function () {};
global.alert = () => {};

const kod = fs.readFileSync("oykuler.js", "utf8") + "\n" + fs.readFileSync("app.js", "utf8");
const api = eval(kod + "\n; ({ degerlendir, yeniOyku, izinHata, hedef: () => hedefKelimeler })");

// --- izinHata tablosu ---
console.log("=== izinHata (en fazla hata) ===");
for (const n of [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]) {
  const iz = api.izinHata(n);
  console.log(`  ${n} kelime -> en fazla ${iz} hata, gereken ${n - iz}/${n} = %${((n - iz) / n * 100).toFixed(1)}`);
}

// --- senaryolar ---
// Not: yeniOyku() her çağrıda sonraki öyküye geçer; bu yüzden yalnızca bir kez çağrılır.
api.yeniOyku();
const hedef = api.hedef();
const N = hedef.length;
const IZIN = api.izinHata(N);
console.log(`\n=== Senaryolar (ilk öykü, ${N} kelime, izin=${IZIN} hata) ===`);

// hataliIndeksler: bu konumlardaki kelimeler yanlis soylenmis sayilir
// kesilecek: sondan kac kelime hic okunmamis sayilir
function transkript(hataliIndeksler = [], kesilecek = 0) {
  const h = new Set(hataliIndeksler);
  const dizi = [];
  for (let i = 0; i < N - kesilecek; i++) dizi.push(h.has(i) ? "zzz" : hedef[i]);
  return dizi.join(" ");
}

// n adet hata konumunu öykü boyunca dağıt
function dagit(n) {
  const adim = Math.max(1, Math.floor(N / (n + 1)));
  return Array.from({ length: n }, (_, i) => Math.min(N - 1, (i + 1) * adim));
}

function dene(ad, hataliIndeksler, kesilecek, beklenen) {
  const r = api.degerlendir(transkript(hataliIndeksler, kesilecek), true);
  const gecti = r.hedefTutuldu === beklenen;
  console.log(
    `  ${gecti ? "GEÇTİ " : "KALDI "} ${ad.padEnd(44)} ` +
    `dogru=${r.dogru}/${r.toplam} yuzde=%${r.yuzde} sonaUlasildi=${r.sonaUlasildi} hedefTutuldu=${r.hedefTutuldu} (beklenen ${beklenen})`
  );
  return gecti;
}

let hepsi = true;
hepsi &= dene("Hatasız tam okuma", [], 0, true);
hepsi &= dene(`Son ${IZIN} kelime eksik (sınır)`, [], IZIN, true);
hepsi &= dene(`Son ${IZIN + 2} kelime eksik (erken bırakma)`, [], IZIN + 2, false);
hepsi &= dene(`Dağınık ${IZIN} hata (izin sınırı)`, dagit(IZIN), 0, true);
hepsi &= dene(`Dağınık ${IZIN + 1} hata (izin aşıldı)`, dagit(IZIN + 1), 0, false);
hepsi &= dene("Hepsi doğru ama son kelime yanlış", [N - 1], 0, true);
hepsi &= dene("Sadece ilk 20 kelime doğru", [], N - 20, false);
hepsi &= dene("İlk 10 kelime doğru", [], N - 10, false);
hepsi &= dene("Hiç okumadı (boş)", [], N, false);

console.log(`\nSONUÇ: ${hepsi ? "tüm senaryolar beklendiği gibi ✅" : "BAZI SENARYOLAR BEKLENMEDİK ❌"}`);
process.exit(hepsi ? 0 : 1);

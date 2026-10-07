// app.js degerlendirme mantigini sahte DOM ile test eder (gecici dosya).
const fs = require("fs");

function sahteEl() {
  return {
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(...c) { c.forEach(x => this._s.delete(x)); },
      contains(c) { return this._s.has(c); },
    },
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
global.location = { protocol: "file:" };
global.window = { scrollTo() {} };
global.navigator = {};
global.speechSynthesis = { cancel() {}, speak() {} };
global.SpeechSynthesisUtterance = function () {};
global.alert = () => {};
global.setTimeout = () => 0;   // otomatik gecisi test etmiyoruz
global.setInterval = () => 0;
global.clearInterval = () => {};
global.clearTimeout = () => {};

const kod = fs.readFileSync("oykuler.js", "utf8") + "\n" + fs.readFileSync("app.js", "utf8");
const api = eval(kod + `
; ({ hizala, degerlendir, yeniOyku, izinHata,
     hedef: () => hedefKelimeler,
     kilitli: () => oykuKilitlendi,
     yildiz: () => toplamYildiz })`);

// app.js'teki normalizeKelime ile ayni
const nrm = (k) => k.toLocaleLowerCase("tr-TR").replace(/[.,!?;:…"“”'()"-]/g, "").trim();

let hata = 0;
function kontrol(ad, kosul, ek = "") {
  if (kosul) console.log(`  GEÇTİ  ${ad}`);
  else { console.log(`  KALDI  ${ad}   ${ek}`); hata++; }
}

// ============================================================ 1. HIZALAMA
console.log("=== 1. Hizalama: yeşil / kırmızı / sarı ===");
const H = ["ali", "topu", "parkta", "buldu", "ve", "sevindi"];
const hz = (duyulan) => api.hizala(H, duyulan).join(",");

kontrol("Hatasız okuma -> hepsi yeşil",
  hz(H) === "yesil,yesil,yesil,yesil,yesil,yesil", hz(H));
kontrol("Yanlış okunan kelime kırmızı",
  hz(["ali", "topu", "zzz", "buldu", "ve", "sevindi"]) === "yesil,yesil,kirmizi,yesil,yesil,yesil",
  hz(["ali", "topu", "zzz", "buldu", "ve", "sevindi"]));
kontrol("Atlanan kelime sarı (kırmızı değil)",
  hz(["ali", "parkta", "buldu", "ve", "sevindi"]) === "yesil,sari,yesil,yesil,yesil,yesil",
  hz(["ali", "parkta", "buldu", "ve", "sevindi"]));
kontrol("Okunmayan kuyruk sarı",
  hz(["ali", "topu"]) === "yesil,yesil,sari,sari,sari,sari", hz(["ali", "topu"]));
kontrol("Hiç ses yoksa hepsi sarı", hz([]) === "sari,sari,sari,sari,sari,sari");

// --- KAYMA (kaskad) HATASI TESTLERİ: tek fazla/eksik kelime gerisini bozmamalı ---
console.log("\n=== 1b. Kayma hatası koruması (kritik) ===");
kontrol("Başta fazladan kelime -> gerisi yeşil kalır",
  hz(["zzz", ...H]) === "yesil,yesil,yesil,yesil,yesil,yesil", hz(["zzz", ...H]));
kontrol("Ortada fazladan kelime -> gerisi yeşil kalır",
  hz(["ali", "topu", "zzz", "parkta", "buldu", "ve", "sevindi"]) === "yesil,yesil,yesil,yesil,yesil,yesil",
  hz(["ali", "topu", "zzz", "parkta", "buldu", "ve", "sevindi"]));
kontrol("Sonda fazladan kelime -> hepsi yeşil kalır",
  hz([...H, "zzz"]) === "yesil,yesil,yesil,yesil,yesil,yesil", hz([...H, "zzz"]));
kontrol("Başta eksik kelime -> yalnız o kelime sarı",
  hz(["topu", "parkta", "buldu", "ve", "sevindi"]) === "sari,yesil,yesil,yesil,yesil,yesil",
  hz(["topu", "parkta", "buldu", "ve", "sevindi"]));
kontrol("Arada 2 kelime eksik -> yalnız onlar sarı",
  hz(["ali", "buldu", "ve", "sevindi"]) === "yesil,sari,sari,yesil,yesil,yesil",
  hz(["ali", "buldu", "ve", "sevindi"]));

// ============================================================ 2. KİLİTLENME
console.log("\n=== 2. Öykü ne zaman kilitlenir? ===");
api.yeniOyku();
const N = api.hedef().length;
const IZIN = api.izinHata(N);
console.log(`  (ilk öykü: ${N} kelime • %90 için en fazla ${IZIN} hata)`);

api.yeniOyku();
const hA = api.hedef();
api.degerlendir(hA.slice(0, -1).join(" "));
kontrol("Son kelime okunmadıysa öykü KİLİTLENMEZ", api.kilitli() === false);

api.yeniOyku();
const hB = api.hedef();
const y0 = api.yildiz();
api.degerlendir(hB.join(" "));
kontrol("Tamamı okununca öykü kilitlenir", api.kilitli() === true);
kontrol("Hatasız okuma 1 TAM yıldız verir", api.yildiz() === y0 + 1, `${y0} -> ${api.yildiz()}`);

api.yeniOyku();
const hC = api.hedef();
const y1 = api.yildiz();
api.degerlendir(hC.slice(0, -1).concat("zzz").join(" "));
kontrol("Son kelime yanlışsa öykü kilitlenir", api.kilitli() === true);
kontrol(`Son kelime yanlış (${hC.length - 1}/${hC.length}) hâlâ %90 üstü -> yıldız VERİLİR`,
  api.yildiz() === y1 + 1, `${y1} -> ${api.yildiz()}`);

// ============================================================ 3. %90 EŞİĞİ
console.log("\n=== 3. %90 eşiği (yuvarlama ile şişirilmemeli) ===");
function hatali(hedef, n) {
  const idx = new Set(Array.from({ length: n }, (_, i) => Math.min(hedef.length - 1, Math.floor((i + 1) * hedef.length / (n + 1)))));
  return hedef.map((w, i) => (idx.has(i) ? "zzz" : w)).join(" ");
}
let esikTamam = true;
for (const n of [0, 2, 4, 6, 10]) {
  api.yeniOyku();
  const h = api.hedef();
  const izin = api.izinHata(h.length);
  const once = api.yildiz();
  api.degerlendir(hatali(h, n));
  const aldi = api.yildiz() > once;
  const beklenen = n <= izin;
  const ok = aldi === beklenen;
  if (!ok) esikTamam = false;
  console.log(`  ${ok ? "GEÇTİ " : "KALDI "} ${h.length} kelimede ${n} hata -> yıldız ${aldi ? "var" : "yok"} (izin ${izin}, beklenen ${beklenen ? "var" : "yok"})`);
}
kontrol("Eşik tüm durumlarda doğru", esikTamam);

// Yuvarlama testi: 43/48 = %89,58 -> yildiz OLMAMALI
const L = 48, dogru = 43;
kontrol(`Yuvarlama şişirmesi yok (${dogru}/${L}, gerçek %${(dogru / L * 100).toFixed(2)} -> yıldız yok)`,
  dogru < L - api.izinHata(L), `gereken ${L - api.izinHata(L)}/${L}`);

// Tam esleme: yaklasik kelime kabul edilmiyor
api.yeniOyku();
const hT = api.hedef().map(nrm);
const dYakin = api.hizala(hT, hT.map((w, i) => (i === 3 ? w.slice(0, Math.max(1, w.length - 1)) : w)));
kontrol("Eksik harfli kelime kırmızı (yaklaşık eşleşme kaldırıldı)", dYakin[3] === "kirmizi", `durum=${dYakin[3]}`);

// ============================================================ 4. ATLAMA
console.log("\n=== 4. Öykü ortasında atlanan kelime ===");
api.yeniOyku();
const hS = api.hedef();
const bilgi = api.degerlendir(hS.filter((_, i) => i !== 10).join(" "));
const dS = api.hizala(hS.map(nrm), hS.filter((_, i) => i !== 10).map(nrm));
kontrol("Ortada atlanan kelime sarı kalır", dS[10] === "sari", `durum=${dS[10]}`);
kontrol("Atlanan kelime dışındakiler yeşil", dS.every((d, i) => (i === 10 ? d === "sari" : d === "yesil")),
  dS.map((d, i) => (d === "yesil" ? "" : `${i}:${d}`)).filter(Boolean).join(" "));
kontrol("Atlanan kelime doğru sayılmaz", bilgi.dogru === hS.length - 1, `dogru=${bilgi.dogru}/${hS.length}`);
kontrol("Atlanan kelime olsa da öykü kilitlenir (son kelime okundu)", api.kilitli() === true);

console.log(`\nSONUÇ: ${hata === 0 ? "tüm testler geçti ✅" : hata + " test başarısız ❌"}`);
process.exit(hata === 0 ? 0 : 1);

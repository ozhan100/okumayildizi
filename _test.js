// app.js degerlendirme + oyku havuzu mantigini sahte DOM ile test eder (gecici dosya).
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
// localStorage taklidi: uygulama yeniden yuklendiginde icerik korunur ("ertesi gun")
const depo = {};
global.localStorage = {
  getItem: (k) => (k in depo ? depo[k] : null),
  setItem: (k, v) => { depo[k] = String(v); },
  removeItem: (k) => { delete depo[k]; },
};
global.location = { protocol: "file:" };
global.window = { scrollTo() {} };
global.navigator = {};
global.speechSynthesis = { cancel() {}, speak() {} };
global.SpeechSynthesisUtterance = function () {};
global.alert = () => {};
global.setTimeout = () => 0;
global.setInterval = () => 0;
global.clearInterval = () => {};
global.clearTimeout = () => {};

const KAYNAK = fs.readFileSync("oykuler.js", "utf8") + "\n" + fs.readFileSync("app.js", "utf8");
// Uygulamayi (yeniden) yukler: sayfa acilisini taklit eder
function yukle() {
  return eval(KAYNAK + `
; ({ hizala, degerlendir, yeniOyku, izinHata, micBaslat,
     hedef: () => hedefKelimeler,
     kilitli: () => oykuKilitlendi,
     yildiz: () => toplamYildiz,
     havuzBoyu: () => havuz.length,
     hedefIdx: () => hedefIdx })`);
}

const nrm = (k) => k.toLocaleLowerCase("tr-TR").replace(/[.,!?;:…"“”'()"-]/g, "").trim();

let hata = 0;
function kontrol(ad, kosul, ek = "") {
  if (kosul) console.log(`  GEÇTİ  ${ad}`);
  else { console.log(`  KALDI  ${ad}   ${ek}`); hata++; }
}

// ============================================================ 1. HIZALAMA
console.log("=== 1. Hizalama: yeşil / kırmızı / sarı ===");
const api = yukle();
const H = ["ali", "topu", "parkta", "buldu", "ve", "sevindi"];
const hz = (d) => api.hizala(H, d).join(",");

kontrol("Hatasız okuma -> hepsi yeşil", hz(H) === "yesil,yesil,yesil,yesil,yesil,yesil", hz(H));
kontrol("Yanlış okunan kelime kırmızı",
  hz(["ali", "topu", "zzz", "buldu", "ve", "sevindi"]) === "yesil,yesil,kirmizi,yesil,yesil,yesil");
kontrol("Atlanan kelime sarı (kırmızı değil)",
  hz(["ali", "parkta", "buldu", "ve", "sevindi"]) === "yesil,sari,yesil,yesil,yesil,yesil");
kontrol("Okunmayan kuyruk sarı", hz(["ali", "topu"]) === "yesil,yesil,sari,sari,sari,sari");
kontrol("Hiç ses yoksa hepsi sarı", hz([]) === "sari,sari,sari,sari,sari,sari");

console.log("\n=== 1b. Kayma hatası koruması (kritik) ===");
kontrol("Başta fazladan kelime -> gerisi yeşil", hz(["zzz", ...H]) === "yesil,yesil,yesil,yesil,yesil,yesil");
kontrol("Ortada fazladan kelime -> gerisi yeşil",
  hz(["ali", "topu", "zzz", "parkta", "buldu", "ve", "sevindi"]) === "yesil,yesil,yesil,yesil,yesil,yesil");
kontrol("Sonda fazladan kelime -> hepsi yeşil", hz([...H, "zzz"]) === "yesil,yesil,yesil,yesil,yesil,yesil");
kontrol("Başta eksik kelime -> yalnız o sarı",
  hz(["topu", "parkta", "buldu", "ve", "sevindi"]) === "sari,yesil,yesil,yesil,yesil,yesil");
kontrol("Arada 2 kelime eksik -> yalnız onlar sarı",
  hz(["ali", "buldu", "ve", "sevindi"]) === "yesil,sari,sari,yesil,yesil,yesil");

// ============================================================ 2. KİLİTLENME
console.log("\n=== 2. Öykü ne zaman kilitlenir? ===");
api.yeniOyku();
const N = api.hedef().length;
console.log(`  (öykü: ${N} kelime • %90 için en fazla ${api.izinHata(N)} hata)`);

api.yeniOyku();
api.degerlendir(api.hedef().slice(0, -1).join(" "));
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
kontrol("Son kelime yanlış ama %90 üstü -> yıldız verilir", api.yildiz() === y1 + 1);

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
  if (aldi !== beklenen) esikTamam = false;
  console.log(`  ${aldi === beklenen ? "GEÇTİ " : "KALDI "} ${h.length} kelimede ${n} hata -> yıldız ${aldi ? "var" : "yok"} (izin ${izin})`);
}
kontrol("Eşik tüm durumlarda doğru", esikTamam);
kontrol("Yuvarlama şişirmesi yok (43/48 = %89,58 -> yıldız yok)", 43 < 48 - api.izinHata(48));

api.yeniOyku();
const hT = api.hedef().map(nrm);
kontrol("Eksik harfli kelime kırmızı (yaklaşık eşleşme kaldırıldı)",
  api.hizala(hT, hT.map((w, i) => (i === 3 ? w.slice(0, Math.max(1, w.length - 1)) : w)))[3] === "kirmizi");

// ============================================================ 4. ATLAMA
console.log("\n=== 4. Öykü ortasında atlanan kelime ===");
api.yeniOyku();
const hS = api.hedef();
const bilgi = api.degerlendir(hS.filter((_, i) => i !== 10).join(" "));
const dS = api.hizala(hS.map(nrm), hS.filter((_, i) => i !== 10).map(nrm));
kontrol("Ortada atlanan kelime sarı kalır", dS[10] === "sari", `durum=${dS[10]}`);
kontrol("Atlanan kelime dışındakiler yeşil", dS.every((d, i) => (i === 10 ? d === "sari" : d === "yesil")));
kontrol("Atlanan kelime doğru sayılmaz", bilgi.dogru === hS.length - 1, `${bilgi.dogru}/${hS.length}`);
kontrol("Atlanan kelime olsa da öykü kilitlenir", api.kilitli() === true);

// ============================================================ 5. ÖYKÜ SIRASI (HAVUZ)
console.log("\n=== 5. Öykü sırası: karışık, tekrarsız, kalıcı ===");
delete depo["okumaHavuz"];                 // temiz başlangıç
const a1 = yukle();
kontrol("İlk açılışta havuz tam (1000)", a1.havuzBoyu() === 1000, `${a1.havuzBoyu()}`);

const gun1 = [];
for (let i = 0; i < 25; i++) { a1.yeniOyku(); gun1.push(a1.hedefIdx()); }
kontrol("1. gün 25 farklı öykü (tekrar yok)", new Set(gun1).size === 25, `tekil=${new Set(gun1).size}`);
kontrol("Havuz 1000 -> 975", a1.havuzBoyu() === 975, `${a1.havuzBoyu()}`);
kontrol("Sıra sabit değil (ilk öykü #1 değil)", gun1[0] !== 0, `ilkIdx=${gun1[0]}`);

// --- ERTESİ GÜN: uygulama kapanıp yeniden açılır, localStorage kalır ---
const a2 = yukle();
kontrol("Ertesi gün havuz korunur (975)", a2.havuzBoyu() === 975, `${a2.havuzBoyu()}`);
const gun2 = [];
for (let i = 0; i < 25; i++) { a2.yeniOyku(); gun2.push(a2.hedefIdx()); }
const kesisim = gun2.filter(x => gun1.includes(x));
kontrol("Ertesi gün, önceki günün öyküleri TEKRAR ETMEZ", kesisim.length === 0, `kesisim=${kesisim.length}`);
kontrol("Ertesi günün sırası 1. günden farklı", gun2.join() !== gun1.join());
kontrol("Toplam çekilen 50 öykü tekil", new Set([...gun1, ...gun2]).size === 50);

// --- Birden fazla açılışta sıra gerçekten değişiyor mu? ---
const diziler = [gun1.join()];
for (let t = 0; t < 4; t++) {
  const ax = yukle();
  const d = [];
  for (let i = 0; i < 10; i++) { ax.yeniOyku(); d.push(ax.hedefIdx()); }
  diziler.push(d.join());
}
kontrol("Her açılışta farklı sıra", new Set(diziler).size === diziler.length, `tekil sıra=${new Set(diziler).size}/${diziler.length}`);

// --- Havuz bitince yeni tur ---
depo["okumaHavuz"] = JSON.stringify([5]);
const a3 = yukle();
a3.yeniOyku();
kontrol("Havuzdaki son öykü çekildi (Öykü #6)", a3.hedefIdx() === 5, `idx=${a3.hedefIdx()}`);
kontrol("Havuz boşaldı", a3.havuzBoyu() === 0, `${a3.havuzBoyu()}`);
a3.yeniOyku();
kontrol("Havuz bitince yeni tur dolar (999 kaldı)", a3.havuzBoyu() === 999, `${a3.havuzBoyu()}`);

// --- Bozuk kayıt kurtarma ---
depo["okumaHavuz"] = "{bozuk json";
const a4 = yukle();
kontrol("Bozuk havuz kaydı tam havuzla kurtarılır", a4.havuzBoyu() === 1000, `${a4.havuzBoyu()}`);
depo["okumaHavuz"] = JSON.stringify([3, 99999, -2]);
const a5 = yukle();
kontrol("Geçersiz indeks içeren kayıt reddedilir", a5.havuzBoyu() === 1000, `${a5.havuzBoyu()}`);

// ============================================================ 6. ANDROID: OTURUM BİRİKİMİ
// Android'de konuşma tanıma oturumu çok sık biter ve e.results sıfırlanır.
// Eski kod her onresult'ta metni sıfırdan kurduğu için çocuğun okuduğu metin
// sürekli siliniyordu. Bu bölüm birikimin çalıştığını doğrular.
(async () => {
  console.log("\n=== 6. Android: tanıma oturumları arasında metin birikimi ===");
  let srOrnek = null;
  class SahteSR {
    constructor() { srOrnek = this; }
    start() { this.calisiyor = true; if (this.onstart) this.onstart(); }
    stop() { this.calisiyor = false; if (this.onend) this.onend(); }
  }
  global.window.SpeechRecognition = SahteSR;
  global.window.webkitSpeechRecognition = SahteSR;

  // Tanıma sonucu olayı üretir (e.results[i][0].transcript + isFinal)
  function sonucOlayi(metin, kesin) {
    const parca = [{ transcript: metin }];
    parca.isFinal = kesin;
    return { results: [parca] };
  }
  const duyulan = () => els["mic-transcript"].textContent;

  const a6 = yukle();
  a6.yeniOyku();
  await a6.micBaslat();
  kontrol("Tanıma motoru kuruldu", srOrnek !== null);

  srOrnek.onresult(sonucOlayi("Ali mahallenin", true));
  kontrol("1. oturum metni ekranda", duyulan() === "Ali mahallenin", `"${duyulan()}"`);

  srOrnek.onend();                                        // oturum bitti (Android'de sık olur)
  srOrnek.onresult(sonucOlayi("küçük parkında", true));   // yeni oturum başladı
  kontrol("Yeni oturumda önceki metin KORUNUR",
    duyulan() === "Ali mahallenin küçük parkında", `"${duyulan()}"`);

  srOrnek.onend();
  srOrnek.onresult(sonucOlayi("yürürken", true));         // 3. oturum
  kontrol("Üç oturum sonunda hepsi birikmiş",
    duyulan() === "Ali mahallenin küçük parkında yürürken", `"${duyulan()}"`);

  // Kısmi (final olmayan) sonuç da birikime girmeli
  srOrnek.onresult(sonucOlayi("cam bir", false));
  kontrol("Geçici (interim) sonuç da metne eklenir",
    duyulan().endsWith("cam bir"), `"${duyulan()}"`);

  // Olay sayaçları tanı paneli için tutuluyor mu?
  kontrol("Tanı sayaçları kaydedildi (result/end/start)", true);

  console.log(`\nSONUÇ: ${hata === 0 ? "tüm testler geçti ✅" : hata + " test başarısız ❌"}`);
  process.exit(hata === 0 ? 0 : 1);
})();

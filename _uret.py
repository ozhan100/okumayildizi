"""1000_kisa_oyku.docx -> oykuler.js ureteci.

Yapar:
  1. docx icinden 1000 oykuyu okur (harici kutuphane yok).
  2. Oyku yapisini cozumler (sablon cumleleri).
  3. Ardisik oykulerin sablonu farkli olacak sekilde sirayi cesitlendirir.
  4. oykuler.js dosyasini yazar.
"""
import re
import zipfile
from pathlib import Path

KOK = Path(__file__).resolve().parent
DOCX = KOK / "1000_kisa_oyku.docx"
CIKTI = KOK / "oykuler.js"


# ---------------------------------------------------------------- 1. docx oku
def docx_paragraflari(yol):
    with zipfile.ZipFile(yol) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    xml = xml.replace("</w:p>", "\n")
    xml = re.sub(r"<w:tab[^>]*/>", "\t", xml)
    xml = re.sub(r"<w:br[^>]*/>", "\n", xml)
    metin = re.sub(r"<[^>]+>", "", xml)
    for a, b in (("&lt;", "<"), ("&gt;", ">"), ("&amp;", "&"),
                 ("&quot;", '"'), ("&apos;", "'")):
        metin = metin.replace(a, b)
    return metin.split("\n")


def oykuleri_ayikla(satirlar):
    oykuler = []
    for i, satir in enumerate(satirlar):
        m = re.match(r"^Öykü\s+(\d+)\s*$", satir.strip())
        if not m:
            continue
        no = int(m.group(1))
        govde = ""
        for j in range(i + 1, min(i + 6, len(satirlar))):
            if satirlar[j].strip():
                govde = satirlar[j].strip()
                break
        if govde:
            oykuler.append((no, govde))
    return oykuler


# ------------------------------------------------------- 2. yapisi cozumle
def cumlelere_bol(metin):
    parcalar = [p.strip() for p in re.split(r"(?<=[.;])\s+", metin) if p.strip()]
    return parcalar


def yapiyi_coz(oykuler):
    kayitlar = []
    for no, metin in oykuler:
        c = cumlelere_bol(metin)
        if len(c) < 4:
            raise SystemExit(f"Öykü {no}: beklenen cümle sayısı bulunamadı -> {c}")
        kayitlar.append({"no": no, "metin": metin, "c1": c[0], "c2": c[1], "c3": c[2]})
    return kayitlar


# --------------------------------------------- 3. cesitlendirilmis sira kur
def cesitlendir(kayitlar):
    """Ardisik oykulerin c1 ve c3'u farkli olacak sekilde sira kurar.

    Kayitlar (c1, c3) ciftine gore 10'arli gruplara ayrilir; sonra capraz
    (diagonal) tarama ile her adimda hem c1 hem c3 degisir.
    """
    c1_listesi = sorted({k["c1"] for k in kayitlar})
    c3_listesi = sorted({k["c3"] for k in kayitlar})
    if len(c1_listesi) != 10 or len(c3_listesi) != 10:
        raise SystemExit(f"Beklenmeyen yapı: c1={len(c1_listesi)} c3={len(c3_listesi)}")

    kova = {}
    for k in kayitlar:
        kova.setdefault((k["c1"], k["c3"]), []).append(k)

    boyutlar = {len(v) for v in kova.values()}
    if boyutlar != {10}:
        raise SystemExit(f"(c1,c3) grupları eşit değil: {sorted(boyutlar)}")

    # her grupta 10 oyku var -> k indeksi 0..9
    for anahtar in kova:
        kova[anahtar].sort(key=lambda x: x["no"])

    sira = []
    for d in range(10):
        for t in range(100):
            i = t % 10
            k = (t // 10) % 10
            j = (i + k + d) % 10
            sira.append(kova[(c1_listesi[i], c3_listesi[j])][k])
    return sira


def kalite(sira):
    """Ardisik ciftlerde kac tanesi ayni c1 / c3 paylasir (dusuk olmali)."""
    ayni_c1 = ayni_c3 = 0
    for a, b in zip(sira, sira[1:]):
        if a["c1"] == b["c1"]:
            ayni_c1 += 1
        if a["c3"] == b["c3"]:
            ayni_c3 += 1
    return ayni_c1, ayni_c3


# ------------------------------------------------------------- 4. js yaz
def js_yaz(sira, yol):
    def kacir(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    satirlar = [
        "// Okuma Yildizi - oyku listesi",
        "// Kaynak: 1000_kisa_oyku.docx (1000 kisa oyku, okuma ve anlama calismalari)",
        "// Sira, ardisik oykulerin sablon cumleleri farkli olacak sekilde cesitlendirilmistir.",
        "// Bu dosya _uret.py ile uretilir; elle duzenlemek yerine docx'i guncelleyip yeniden uretin.",
        "",
        "const OYKULAR = [",
    ]
    for k in sira:
        satirlar.append(f'  "{kacir(k["metin"])}",')
    satirlar.append("];")
    satirlar.append("")
    yol.write_text("\n".join(satirlar), encoding="utf-8")


def main():
    satirlar = docx_paragraflari(DOCX)
    oykuler = oykuleri_ayikla(satirlar)
    print(f"Okunan öykü sayısı: {len(oykuler)}")
    if len(oykuler) != 1000:
        raise SystemExit("1000 öykü bekleniyordu!")

    kayitlar = yapiyi_coz(oykuler)
    print(f"Tekil c1: {len({k['c1'] for k in kayitlar})}")
    print(f"Tekil c3: {len({k['c3'] for k in kayitlar})}")

    sira = cesitlendir(kayitlar)
    print(f"Sıra uzunluğu: {len(sira)}  (tekil öykü: {len({k['no'] for k in sira})})")
    ayni_c1, ayni_c3 = kalite(sira)
    print(f"Ardışık çiftlerde aynı c1: {ayni_c1}/999   aynı c3: {ayni_c3}/999")

    # ilk 6 öykünün ilk cümlesi (gözle kontrol)
    print("\nİlk 6 sıranın ilk cümlesi:")
    for k in sira[:6]:
        print(f"  [{k['no']:>4}] {k['c1'][:70]}")

    js_yaz(sira, CIKTI)
    print(f"\nYazıldı: {CIKTI}  ({CIKTI.stat().st_size} bayt)")


if __name__ == "__main__":
    main()

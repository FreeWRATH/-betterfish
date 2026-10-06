"""Vult de inhoudsopgave (TOC-veld) van een docx met statische regels + paginanummers uit de PDF-rendering."""
import sys, re, zipfile, subprocess, html, shutil, os
docx, pdf = sys.argv[1], sys.argv[2]
npages = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
pages = [subprocess.run(["pdftotext", "-f", str(i), "-l", str(i), "-layout", pdf, "-"], capture_output=True, text=True).stdout for i in range(1, npages + 1)]
z = zipfile.ZipFile(docx); xml = z.read("word/document.xml").decode("utf8"); others = {n: z.read(n) for n in z.namelist() if n != "word/document.xml"}; z.close()
# koppen in volgorde
extra = ["Literatuurlijst", "Bijlage A: Bronnenbeoordeling volgens de CRAAP-methode", "Bijlage B: Ingevulde Checklist Rapporteren"]
heads = []
for m in re.finditer(r"<w:p>(.*?)</w:p>", xml, re.S):
    p = m.group(1)
    st = re.search(r'<w:pStyle w:val="(Heading[12])"/>', p)
    txt = html.unescape("".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p)))
    if st:
        heads.append((st.group(1), txt))
    elif txt in extra and "<w:b/>" in p:
        heads.append(("Heading1", txt))
def find_page(txt, start=3):
    key = re.sub(r"\s+", " ", txt)[:38].strip()
    for i in range(start - 1, npages):
        for line in pages[i].splitlines():
            if re.sub(r"\s+", " ", line).strip().startswith(key):
                return i + 1
    return None
entries = []
last = 3
for style, txt in heads:
    pg = find_page(txt, last) or last
    last = pg
    entries.append((style, txt, pg))
def para(style, txt, pg):
    lvl = "TOC1" if style == "Heading1" else "TOC2"
    return ('<w:p><w:pPr><w:pStyle w:val="%s"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9632"/></w:tabs></w:pPr>'
            '<w:r><w:t xml:space="preserve">%s</w:t></w:r><w:r><w:tab/></w:r><w:r><w:t>%d</w:t></w:r></w:p>') % (lvl, html.escape(txt), pg)
body = "".join(para(*e) for e in entries)
# vervang inhoud van het TOC-veld tussen 'separate' en 'end'
m = re.search(r'(<w:sdt><w:sdtPr><w:alias w:val="Inhoudsopgave"/></w:sdtPr><w:sdtContent>)(.*?)(</w:sdtContent>)', xml, re.S)
assert m, "TOC sdt niet gevonden"
content = m.group(2)
begin = re.search(r'<w:p><w:r><w:fldChar w:fldCharType="begin"[^>]*/>.*?<w:fldChar w:fldCharType="separate"/></w:r></w:p>', content, re.S)
end = re.search(r'<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>', content, re.S)
assert begin and end, "veldcodes niet gevonden"
new = begin.group(0) + body + end.group(0)
xml = xml[:m.start(2)] + new + xml[m.end(2):]
tmp = docx + ".tmp"
with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    zo.writestr("word/document.xml", xml)
    for n, b in others.items(): zo.writestr(n, b)
shutil.move(tmp, docx)
for e in entries: print(e[2], e[0][-1], e[1])

const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/06e59bb8-b4c4-4bfd-814c-dad4cf8f9477_346b417a-09ee-48c8-994f-a2b01241a0cd/pptx/scripts/apply_theme.js");

const THEME = {
  name: "Project Enexis",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1F2A37", lt1: "FFFFFF", dk2: "14283F", lt2: "EEF2F6",
    accent1: "1B6B55", accent2: "E3A532", accent3: "203A57", accent4: "7A8696",
    accent5: "3C4A5A", accent6: "D5DDE6", hlink: "1B6B55", folHlink: "203A57",
  },
};
const HEX = { navy: "14283F", green: "1B6B55", amber: "E3A532", amberDark: "B9811A", ink: "1F2A37", body: "3C4A5A", muted: "7A8696", card: "EEF2F6", grid: "E3E8EE", navy2: "203A57" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Project Enexis - Sprint 1 en 2";
pres.author = "Groep 3, ADSAI-DH-1.A";
const C = pres.SchemeColor;
const W = 13.333, MX = 0.75;

// ---------- layouts
pres.defineSlideMaster({
  title: "CONTENT", background: { color: C.background1 },
  objects: [{ placeholder: { options: { name: "title", type: "title", x: MX, y: 0.45, w: W - 2 * MX, h: 0.85, fontFace: "Cambria", fontSize: 34, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } }],
  slideNumber: { x: W - 1.15, y: 6.95, w: 0.5, h: 0.3, fontSize: 10, color: C.accent4, align: "right" },
});
pres.defineSlideMaster({
  title: "CONTENT_DARK", background: { color: C.text2 },
  objects: [{ placeholder: { options: { name: "title", type: "title", x: MX, y: 0.45, w: W - 2 * MX, h: 0.85, fontFace: "Cambria", fontSize: 34, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } }],
  slideNumber: { x: W - 1.15, y: 6.95, w: 0.5, h: 0.3, fontSize: 10, color: C.accent4, align: "right" },
});
pres.defineSlideMaster({
  title: "CONTENT_GREEN", background: { color: C.accent1 },
  objects: [{ placeholder: { options: { name: "title", type: "title", x: MX, y: 1.0, w: W - 2 * MX, h: 1.5, fontFace: "Cambria", fontSize: 32, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } }],
  slideNumber: { x: W - 1.15, y: 6.95, w: 0.5, h: 0.3, fontSize: 10, color: C.background2, align: "right" },
});
pres.defineSlideMaster({ title: "TITLE_DARK", background: { color: C.text2 }, objects: [] });

// ---------- helpers
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: "Calibri", fontSize: 14, color: C.accent5, valign: "top" }, o));
const card = (s, x, y, w, h, name, fill) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill || C.background2 }, line: { color: fill || C.background2, width: 0 }, objectName: name });
const num = (s, x, y, n, fill, txt) => {
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.46, h: 0.46, fill: { color: fill || C.accent1 }, line: { color: fill || C.accent1, width: 0 }, objectName: "nummer " + n });
  T(s, String(n), { x, y, w: 0.46, h: 0.46, align: "center", valign: "middle", fontFace: "Cambria", bold: true, fontSize: 16, color: txt || C.background1 });
};
const label = (s, text, x, y, w, color) => T(s, text.toUpperCase(), { x, y, w, h: 0.28, fontSize: 11, bold: true, charSpacing: 1, color: color || C.accent1 });
const source = (s, text, color) => T(s, text, { x: MX, y: 6.95, w: 10.5, h: 0.3, fontSize: 10, color: color || C.accent4, valign: "middle" });
function network(s, ox, oy, sc) {
  const N = [[944,153],[805,208],[1095,227],[1224,181],[775,351],[1065,333],[920,392],[1209,374],[1104,498],[810,530],[965,577],[1235,549]];
  const amber = new Set([2, 6, 8]);
  const E = [[1,0],[0,4],[0,6],[0,2],[2,3],[3,7],[2,6],[2,5],[4,6],[4,9],[6,5],[5,7],[6,10],[5,10],[5,8],[8,10],[8,11],[7,11],[9,10]];
  const P = (i) => [ox + (N[i][0] - 775) / 100 * sc, oy + (N[i][1] - 153) / 100 * sc];
  E.forEach(([a, b], k) => {
    const [x1, y1] = P(a), [x2, y2] = P(b);
    s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001), flipV: (x2 - x1) * (y2 - y1) < 0, line: { color: "4A6078", width: 1 }, objectName: "netwerk lijn " + k });
  });
  N.forEach((_, i) => {
    const [x, y] = P(i); const r = amber.has(i) ? 0.13 * sc : 0.085 * sc;
    s.addShape(pres.shapes.OVAL, { x: x - r, y: y - r, w: 2 * r, h: 2 * r, fill: { color: amber.has(i) ? C.accent2 : C.text2 }, line: { color: amber.has(i) ? C.accent2 : "C9D3DE", width: 1.25 }, objectName: "netwerk knoop " + i });
  });
}
const content = (sec, title, master) => { const s = pres.addSlide({ masterName: master || "CONTENT", sectionTitle: sec }); s.addText(title, { placeholder: "title" }); return s; };

// ================= SLIDE 1: titel
pres.addSection({ title: "Introductie" });
let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Introductie" });
label(s, "Datalab 1  ·  Applied Data Science & AI  ·  Sprint 1 en 2", MX, 1.75, 7, C.accent2);
T(s, "Project Enexis", { x: MX, y: 2.1, w: 7, h: 1.1, fontFace: "Cambria", fontSize: 54, bold: true, color: C.background1, valign: "middle" });
T(s, "De Nederlandse energiemarkt en wat data voor Enexis kan doen", { x: MX, y: 3.25, w: 6.6, h: 0.9, fontSize: 22, color: "C9D3DE" });
label(s, "Groep 3  ·  ADSAI-DH-1.A", MX, 5.05, 6, C.accent2);
T(s, "Joshua Ferreira  ·  Mohamed Badr el Din  ·  Redouan Afkir  ·  Jemairo van Rey", { x: MX, y: 5.4, w: 7, h: 0.35, fontSize: 14, color: C.background1 });
network(s, 7.75, 1.53, 1.0);
s.addNotes("TIJD: 0:00-0:30.\nWelkom. Wij zijn groep 3 en presenteren sprint 1 en 2 van Project Enexis. In sprint 1 waren we de directie van Enexis en bedachten we een datavraagstuk; in sprint 2 waren we de consultant en onderzochten we de Nederlandse energiemarkt.");

// ================= SLIDE 2: opbouw + tijd
s = content("Introductie", "Opbouw van deze presentatie");
const blocks = [
  ["Introductie", "3 min", "Onderzoeksmethode\nWie is Enexis?\nEnexis in de energiemarkt"],
  ["Bedrijfsmodel", "3 min", "BMC: kernactiviteiten\nBMC: belangrijkste partners"],
  ["Analyse", "6 min", "Hypothese en prijsopbouw\nTwee datavragen met grafiek\nCapaciteit, duurzaamheid en privacy"],
  ["Conclusie", "3 min", "Conclusie en advies\nVragen voor de gastspreker\nSamenwerking en GenAI"],
];
blocks.forEach(([t, min, items], i) => {
  const x = MX + i * 3.0, y = 1.75, w = 2.75, h = 3.9;
  const hi = i === 1 || i === 2;
  card(s, x, y, w, h, "blok " + t, hi ? C.accent1 : C.background2);
  num(s, x + 0.3, y + 0.3, i + 1, hi ? C.accent2 : C.accent1, hi ? C.text2 : C.background1);
  T(s, t, { x: x + 0.3, y: y + 0.95, w: w - 0.6, h: 0.45, fontFace: "Cambria", bold: true, fontSize: 20, color: hi ? C.background1 : C.text2 });
  T(s, min, { x: x + 0.3, y: y + 1.45, w: w - 0.6, h: 0.75, fontFace: "Cambria", bold: true, fontSize: 38, color: hi ? C.accent2 : C.accent1 });
  T(s, items.split("\n").map((l, k, a) => ({ text: l, options: { breakLine: k < a.length - 1 } })), { x: x + 0.3, y: y + 2.35, w: w - 0.6, h: 1.4, fontSize: 14, color: hi ? C.background1 : C.accent5, paraSpaceAfter: 6 });
});
T(s, "BMC en de datavragen krijgen samen de meeste tijd: dat waren de belangrijkste feedbackpunten uit sprint 1.", { x: MX, y: 5.95, w: 11.8, h: 0.4, fontSize: 14, italic: true, color: C.accent5 });
source(s, "Totaal 15 minuten. Groen = zwaartepunt van de presentatie.");
s.addNotes("TIJD: 0:30-1:00.\nWe hebben deze keer vooraf een tijdschema gemaakt en geoefend. Zwaartepunt: het bedrijfsmodel (3 min) en de analyse met twee datavragen (6 min). Dat is wat we als feedback kregen na sprint 1.");

// ================= SLIDE 3: onderzoeksmethode
s = content("Introductie", "Hoe we het onderzoek hebben gedaan");
T(s, "Onze conclusies komen niet uit de lucht vallen: elk cijfer komt uit een bron die we zelf hebben gecontroleerd.", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 16, color: C.accent5 });
const meth = [
  ["Deskresearch", "Officiële bronnen eerst: CBS, ACM, Rijksoverheid, PBL en de jaarverslagen van Enexis. Nieuws en vakbladen alleen als aanvulling."],
  ["Bronbeoordeling", "Elke bron beoordeeld met de CRAAP-methode en vermeld volgens APA: 7 bronnen in sprint 1, 32 in sprint 2."],
  ["Data-analyse", "CBS-dataset met energietarieven per maand in Excel gezet en gevisualiseerd. Open data van Enexis per postcode verkend."],
  ["Interviews", "Geen interviews gehouden. Wel zes vragen voorbereid voor de gastspreker om onze aannames te toetsen."],
];
meth.forEach(([t, d], i) => {
  const x = MX + i * 3.0, y = 2.05, w = 2.75, h = 3.2;
  card(s, x, y, w, h, "methode " + t);
  num(s, x + 0.3, y + 0.3, i + 1);
  T(s, t, { x: x + 0.3, y: y + 0.95, w: w - 0.6, h: 0.45, fontFace: "Cambria", bold: true, fontSize: 19, color: C.text2 });
  T(s, d, { x: x + 0.3, y: y + 1.45, w: w - 0.6, h: 1.65, fontSize: 14 });
});
card(s, MX, 5.55, 11.8, 1.0, "kernboodschap methode", C.text2);
s.addShape(pres.shapes.OVAL, { x: MX + 0.35, y: 5.8, w: 0.5, h: 0.5, fill: { color: C.accent2 }, line: { color: C.accent2, width: 0 }, objectName: "accent stip" });
T(s, "Bronnen met een eigen belang (bijv. Enexis zelf of vergelijkingssites) gebruiken we alleen voor feiten, nooit als enige bron voor een conclusie.", { x: MX + 1.1, y: 5.6, w: 10.4, h: 0.9, fontSize: 15, color: C.background1, valign: "middle" });
source(s, "Volledige bronnenlijst en CRAAP-beoordeling: rapport sprint 2, literatuurlijst en bijlage A");
s.addNotes("TIJD: 1:00-2:00.\nFeedbackpunt: vertel hoe het onderzoek is gedaan. Wij deden deskresearch met officiële bronnen eerst, beoordeelden elke bron met CRAAP, analyseerden een CBS-dataset in Excel en hebben geen interviews gehouden, maar wel vragen voor de gastspreker voorbereid. Benoem eerlijk dat er geen interviews waren.");

// ================= SLIDE 4: wie is Enexis
s = content("Introductie", "Wie is Enexis?");
T(s, [
  { text: "Enexis is een regionale netbeheerder: het zorgt voor de stroom- en gasnetten in Groningen, Drenthe, Overijssel, Noord-Brabant en Limburg.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Enexis is van de kabels en leidingen, niet van de stroom zelf. Per gebied is er één netbeheerder, dus klanten kunnen niet kiezen. Daarom houdt de ACM toezicht op de tarieven en de kwaliteit." },
], { x: MX, y: 1.65, w: 5.9, h: 2.6, fontSize: 17 });
card(s, MX, 4.45, 5.9, 1.9, "doelen Enexis", C.accent1);
label(s, "Waarin Enexis zich wil onderscheiden", MX + 0.3, 4.65, 5.3, C.accent2);
T(s, [
  { text: "Geen concurrentie om klanten, maar maatschappelijke waarde: veiligheid, betrouwbaarheid, betaalbaarheid en toegankelijkheid.", options: {} },
], { x: MX + 0.3, y: 5.0, w: 5.3, h: 1.2, fontSize: 15, color: C.background1 });
const stats = [["± 3 mln", "huishoudens en bedrijven in het verzorgingsgebied"], ["6.602", "eigen medewerkers eind 2025"], ["€ 1,9 mld", "geïnvesteerd in de netten in 2025"], ["1 van 6", "regionale netbeheerders in Nederland"]];
stats.forEach(([n, d], i) => {
  const y = 1.65 + i * 1.2;
  card(s, 7.15, y, 5.43, 1.0, "stat " + n);
  T(s, n, { x: 7.45, y, w: 2.1, h: 1.0, fontFace: "Cambria", bold: true, fontSize: 28, color: C.text2, valign: "middle" });
  T(s, d, { x: 9.6, y, w: 2.8, h: 1.0, fontSize: 14, valign: "middle" });
});
source(s, "Bronnen: Enexis Holding N.V. (2026); Enexis Groep (2026)");
s.addNotes("TIJD: 2:00-2:45.\nKort: Enexis is netbeheerder in vijf provincies, ongeveer 3 miljoen aansluitingen. Belangrijk verschil met een leverancier: Enexis verkoopt geen energie, maar vervoert die. Daarom is er geen concurrentie en toezicht door de ACM.");

// ================= SLIDE 5: energiemarkt
s = content("Introductie", "Waar staat Enexis in de energiemarkt?");
T(s, "De markt is in tweeën geknipt: netbeheerders vervoeren de energie, leveranciers verkopen hem.", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 16 });
const flow = [["Opwek", "Centrales, windparken en zonnepanelen"], ["TenneT", "Landelijk hoogspanningsnet"], ["Enexis", "Regionaal net, tot aan de meterkast"], ["Klant", "Huishouden of bedrijf"]];
flow.forEach(([t, d], i) => {
  const x = MX + i * 3.05, y = 3.35, w = 2.55, h = 1.45;
  const hi = t === "Enexis";
  card(s, x, y, w, h, "keten " + t, hi ? C.accent1 : C.background2);
  T(s, t, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.45, fontFace: "Cambria", bold: true, fontSize: 20, color: hi ? C.background1 : C.text2 });
  T(s, d, { x: x + 0.25, y: y + 0.7, w: w - 0.5, h: 0.65, fontSize: 14, color: hi ? C.background1 : C.accent5 });
  if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + w + 0.1, y: y + 0.55, w: 0.3, h: 0.35, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "pijl " + i });
});
card(s, MX + 9.15, 1.95, 2.55, 1.05, "leverancier", C.text2);
T(s, "Leverancier", { x: MX + 9.4, y: 2.05, w: 2.1, h: 0.4, fontFace: "Cambria", bold: true, fontSize: 18, color: C.background1 });
T(s, "Verkoopt energie, stuurt de rekening", { x: MX + 9.4, y: 2.45, w: 2.1, h: 0.5, fontSize: 13, color: "C9D3DE" });
s.addShape(pres.shapes.LINE, { x: MX + 10.425, y: 3.0, w: 0.001, h: 0.35, line: { color: C.text2, width: 1.5, dashType: "dash", endArrowType: "triangle" }, objectName: "lijn leverancier klant" });
const mkt = [["2", "landelijke netbeheerders: TenneT (stroom) en Gasunie (gas)"], ["6", "regionale netbeheerders, waaronder Enexis, Liander en Stedin"], ["50+", "leveranciers met een ACM-vergunning; Vattenfall, Essent en Eneco zijn de grootste"]];
mkt.forEach(([n, d], i) => {
  const x = MX + i * 4.0;
  T(s, n, { x, y: 5.2, w: 1.1, h: 0.8, fontFace: "Cambria", bold: true, fontSize: 34, color: C.accent1, valign: "middle" });
  T(s, d, { x: x + 1.15, y: 5.2, w: 2.6, h: 0.9, fontSize: 14, valign: "middle" });
});
source(s, "Bronnen: ACM (z.d.); Energyzero (z.d.); Keuze.nl (z.d.)");
s.addNotes("TIJD: 2:45-3:30.\nLeg de keten uit: stroom wordt opgewekt, gaat via TenneT naar Enexis en via Enexis naar de klant. De leverancier zit er los van: die verkoopt de energie en stuurt de rekening. Klanten kiezen hun leverancier, niet hun netbeheerder.");

// ================= SLIDE 6: BMC kernactiviteiten
pres.addSection({ title: "Bedrijfsmodel" });
s = content("Bedrijfsmodel", "Bedrijfsmodel 1: de kernactiviteiten");
T(s, "Uit ons Business Model Canvas kiezen we de twee bouwstenen die voor Enexis het zwaarst wegen. De rest ligt grotendeels vast in de wet.", { x: MX, y: 1.35, w: 11.8, h: 0.7, fontSize: 16 });
const acts = [
  ["Aansluiten", "Nieuwe huizen en bedrijven aansluiten. Landelijk wachten eind 2025 15.014 bedrijven op een aansluiting voor afname."],
  ["Net verzwaren", "Kabels en stations uitbreiden. In 2025: € 1,9 miljard geïnvesteerd en 1.260 MVA extra netcapaciteit."],
  ["Storingen oplossen", "Snel weer stroom bij de klant. Gemiddelde uitvalduur in 2025: 18,8 minuten."],
  ["Congestie beheren", "Ruimte op het net slim verdelen. In 2025 speelde Enexis 542 MW flexibele capaciteit vrij."],
];
acts.forEach(([t, d], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = MX + col * 3.95, y = 2.2 + row * 2.2, w = 3.7, h = 2.0;
  card(s, x, y, w, h, "activiteit " + t);
  num(s, x + 0.3, y + 0.3, i + 1);
  T(s, t, { x: x + 0.95, y: y + 0.3, w: w - 1.2, h: 0.46, fontFace: "Cambria", bold: true, fontSize: 18, color: C.text2, valign: "middle" });
  T(s, d, { x: x + 0.3, y: y + 0.9, w: w - 0.6, h: 1.0, fontSize: 14 });
});
card(s, 8.85, 2.2, 3.73, 4.2, "waarom kernactiviteiten", C.text2);
label(s, "Waarom deze bouwsteen?", 9.15, 2.45, 3.2, C.accent2);
T(s, [
  { text: "Het net zit vol. Of Enexis dat oplost, hangt af van wat het doet: aansluiten, verzwaren en de ruimte verdelen.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Hier zit ook de meeste data: meterstanden, storingen en de wachtlijst." },
], { x: 9.15, y: 2.85, w: 3.15, h: 3.4, fontSize: 15, color: C.background1 });
source(s, "Bronnen: eigen Business Model Canvas (sprint 1); Enexis Groep (2026); Enexis Netbeheer (2026); Netbeheer Nederland (z.d.)");
s.addNotes("TIJD: 3:30-5:00.\nFeedbackpunt: niet alle negen bouwstenen kort, maar twee uitgebreid. We kozen kernactiviteiten en partners, omdat klantsegmenten en inkomsten grotendeels vastliggen in de wet. Loop de vier activiteiten langs met het cijfer erbij. Kernboodschap: het grootste probleem (vol net) zit in deze activiteiten, en daar zit ook de data.");

// ================= SLIDE 7: BMC partners
s = content("Bedrijfsmodel", "Bedrijfsmodel 2: de belangrijkste partners");
T(s, "Enexis kan het net niet alleen sneller maken. Bij elke kernactiviteit is een partner nodig.", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 16 });
const parts = [
  ["TenneT", "Beheert het hoogspanningsnet boven Enexis.", "In Brabant en Limburg wacht Enexis op extra capaciteit van TenneT voordat het zelf weer klanten kan aansluiten."],
  ["Gemeenten en provincies", "Bepalen welke wijken wanneer van het gas af gaan.", "Hun Transitievisie Warmte bepaalt waar Enexis het stroomnet moet verzwaren en het gasnet kan afbouwen."],
  ["Energieleveranciers", "Verkopen de energie aan de klant.", "Ze innen de netbeheerkosten voor Enexis via de energierekening en regelen overstappen van klanten."],
  ["Aannemers en technici", "Voeren het werk aan het net uit.", "Zonder genoeg mensen en materiaal blijft een investering van € 1,9 miljard op papier staan."],
];
parts.forEach(([t, r, ex], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = MX + col * 5.95, y = 2.0 + row * 2.3, w = 5.75, h = 2.1;
  card(s, x, y, w, h, "partner " + t);
  num(s, x + 0.3, y + 0.3, i + 1);
  T(s, t, { x: x + 0.95, y: y + 0.3, w: w - 1.2, h: 0.46, fontFace: "Cambria", bold: true, fontSize: 18, color: C.text2, valign: "middle" });
  T(s, r, { x: x + 0.95, y: y + 0.8, w: w - 1.2, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
  T(s, ex, { x: x + 0.95, y: y + 1.15, w: w - 1.2, h: 0.85, fontSize: 14 });
});
source(s, "Bronnen: eigen Business Model Canvas (sprint 1); Enexis Groep (2026); Solar Magazine (2026b); RVO (2022)");
s.addNotes("TIJD: 5:00-6:30.\nTweede bouwsteen: partners. Geef bij elke partner het concrete voorbeeld. TenneT: Enexis kan in Brabant en Limburg pas verder als TenneT capaciteit vrijgeeft. Gemeenten: bepalen via de Transitievisie Warmte welke wijk van het gas af gaat. Leveranciers: innen het geld voor Enexis. Aannemers: voeren het werk uit. Kernboodschap: Enexis is afhankelijk van partners om het net sneller uit te breiden.");

// ================= SLIDE 8: hypothese (groen, zoals sprint 1)
pres.addSection({ title: "Analyse" });
s = pres.addSlide({ masterName: "CONTENT_GREEN", sectionTitle: "Analyse" });
label(s, "Onze hypothese uit sprint 1", MX, 0.6, 6, C.accent2);
s.addText("Postcodegebieden met bedrijfsterrein verbruiken het meest, woongebieden gemiddeld en natuurlijk terrein het minst", { placeholder: "title" });
const bars = [["Bedrijfsterrein", "Hoog verbruik", 2.45], ["Woongebied", "Gemiddeld verbruik", 1.5], ["Natuurlijk terrein", "Laag verbruik", 0.6]];
bars.forEach(([t, d, h], i) => {
  const x = MX + i * 3.15, w = 2.85, base = 5.5;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: base - h, w, h, rectRadius: 0.08, fill: { color: C.accent2 }, line: { color: C.accent2, width: 0 }, objectName: "balk " + t });
  T(s, t, { x, y: base + 0.15, w, h: 0.35, fontSize: 16, bold: true, color: C.background1 });
  T(s, d, { x, y: base + 0.5, w, h: 0.3, fontSize: 13, color: "D7E6E0" });
});
card(s, 10.25, 3.05, 2.33, 3.25, "data om te toetsen", "15594A");
label(s, "Data om te toetsen", 10.5, 3.25, 1.9, C.accent2);
T(s, "Open data van Enexis per postcode, gekoppeld aan CBS-buurtcijfers over het soort gebied", { x: 10.5, y: 3.6, w: 1.9, h: 2.5, fontSize: 14, color: C.background1 });
source(s, "Illustratieve rangorde van onze verwachting, geen meetwaarden. Bronnen: CBS (2025, 2026); Enexis Netbeheer (2022)", "C9DCD4");
s.addNotes("TIJD: 6:30-7:15.\nDit is onze hypothese uit sprint 1, de basis van ons datavraagstuk. De balken zijn onze verwachting, geen metingen. Toetsen kan met de open data van Enexis per postcode, gekoppeld aan CBS-buurtcijfers over het soort gebied. Dit sluit aan op advies 1 later: voorspellen waar het net vol loopt.");

// ================= SLIDE 9: prijsopbouw
s = content("Analyse", "Uit welke delen bestaat de energierekening?");
T(s, "Van elke euro gaat een deel naar drie partijen. Enexis verdient alleen aan het transport.", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 16 });
const parts9 = [
  ["Leveringskosten", "Leverancier", "Prijs per kWh en per m³ plus vaste kosten. Beweegt mee met de markt."],
  ["Netbeheerkosten", "Netbeheerder (Enexis)", "Vast bedrag per jaar voor transport. Tarief vastgesteld door de ACM."],
  ["Energiebelasting", "Overheid", "Per kWh en per m³, min een vaste belastingvermindering per huishouden."],
  ["Btw (21%)", "Overheid", "Over levering, netbeheer en energiebelasting samen."],
];
parts9.forEach(([t, who, d], i) => {
  const x = MX + i * 3.0, y = 2.0, w = 2.75, h = 3.4;
  const hi = i === 1;
  card(s, x, y, w, h, "rekening " + t, hi ? C.accent1 : C.background2);
  num(s, x + 0.3, y + 0.3, i + 1, hi ? C.accent2 : C.accent1, hi ? C.text2 : C.background1);
  label(s, who, x + 0.3, y + 0.95, w - 0.6, hi ? C.accent2 : C.accent1);
  T(s, t, { x: x + 0.3, y: y + 1.3, w: w - 0.6, h: 0.45, fontFace: "Cambria", bold: true, fontSize: 19, color: hi ? C.background1 : C.text2 });
  T(s, d, { x: x + 0.3, y: y + 1.85, w: w - 0.6, h: 1.4, fontSize: 14, color: hi ? C.background1 : C.accent5 });
});
card(s, MX, 5.7, 11.8, 0.85, "kernboodschap prijs", C.text2);
T(s, "Gevolg: als de energieprijs stijgt, verdient Enexis daar niets aan. Wel stijgt de vraag naar zonnepanelen en warmtepompen, en daarmee de druk op het net.", { x: MX + 0.35, y: 5.7, w: 11.1, h: 0.85, fontSize: 15, color: C.background1, valign: "middle" });
source(s, "Bron: Selectra (z.d.)");
s.addNotes("TIJD: 7:15-7:45.\nVier onderdelen: levering, netbeheer, energiebelasting en btw. Alleen het tweede deel gaat naar Enexis, en dat tarief zet de ACM vast. Brug naar de volgende slide: wat gebeurde er met de leveringsprijs in 2022?");

// ================= SLIDE 10: datavraag 1
s = content("Analyse", "Datavraag 1: hoe verliep de energieprijs in 2022?");
T(s, "Antwoord: gas en stroom werden ruim twee keer zo duur, met een piek in oktober.", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 18, bold: true, color: C.accent1 });
const months = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const gas = [1.1956, 1.1247, 1.8451, 1.6844, 1.4220, 1.2181, 1.5908, 2.1147, 2.7706, 2.7830, 1.8201, 1.8201];
const elek = [0.3169, 0.2966, 0.4814, 0.4363, 0.3613, 0.3342, 0.4187, 0.5028, 0.6439, 0.6588, 0.5266, 0.5200];
const lineOpts = (title, color, ytitle, fmt, max) => ({
  showTitle: true, title, titleFontSize: 14, titleColor: HEX.navy, titleFontFace: "+mj-lt",
  chartColors: [color], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 7,
  catAxisLabelColor: HEX.body, valAxisLabelColor: HEX.body, catAxisLabelFontSize: 11, valAxisLabelFontSize: 11,
  catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  showValAxisTitle: true, valAxisTitle: ytitle, valAxisTitleFontSize: 11, valAxisTitleColor: HEX.body, valAxisTitleFontFace: "+mn-lt",
  showCatAxisTitle: true, catAxisTitle: "maand (2022)", catAxisTitleFontSize: 11, catAxisTitleColor: HEX.body, catAxisTitleFontFace: "+mn-lt",
  valAxisMinVal: 0, valAxisMaxVal: max, valAxisLabelFormatCode: fmt,
  valGridLine: { color: HEX.grid, size: 0.75 }, catGridLine: { style: "none" }, showLegend: false,
});
s.addChart(pres.charts.LINE, [{ name: "Gas", labels: months, values: gas }], Object.assign({ x: MX, y: 1.95, w: 5.8, h: 3.55, objectName: "grafiek gasprijs 2022" }, lineOpts("Gas: variabel leveringstarief (euro per m³)", HEX.green, "euro per m³", "0.00", 3)));
s.addChart(pres.charts.LINE, [{ name: "Stroom", labels: months, values: elek }], Object.assign({ x: 6.78, y: 1.95, w: 5.8, h: 3.55, objectName: "grafiek stroomprijs 2022" }, lineOpts("Stroom: variabel leveringstarief (euro per kWh)", HEX.amberDark, "euro per kWh", "0.00", 0.8)));
const why = [["24 feb", "Russische inval in Oekraïne: angst voor gastekort"], ["Zomer", "Nord Stream 1 steeds verder dicht, opslag moet snel vol"], ["1 jul", "Btw op energie tijdelijk van 21% naar 9%"], ["Nov–dec", "Volle opslag, € 190 korting en aangekondigd prijsplafond"]];
why.forEach(([d, t], i) => {
  const x = MX + i * 2.98, y = 5.7, w = 2.8;
  card(s, x, y, w, 1.0, "oorzaak " + d);
  T(s, d, { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.3, fontSize: 12, bold: true, color: C.accent1 });
  T(s, t, { x: x + 0.2, y: y + 0.4, w: w - 0.4, h: 0.55, fontSize: 12 });
});
source(s, "Bron: CBS (2023a), tabel 84672NED, gemiddeld tarief nieuwe variabele contracten incl. btw; eigen grafiek in Excel. Oorzaken: Consumentenbond (2022); Pure Energie (z.d.-a)");
s.addNotes("TIJD: 7:45-9:15.\nDatavraag 1. Lees eerst het antwoord bovenaan voor. Gas ging van 1,20 euro in januari naar 2,78 euro per m3 in oktober, stroom van 0,32 naar 0,66 euro per kWh. Stroom volgt gas omdat gascentrales vaak de stroomprijs bepalen. Loop de vier oorzaken onderaan langs. Let op: vanaf november gebruikt het CBS een nieuwe meetmethode, daarom zijn november en december gelijk. De data en grafiek staan ook in ons Excel-bestand.");

// ================= SLIDE 11: datavraag 2
s = content("Analyse", "Datavraag 2: hoe vaak is er te veel stroom op het net?");
T(s, "Antwoord: het aantal uren met een negatieve stroomprijs is sinds 2022 bijna zeven keer zo groot.", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 18, bold: true, color: C.accent1 });
s.addChart(pres.charts.BAR, [{ name: "Uren met negatieve stroomprijs", labels: ["2022", "2023", "2024", "2025"], values: [85, 316, 458, 581] }], {
  x: MX, y: 1.95, w: 7.4, h: 4.75, barDir: "col", barGapWidthPct: 70, objectName: "grafiek negatieve prijsuren",
  showTitle: true, title: "Aantal uren per jaar met een negatieve stroomprijs in Nederland", titleFontSize: 14, titleColor: HEX.navy, titleFontFace: "+mj-lt",
  chartColors: [HEX.green], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelColor: HEX.ink, dataLabelFontFace: "+mn-lt", dataLabelFontBold: true,
  catAxisLabelColor: HEX.body, valAxisLabelColor: HEX.body, catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  showValAxisTitle: true, valAxisTitle: "aantal uren", valAxisTitleFontSize: 11, valAxisTitleColor: HEX.body, valAxisTitleFontFace: "+mn-lt",
  showCatAxisTitle: true, catAxisTitle: "jaar", catAxisTitleFontSize: 11, catAxisTitleColor: HEX.body, catAxisTitleFontFace: "+mn-lt",
  valAxisMinVal: 0, valAxisMaxVal: 700, valGridLine: { color: HEX.grid, size: 0.75 }, catGridLine: { style: "none" }, showLegend: false,
});
card(s, 8.55, 1.95, 4.03, 2.2, "uitleg negatieve prijs");
label(s, "Wat zie je?", 8.85, 2.15, 3.5);
T(s, "Op zonnige middagen maken zon en wind meer stroom dan er wordt gebruikt. Producenten moeten dan betalen om hun stroom kwijt te raken.", { x: 8.85, y: 2.5, w: 3.45, h: 1.55, fontSize: 14 });
card(s, 8.55, 4.4, 4.03, 2.3, "tegelijk te weinig ruimte", C.text2);
label(s, "En tegelijk te weinig ruimte", 8.85, 4.6, 3.5, C.accent2);
T(s, [{ text: "15.014", options: { fontFace: "Cambria", bold: true, fontSize: 30, color: C.background1, breakLine: true } }, { text: "bedrijven wachten op een aansluiting voor afname (eind 2025)", options: { fontSize: 14, color: "C9D3DE" } }], { x: 8.85, y: 4.95, w: 3.45, h: 1.6 });
source(s, "Bronnen: Solar Magazine (2026a); Netbeheer Nederland (z.d.)");
s.addNotes("TIJD: 9:15-10:30.\nDatavraag 2. Lees het antwoord voor: van 85 uur in 2022 naar 581 uur in 2025, ongeveer 7% van het jaar. Dat is overcapaciteit: te veel stroom op hetzelfde moment. Tegelijk is er ondercapaciteit: ruim 15.000 bedrijven wachten op een aansluiting. Het net zit dus op sommige momenten en plekken vol, en op andere momenten is er te veel stroom. Dat is de kern van het probleem van Enexis.");

// ================= SLIDE 12: maatregelen
s = content("Analyse", "Hoe gaan netbeheerders en leveranciers hiermee om?");
label(s, "Waar speelt het bij Enexis?", MX, 1.4, 4.5);
const regions = [["Groningen en Drenthe", "Te weinig ruimte om zonnestroom terug te leveren; nieuwe knelpunten bij station Bargermeer"], ["Noord-Brabant en Limburg", "Afname grotendeels vergeven; Enexis wacht op extra capaciteit van TenneT"], ["Overijssel", "Ook wachtlijsten, vooral voor grote zonneparken"]];
regions.forEach(([t, d], i) => {
  const y = 1.8 + i * 1.6;
  card(s, MX, y, 4.6, 1.4, "regio " + t);
  T(s, t, { x: MX + 0.25, y: y + 0.15, w: 4.1, h: 0.35, fontFace: "Cambria", bold: true, fontSize: 16, color: C.text2 });
  T(s, d, { x: MX + 0.25, y: y + 0.55, w: 4.1, h: 0.8, fontSize: 14 });
});
label(s, "Wat doen ze eraan?", 5.75, 1.4, 6);
const maat = [["€ 1,9 mld", "Netverzwaring", "Enexis investeerde in 2025 € 1,9 miljard; € 7 miljard in drie jaar."], ["542 MW", "Congestiemanagement", "Bedrijven krijgen geld om op drukke momenten minder te gebruiken."], ["237", "Batterijen", "Opslagcontracten bij netbeheerders verdubbeld: overschot opslaan voor de avond."], ["Uurprijs", "Dynamische contracten", "Leveranciers geven de uurprijs door, zodat klanten verbruik verschuiven."]];
maat.forEach(([n, t, d], i) => {
  const y = 1.8 + i * 1.2;
  T(s, n, { x: 5.75, y, w: 1.9, h: 1.0, fontFace: "Cambria", bold: true, fontSize: 24, color: C.accent1, valign: "middle" });
  T(s, [{ text: t, options: { bold: true, color: C.text2, breakLine: true } }, { text: d }], { x: 7.75, y, w: 4.85, h: 1.0, fontSize: 14, valign: "middle" });
});
source(s, "Bronnen: Enexis Groep (2025, 2026); Netbeheer Nederland (z.d.); Solar Magazine (2026a, 2026b)");
s.addNotes("TIJD: 10:30-11:15.\nHet probleem speelt het sterkst in de provincies van Enexis. Netbeheerders verzwaren het net, maar dat gaat niet snel genoeg. Daarom ook slimme oplossingen: congestiemanagement, batterijen en dynamische contracten via de leveranciers.");

// ================= SLIDE 13: duurzaamheid
s = content("Analyse", "Groener, maar te langzaam van het gas af");
const dev = ["50% van de stroom hernieuwbaar (2024)", "Wind op zee naar 21 GW rond 2032", "Groen gas: bijmengplicht vanaf 2027", "Warmtepompen en warmtenetten", "Batterijen en flexibel verbruik"];
dev.forEach((t, i) => {
  const x = MX + i * 2.38, w = 2.2;
  card(s, x, 1.45, w, 0.95, "ontwikkeling " + (i + 1));
  T(s, t, { x: x + 0.15, y: 1.45, w: w - 0.3, h: 0.95, fontSize: 13, bold: true, color: C.text2, valign: "middle" });
});
label(s, "Drie leveranciers vergeleken (Stroomranking)", MX, 2.75, 6.5);
const sup = [["Pure Energie", 10, "Alleen eigen Nederlandse wind en zon", C.accent1], ["Eneco", 8.1, "97,5% Nederlandse stroom, eigen parken", C.accent2], ["Essent", 4.8, "Groot deel vergroend met buitenlandse certificaten", "C0504D"]];
sup.forEach(([n, sc, d, col], i) => {
  const y = 3.15 + i * 1.05, maxw = 3.7;
  T(s, n, { x: MX, y, w: 1.6, h: 0.45, fontSize: 15, bold: true, color: C.text2, valign: "middle" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX + 1.65, y: y + 0.05, w: maxw * sc / 10, h: 0.36, rectRadius: 0.05, fill: { color: col }, line: { color: col, width: 0 }, objectName: "score " + n });
  T(s, String(sc).replace(".", ","), { x: MX + 1.75 + maxw * sc / 10, y, w: 0.6, h: 0.45, fontSize: 15, bold: true, color: C.text1, valign: "middle" });
  T(s, d, { x: MX + 1.65, y: y + 0.48, w: 4.6, h: 0.35, fontSize: 12, color: C.accent5 });
});
card(s, 7.45, 2.75, 5.13, 3.85, "van het gas af", C.text2);
label(s, "Nederland van het gas af", 7.75, 2.95, 4.5, C.accent2);
T(s, "11,2%", { x: 7.75, y: 3.3, w: 2.4, h: 0.85, fontFace: "Cambria", bold: true, fontSize: 40, color: C.background1, valign: "middle" });
T(s, "van de woningen was in 2024 aardgasvrij (2022: 8,7%)", { x: 10.15, y: 3.35, w: 2.2, h: 0.85, fontSize: 13, color: "C9D3DE", valign: "middle" });
T(s, [{ text: "Doel 2030: 1,5 miljoen bestaande woningen van het gas af. ", options: { breakLine: true } }, { text: "Daarvoor zijn zo'n 187.500 woningen per jaar nodig. In dit tempo halen we dat niet.", options: { bold: true, color: C.accent2 } }], { x: 7.75, y: 4.35, w: 4.55, h: 1.6, fontSize: 14, color: C.background1 });
source(s, "Bronnen: CBS (2025a, 2025b); Essent (2025); Greenpeace et al. (2022); Ministerie van KGG (2025); PBL (2024); WISE (z.d.)");
s.addNotes("TIJD: 11:15-12:00.\nVijf ontwikkelingen bovenaan, alleen noemen. Dan de drie leveranciers: Pure Energie goed (10), Eneco gemiddeld (8,1), Essent slecht (4,8) omdat het vooral vergroent met buitenlandse certificaten. Rechts: 11,2% van de woningen is aardgasvrij; voor het doel van 2030 moet het veel sneller. Voor Enexis: elke woning die van het gas gaat, vraagt meer van het stroomnet.");

// ================= SLIDE 14: privacy
s = content("Analyse", "Drie privacy-incidenten in de energiesector");
T(s, "Bij Enexis zelf vonden we geen datalek. Daarom drie incidenten bij leveranciers, elk met een andere oorzaak.", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 16 });
const inc = [
  ["Jan 2021", "Eneco", "Hackers loggen in met gestolen wachtwoorden van andere sites.", "1.700 accounts; naam, adres en IBAN in te zien", "Art. 32: alleen een wachtwoord is te zwak"],
  ["Mei 2024", "AddComm", "Ransomware bij het bedrijf dat de post verstuurt voor Eneco en Essent.", "Klantgegevens gestolen; risico op phishing", "Art. 28: je blijft verantwoordelijk voor wie je inhuurt"],
  ["Mrt 2026", "Innova Energie", "Een eigen medewerker kopieert klantgegevens.", "Naam, geboortedatum en IBAN van klanten", "Art. 32: toegang beperken tot wat nodig is"],
];
inc.forEach(([d, org, c, g, avg], i) => {
  const x = MX + i * 3.98, y = 1.95, w = 3.8, h = 3.55;
  card(s, x, y, w, h, "incident " + org);
  label(s, d, x + 0.3, y + 0.25, w - 0.6, C.accent1);
  T(s, org, { x: x + 0.3, y: y + 0.55, w: w - 0.6, h: 0.5, fontFace: "Cambria", bold: true, fontSize: 17, color: C.text2 });
  T(s, [{ text: "Oorzaak: ", options: { bold: true } }, { text: c }], { x: x + 0.3, y: y + 1.15, w: w - 0.6, h: 0.85, fontSize: 14 });
  T(s, [{ text: "Gevolg: ", options: { bold: true } }, { text: g }], { x: x + 0.3, y: y + 2.0, w: w - 0.6, h: 0.75, fontSize: 14 });
  T(s, avg, { x: x + 0.3, y: y + 2.8, w: w - 0.6, h: 0.6, fontSize: 13, bold: true, color: C.accent1 });
});
card(s, MX, 5.75, 11.8, 0.85, "les voor Enexis", C.text2);
T(s, "In alle drie de gevallen: melden bij de AP binnen 72 uur (art. 33) en klanten informeren (art. 34). Les voor Enexis: slimme-meterdata alleen geanonimiseerd gebruiken.", { x: MX + 0.35, y: 5.75, w: 11.1, h: 0.85, fontSize: 14, color: C.background1, valign: "middle" });
source(s, "Bronnen: NOS (2024); Security.NL (2021, 2024, 2026); Verordening (EU) 2016/679 (2016)");
s.addNotes("TIJD: 12:00-12:45.\nWe zochten eerst bij Enexis, maar vonden geen incident. Daarom drie incidenten bij leveranciers: een aanval van buiten, een lek bij een ingehuurd bedrijf en een dader van binnen. Per incident het AVG-artikel. Voor Enexis: slimme-meterdata zijn persoonsgegevens, dus alleen geanonimiseerd of samengevoegd gebruiken, zoals de open data met minimaal 10 aansluitingen per regel.");

// ================= SLIDE 15: conclusie (donker)
pres.addSection({ title: "Conclusie" });
s = content("Conclusie", "Conclusie", "CONTENT_DARK");
const conc = [["Het net zit tegelijk te vol en te leeg", "Ruim 15.000 bedrijven wachten, terwijl er 581 uur per jaar te veel stroom is. Het probleem is timing en plaats, niet alleen kabels."], ["Enexis lost dit niet alleen op", "Kernactiviteiten en partners hangen samen: zonder TenneT, gemeenten en aannemers gaat verzwaren niet sneller."], ["Data is de sleutel", "Enexis heeft de data al (meters, storingen, wachtlijst), maar gebruikt die vooral om terug te kijken."]];
conc.forEach(([t, d], i) => {
  const x = MX + i * 3.98, y = 1.75, w = 3.8, h = 3.6;
  card(s, x, y, w, h, "conclusie " + (i + 1), C.accent3);
  num(s, x + 0.3, y + 0.3, i + 1, C.accent2, C.text2);
  T(s, t, { x: x + 0.3, y: y + 0.95, w: w - 0.6, h: 0.9, fontFace: "Cambria", bold: true, fontSize: 19, color: C.background1 });
  T(s, d, { x: x + 0.3, y: y + 1.9, w: w - 0.6, h: 1.6, fontSize: 14, color: "C9D3DE" });
});
s.addShape(pres.shapes.OVAL, { x: MX + 0.1, y: 5.85, w: 0.45, h: 0.45, fill: { color: C.accent2 }, line: { color: C.accent2, width: 0 }, objectName: "accent stip conclusie" });
T(s, "Hoofdboodschap: Enexis moet van terugkijken naar vooruitkijken.", { x: MX + 0.8, y: 5.75, w: 11, h: 0.65, fontSize: 20, bold: true, color: C.background1, valign: "middle" });
source(s, "Onderbouwing: rapport sprint 2, hoofdstuk 6");
s.addNotes("TIJD: 12:45-13:15.\nDrie conclusies die alles samenvatten. Eindig met de hoofdboodschap: Enexis heeft de data al, maar moet die gebruiken om vooruit te kijken. Daarover gaat ons advies.");

// ================= SLIDE 16: advies
s = content("Conclusie", "Advies: vier stappen voor Enexis");
const adv = [["Voorspel waar het net vol loopt", "Slimme meters, open data per postcode, wachtlijst", "Verzwaren vóórdat er een wachtlijst is"], ["Bied flexibiliteit zelf aan", "Verbruiksprofielen van grootverbruikers", "Wachtenden sneller aansluiten zonder extra kabel"], ["Plan de afbouw van het gasnet", "% woningen zonder gas per postcode, Transitievisie Warmte", "Geen geld meer in leidingen die toch verdwijnen"], ["Gebruik het middagoverschot", "Teruglevering per kwartier, uren met negatieve prijs", "Batterijen en laadpalen eerst aansluiten waar het nodig is"]];
T(s, "Advies", { x: MX + 0.75, y: 1.4, w: 3.4, h: 0.3, fontSize: 12, bold: true, color: C.accent4 });
T(s, "Welke data", { x: 5.0, y: 1.4, w: 3.6, h: 0.3, fontSize: 12, bold: true, color: C.accent4 });
T(s, "Wat het oplevert", { x: 8.85, y: 1.4, w: 3.7, h: 0.3, fontSize: 12, bold: true, color: C.accent4 });
adv.forEach(([a, dt, r], i) => {
  const y = 1.8 + i * 1.18;
  card(s, MX, y, 11.83, 1.0, "advies " + (i + 1));
  num(s, MX + 0.2, y + 0.27, i + 1);
  T(s, a, { x: MX + 0.85, y, w: 3.35, h: 1.0, fontFace: "Cambria", bold: true, fontSize: 16, color: C.text2, valign: "middle" });
  T(s, dt, { x: 5.0, y, w: 3.6, h: 1.0, fontSize: 14, valign: "middle" });
  T(s, r, { x: 8.85, y, w: 3.55, h: 1.0, fontSize: 14, bold: true, color: C.accent1, valign: "middle" });
});
source(s, "Uitwerking per advies: rapport sprint 2, paragraaf 5.2. Advies 1 sluit aan op onze hypothese en datavragen uit sprint 1");
s.addNotes("TIJD: 13:15-14:00.\nVier adviezen die volgen uit de analyse. Benadruk de middelste kolom: Enexis heeft al deze data. Advies 1 is ons datavraagstuk uit sprint 1. Rest kort.");

// ================= SLIDE 17: gastspreker
s = content("Conclusie", "Wat we de gastspreker willen vragen");
T(s, "Zes vragen voorbereid, om onze aannames te toetsen. Drie belangrijkste:", { x: MX, y: 1.35, w: 11.8, h: 0.4, fontSize: 16 });
const qs = [["Hoe ver vooruit kunt u nu voorspellen waar een station vol loopt, en welke data mist daarvoor nog?", "Toetst advies 1 en onze datavragen uit sprint 1."], ["Welke slimme-meterdata mag u gebruiken voor analyses, en hoe anonimiseert u die?", "Slimme-meterdata zijn persoonsgegevens onder de AVG."], ["Wanneer besluit u een gasleiding niet meer te vervangen omdat de wijk van het gas af gaat?", "Toetst advies 3; nu is 11,2% van de woningen aardgasvrij."]];
qs.forEach(([q, w], i) => {
  const y = 1.95 + i * 1.5;
  card(s, MX, y, 11.83, 1.3, "vraag " + (i + 1));
  num(s, MX + 0.3, y + 0.42, i + 1);
  T(s, q, { x: MX + 1.0, y: y + 0.15, w: 10.5, h: 0.6, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
  T(s, w, { x: MX + 1.0, y: y + 0.75, w: 10.5, h: 0.4, fontSize: 14, color: C.accent1 });
});
source(s, "Alle zes vragen met onderbouwing: rapport sprint 2, paragraaf 5.5. Bronnen: CBS (2025b); Verordening (EU) 2016/679 (2016)");
s.addNotes("TIJD: 14:00-14:20.\nKort: we hebben zes vragen voorbereid, hier de drie belangrijkste. Bij elke vraag zeggen waarom we hem stellen.");

// ================= SLIDE 18: samenwerking
s = content("Conclusie", "Samenwerking en GenAI");
label(s, "Van sprint 1 naar sprint 2", MX, 1.4, 6);
const sw = [["Opdracht in het begin onduidelijk", "Gestart met een samenwerkingsovereenkomst"], ["Taken pas laat verdeeld", "Taken verdeeld op ieders expertise"], ["Elkaars werk te laat gecontroleerd", "Elk hoofdstuk nagelezen door een ander"]];
T(s, "Sprint 1", { x: MX, y: 1.75, w: 3.0, h: 0.3, fontSize: 12, bold: true, color: C.accent4 });
T(s, "Sprint 2", { x: MX + 3.3, y: 1.75, w: 3.0, h: 0.3, fontSize: 12, bold: true, color: C.accent4 });
sw.forEach(([a, b], i) => {
  const y = 2.1 + i * 1.15;
  card(s, MX, y, 3.0, 0.95, "sprint1 " + i);
  T(s, a, { x: MX + 0.2, y, w: 2.6, h: 0.95, fontSize: 14, valign: "middle" });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: MX + 3.05, y: y + 0.32, w: 0.22, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "pijl sw " + i });
  card(s, MX + 3.3, y, 3.0, 0.95, "sprint2 " + i, C.accent1);
  T(s, b, { x: MX + 3.5, y, w: 2.6, h: 0.95, fontSize: 14, color: C.background1, valign: "middle" });
});
T(s, "Verbeterpunt sprint 3: grote taken eerder opsplitsen en een interne deadline twee dagen vóór de echte.", { x: MX, y: 5.65, w: 6.3, h: 0.8, fontSize: 14, italic: true });
card(s, 7.45, 1.4, 5.13, 5.1, "genai", C.text2);
label(s, "GenAI-evaluatie", 7.75, 1.6, 4.5, C.accent2);
T(s, [
  { text: "Wel gebruikt voor", options: { bold: true, color: C.background1, breakLine: true } },
  { text: "Begrippen uitleggen, zoektermen bedenken, spelling en zinsbouw, hulp bij de Excel-grafiek", options: { color: "C9D3DE", breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Niet gebruikt voor", options: { bold: true, color: C.background1, breakLine: true } },
  { text: "Cijfers zonder bron, hele hoofdstukken schrijven, de reflectie", options: { color: "C9D3DE", breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Wat we leerden", options: { bold: true, color: C.accent2, breakLine: true } },
  { text: "GenAI helpt om te weten waar je moet zoeken, maar is onbetrouwbaar voor wat er staat: cijfers bleken soms uit verschillende jaren te komen.", options: { color: C.background1 } },
], { x: 7.75, y: 2.0, w: 4.55, h: 4.3, fontSize: 14 });
source(s, "Uitwerking: samenwerkingsovereenkomst en reflectie sprint 1 en 2");
s.addNotes("TIJD: 14:20-14:50.\nProces: wat ging in sprint 1 minder, en wat deden we in sprint 2 anders. GenAI: hulpmiddel, geen bron. Belangrijkste les: cijfers altijd zelf nazoeken.");

// ================= SLIDE 19: vragen
s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Conclusie" });
label(s, "Bedankt voor jullie aandacht", MX, 2.25, 6, C.accent2);
T(s, "Vragen?", { x: MX, y: 2.6, w: 6.5, h: 1.1, fontFace: "Cambria", fontSize: 54, bold: true, color: C.background1, valign: "middle" });
T(s, "Project Enexis  ·  Sprint 1 en 2", { x: MX, y: 3.75, w: 6.5, h: 0.5, fontSize: 20, color: "C9D3DE" });
T(s, "Joshua Ferreira  ·  Mohamed Badr el Din  ·  Redouan Afkir  ·  Jemairo van Rey", { x: MX, y: 5.4, w: 7, h: 0.35, fontSize: 14, color: C.background1 });
network(s, 7.75, 1.53, 1.0);
s.addNotes("TIJD: 14:50-15:00.\nBedanken en vragen beantwoorden. Achtergrondmateriaal: rapport sprint 2, Excel-bestand, samenwerkingsovereenkomst en reflectie.");

(async () => {
  const out = "/home/user/-betterfish/datalab-sprint2/Datalab1_Presentatie_Sprint1en2_Enexis.pptx";
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("geschreven:", out);
})();

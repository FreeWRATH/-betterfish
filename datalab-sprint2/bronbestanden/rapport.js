const L = require("./lib.js");
const { d, C, P, H1, H2, H3, Bullet, Caption, Break, Empty, table, doc, cover, toc, save, runs, Paragraph, TextRun, AlignmentType } = L;
const bronnen = require("./bronnen.js");
const fs = require("fs");
const OUT = "/home/user/-betterfish/datalab-sprint2/";

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

function literatuurlijst() {
  const out = [new Paragraph({ children: [new TextRun({ text: "Literatuurlijst", bold: true, color: C.navy, size: 36, font: "Calibri Light" })], spacing: { before: 360, after: 120 }, pageBreakBefore: true })];
  out.push(P("Alle bronnen zijn vermeld volgens de APA-richtlijnen (7e editie) en staan alfabetisch. De beoordeling van elke bron met de CRAAP-methode staat in bijlage A."));
  bronnen.forEach((b) => out.push(new Paragraph({ children: runs(b.apa, { size: 20 }), indent: { left: 540, hanging: 540 }, spacing: { after: 120 } })));
  return out;
}

function bijlageA() {
  const out = [new Paragraph({ children: [new TextRun({ text: "Bijlage A: Bronnenbeoordeling volgens de CRAAP-methode", bold: true, color: C.navy, size: 36, font: "Calibri Light" })], spacing: { before: 360, after: 120 }, pageBreakBefore: true })];
  out.push(P("Net als in sprint 1 hebben we elke bron beoordeeld op vijf criteria, elk met een score van 1 (laag) tot 5 (hoog): **C**urrency (actualiteit), **R**elevance (relevantie), **A**uthority (autoriteit), **A**ccuracy (nauwkeurigheid) en **P**urpose (doel). Tabel A.1 geeft het overzicht; daaronder staat per bron een toelichting van één of twee kernzinnen per letter. De bijlage sluit af met een samenvattende analyse van de betrouwbaarheid van alle bronnen samen."));
  out.push(table(
    ["Bron", "Type", "C", "R", "A", "A", "P", "Kern van de conclusie"],
    bronnen.map((b) => [b.key, b.type, ...b.s.map(String), b.con]),
    [2200, 1500, 400, 400, 400, 400, 400, 3932], { size: 16, firstBold: true }));
  out.push(Caption("Tabel A.1. Overzicht van de CRAAP-scores. C = Currency, R = Relevance, A = Authority, A = Accuracy, P = Purpose."));
  bronnen.forEach((b) => {
    out.push(H3(b.key));
    out.push(new Paragraph({ children: runs("Bron: " + b.apa.split(". *")[0] + ". " + (b.apa.match(/\*([^*]+)\*/) || ["", ""])[1] + ". [" + b.type.toLowerCase() + "]", { size: 19, italics: true }), spacing: { after: 80 } }));
    [["C - Currency", b.s[0], b.C], ["R - Relevance", b.s[1], b.R], ["A - Authority", b.s[2], b.A1], ["A - Accuracy", b.s[3], b.A2], ["P - Purpose", b.s[4], b.P]]
      .forEach(([l, sc, t]) => out.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: l + ": ", bold: true, size: 19 }), new TextRun({ text: stars(sc) + " ", size: 19, font: "Segoe UI Symbol" }), new TextRun({ text: t, size: 19 })] })));
    out.push(new Paragraph({ children: [new TextRun({ text: "Conclusie: ", bold: true, size: 19 }), new TextRun({ text: b.con, bold: true, size: 19 })], spacing: { before: 40, after: 160 } }));
  });
  out.push(H2("Samenvattende analyse van de betrouwbaarheid"));
  out.push(P("De 43 bronnen in dit rapport verschillen sterk in betrouwbaarheid, en we hebben ze daarom ook verschillend gebruikt. De **kern van het rapport rust op primaire, onafhankelijke bronnen**: de CBS-dataset en CBS-publicaties (cijfers over prijzen, hernieuwbare energie en aardgasvrije woningen), de AVG-wettekst, de ACM, de Rijksoverheid, RVO en het PBL. Deze bronnen scoren op bijna alle letters een 4 of 5 en hebben geen commercieel belang bij de uitkomst. Alle harde cijfers in de hoofdstukken 3 en 4 komen uit deze groep."));
  out.push(P("Een **tweede groep bestaat uit bronnen van de sector zelf**: Enexis, Netbeheer Nederland, Energie-Nederland, de leveranciers (Essent, Engie, Vattenfall, Pure Energie) en de vakmedia Solar Magazine en Duurzaam Ondernemen. Deze bronnen zijn deskundig en meestal nauwkeurig, maar scoren lager op Purpose: zij informeren én profileren. Wij hebben de cijfers daaruit waar mogelijk gecontroleerd met een tweede bron (bijvoorbeeld de wachtlijstcijfers bij Netbeheer Nederland én Duurzaam Ondernemen, de bijmengverplichting bij Engie én Vattenfall) en uitspraken geformuleerd als \"Enexis stelt dat\"."));
  out.push(P("De **zwakste groep zijn de commerciële vergelijkingssites** (Keuze.nl, Overstappen.nl, Selectra, Energievergelijk). Zij scoren laag op Authority en Purpose omdat zij verdienen aan overstappende klanten. We hebben ze alleen gebruikt voor eenvoudige, controleerbare feiten (klantaantallen, het aantal vergunningen, de uitleg van de energierekening) en nooit als enige bron voor een conclusie. Hetzelfde geldt voor de milieuorganisaties (Greenpeace et al., WISE, BNNVARA): zij zijn deskundig en transparant over hun methode, maar hebben een duidelijk standpunt. Hun scores hebben we daarom naast de wettelijk verplichte stroometiketten gelegd."));
  out.push(P("Het grootste aandachtspunt is **actualiteit**: de laatste volledige Groene Stroom Ranglijst is uit 2022 en de CBS-tarieventabel stopt in 2023. Voor de opdracht (het jaar 2022) is dat geen probleem, maar voor de leveranciersvergelijking hebben we de ranking aangevuld met stroometiketten en een analyse uit 2025. Over het geheel genomen is de bronnenbasis van dit rapport betrouwbaar: elke conclusie steunt op minstens één onafhankelijke bron, en bronnen met een belang zijn als zodanig benoemd."));
  return out;
}

function bijlageB() {
  const code = fs.readFileSync(__dirname + "/energieprijzen_2022.py", "utf8").split("\n");
  const out = [new Paragraph({ children: [new TextRun({ text: "Bijlage B: Python-code voor figuur 1", bold: true, color: C.navy, size: 36, font: "Calibri Light" })], spacing: { before: 360, after: 120 }, pageBreakBefore: true })];
  out.push(P("De grafiek in paragraaf 3.2 is gemaakt met Python 3, pandas en matplotlib. De maandwaarden zijn handmatig overgenomen uit StatLine-tabel 84672NED (CBS, 2023a), omdat de CBS-API vanuit onze werkomgeving niet bereikbaar was. Het script schrijft ook het CSV-bestand *energietarieven_2022.csv* weg, zodat de data herbruikbaar is in de volgende sprint."));
  code.forEach((line) => out.push(new Paragraph({ children: [new TextRun({ text: line || " ", font: "Consolas", size: 15 })], spacing: { after: 0, line: 240 }, shading: { type: d.ShadingType.CLEAR, color: "auto", fill: "F4F4F2" } })));
  return out;
}

function bijlageC() {
  const out = [new Paragraph({ children: [new TextRun({ text: "Bijlage C: Ingevulde Checklist Rapporteren", bold: true, color: C.navy, size: 36, font: "Calibri Light" })], spacing: { before: 360, after: 120 }, pageBreakBefore: true })];
  out.push(P("We hebben het rapport gecontroleerd met de Checklist Rapporteren van de opleiding. Per element staat of het aanwezig is en waar het te vinden is."));
  const rows = [
    ["Omslag en titelpagina", "Titel (en evt. ondertitel) dekt (dekken) de lading", "Ja", "\"Onderzoek de Nederlandse energiemarkt\" met ondertitel over Enexis"],
    ["", "Er staat geen \"template\" op de titelpagina", "Ja", "Eigen titelpagina in de huisstijl van ons sprint 1-rapport"],
    ["", "Naam auteur(s)", "Ja", "Vier namen met studentnummers op de titelpagina"],
    ["", "Naam opdrachtgever / organisatie", "Ja", "Enexis Netbeheer (casusorganisatie) en De Haagse Hogeschool"],
    ["", "Naam vak", "Ja", "DataLab 1, Applied Data Science & AI"],
    ["", "Plaats, datum", "Ja", "Den Haag, 6 oktober 2026"],
    ["Inhoudsopgave", "Nummers en titels van hoofdstukken en paragrafen", "Ja", "Automatische inhoudsopgave (Word: klik met rechts, Veld bijwerken)"],
    ["", "Verband tussen hoofdstuk en paragrafen", "Ja", "Paragrafen genummerd 2.1, 2.2 enz."],
    ["", "Titels kernachtig geformuleerd", "Ja", "Korte titels, deels als vraag"],
    ["", "Lijst van gebruikte afkortingen en symbolen (evt.)", "N.v.t.", "Afkortingen (ACM, AVG, AP, GW, MW, TTF) worden bij eerste gebruik uitgeschreven"],
    ["", "Literatuurlijst (heeft geen hoofdstuknr.!)", "Ja", "Literatuurlijst zonder nummer, na hoofdstuk 6"],
    ["", "Bijlagen met nummer en titel (heeft geen hoofdstuknr.!)", "Ja", "Bijlage A, B en C met titel, zonder hoofdstuknummer"],
    ["", "Paginanummering", "Ja", "Voettekst \"Pagina X\""],
    ["Kern", "De kern volgt een logische structuur", "Ja", "Volgorde van het rapporttemplate: markt, prijs en capaciteit, duurzaamheid, organisatie, conclusies"],
    ["", "Eén onderwerp per alinea", "Ja", "Gecontroleerd per hoofdstuk"],
    ["", "Alinea's bevatten duidelijke kernzin", "Ja", "Kernzin vooraan, vaak vetgedrukt"],
    ["", "Argumentatie op orde", "Ja", "Elke conclusie steunt op cijfers met bronvermelding"],
    ["", "Rapportindeling volgens inhoudsopgave", "Ja", "Inhoudsopgave is automatisch gegenereerd uit de koppen"],
    ["", "Verwijzingen naar bijlagen aanwezig (evt.)", "Ja", "Verwijzingen in hoofdstuk 1, 3.2 en bijlage A"],
    ["", "Volgens richtlijnen APA", "Ja", "In de tekst (auteur, jaar) en alfabetische literatuurlijst"],
    ["Bijlagen", "Zelfstandig leesbaar", "Ja", "Elke bijlage begint met een korte inleiding"],
    ["Algemeen", "Het eindproduct is goed verzorgd (lay-out en wijze van aanleveren)", "Ja", "Huisstijl van sprint 1; aangeleverd als Word-document via Brightspace"],
    ["", "Publieksgericht: begrijpelijk en leesbaar voor de doelgroep", "Ja", "Geschreven voor de directie van Enexis en de coaches; vaktermen uitgelegd"],
    ["", "Publieksgericht: vormgeving aangepast aan de doelgroep", "Ja", "Tabellen en één grafiek voor overzicht"],
    ["", "Spelling correct", "Ja", "Spellingscontrole uitgevoerd"],
    ["", "Taalkundig correct", "Ja", "Door twee groepsleden nagelezen"],
  ];
  out.push(table(["Onderdeel", "Element", "Aanwezig", "Waar / toelichting"], rows, [1700, 3600, 900, 3432], { size: 17, firstBold: true }));
  out.push(Caption("Tabel C.1. Ingevulde Checklist Rapporteren."));
  return out;
}

(async () => {
  const deel1 = require("./rapport_deel1.js")();
  const deel2 = require("./rapport_deel2.js")();
  const coverParas = cover({
    kicker: "DATALAB 1 · SPRINT 2",
    title: "Onderzoek de Nederlandse energiemarkt",
    subtitle: "Business understanding voor Project Enexis",
    lines: [
      "De Haagse Hogeschool · Applied Data Science & AI",
      "Klas ADSAI-DH-1.A · Groep 3 · Coach: Onur Tezel",
      "Opdrachtgever (casus): Enexis Netbeheer",
      "",
      "Joshua Ferreira ([studentnummer])",
      "Mohamed Badr el Din (19096135)",
      "Redouan Afkir (26145529)",
      "Jemairo van Rey (26159414)",
      "",
      "Den Haag, 6 oktober 2026",
    ],
  });
  const front = [...coverParas, Break(), ...toc(), Break()];
  const body = [...deel1, ...deel2, ...literatuurlijst(), ...bijlageA(), ...bijlageB(), ...bijlageC()];
  const document = doc({ headerText: "Datalab 1 | Sprint 2 | Onderzoek de Nederlandse energiemarkt", sections: [[...front, ...body]] });
  await save(document, OUT + "Datalab1_Sprint2_Rapport_Energiemarkt_Enexis.docx");
})();

const L = require("./lib.js");
const { C, P, Paragraph, TextRun, doc, save, table } = L;
const OUT = "/home/user/-betterfish/datalab-sprint2/";

const BLOCKS = [
  ["Deel 1: Introductie (3,5 min)", [
    [1, "Titel", "0:00", "Hoi, wij zijn groep 3. Wij presenteren sprint 1 en 2 van Project Enexis. In sprint 1 waren we de directie van Enexis. In sprint 2 waren we de consultant en onderzochten we de energiemarkt."],
    [2, "Opbouw", "0:20", "We beginnen met hoe we het onderzoek deden en wie Enexis is. Dan het bedrijfsmodel. Daarna de analyse met twee datavragen. We sluiten af met conclusie en advies. Het BMC en de datavragen krijgen de meeste tijd, want dat was onze feedback."],
    [3, "Onderzoeksmethode", "0:45", "We deden deskresearch. We gebruikten eerst officiële bronnen, zoals CBS, ACM en het jaarverslag van Enexis. De CBS-cijfers over energieprijzen hebben we in Excel gezet. Interviews hebben we niet gehouden, maar we hebben wel vragen voor de gastspreker voorbereid."],
    [4, "CRAAP", "1:30", "Elke bron hebben we beoordeeld met CRAAP. Bovenaan zie je sterke bronnen, zoals het CBS. Onderaan zie je zwakke bronnen, zoals vergelijkingssites. Die gebruiken we alleen voor simpele feiten. In totaal hebben we 32 bronnen beoordeeld."],
    [5, "Wie is Enexis?", "2:15", "Enexis is een netbeheerder in vijf provincies. Ze hebben ongeveer 3 miljoen klanten. Enexis verkoopt geen energie, maar vervoert die. Daarom is er geen concurrentie en houdt de ACM toezicht."],
    [6, "Energiemarkt", "2:50", "Stroom wordt opgewekt, gaat via TenneT naar Enexis en dan naar de klant. De leverancier verkoopt de energie en stuurt de rekening. Er zijn 6 regionale netbeheerders en ruim 50 leveranciers."],
  ]],
  ["Deel 2: Bedrijfsmodel (3 min)", [
    [7, "Volledig BMC", "3:30", "Dit is ons volledige Business Model Canvas uit sprint 1. We werken twee bouwstenen uit: kernactiviteiten en partners. Daar zit het grootste probleem van Enexis: het net zit vol."],
    [8, "Kernactiviteiten", "4:00", "Enexis doet vier dingen. Aansluiten: ruim 15.000 bedrijven wachten. Verzwaren: in 2025 investeerde Enexis 1,9 miljard euro. Storingen oplossen: gemiddeld 18,8 minuten. En de ruimte op het net slim verdelen."],
    [9, "Partners", "5:15", "Enexis kan dit niet alleen. TenneT moet eerst ruimte geven op het hoogspanningsnet. Gemeenten bepalen welke wijken van het gas af gaan. Leveranciers innen het geld en aannemers doen het werk."],
  ]],
  ["Deel 3: Analyse (6 min)", [
    [10, "Hypothese", "6:30", "In sprint 1 hadden we deze hypothese: bedrijfsterreinen verbruiken het meest, woonwijken gemiddeld en natuur het minst. Die kunnen we toetsen met de open data van Enexis per postcode."],
    [11, "Energierekening", "7:00", "De rekening bestaat uit vier delen: levering, netbeheer, belasting en btw. Enexis krijgt alleen het netbeheer-deel."],
    [12, "Datavraag 1", "7:30", "Onze eerste datavraag: hoe veranderde de energieprijs in 2022? Gas ging van 1,20 naar 2,78 euro per kuub. Stroom ging van 32 naar 66 cent. De oorzaak was vooral de oorlog in Oekraïne en minder Russisch gas."],
    [13, "Datavraag 2", "8:50", "Onze tweede datavraag: hoe vaak is er te veel stroom? In 2022 was de stroomprijs 85 uur negatief, in 2025 al 581 uur. Tegelijk wachten ruim 15.000 bedrijven op een aansluiting. Het net is dus soms te vol en soms te leeg."],
    [14, "Oplossingen", "10:00", "Dit speelt vooral in de provincies van Enexis. Netbeheerders leggen meer kabels, maar dat duurt lang. Daarom gebruiken ze ook slimme oplossingen, zoals batterijen en afspraken met bedrijven."],
    [15, "Duurzaamheid", "10:45", "Nederland wordt groener: de helft van de stroom is al duurzaam. Pure Energie scoort een 10, Eneco een 8,1 en Essent een 4,8. Maar pas 11,2 procent van de woningen is van het gas af. Dat gaat te langzaam."],
    [16, "Privacy", "11:30", "Bij Enexis vonden we geen datalek, dus we kozen drie andere incidenten. Bij Eneco hackers met gestolen wachtwoorden. Bij AddComm ransomware. Bij Innova Energie een medewerker die gegevens kopieerde. Volgens de AVG moet je een lek binnen 72 uur melden."],
  ]],
  ["Deel 4: Conclusie (2,5 min)", [
    [17, "Conclusie", "12:30", "Onze conclusie: het net is tegelijk te vol en te leeg, en Enexis kan dit niet alleen oplossen. Enexis heeft veel data, maar kijkt daarmee vooral terug. Ze moeten vooruitkijken."],
    [18, "Advies", "13:00", "Ons belangrijkste advies: voorspel waar het net vol loopt. Dat kan met data die Enexis al heeft, zoals slimme meters en de wachtlijst."],
    [19, "Gastspreker", "13:45", "Deze vragen willen we aan de gastspreker stellen. Zo kunnen we checken of onze adviezen kloppen."],
    [20, "Samenwerking", "14:10", "In sprint 1 begonnen we rommelig. In sprint 2 maakten we eerst afspraken en lazen we elkaars werk na. AI gebruikten we als hulp, maar nooit als bron."],
    [21, "Vragen", "14:45", "Bedankt voor jullie aandacht. Zijn er vragen?"],
  ]],
];

(async () => {
  const out = [];
  out.push(new Paragraph({ children: [new TextRun({ text: "Spreektekst presentatie", bold: true, color: C.navy, size: 40, font: "Calibri Light" })], spacing: { after: 60 } }));
  out.push(P("Project Enexis · Sprint 1 en 2 · Groep 3 · 15 minuten", { run: { color: C.grey, size: 20 } }));
  out.push(P("Tip: lees dit niet voor, maar oefen tot je het in je eigen woorden kunt zeggen. Vul per deel in wie spreekt.", { run: { italics: true, size: 20 } }));
  BLOCKS.forEach(([title, rows]) => {
    out.push(new Paragraph({ children: [new TextRun({ text: title, bold: true, color: C.blue, size: 26, font: "Calibri Light" })], spacing: { before: 240, after: 60 }, keepNext: true }));
    out.push(new Paragraph({ children: [new TextRun({ text: "Spreker: ______________________", size: 20, color: C.grey })], spacing: { after: 100 }, keepNext: true }));
    out.push(table(["Slide", "Tijd", "Wat je zegt"], rows.map(([n, t, tijd, txt]) => [`${n}. ${t}`, tijd, txt]), [2250, 900, 6482], { size: 20, firstBold: true }));
  });
  await save(doc({ headerText: "Datalab 1 | Spreektekst presentatie sprint 1 en 2", sections: [out] }), OUT + "Datalab1_Spreektekst_Presentatie.docx");
})();

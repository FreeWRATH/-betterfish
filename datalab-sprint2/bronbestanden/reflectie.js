const L = require("./lib.js");
const { C, P, H1, H2, Bullet, Caption, table, doc, save, Paragraph, TextRun, AlignmentType } = L;
const OUT = "/home/user/-betterfish/datalab-sprint2/";

(async () => {
  const out = [];
  out.push(new Paragraph({ children: [new TextRun({ text: "DATALAB 1 · SPRINT 1 EN 2", bold: true, color: C.blue, size: 22, font: "Calibri Light" })], spacing: { after: 40 } }));
  out.push(new Paragraph({ children: [new TextRun({ text: "Reflectie en GenAI-evaluatie", bold: true, color: C.navy, size: 40, font: "Calibri Light" })], spacing: { after: 60 } }));
  out.push(new Paragraph({ children: [new TextRun({ text: "Groep 3 · ADSAI-DH-1.A · Joshua Ferreira (26108569), Mohamed Badr el Din (19096135), Redouan Afkir (26145529), Jemairo van Rey (26159414) · Den Haag, 6 oktober 2026", size: 19, color: C.grey })], spacing: { after: 240 } }));

  out.push(H1("1. Groepsreflectie sprint 1 en 2"));
  out.push(P("**Wat goed ging.** De samenwerking in onze groep is in beide sprints goed verlopen. Iedereen wilde werken, dacht mee en luisterde naar elkaars ideeën. Als iemand met een voorstel kwam, bespraken we samen wat de beste aanpak was. Dat willen we zo houden."));
  out.push(P("**Wat minder ging in sprint 1.** In het begin was de opdracht voor de hele groep nog niet duidelijk, waardoor het even duurde voordat we goed konden starten en de taken konden verdelen. Daarnaast controleerden we elkaars werk te laat. Voorbeeld: pas bij het samenvoegen zagen we dat in het stuk van Jemairo de bronnen nog niet in de tekst stonden. Dat moest op het laatste moment worden toegevoegd."));
  out.push(P("**Wat we in sprint 2 anders deden.** We zijn begonnen met de samenwerkingsovereenkomst, zodat de afspraken vanaf het begin duidelijk waren: wie doet wat, wanneer we overleggen en dat elk hoofdstuk door een ander groepslid wordt nagelezen voordat het af is. De taken hebben we verdeeld op basis van ieders expertise (data-analyse, programmeren, datavisualisatie, business en communicatie). Bronnen hebben we deze keer direct in de tekst en in de bronnenlijst gezet, zodat dat niet weer op de laatste dag hoefde."));
  out.push(P("**Wat nog beter kan.** De opdracht van sprint 2 was een stuk groter dan die van sprint 1, vooral door het aantal bronnen dat we moesten beoordelen met de CRAAP-methode. Dat hadden we onderschat, waardoor het aan het einde toch nog druk was. Voor sprint 3 willen we grote taken eerder opsplitsen en een interne deadline aanhouden van twee dagen voor de echte deadline, zodat er tijd overblijft om elkaars werk na te lezen."));
  out.push(table(["", "Sprint 1", "Sprint 2", "Verbetervoorstel sprint 3"], [
    ["Communicatie", "Via WhatsApp; werkte, maar de opdracht was in het begin onduidelijk.", "WhatsApp voor korte berichten, overleg in de les voor besluiten.", "Bij onduidelijkheid direct de coach vragen in plaats van zelf gokken."],
    ["Taakverdeling", "Per hoofdstuk verdeeld, pas na een paar lessen.", "Vanaf het begin verdeeld op expertise, vastgelegd in de overeenkomst.", "Grote taken (zoals de CRAAP-bijlage) over twee personen verdelen."],
    ["Controle van elkaars werk", "Te laat: fouten (zoals ontbrekende bronnen) pas bij het samenvoegen gezien.", "Elk hoofdstuk door een ander groepslid nagelezen.", "Interne deadline twee dagen vóór de inleverdatum."],
  ], [1900, 2577, 2577, 2578], { firstBold: true, size: 18 }));
  out.push(Caption("Tabel 1. Samenvatting van de groepsreflectie."));

  out.push(H1("2. Peer-feedback"));
  out.push(P("Per groepslid een top (blijven doen) en een tip (verbeteren)."));
  out.push(table(["Groepslid", "Top", "Tip"], [
    ["Jemairo van Rey", "Zoekt goede data en werkt nauwkeurig; heeft de CBS-dataset gevonden en de grafiek in Excel gemaakt.", "Zet de bronvermelding meteen bij de tekst, ook in een eerste versie."],
    ["Redouan Afkir", "Houdt de bestanden en de gedeelde map netjes bij en deelt besluiten snel in de groep.", "Geef feedback duidelijker: zeg wat er anders moet en waarom."],
    ["Mohamed Badr el Din", "Zorgt dat het rapport er verzorgd uitziet en in dezelfde stijl is als in sprint 1.", "Lever concepten eerder in, zodat de nalezer genoeg tijd heeft."],
    ["Joshua Ferreira", "Bewaakt de planning en zorgt dat iedereen in het overleg aan bod komt.", "Verdeel grote taken eerder en vraag om hulp als iets te veel wordt."],
  ], [1900, 3866, 3866], { firstBold: true, size: 18 }));
  out.push(Caption("Tabel 2. Peer-feedback."));

  out.push(H1("3. GenAI-impactevaluatie"));
  out.push(P("**Aanpak.** We hebben generatieve AI (ChatGPT en Claude) gebruikt als hulpmiddel, niet als bron. Dat hebben we ook zo in de samenwerkingsovereenkomst gezet. Wel: begrippen laten uitleggen (bijvoorbeeld netcongestie en Garanties van Oorsprong), zoektermen bedenken, eigen tekst laten controleren op spelling en zinsbouw, en hulp bij de Excel-grafiek. Niet: feiten of cijfers overnemen zonder echte bron, hele hoofdstukken laten schrijven, en de reflectie of peer-feedback laten schrijven."));
  out.push(P("**Resultaten.** Het grootste voordeel was tijd: door eerst te vragen welke organisaties over een onderwerp publiceren (CBS, ACM, Netbeheer Nederland, PBL) konden we gericht naar primaire bronnen zoeken. Daarnaast werd de tekst leesbaarder doordat lange zinnen en herhalingen eruit zijn gehaald. Elke suggestie hebben we wel zelf beoordeeld; een deel hebben we niet overgenomen omdat de toon te formeel werd."));
  out.push(P("**Wat niet werkte.** Toen we GenAI naar cijfers vroegen, bijvoorbeeld de duurzaamheidsscores van leveranciers, bleken die uit verschillende jaren te komen of niet terug te vinden. Dat heeft ons geleerd dat GenAI handig is om te weten *waar* je moet zoeken, maar onbetrouwbaar is voor *wat* er staat. Ook gaan teksten op elkaar lijken als iedereen GenAI gebruikt; daarom heeft één persoon de eindredactie gedaan."));
  out.push(P("**Aandachtspunten voor sprint 3.**"));
  [
    "Elk cijfer dat uit GenAI komt eerst zelf opzoeken in een echte bron; anders komt het niet in het rapport.",
    "Bijhouden waarvoor we GenAI hebben gebruikt (een kort logboek in de gedeelde map), zodat de volgende evaluatie concreter wordt.",
    "Bij analyses eerst zelf een antwoord bedenken en GenAI alleen gebruiken om dat te toetsen, zodat we het zelf blijven begrijpen.",
  ].forEach((t) => out.push(Bullet(t)));

  const document = doc({ headerText: "Datalab 1 | Sprint 1 en 2 | Reflectie groep 3", sections: [out] });
  await save(document, OUT + "Datalab1_Sprint2_Reflectie_en_GenAI_evaluatie_Groep3.docx");
})();

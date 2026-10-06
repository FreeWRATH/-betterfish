const L = require("./lib.js");
const { d, C, P, H2, Bullet, Caption, table, kv, doc, save, runs, Paragraph, TextRun, AlignmentType, CONTENT_W } = L;
const OUT = "/home/user/-betterfish/datalab-sprint2/";

function titel(t) { return new Paragraph({ children: [new TextRun({ text: t, bold: true, color: C.navy, size: 40, font: "Calibri Light" })], spacing: { before: 120, after: 200 } }); }
function kop(t) { return new Paragraph({ children: [new TextRun({ text: t, bold: true, color: C.blue, size: 24, font: "Calibri Light" })], spacing: { before: 240, after: 80 }, keepNext: true }); }

(async () => {
  const out = [];
  out.push(new Paragraph({ children: [new TextRun({ text: "Sprintnummer: ", size: 22 }), new TextRun({ text: "2", italics: true, size: 22 })], spacing: { after: 120 } }));
  out.push(titel("Samenwerkingsovereenkomst"));
  out.push(kv([
    ["Klas:", "ADSAI-DH-1.A"],
    ["Groepsnr.:", "3"],
    ["Coach:", "Onur Tezel"],
    ["Studenten (naam, studentnr.)", ""],
    ["1.", "Jemairo van Rey (26159414)"],
    ["2.", "Redouan Afkir (26145529)"],
    ["3.", "Mohamed Badr el Din (19096135)"],
    ["4.", "Joshua Ferreira ([studentnummer])"],
    ["Datum:", "29-09-2026"],
  ]));
  out.push(new Paragraph({ children: [], spacing: { after: 120 } }));

  out.push(kop("Expertises van de groepsleden"));
  out.push(table(["Naam", "Expertise", "Rol in sprint 2"], [
    ["Jemairo van Rey", "Data-analyse", "Dataset CBS zoeken, grafiek in Python, hoofdstuk 3"],
    ["Redouan Afkir", "Programmeren", "Code en versiebeheer, hoofdstuk 5 (advies en data), checklist"],
    ["Mohamed Badr el Din", "Datavisualisatie", "Opmaak rapport, tabellen en figuren, hoofdstuk 4"],
    ["Joshua Ferreira", "Business & communicatie", "Hoofdstuk 2 en 6, bronnenbeoordeling (CRAAP), APA, presentatie"],
  ], [2600, 2600, 4432], { firstBold: true }));
  out.push(new Paragraph({ children: [], spacing: { after: 120 } }));

  out.push(kop("Media voor samenwerking"));
  out.push(P("We gebruiken de volgende middelen. Elk middel heeft één duidelijk doel, zodat informatie niet verspreid raakt:"));
  out.push(table(["Middel", "Waarvoor", "Afspraak"], [
    ["WhatsApp-groep", "Snelle communicatie, afwezigheid melden, korte vragen", "Reageren binnen 24 uur; bij urgentie (deadline binnen 48 uur) binnen 2 uur op lesdagen"],
    ["Microsoft Teams (klasteam)", "Communicatie met de coach, online overleg buiten de les", "Eén vast online overlegmoment per week van 30 minuten op maandag 19:00 uur"],
    ["OneDrive / gedeelde map", "Alle documenten (rapport, overeenkomst, reflectie, bronnen)", "Alleen in de gedeelde map werken; bestandsnaam met versie en datum (bijv. Rapport_v3_2026-10-06)"],
    ["Google Colab / GitHub", "Python-code en datasets", "Code in één gedeeld notebook; elke wijziging met een korte beschrijving"],
    ["Brightspace", "Inleveren van de eindproducten", "Eén groepslid (Joshua) levert in, na akkoord van iedereen in de WhatsApp-groep"],
  ], [2200, 3300, 4132], { firstBold: true }));

  out.push(kop("Groepsregels"));
  out.push(P("**Doelstelling**"));
  out.push(P("Het doel van onze groep is om samen een kwalitatief goed DataLab-project op te leveren. We willen de kennis en vaardigheden van ieder groepslid goed benutten, taken eerlijk verdelen en ervoor zorgen dat het eindproduct duidelijk, goed onderbouwd en compleet is. Concreet voor sprint 2: het rapport, de samenwerkingsovereenkomst en de reflectie zijn uiterlijk twee dagen voor de deadline op Brightspace af, zodat we nog één dag hebben om elkaars werk te controleren. We streven naar minimaal een 'Goed' op alle onderdelen van het beoordelingsformulier. Daarnaast willen we als groep leren van het werken met data en van elkaar."));
  out.push(P("**Werktijden**"));
  out.push(P("We werken tijdens de ingeplande DataLab-uren op school gezamenlijk aan het project. Daarnaast werkt ieder groepslid minimaal 3 uur per week buiten de les aan zijn eigen taken. Elke maandag om 19:00 uur hebben we een online overleg van 30 minuten via Teams waarin we de voortgang bespreken en de taken voor de komende week vastleggen. In de week voor een deadline plannen we één extra fysiek werkmoment op school."));
  out.push(P("**Afspraken communicatie**"));
  out.push(P("We communiceren voornamelijk via onze groeps-WhatsApp. Hier bespreken we belangrijke informatie, taken, deadlines en eventuele wijzigingen. We reageren binnen 24 uur op berichten; bij urgente berichten (gemarkeerd met 'URGENT') reageren we op lesdagen binnen 2 uur. Besluiten die we in de les of in het overleg nemen, zet Redouan dezelfde dag in de WhatsApp-groep, zodat ook afwezige groepsleden op de hoogte zijn. Met de coach communiceren we via Teams of in de les."));
  out.push(P("**Afspraken aanwezigheid**"));
  out.push(P("Iedereen is op tijd aanwezig tijdens de ingeplande DataLab-momenten en het wekelijkse online overleg, tenzij iemand een geldige reden heeft om afwezig te zijn. Bij afwezigheid laat je dit minimaal 24 uur van tevoren weten in de WhatsApp-groep (bij ziekte: vóór 9:00 uur op de dag zelf) en spreek je af wie jouw taak van die dag overneemt of wanneer je het inhaalt. Tijdens de bijeenkomsten verwachten we dat iedereen actief meewerkt, initiatief toont, naar elkaar luistert en zich bezighoudt met het project; telefoons blijven weg tijdens het overleg."));
  out.push(P("**Afspraken documenten delen**"));
  out.push(P("We bewaren en delen al onze documenten in één gedeelde OneDrive-map, zodat iedereen altijd bij de meest recente bestanden kan. We werken zoveel mogelijk in gedeelde documenten om te voorkomen dat er verschillende versies ontstaan. Bestanden krijgen een duidelijke naam met versienummer en datum. Elke bron die iemand gebruikt, wordt direct toegevoegd aan de gedeelde bronnenlijst met de APA-vermelding en de CRAAP-beoordeling, zodat we dat niet op het laatst hoeven te doen (ons verbeterpunt uit sprint 1). Code staat in één gedeeld Colab-notebook."));
  out.push(P("**Taakverdeling en controle**"));
  out.push(P("Taken worden elke maandag verdeeld op basis van ieders expertise (zie tabel) en vastgelegd in de WhatsApp-groep met naam en deadline. Elk onderdeel van het rapport wordt door minimaal één ander groepslid nagelezen voordat het definitief is; de nalezer controleert op inhoud, spelling en bronvermelding. Joshua bewaakt de planning en de deadlines."));
  out.push(P("**Procedure bij niet nakomen afspraken**"));
  out.push(P("Als iemand een afspraak niet nakomt, bespreken we dit eerst met die persoon en krijgt diegene een waarschuwing. Gebeurt het daarna opnieuw, dan krijgt diegene een tweede waarschuwing en maken we duidelijke afspraken over wat er moet verbeteren, met een datum waarop we dat opnieuw bekijken. Als afspraken daarna nog steeds niet worden nagekomen, bespreken we dit als groep en nemen we contact op met de coach. Iedereen blijft zelf verantwoordelijk voor zijn of haar afgesproken taken en deadlines."));
  out.push(P("**Overige afspraken**"));
  out.push(P("Generatieve AI (zoals ChatGPT of Claude) mogen we gebruiken voor het verbeteren van teksten, het controleren van code en het uitleggen van begrippen, maar nooit als bron: elk feit moet terug te vinden zijn in een echte bron die we zelf hebben gecontroleerd. In de reflectie beschrijven we hoe we GenAI hebben gebruikt. Feedback geven we eerlijk en respectvol, gericht op het werk en niet op de persoon."));
  out.push(new Paragraph({ children: [], spacing: { after: 200 } }));
  out.push(kop("Ondertekening"));
  out.push(table(["Naam", "Datum", "Handtekening"], [
    ["Jemairo van Rey", "29-09-2026", ""], ["Redouan Afkir", "29-09-2026", ""], ["Mohamed Badr el Din", "29-09-2026", ""], ["Joshua Ferreira", "29-09-2026", ""],
  ], [3600, 2400, 3632], { firstBold: true }));

  const document = doc({ headerText: "Datalab 1 | Sprint 2 | Samenwerkingsovereenkomst groep 3", sections: [out] });
  await save(document, OUT + "Datalab1_Sprint2_Samenwerkingsovereenkomst_Groep3.docx");
})();

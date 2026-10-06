const L = require("./lib.js");
const { d, C, P, H1, H2, H3, Bullet, Num, Caption, Break, table, doc, cover, toc, save, Paragraph, TextRun } = L;
const OUT = "/home/user/-betterfish/datalab-sprint2/";

(async () => {
  const out = [];
  out.push(...cover({
    kicker: "DATALAB 1 · SPRINT 1 EN 2",
    title: "Reflectie en GenAI-impactevaluatie",
    subtitle: "Groepsproces, peer-feedback en gebruik van generatieve AI",
    lines: ["De Haagse Hogeschool · Applied Data Science & AI", "Klas ADSAI-DH-1.A · Groep 3 · Coach: Onur Tezel", "", "Joshua Ferreira (26108569)", "Mohamed Badr el Din (19096135)", "Redouan Afkir (26145529)", "Jemairo van Rey (26159414)", "", "Den Haag, 6 oktober 2026"],
  }));
  out.push(Break());

  out.push(H1("1. Inleiding"));
  out.push(P("In dit document reflecteren wij op sprint 1 en sprint 2 van DataLab 1. We kijken terug op het groepsproces, geven elkaar peer-feedback en evalueren welke invloed generatieve AI (GenAI) op ons werk heeft gehad. De vorm is vrij; wij hebben gekozen voor de methode **STARR** (Situatie, Taak, Actie, Resultaat, Reflectie) voor de groepsreflectie, omdat die ons dwingt om bij elk punt een concreet voorbeeld en een verbetervoorstel te geven. Voor de peer-feedback gebruiken we per persoon de vorm **Top en Tip**. De GenAI-evaluatie bestaat uit onze aanpak, de resultaten, wat wel en niet werkte en een actieplan voor sprint 3."));

  out.push(H1("2. Reflectie op het groepsproces"));
  out.push(H2("2.1 Terugblik op sprint 1"));
  out.push(P("**Situatie.** In sprint 1 moesten we als directie van Enexis een organisatiebeschrijving, een Business Model Canvas, een activiteitentabel met data en een datavraagstuk opleveren. De opdracht was voor de hele groep in het begin niet duidelijk."));
  out.push(P("**Taak.** Samen een rapport en een presentatie maken en de taken eerlijk verdelen."));
  out.push(P("**Actie.** We hebben in de eerste les de opdracht nog een keer met de coach doorgenomen en daarna de hoofdstukken verdeeld. Iedereen werkte zijn eigen deel uit en we voegden de delen aan het einde samen."));
  out.push(P("**Resultaat.** Het rapport was op tijd af en de inzet was goed: iedereen wilde werken, dacht mee en luisterde naar elkaars ideeën. Maar bij het samenvoegen bleek dat in het hoofdstuk van Jemairo de bronvermeldingen in de tekst ontbraken, en dat de hoofdstukken in stijl verschilden. Dit kwam pas op de laatste dag naar voren."));
  out.push(P("**Reflectie.** We controleerden elkaars werk te laat en te weinig. Doordat ieder zijn deel alleen schreef, zagen we fouten pas bij het samenvoegen. Ons verbetervoorstel uit sprint 1 was daarom: vanaf het begin duidelijke afspraken maken en elkaars werk tussentijds controleren."));

  out.push(H2("2.2 Wat we in sprint 2 anders hebben gedaan"));
  out.push(P("**Situatie.** In sprint 2 moesten we als consultant de Nederlandse energiemarkt onderzoeken: een groter rapport met veel bronnen, een grafiek in Excel, een CRAAP-beoordeling van elke bron, een samenwerkingsovereenkomst en deze reflectie."));
  out.push(P("**Taak.** De verbeterpunten uit sprint 1 echt toepassen en tegelijk een veel groter product opleveren."));
  out.push(P("**Actie.** We zijn gestart met de samenwerkingsovereenkomst, waarin we de afspraken uit sprint 1 concreet hebben gemaakt: een vast wekelijks overleg op maandag, een gedeelde bronnenlijst waarin elke bron direct met APA-vermelding en CRAAP-score wordt toegevoegd, en de regel dat elk hoofdstuk door een ander groepslid wordt nagelezen voordat het definitief is. De taken hebben we verdeeld op basis van ieders expertise: Jemairo de dataset en de Excel-grafiek, Mohamed de opmaak en hoofdstuk 4, Redouan de code en het advies, Joshua de marktbeschrijving, de conclusies en de bronnen."));
  out.push(P("**Resultaat.** Het rapport is completer en consistenter dan in sprint 1. Voorbeeld: toen Mohamed hoofdstuk 4 nalas, zag hij dat de duurzaamheidsscores van de leveranciers uit een ranglijst van 2022 kwamen; we hebben die daarna aangevuld met de stroometiketten van 2025 en dat in de CRAAP-beoordeling uitgelegd. In sprint 1 zou zo'n punt pas bij de presentatie zijn opgevallen. Een tweede voorbeeld: de bronnenlijst was deze keer op de laatste dag al compleet, omdat iedereen bronnen direct had toegevoegd."));
  out.push(P("**Reflectie.** De tussentijdse controle werkt, maar kost tijd die we niet goed hadden ingepland: in de laatste week moesten we twee avonden extra werken. Ook merkten we dat de CRAAP-beoordeling van 43 bronnen veel werk is als je het aan het einde doet voor de bronnen die wél te laat waren toegevoegd. Voor sprint 3 willen we de controle vaster inplannen (zie 2.4)."));

  out.push(H2("2.3 Samenwerken: communicatie, taakverdeling en afspraken"));
  out.push(table(["Onderdeel", "Wat ging goed", "Wat ging minder goed", "Verbetervoorstel"], [
    ["Communicatie", "De WhatsApp-groep werd elke dag gebruikt; iedereen reageerde binnen een dag. Besluiten uit de les stonden dezelfde dag in de groep.", "Lange discussies in WhatsApp (bijvoorbeeld over welk jaar de grafiek moest tonen) kostten veel berichten; in een gesprek van vijf minuten was het sneller opgelost.", "Inhoudelijke discussies bewaren voor het maandagoverleg; WhatsApp alleen voor korte afstemming."],
    ["Taakverdeling en planning", "Taken sloten aan bij ieders expertise en stonden met naam en deadline in de groep.", "De omvang van de CRAAP-bijlage hadden we onderschat; die taak lag uiteindelijk vooral bij Joshua.", "Grote taken opsplitsen en over twee personen verdelen; de omvang vooraf inschatten in uren."],
    ["Afspraken en deadlines", "Alle interne deadlines zijn gehaald; niemand is zonder bericht afwezig geweest.", "Eén keer kwam een stuk een dag later dan afgesproken, waardoor de nalezer minder tijd had.", "Interne deadline twee dagen vóór de echte deadline, zoals in de overeenkomst staat, en die ook echt bewaken."],
    ["Sfeer en inzet", "Iedereen wilde werken, dacht mee en stond open voor feedback op zijn tekst.", "Feedback werd soms te voorzichtig gegeven ('misschien kun je...'), waardoor niet altijd duidelijk was of iets echt moest veranderen.", "Feedback concreet maken: wat, waarom en wanneer het aangepast moet zijn."],
  ], [1700, 2700, 2700, 2532], { firstBold: true, size: 17 }));
  out.push(Caption("Tabel 1. Reflectie op de samenwerking in sprint 1 en 2."));

  out.push(H2("2.4 Actiepunten voor sprint 3"));
  [
    "**Controlemoment inplannen:** elke donderdag levert ieder zijn concept in en leest op vrijdag het stuk van een ander na, met een vaste checklist (inhoud, bronnen in de tekst, APA, spelling). Joshua bewaakt dat dit gebeurt.",
    "**Bronnen direct beoordelen:** een bron wordt pas gebruikt als de APA-vermelding en de CRAAP-score in de gedeelde lijst staan. Zo voorkomen we het werk op de laatste dag.",
    "**Grote taken splitsen:** taken van meer dan vier uur worden verdeeld over twee personen, zodat niemand alleen de bottleneck is.",
    "**Inhoudelijke discussies op maandag:** vragen die meer dan vijf berichten nodig hebben, komen op de agenda van het maandagoverleg.",
  ].forEach((t) => out.push(Num(t)));

  out.push(H1("3. Peer-feedback"));
  out.push(P("We hebben elkaar feedback gegeven in de vorm van een top (wat je goed doet en moet blijven doen) en een tip (wat je kunt verbeteren), elk met een voorbeeld uit sprint 1 of 2."));
  out.push(table(["Groepslid", "Top", "Tip"], [
    ["Jemairo van Rey", "Jemairo heeft de CBS-dataset gevonden en de grafieken in Excel gemaakt, inclusief het uitzoeken van de methodewijziging van het CBS in november 2022. Hij werkt nauwkeurig en legt goed uit wat hij heeft gedaan.", "In sprint 1 ontbraken de bronvermeldingen in zijn tekst; in sprint 2 ging dat veel beter. Tip: schrijf de bronvermelding direct bij elke zin die je uit een bron haalt, ook in een eerste versie."],
    ["Redouan Afkir", "Redouan houdt de code en de bestanden netjes bij en zet besluiten uit de les dezelfde dag in de groep. Het advieshoofdstuk is concreet en sluit aan op ons datavraagstuk uit sprint 1.", "Redouan geeft feedback soms te voorzichtig. Tip: zeg duidelijk wat er anders moet en waarom; de groep kan dat goed hebben."],
    ["Mohamed Badr el Din", "Mohamed zorgt dat het rapport er verzorgd uitziet en in dezelfde stijl is als in sprint 1. Hij zag bij het nalezen dat de leveranciersscores verouderd waren, waardoor we dat konden oplossen.", "Mohamed levert soms op het laatste moment. Tip: houd de interne deadline van twee dagen voor de echte deadline aan, zodat de nalezer ook tijd heeft."],
    ["Joshua Ferreira", "Joshua bewaakt de planning en heeft de bronnenlijst en de CRAAP-beoordeling grotendeels gedaan. Hij structureert het overleg en zorgt dat iedereen aan bod komt.", "Joshua neemt soms te veel werk naar zich toe (bijvoorbeeld de hele CRAAP-bijlage). Tip: verdeel grote taken eerder en vraag om hulp als iets meer dan vier uur kost."],
  ], [1900, 3866, 3866], { firstBold: true, size: 17 }));
  out.push(Caption("Tabel 2. Peer-feedback per groepslid (top en tip)."));

  out.push(H1("4. GenAI-impactevaluatie"));
  out.push(H2("4.1 Onze aanpak"));
  out.push(P("In de samenwerkingsovereenkomst hebben we afgesproken dat generatieve AI (ChatGPT, Claude, Copilot) gebruikt mag worden als hulpmiddel, maar nooit als bron. In sprint 1 gebruikten we GenAI vooral spontaan en individueel: iemand liet een alinea herschrijven of vroeg om uitleg van een begrip. In sprint 2 hebben we het bewuster gedaan en afgesproken waarvoor wel en niet:"));
  out.push(table(["Wel", "Niet"], [
    ["Begrippen laten uitleggen (bijvoorbeeld congestiemanagement, Garanties van Oorsprong, credential stuffing) om daarna gericht in echte bronnen te zoeken", "Feiten of cijfers overnemen zonder bron; GenAI mag nooit de enige bron van een getal zijn"],
    ["Zoektermen bedenken voor de bronnenzoektocht (informatievaardigheden)", "Hele hoofdstukken laten schrijven en overnemen"],
    ["Eigen tekst laten controleren op spelling, zinsbouw en samenhang", "Bronnen laten verzinnen: elke bron is door ons zelf geopend en beoordeeld met CRAAP"],
    ["Hulp bij Excel (welke grafiek past bij de data, hoe je een as een titel geeft) en bij het begrijpen van de CBS-tabel", "Conclusies en adviezen laten bedenken zonder eigen onderbouwing"],
    ["Opzet van tabellen en de structuur van een hoofdstuk bespreken", "De reflectie en peer-feedback laten schrijven"],
  ], [4816, 4816]));
  out.push(Caption("Tabel 3. Afspraken over het gebruik van GenAI in sprint 2."));

  out.push(H2("4.2 Resultaten: wat GenAI heeft opgeleverd"));
  [
    "**Snellere bronnenzoektocht.** Door GenAI eerst te vragen welke organisaties over een onderwerp publiceren (bijvoorbeeld CBS, ACM, Netbeheer Nederland, PBL), konden we gericht naar primaire bronnen zoeken in plaats van naar vergelijkingssites. Dat zie je terug in de CRAAP-bijlage: de kern van het rapport steunt op onafhankelijke bronnen.",
    "**Betere grafiek.** We twijfelden of gas en stroom in één grafiek konden; GenAI legde uit waarom twee aparte grafieken met een eigen as eerlijker zijn. De data zijn handmatig uit StatLine overgenomen en door twee groepsleden gecontroleerd.",
    "**Leesbaarder rapport.** Lange zinnen en herhalingen zijn eruit gehaald. We hebben elke suggestie wel zelf beoordeeld: ongeveer een derde van de voorgestelde wijzigingen hebben we niet overgenomen, omdat de toon te formeel werd of de betekenis verschoof.",
    "**Uitleg van moeilijke begrippen.** Vooral bij de AVG-artikelen en bij de opbouw van de energierekening hielp een uitleg in gewone taal om de bronnen daarna beter te begrijpen.",
  ].forEach((t) => out.push(Bullet(t)));

  out.push(H2("4.3 Wat wel en niet werkte"));
  out.push(P("**Wat werkte:** GenAI als 'sparringpartner' en als redacteur van onze eigen tekst. Ook het laten uitleggen van de kolommen in de CBS-tabel scheelde veel tijd."));
  out.push(P("**Wat niet werkte:** in sprint 1 liet een groepslid GenAI een alinea over Enexis schrijven; daar stonden cijfers in die we nergens konden terugvinden en die we dus moesten schrappen. In sprint 2 vroegen we GenAI naar de duurzaamheidsscores van leveranciers; de genoemde scores bleken uit verschillende jaren te komen. Dat heeft ons geleerd dat GenAI handig is om te weten *waar* je moet zoeken, maar onbetrouwbaar is voor het *wat*. Ook merkten we dat teksten van GenAI op elkaar gaan lijken als iedereen ze gebruikt; daarom hebben we de eindredactie door één persoon laten doen, zodat het rapport één stem heeft."));
  out.push(P("**Risico's die we zien:** afhankelijkheid (zelf minder goed leren schrijven en zoeken), verkeerde feiten die er geloofwaardig uitzien, en privacy: we hebben geen persoonsgegevens of documenten van anderen in GenAI-tools ingevoerd."));

  out.push(H2("4.4 Leerpunten en actieplan voor sprint 3"));
  out.push(table(["Leerpunt", "Actie in sprint 3", "Wie", "Wanneer"], [
    ["GenAI is geen bron", "Elke door GenAI genoemde bron of cijfer wordt zelf opgezocht en krijgt pas een plek in het rapport als de echte bron is gevonden en beoordeeld", "Iedereen", "Doorlopend"],
    ["Transparantie", "We houden in de gedeelde map een logboek bij: welke tool, waarvoor, en wat we hebben overgenomen. Dat logboek is de basis voor de volgende GenAI-evaluatie", "Redouan", "Vanaf week 1"],
    ["Eén stem in het rapport", "Eindredactie door één persoon na de nalees-ronde", "Joshua", "Laatste week"],
    ["Analyse begrijpen", "Een grafiek of analyse die met hulp van GenAI is gemaakt wordt door een ander groepslid uitgelegd in het overleg voordat we die gebruiken (anders begrijpen we onze eigen analyse niet)", "Jemairo en Redouan", "Elk maandagoverleg"],
    ["Zelf eerst denken", "Bij analysevragen eerst zelf een antwoord formuleren en GenAI daarna alleen gebruiken om dat antwoord te toetsen", "Iedereen", "Doorlopend"],
  ], [2000, 4632, 1600, 1400], { firstBold: true, size: 17 }));
  out.push(Caption("Tabel 4. Actieplan GenAI voor sprint 3."));

  out.push(H1("5. Conclusie"));
  out.push(P("De samenwerking in onze groep is in sprint 2 duidelijk beter geworden dan in sprint 1. De inzet was in beide sprints goed, maar in sprint 2 hebben we onze afspraken concreet gemaakt en elkaars werk tussentijds gecontroleerd, waardoor fouten eerder werden gevonden. Het grootste verbeterpunt blijft planning: grote taken moeten eerder worden gesplitst en interne deadlines beter bewaakt. GenAI heeft ons geholpen om sneller goede bronnen te vinden, een betere grafiek te maken en leesbaarder te schrijven, maar heeft ons ook geleerd dat elk feit zelf gecontroleerd moet worden. Met de actiepunten uit paragraaf 2.4 en 4.4 gaan we sprint 3 in."));

  const document = doc({ headerText: "Datalab 1 | Sprint 1 en 2 | Reflectie groep 3", sections: [out] });
  await save(document, OUT + "Datalab1_Sprint2_Reflectie_en_GenAI_evaluatie_Groep3.docx");
})();

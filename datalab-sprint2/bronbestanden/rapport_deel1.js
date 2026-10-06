// Deel 1: hoofdstukken 1 t/m 3
const L = require("./lib.js");
const { P, H1, H2, H3, Bullet, Num, Caption, Break, Empty, Conclusie, table, image } = L;
const fs = require("fs");

module.exports = function deel1() {
  const out = [];

  // ---------- 1. Inleiding
  out.push(H1("1. Inleiding"));
  out.push(P("In sprint 1 waren wij de directie van Enexis Netbeheer en bedachten we een datavraagstuk voor een data-consultant. In sprint 2 is het andersom: nu zijn wij zelf die consultant. Voordat we iets met de data van Enexis kunnen, moeten we eerst snappen in wat voor wereld Enexis werkt. Dat is stap 1 van de data science life-cycle: *business understanding*. Zonder die kennis zie je niet of een uitkomst klopt. Vergelijk het met een hartslag van 2000 slagen per minuut: alleen als je iets van gezondheid weet, zie je meteen dat dat niet kan."));
  out.push(P("De opdracht voor deze sprint is: **\"Onderzoek de Nederlandse energiemarkt\"**. Om deze hoofdvraag te beantwoorden hebben we de volgende deelvragen uitgewerkt:"));
  [
    "Welke netbeheerders en leveranciers zijn er, en wat doen zij precies?",
    "Hoe is de prijs van gas en elektriciteit opgebouwd en hoe verliep die prijs per maand in 2022?",
    "In hoeverre is er sprake van over- en ondercapaciteit op het net, waar speelt dit en hoe gaan netbeheerders en leveranciers daarmee om?",
    "Welke duurzaamheidsontwikkelingen zijn er, wat doen drie leveranciers aan duurzaamheid en in hoeverre is Nederland van het gas af?",
    "Wat kan Enexis doen op het gebied van duurzaamheid en hoe kan data daarbij helpen?",
    "Welke privacy-incidenten zijn er in de energiesector geweest en hoe is de AVG daarop van toepassing?",
  ].forEach((t) => out.push(Num(t)));
  out.push(P("**Aanpak.** We hebben de dingen uit de workshop informatievaardigheden echt gebruikt. We zochten met gerichte zoektermen eerst naar primaire bronnen (CBS, ACM, Rijksoverheid, netbeheerders, leveranciers) en pakten nieuws- en sectorbronnen alleen als aanvulling erbij. Alle bronnen zijn in de tekst en in de literatuurlijst vermeld volgens APA en beoordeeld met de CRAAP-methode (bijlage A). De prijsgrafiek hebben we in Excel gemaakt op basis van een CBS-dataset; het Excel-bestand leveren we mee. In bijlage B staat de ingevulde Checklist Rapporteren.", { spacing: { before: 120 } }));
  out.push(P("**Leeswijzer.** Hoofdstuk 2 beschrijft de netbeheerders en leveranciers. Hoofdstuk 3 gaat over de prijsopbouw, het prijsverloop in 2022 en de capaciteit van het net. Hoofdstuk 4 behandelt de duurzaamheidsontwikkelingen en de doelstellingen voor \"Nederland van het gas af\". Hoofdstuk 5 past dit toe op onze organisatie Enexis: een advies, de rol van data, de privacy-incidenten en onze vragen voor de gastspreker. Hoofdstuk 6 bevat de conclusies."));

  // ---------- 2. Netbeheerders en leveranciers
  out.push(H1("2. Netbeheerders en leveranciers"));
  out.push(P("De Nederlandse energiemarkt is sinds de liberalisering in tweeën geknipt. Netbeheerders zijn van de kabels en leidingen en mogen geen energie verkopen. Leveranciers verkopen de energie en mogen geen netten hebben. In dit hoofdstuk kijken we welke partijen er zijn en wat ze precies doen."));

  out.push(H2("2.1 Welke netbeheerders zijn er?"));
  out.push(P("Nederland heeft twee landelijke netbeheerders en zes regionale netbeheerders. TenneT beheert het landelijke hoogspanningsnet voor elektriciteit en Gasunie Transport Services (GTS) het landelijke gastransportnet. De regionale netbeheerders beheren de midden- en laagspanningsnetten en de regionale gasnetten en brengen de energie tot aan de meterkast (Energyzero, z.d.). Per gebied is er precies één regionale netbeheerder, dus als klant heb je daar niks te kiezen."));
  out.push(table(
    ["Netbeheerder", "Soort", "Werkgebied"],
    [
      ["TenneT", "Landelijk, elektriciteit", "Hoogspanningsnet in heel Nederland (en delen van Duitsland)"],
      ["Gasunie Transport Services (GTS)", "Landelijk, gas", "Landelijk gastransportnet"],
      ["Liander", "Regionaal", "Friesland, Noord-Holland, Amsterdam, Zuid-Holland (deels), Gelderland en Flevoland"],
      ["Enexis Netbeheer", "Regionaal", "Groningen, Drenthe, Overijssel, Noord-Brabant en Limburg"],
      ["Stedin", "Regionaal", "Utrecht, Zeeland, een deel van Zuid-Holland, Kennemerland, Amstelland en delen van Noordoost-Friesland"],
      ["Westland Infra", "Regionaal", "Westland en Midden-Delfland"],
      ["Coteq Netbeheer", "Regionaal", "Negen gemeenten in Overijssel"],
      ["Rendo", "Regionaal", "Negen gemeenten in Overijssel en Drenthe"],
    ],
    [2600, 2000, 5032], { firstBold: true }));
  out.push(Caption("Tabel 1. Netbeheerders in Nederland. Bron: Energyzero (z.d.)."));
  out.push(P("Stedin, Liander en Enexis zijn de drie grootste regionale netbeheerders met de meeste aansluitingen (Energyzero, z.d.). Enexis, onze organisatie uit sprint 1, is daarmee één van de zes regionale netbeheerders en verzorgt ongeveer 3 miljoen huishoudens en bedrijven (Enexis Holding N.V., 2026)."));

  out.push(H2("2.2 Welke leveranciers zijn er?"));
  out.push(P("Een energieleverancier die gas of elektriciteit levert aan consumenten en andere kleinverbruikers heeft een vergunning van de Autoriteit Consument & Markt (ACM) nodig (ACM, z.d.). Op de lijst van de ACM staan ruim vijftig leveranciers met zo'n vergunning (ACM, z.d.). Er zijn dus veel meer leveranciers dan netbeheerders, en hier kies je als klant wél zelf bij wie je je energie koopt."));
  out.push(P("De markt wordt gedomineerd door drie grote partijen. Vattenfall heeft ongeveer 1,7 miljoen klanten, Essent 1,5 miljoen en Eneco 1,3 miljoen; Budget Energie volgt met ongeveer 750.000 klanten (Keuze.nl, z.d.). Daarnaast zijn er veel kleinere leveranciers, zoals Greenchoice, Vandebron, Pure Energie, Frank Energie en Energie VanOns, die zich vaak onderscheiden met groene stroom of dynamische contracten."));
  out.push(table(
    ["Leverancier", "Moederbedrijf", "Klanten (circa)", "Kenmerk"],
    [
      ["Vattenfall", "Vattenfall AB (Zweedse staat)", "1,7 miljoen", "Grootste leverancier; voorheen Nuon"],
      ["Essent", "E.ON", "1,5 miljoen", "Ook merk Energiedirect"],
      ["Eneco", "Mitsubishi / Chubu", "1,3 miljoen", "Voorheen deels gemeentelijk"],
      ["Budget Energie (Budget Thuis)", "Budget Thuis", "750.000", "Prijsvechter"],
      ["Greenchoice, Vandebron, Pure Energie e.a.", "Diverse", "Kleiner", "Profileren zich op duurzaamheid"],
    ],
    [2500, 2400, 1700, 3032], { firstBold: true }));
  out.push(Caption("Tabel 2. De grootste energieleveranciers van Nederland. Bron: Keuze.nl (z.d.)."));

  out.push(H2("2.3 Wat doet een netbeheerder en wat doet een leverancier?"));
  out.push(P("De netbeheerder regelt het transport. Hij legt kabels en leidingen aan, onderhoudt en vervangt ze, sluit nieuwe huizen en bedrijven aan, lost storingen op, beheert de slimme meters en verzwaart het net als het vol raakt. Omdat een netbeheerder in zijn gebied een monopolie heeft, staan zijn taken in de wet en kijkt de ACM mee naar de tarieven en de kwaliteit (Enexis Holding N.V., 2026)."));
  out.push(P("De leverancier koopt energie in op de groothandelsmarkt (of maakt die zelf) en verkoopt die aan klanten. De leverancier bepaalt het leveringstarief, stuurt de energierekening, int daarbij ook de netbeheerkosten en de belastingen voor de netbeheerder en de overheid, en doet de klantenservice. Je kiest zelf je leverancier en kunt overstappen wanneer je wilt; je netbeheerder blijft dan gewoon dezelfde."));
  out.push(table(
    ["", "Netbeheerder", "Leverancier"],
    [
      ["Wat levert hij?", "Transport van gas en elektriciteit via kabels en leidingen", "De energie zelf (gas en elektriciteit)"],
      ["Keuze klant?", "Nee, één per gebied (monopolie)", "Ja, vrije keuze en overstappen mogelijk"],
      ["Toezicht", "ACM stelt de tarieven vast (gereguleerd)", "ACM-vergunning; tarieven zijn vrij maar moeten redelijk zijn"],
      ["Voorbeelden", "TenneT, GTS, Enexis, Liander, Stedin", "Vattenfall, Essent, Eneco, Greenchoice, Pure Energie"],
      ["Taken", "Aansluiten, onderhouden, storingen oplossen, verzwaren, meters beheren", "Inkopen, verkopen, factureren, klantenservice, duurzame producten"],
      ["Inkomsten", "Vaste netbeheerkosten per aansluiting", "Leveringstarief per kWh en per m³ plus vaste leveringskosten"],
    ],
    [2000, 3816, 3816], { firstBold: true }));
  out.push(Caption("Tabel 3. Verschil tussen netbeheerder en leverancier. Bronnen: ACM (z.d.); Enexis Holding N.V. (2026)."));

  // ---------- 3. Gasprijs en capaciteit
  out.push(H1("3. Gasprijs en capaciteit"));
  out.push(P("In dit hoofdstuk gaat het over de prijs van energie en over de ruimte op het net. Eerst leggen we uit waar de energierekening uit bestaat. Daarna laten we zien hoe de gas- en stroomprijs in 2022 per maand liep en waardoor dat kwam. Tot slot kijken we naar het volle net: waar is te weinig ruimte, waar juist te veel stroom, en wat doen netbeheerders en leveranciers daaraan."));

  out.push(H2("3.1 Hoe is de prijs van gas en elektriciteit opgebouwd?"));
  out.push(P("De energierekening van een huishouden bestaat uit vier onderdelen (Selectra, z.d.):"));
  out.push(Num("**Leveringskosten.** Dit is het deel dat naar de leverancier gaat. Het bestaat uit een variabel leveringstarief per kWh en per m³ (de inkoopprijs op de groothandelsmarkt plus de marge van de leverancier) en vaste leveringskosten per jaar. Dit onderdeel beweegt mee met de markt.", "nums2"));
  out.push(Num("**Netbeheerkosten.** Een vast bedrag per jaar voor het transport en onderhoud van het net. De hoogte hangt af van de regio en de netbeheerder en wordt door de ACM vastgesteld. Je kiest dit onderdeel dus niet zelf.", "nums2"));
  out.push(Num("**Energiebelasting.** Een belasting per kWh en per m³ die de overheid heft. Hiervan gaat de belastingvermindering af: een vast bedrag per aansluiting dat ieder huishouden terugkrijgt. In 2026 is de energiebelasting € 0,11085 per kWh en € 0,72680 per m³ (incl. btw, eerste schijf) en de belastingvermindering € 628,96 per jaar (Selectra, z.d.).", "nums2"));
  out.push(Num("**Btw.** Over het totaal van levering, netbeheer en energiebelasting wordt 21% btw gerekend.", "nums2"));
  out.push(P("Grofweg gaat je geld dus naar drie partijen: de leverancier (levering), de netbeheerder (transport) en de overheid (energiebelasting en btw) (Selectra, z.d.). Bij gas is het belastingdeel best groot; de overheid maakt gas expres duurder dan stroom, zodat mensen eerder elektrisch gaan verwarmen. Voor Enexis telt alleen het tweede deel: de netbeheerkosten zijn het enige waar een netbeheerder aan verdient.", { spacing: { before: 120 } }));

  out.push(H2("3.2 Verloop van de gas- en elektriciteitsprijs in 2022"));
  out.push(P("Voor het prijsverloop hebben we de dataset *Gemiddelde energietarieven voor consumenten, 2018-2023* (StatLine-tabel 84672NED) van het CBS gebruikt. Deze tabel bevat per maand het gemiddelde variabele leveringstarief van nieuwe variabele contracten, inclusief btw (CBS, 2023a). We hebben de twaalf maandwaarden van 2022 in Excel gezet en daar twee lijngrafieken van gemaakt (figuur 1). Gas gaat per m³ en stroom per kWh, dus die staan elk in een eigen grafiek; in één grafiek zou je appels met peren vergelijken. Het Excel-bestand (*Energieprijzen_2022_CBS.xlsx*) leveren we mee bij het rapport."));
  out.push(image(fs.readFileSync(__dirname + "/figuur1_excel.png"), 5.6, 5.42));
  out.push(Caption("Figuur 1. Gemiddeld variabel leveringstarief voor gas (euro per m³) en elektriciteit (euro per kWh) per maand in 2022, inclusief btw. Eigen grafieken in Excel op basis van CBS (2023a)."));
  out.push(table(
    ["Maand 2022", "Gas (€/m³)", "Elektriciteit (€/kWh)", "Maand 2022", "Gas (€/m³)", "Elektriciteit (€/kWh)"],
    [
      ["januari", "1,1956", "0,3169", "juli", "1,5908", "0,4187"],
      ["februari", "1,1247", "0,2966", "augustus", "2,1147", "0,5028"],
      ["maart", "1,8451", "0,4814", "september", "2,7706", "0,6439"],
      ["april", "1,6844", "0,4363", "oktober", "2,7830", "0,6588"],
      ["mei", "1,4220", "0,3613", "november", "1,8201", "0,5266"],
      ["juni", "1,2181", "0,3342", "december", "1,8201", "0,5200"],
    ],
    [1600, 1300, 1916, 1600, 1300, 1916]));
  out.push(Caption("Tabel 4. De gebruikte maandwaarden. Bron: CBS (2023a). Vanaf november 2022 gebruikt het CBS een nieuwe meetmethode, waardoor de laatste twee maanden niet volledig vergelijkbaar zijn met de maanden ervoor."));

  out.push(H2("3.3 Wat zien we en wat zijn de oorzaken van de schommelingen?"));
  out.push(P("**Wat we zien.** Gas en stroom lopen in 2022 bijna precies gelijk op. Allebei beginnen ze het jaar al hoog, zakken in februari een beetje, schieten in maart omhoog, zakken weer tot juni en lopen daarna op naar een piek in september en oktober. Gas kost in oktober € 2,78 per m³, meer dan twee keer zoveel als in januari (€ 1,20). Elektriciteit stijgt van € 0,32 naar € 0,66 per kWh. In november en december dalen beide tarieven weer, maar ze blijven ver boven het niveau van begin 2022."));
  out.push(P("Dat stroom precies hetzelfde doet als gas is geen toeval. In Nederland bepalen gascentrales vaak de stroomprijs, omdat zij de laatste (en duurste) centrale zijn die aan moet om aan de vraag te voldoen. Wordt gas duur, dan wordt stroom dus bijna meteen ook duur."));
  out.push(P("**Oorzaken.** De schommelingen hebben vooral geopolitieke en fiscale oorzaken:"));
  [
    "**Het jaar begon al hoog.** In de tweede helft van 2021 waren de tarieven al flink gestegen, dus januari 2022 begon al duur (CBS, 2023a). Het kabinet verlaagde daarom per 1 januari 2022 de energiebelasting en verhoogde de belastingvermindering.",
    "**24 februari: Russische inval in Oekraïne.** De gasprijs schoot direct omhoog uit angst dat Rusland de gaskraan zou dichtdraaien, en Duitsland schortte de goedkeuring van Nord Stream 2 op. Dit verklaart de piek in maart (Pure Energie, z.d.-a).",
    "**Voorjaar: tijdelijke rust.** Van april tot juni daalden de tarieven weer iets, omdat de winter voorbij was en de gasvoorraden werden gevuld.",
    "**Zomer: Nord Stream 1 steeds verder dicht.** In de zomer draaide Rusland de gaskraan via Nord Stream 1 steeds verder dicht en eind augustus ging de leiding helemaal dicht voor \"onderhoud\" (Pure Energie, z.d.-a). Europa moest in korte tijd de gasopslagen vullen zonder Russisch gas. Door die enorme vraag piekte de groothandelsprijs eind augustus.",
    "**1 juli: btw van 21% naar 9%.** Om huishoudens te ontzien verlaagde het kabinet de btw op energie tijdelijk van 1 juli tot en met 31 december 2022 (Consumentenbond, 2022). Omdat de tarieven in figuur 1 inclusief btw zijn, dempt dit de stijging vanaf juli. Zonder deze maatregel was de piek nog hoger geweest.",
    "**September en oktober: hoogste consumententarieven.** Leveranciers geven de groothandelsprijs met vertraging door aan klanten. De piek op de groothandelsmarkt (augustus) zien we daarom pas in september en oktober terug in de consumententarieven (CBS, 2023b).",
    "**November en december: daling.** De groothandelsprijzen daalden door volle gasopslagen, een zachte herfst en minder vraag. Daarnaast kreeg ieder huishouden in november en december € 190 korting en kondigde het kabinet voor 2023 een prijsplafond aan van € 1,45 per m³ en € 0,40 per kWh (CBS, 2023b). Het CBS stapte in november ook over op een nieuwe meetmethode (CBS, 2023a), wat mede verklaart waarom november en december exact gelijk zijn.",
  ].forEach((t) => out.push(Bullet(t)));
  out.push(P("Kort gezegd: de gasprijs van 2022 draaide om Russisch gas en de angst dat het op zou raken, en de stroomprijs ging daar gewoon in mee. De overheid heeft met de btw-verlaging, lagere energiebelasting, de € 190 korting en het prijsplafond de klap voor huishoudens kleiner gemaakt, maar niet weggehaald.", { spacing: { before: 120 } }));

  out.push(H2("3.4 Over- en ondercapaciteit op het net"));
  out.push(P("Hoeveel stroom er wordt gemaakt en hoeveel er wordt gebruikt loopt niet altijd gelijk, en een kabel kan maar een bepaalde hoeveelheid stroom tegelijk aan. Daardoor heb je twee problemen tegelijk: te weinig ruimte op het net (netcongestie) en te veel stroom op hetzelfde moment (overcapaciteit)."));
  out.push(H3("Ondercapaciteit: het net zit vol"));
  out.push(P("Door de energietransitie willen bedrijven steeds zwaardere aansluitingen (warmtepompen, elektrische auto's, datacenters, elektrische ketels) en willen zonne- en windparken steeds meer stroom kwijt op het net. Het net groeit daar niet snel genoeg in mee. Eind 2025 wachtten 15.014 bedrijven op een nieuwe of zwaardere aansluiting voor afname, samen goed voor 9.305 MW, en wachtten 8.687 bedrijven op capaciteit om terug te kunnen leveren, samen 5.027 MW. De wachtlijst voor afname groeide in een jaar met 26% (Netbeheer Nederland, z.d.)."));
  out.push(P("**Waar speelt dit?** Netcongestie speelt inmiddels in vrijwel heel Nederland, maar het begon in de regio's met veel zonneparken en weinig bevolking: Groningen, Drenthe en Overijssel voor teruglevering, en later Limburg en Noord-Brabant voor afname. Dat zijn precies de vijf provincies van Enexis. In Brabant en Limburg is de transportcapaciteit voor grootverbruikers grotendeels vergeven en verdrievoudigde het aantal klanten op de wachtlijst in korte tijd (Solar Magazine, 2026b). In 2025 en 2026 kondigde Enexis nieuwe knelpunten aan in Limburg (station Heer) en Drenthe (station Bargermeer) en werd in Groningen transportschaarste afgekondigd voor negen netdelen (Solar Magazine, 2026b). Ook in Gelderland, Flevoland en Utrecht (gebieden van Liander en Stedin) staan veel gebieden op rood op de landelijke capaciteitskaart."));
  out.push(H3("Overcapaciteit: te veel stroom op zonnige dagen"));
  out.push(P("Het omgekeerde probleem is er ook. Op zonnige middagen maken alle zonnepanelen en windparken samen meer stroom dan er op dat moment wordt gebruikt. De marktprijs wordt dan negatief: producenten moeten betalen om stroom kwijt te kunnen. Nederland had 85 uren met negatieve stroomprijzen in 2022, 316 in 2023, 458 in 2024 en een record van 581 uren in 2025, ongeveer 7% van het jaar (Solar Magazine, 2026a). Op die momenten kan het overschot niet volledig naar het buitenland worden geëxporteerd en moeten opwekinstallaties worden teruggeschakeld. Overcapaciteit betekent dus niet dat er te veel kabels liggen, maar dat er te veel stroom op hetzelfde moment wordt gemaakt, vooral in het voorjaar en de zomer tussen 11.00 en 16.00 uur."));
  out.push(H3("Hoe gaan netbeheerders en leveranciers hiermee om?"));
  out.push(table(
    ["Maatregel", "Wie", "Wat houdt het in"],
    [
      ["Netverzwaring", "Netbeheerders", "Enexis investeerde in 2025 € 1,9 miljard en bouwde 1.260 MVA aan nieuwe netcapaciteit; de komende drie jaar investeert het € 7 miljard, de grootste uitbreiding van het regionale net ooit (Enexis Groep, 2025, 2026). Toch kan het net de vraag niet bijbenen."],
      ["Congestiemanagement", "Netbeheerders", "Bedrijven krijgen een vergoeding om op drukke momenten minder af te nemen of terug te leveren. Enexis speelde zo in 2025 542 MW flexibele capaciteit vrij, vergelijkbaar met het verbruik van Eindhoven (Enexis Groep, 2026)."],
      ["Capaciteitsbeperkingscontracten en tijdsgebonden contracten", "Netbeheerders", "Klanten krijgen alleen capaciteit buiten de piekuren of beloven een maximum. Landelijk groeide het aantal capaciteitsbeperkingscontracten voor afname van 18 naar 243 in een jaar (Netbeheer Nederland, z.d.)."],
      ["Batterijopslag", "Netbeheerders en bedrijven", "Batterijen slaan het middagoverschot op en leveren het 's avonds terug. Het aantal opslagcontracten bij netbeheerders verdubbelde naar 237 (Netbeheer Nederland, z.d.)."],
      ["Terugschakelen (curtailment) van zon en wind", "Netbeheerders en producenten", "Bij negatieve prijzen en bij een vol net worden zonne- en windparken (deels) teruggeschakeld, zodat het overschot niet op het net komt (Solar Magazine, 2026a)."],
      ["Dynamische contracten en terugleverkosten", "Leveranciers", "Leveranciers geven uurprijzen door aan klanten (dynamisch contract) zodat klanten verbruik verschuiven naar goedkope uren, en rekenen terugleverkosten aan zonnepaneelbezitters om het middagoverschot te ontmoedigen (Solar Magazine, 2026a)."],
      ["Wachtrij en capaciteitskaart", "Netbeheerders", "Aanvragen komen in een wachtrij per voedingsgebied. Op de landelijke capaciteitskaart kunnen bedrijven vooraf zien waar nog ruimte is, zodat zij hun locatiekeuze kunnen aanpassen (Netbeheer Nederland, z.d.)."],
    ],
    [2300, 1800, 5532], { firstBold: true }));
  out.push(Caption("Tabel 5. Maatregelen tegen over- en ondercapaciteit. Bronnen: Enexis Groep (2025, 2026); Netbeheer Nederland (z.d.); Solar Magazine (2026a)."));
  out.push(P("Voor Enexis betekent dit dat het probleem de komende jaren niet alleen met extra kabels wordt opgelost. Enexis zegt zelf dat ondanks de recordinvesteringen \"wachtlijsten en volle stroomnetten voorlopig de realiteit blijven\" en dat de toekomst om meer flexibele oplossingen vraagt (Enexis Groep, 2026). Data over wanneer en waar het net vol zit, is daarvoor de sleutel; daar komen we in hoofdstuk 5 op terug."));

  return out;
};

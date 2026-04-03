import { API_BASE_URL } from "../config.js";

const KATEGORIEN = [
  "Bonus-Hymne",
  "Jährlich",
  "Geburt Christi",
  "Große Fastenzeit",
  "Das Kreuzfest",
  "Karwoche",
  "Al Khamasin (50 hl. Tage)",
  "Apostelfastenzeit",
  "Marienfastenzeit",
  "Koptisches Neujahr (Neiruzfest)",
  "Kiahk"
];


const KATEGORIE_DESIGNS = {
  "Bonus-Hymne": {
    accent: "#b8871c",
    accentSoft: "rgba(184, 135, 28, 0.16)",
    button: "#b8871c",
    buttonHover: "#946d13",
    count: "#9a6b10",
    contentBg: "#fffaf0",
    glow: "rgba(184, 135, 28, 0.20)",
    iconSvg: "../images/lehrplan/bonus-Hymne.svg"
  },
  "Jährlich": {
    accent: "#2c5f8a",
    accentSoft: "rgba(44, 95, 138, 0.15)",
    button: "#2c5f8a",
    buttonHover: "#224968",
    count: "#244f74",
    contentBg: "#f6faff",
    glow: "rgba(44, 95, 138, 0.20)",
    iconSvg: "../images/lehrplan/jährlich.svg" 
  },
  "Geburt Christi": {
    accent: "#cf9c1f",
    accentSoft: "rgba(207, 156, 31, 0.16)",
    button: "#cf9c1f",
    buttonHover: "#aa7f17",
    count: "#9f7410",
    contentBg: "#fff9ed",
    glow: "rgba(207, 156, 31, 0.20)",
    iconSvg: "../images/lehrplan/geburt-christi.svg"
  },
  "Große Fastenzeit": {
    accent: "#8c6b3f",
    accentSoft: "rgba(140, 107, 63, 0.15)",
    button: "#8c6b3f",
    buttonHover: "#6e5331",
    count: "#6e5331",
    contentBg: "#fcf9f3",
    glow: "rgba(140, 107, 63, 0.20)",
    iconSvg: "../images/lehrplan/große-fastenzeit.svg"
  },
  "Das Kreuzfest": {
    accent: "#7a3eb1",
    accentSoft: "rgba(122, 62, 177, 0.16)",
    button: "#7a3eb1",
    buttonHover: "#5f2f8a",
    count: "#642f95",
    contentBg: "#faf5ff",
    glow: "rgba(122, 62, 177, 0.22)",
    iconSvg: "../images/lehrplan/das-kreuzfest.svg"
  },
  "Karwoche": {
    accent: "#7a1f2a",
    accentSoft: "rgba(122, 31, 42, 0.16)",
    button: "#7a1f2a",
    buttonHover: "#5f1820",
    count: "#6a1823",
    contentBg: "#fff6f7",
    glow: "rgba(122, 31, 42, 0.22)",
    iconSvg: "../images/lehrplan/karwoche.svg"
  },
  "Al Khamasin (50 hl. Tage)": {
    accent: "#d6a31d",
    accentSoft: "rgba(214, 163, 29, 0.16)",
    button: "#d6a31d",
    buttonHover: "#ae8417",
    count: "#9e7711",
    contentBg: "#fffcef",
    glow: "rgba(214, 163, 29, 0.20)",
    iconSvg: "../images/lehrplan/al-khamasin.svg"
  },
  "Apostelfastenzeit": {
    accent: "#1f6e78",
    accentSoft: "rgba(31, 110, 120, 0.16)",
    button: "#1f6e78",
    buttonHover: "#17535a",
    count: "#17535a",
    contentBg: "#f2fbfc",
    glow: "rgba(31, 110, 120, 0.22)",
    iconSvg: "../images/lehrplan/apostelfastenzeit.svg"
  },
  "Marienfastenzeit": {
    accent: "#4f86c6",
    accentSoft: "rgba(79, 134, 198, 0.16)",
    button: "#4f86c6",
    buttonHover: "#3c6ea8",
    count: "#3a69a0",
    contentBg: "#f4f9ff",
    glow: "rgba(79, 134, 198, 0.22)",
    iconSvg: "../images/lehrplan/mariafastenzeit.svg"
  },
  "Koptisches Neujahr (Neiruzfest)": {
    accent: "#c13c3c",
    accentSoft: "rgba(193, 60, 60, 0.16)",
    button: "#c13c3c",
    buttonHover: "#9c2f2f",
    count: "#972c2c",
    contentBg: "#fff6f6",
    glow: "rgba(193, 60, 60, 0.22)",
    iconSvg: "../images/lehrplan/koptisches-neujahr.svg"
  },
  "Kiahk": {
    accent: "#355b9d",
    accentSoft: "rgba(53, 91, 157, 0.16)",
    button: "#355b9d",
    buttonHover: "#2a477b",
    count: "#2c4c86",
    contentBg: "#f5f8ff",
    glow: "rgba(53, 91, 157, 0.22)",
    iconSvg: "../images/lehrplan/kiahk.svg"
  }
};

function svgZuCssUrl(svg) {
  return `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}")`;
}

function holeKategorieDesign(kategorie) {
  return KATEGORIE_DESIGNS[kategorie] || {
    accent: "#2563eb",
    accentSoft: "rgba(37, 99, 235, 0.14)",
    button: "#16a34a",
    buttonHover: "#15803d",
    count: "#2563eb",
    contentBg: "#f8fafc",
    glow: "rgba(37, 99, 235, 0.22)",
    icon: "bi-folder-fill"
  };
}

function holeKategorieIllustration(kategorie) {
  switch (kategorie) {
    case "Bonus-Hymne":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <circle cx='410' cy='128' r='90' fill='#f1d08b' fill-opacity='.12'/>
          <rect x='325' y='96' width='118' height='72' rx='12' fill='#c79d37' fill-opacity='.18'/>
          <path d='M384 92l10 23 25 3-18 16 5 25-22-12-22 12 5-25-18-16 25-3z' fill='#d7a82a' fill-opacity='.32'/>
          <path d='M446 72l6 14 15 2-11 9 3 15-13-7-13 7 3-15-11-9 15-2z' fill='#d7a82a' fill-opacity='.24'/>
          <path d='M333 183c32-16 88-18 131-5' stroke='#c79d37' stroke-opacity='.24' stroke-width='8' stroke-linecap='round' fill='none'/>
        </svg>
      `);

    case "Jährlich":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <path d='M322 180c0-56 37-98 90-98s90 42 90 98' fill='none' stroke='#2c5f8a' stroke-opacity='.20' stroke-width='16' stroke-linecap='round'/>
          <path d='M352 180v-62c0-12 9-21 21-21h78c12 0 21 9 21 21v62' fill='#2c5f8a' fill-opacity='.08'/>
          <path d='M406 82v38' stroke='#b9913a' stroke-opacity='.25' stroke-width='10' stroke-linecap='round'/>
          <path d='M380 126h52' stroke='#b9913a' stroke-opacity='.22' stroke-width='10' stroke-linecap='round'/>
          <path d='M448 86c14 20 19 43 14 69' stroke='#7d8fa3' stroke-opacity='.24' stroke-width='8' stroke-linecap='round' fill='none'/>
        </svg>
      `);

    case "Geburt Christi":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <circle cx='409' cy='94' r='72' fill='#f2d38e' fill-opacity='.12'/>
          <path d='M410 42l10 24 26 3-19 16 5 25-22-12-22 12 5-25-19-16 26-3z' fill='#d7a82a' fill-opacity='.34'/>
          <path d='M350 177c16-28 36-42 60-42s44 14 60 42' fill='none' stroke='#8f6a41' stroke-opacity='.26' stroke-width='12' stroke-linecap='round'/>
          <path d='M372 162h76' stroke='#8f6a41' stroke-opacity='.22' stroke-width='10' stroke-linecap='round'/>
          <path d='M330 196c38-20 117-21 160 0' stroke='#cf9c1f' stroke-opacity='.16' stroke-width='8' stroke-linecap='round' fill='none'/>
        </svg>
      `);

    case "Große Fastenzeit":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <path d='M305 194c28-36 57-55 92-55 27 0 50 10 78 31 12 9 23 16 32 24H305z' fill='#8c6b3f' fill-opacity='.11'/>
          <path d='M324 194c20-28 46-47 73-47 18 0 35 7 54 21 9 7 18 13 25 20H324z' fill='#b08d61' fill-opacity='.16'/>
          <path d='M382 116v42' stroke='#6e5331' stroke-opacity='.26' stroke-width='8' stroke-linecap='round'/>
          <path d='M367 131h30' stroke='#6e5331' stroke-opacity='.26' stroke-width='8' stroke-linecap='round'/>
          <path d='M420 194c-14-15-28-24-45-31' stroke='#8c6b3f' stroke-opacity='.20' stroke-width='7' stroke-linecap='round' fill='none'/>
        </svg>
      `);

    case "Das Kreuzfest":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <circle cx='411' cy='126' r='82' fill='#c6a2e9' fill-opacity='.10'/>
          <path d='M408 68v118' stroke='#7a3eb1' stroke-opacity='.30' stroke-width='16' stroke-linecap='round'/>
          <path d='M362 116h92' stroke='#7a3eb1' stroke-opacity='.30' stroke-width='16' stroke-linecap='round'/>
          <path d='M408 53l6 11 13 2-9 8 2 13-12-6-12 6 2-13-9-8 13-2z' fill='#d9b65e' fill-opacity='.34'/>
          <path d='M330 126h36M454 126h36M408 204v22' stroke='#d9b65e' stroke-opacity='.22' stroke-width='7' stroke-linecap='round'/>
        </svg>
      `);

    case "Karwoche":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <circle cx='410' cy='128' r='84' fill='#7a1f2a' fill-opacity='.08'/>
          <path d='M365 88c18-24 72-28 94 0' fill='none' stroke='#7a1f2a' stroke-opacity='.30' stroke-width='8' stroke-linecap='round'/>
          <path d='M370 95l10-12M391 88l12-15M417 88l13-15M442 93l12-13' stroke='#7a1f2a' stroke-opacity='.28' stroke-width='6' stroke-linecap='round'/>
          <path d='M410 104v86' stroke='#5c1520' stroke-opacity='.30' stroke-width='12' stroke-linecap='round'/>
          <path d='M374 138h72' stroke='#5c1520' stroke-opacity='.30' stroke-width='12' stroke-linecap='round'/>
          <path d='M452 176c0 9-6 17-14 17-9 0-14-8-14-17 0-7 5-13 14-21 9 8 14 14 14 21z' fill='#a61e2b' fill-opacity='.22'/>
        </svg>
      `);

    case "Al Khamasin (50 hl. Tage)":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <circle cx='413' cy='112' r='58' fill='#f0d481' fill-opacity='.20'/>
          <path d='M413 28v22M413 174v22M329 112h22M475 112h22M353 52l16 16M457 156l16 16M353 172l16-16M457 68l16-16' stroke='#d6a31d' stroke-opacity='.28' stroke-width='8' stroke-linecap='round'/>
          <path d='M352 186c13-28 30-41 61-41s48 13 61 41' fill='#d6a31d' fill-opacity='.10'/>
          <path d='M382 186v-36h62v36' fill='none' stroke='#d6a31d' stroke-opacity='.24' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/>
        </svg>
      `);

    case "Apostelfastenzeit":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <path d='M332 174c19 9 38 13 58 13 35 0 64-11 96-31-10 25-39 42-85 42-27 0-50-7-69-24z' fill='#1f6e78' fill-opacity='.18'/>
          <path d='M352 154l55-42 57 42' fill='none' stroke='#1f6e78' stroke-opacity='.28' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/>
          <path d='M407 112v52' stroke='#8e5f28' stroke-opacity='.24' stroke-width='8' stroke-linecap='round'/>
          <path d='M432 78c9 8 14 17 14 27-12-2-22-8-28-18 4-5 8-8 14-9z' fill='#d57b1f' fill-opacity='.24'/>
          <path d='M338 205c28-10 54-14 79-14 29 0 55 5 78 14' stroke='#1f6e78' stroke-opacity='.18' stroke-width='7' stroke-linecap='round' fill='none'/>
        </svg>
      `);

    case "Marienfastenzeit":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <circle cx='410' cy='100' r='66' fill='#9cc0ea' fill-opacity='.12'/>
          <path d='M410 67c20 21 28 46 24 74-16-8-29-21-39-39-10 18-23 31-39 39-4-28 4-53 24-74 10 10 19 15 15 15s5-5 15-15z' fill='#4f86c6' fill-opacity='.18'/>
          <path d='M410 44l6 14 15 2-11 9 3 15-13-7-13 7 3-15-11-9 15-2z' fill='#d7bd70' fill-opacity='.34'/>
          <path d='M367 180c23-17 51-26 84-26' stroke='#4f86c6' stroke-opacity='.20' stroke-width='8' stroke-linecap='round' fill='none'/>
        </svg>
      `);

    case "Koptisches Neujahr (Neiruzfest)":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <path d='M359 96l14 24h72l14-24-22-14-28 17-28-17z' fill='#c13c3c' fill-opacity='.22'/>
          <path d='M409 120v58' stroke='#c13c3c' stroke-opacity='.24' stroke-width='10' stroke-linecap='round'/>
          <path d='M447 150c12 15 18 31 17 49-17-7-31-21-41-39' fill='none' stroke='#5f9c4b' stroke-opacity='.24' stroke-width='8' stroke-linecap='round'/>
          <path d='M369 186c20-6 43-9 67-9 21 0 42 3 64 9' stroke='#d2a93c' stroke-opacity='.24' stroke-width='8' stroke-linecap='round' fill='none'/>
          <circle cx='409' cy='68' r='20' fill='#d2a93c' fill-opacity='.18'/>
        </svg>
      `);

    case "Kiahk":
      return svgZuCssUrl(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 260'>
          <circle cx='430' cy='82' r='32' fill='#9db5e8' fill-opacity='.18'/>
          <circle cx='442' cy='76' r='32' fill='white' fill-opacity='.90'/>
          <path d='M372 146c0-17 14-31 31-31s31 14 31 31c0 10-4 19-10 27l-21 27-21-27c-6-8-10-17-10-27z' fill='#355b9d' fill-opacity='.16'/>
          <path d='M404 117v33' stroke='#d4b35d' stroke-opacity='.26' stroke-width='8' stroke-linecap='round'/>
          <path d='M389 132h30' stroke='#d4b35d' stroke-opacity='.24' stroke-width='7' stroke-linecap='round'/>
          <path d='M350 54l6 14 15 2-11 9 3 15-13-7-13 7 3-15-11-9 15-2z' fill='#d4b35d' fill-opacity='.26'/>
          <path d='M468 120l5 11 12 2-9 7 2 12-10-6-10 6 2-12-9-7 12-2z' fill='#d4b35d' fill-opacity='.22'/>
        </svg>
      `);

    default:
      return "none";
  }
}

function wendeKategorieDesignAn(card, iconElement, kategorie) {
  const design = holeKategorieDesign(kategorie);

  card.style.setProperty("--theme-accent", design.accent);
  card.style.setProperty("--theme-accent-soft", design.accentSoft);
  card.style.setProperty("--theme-button", design.button);
  card.style.setProperty("--theme-button-hover", design.buttonHover);
  card.style.setProperty("--theme-count", design.count);
  card.style.setProperty("--theme-content-bg", design.contentBg);
  card.style.setProperty("--theme-glow", design.glow);
  card.style.setProperty("--card-illustration", holeKategorieIllustration(kategorie));

 if (iconElement) {
  if (design.iconSvg) {
    iconElement.innerHTML = `<img src="${design.iconSvg}" alt="" class="ordner-icon-svg">`;
  } else if (design.icon) {
    iconElement.innerHTML = `<i class="bi ${design.icon}"></i>`;
  } else {
    iconElement.innerHTML = "";
  }
}
}

//Beginn des codes
const ordnerListe = document.getElementById("ordnerListe");
const zurueckButton = document.getElementById("zurueckButton");
const monatSucheVonInput = document.getElementById("monatSucheVon");
const monatSucheBisInput = document.getElementById("monatSucheBis");
const monatSucheButton = document.getElementById("monatSucheButton");
const monatResetButton = document.getElementById("monatResetButton");
const monatScreenshotButton = document.getElementById("monatScreenshotButton");
const monatInfo = document.getElementById("monatInfo");

let aktiverMonatsFilterVon = "";
let aktiverMonatsFilterBis = "";
const offeneKategorien = new Set();
let aktuellGezogeneHymneId = null;
let aktuellGezogeneKategorie = null;

let daten = leeresDatenObjekt();

init();

function normalisiereDatumFuerInput(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatiereDatum(value) {
  if (!value) return "";
  const datum = new Date(`${normalisiereDatumFuerInput(value)}T00:00:00`);
  return datum.toLocaleDateString("de-DE");
}

function formatiereZeitraum(start) {
  if (start) return `ab ${formatiereDatum(start)}`;
  return "";
}

//Local ansehen:
// async function init() {
//   daten = leeresDatenObjekt();
//   renderAlleOrdner();
// }

async function init() {
  const email = localStorage.getItem("email");

  if (!email) {
    window.location.href = "/login/login.html";
    return;
  }

  await ladeDatenVomServer();
  renderAlleOrdner();
}

function leeresDatenObjekt() {
  const obj = {};
  KATEGORIEN.forEach((kategorie) => {
    obj[kategorie] = [];
  });
  return obj;
}

function holeMonatsGrenzen(monatWert) {
  if (!monatWert) return null;

  const [jahr, monat] = monatWert.split("-").map(Number);
  if (!jahr || !monat) return null;

  const ersterTag = `${jahr}-${String(monat).padStart(2, "0")}-01`;
  const letzterTagDate = new Date(jahr, monat, 0);
  const letzterTag = `${jahr}-${String(monat).padStart(2, "0")}-${String(letzterTagDate.getDate()).padStart(2, "0")}`;

  return {
    start: ersterTag,
    end: letzterTag
  };
}

function formatiereMonatJahr(monatWert) {
  if (!monatWert) return "";
  const [jahr, monat] = monatWert.split("-").map(Number);
  const d = new Date(jahr, monat - 1, 1);
  return d.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric"
  });
}

function hatAktivenMonatsFilter() {
  return !!(aktiverMonatsFilterVon || aktiverMonatsFilterBis);
}

function holeMonatsbereich(vonWert, bisWert) {
  if (!vonWert && !bisWert) return null;

  const von = vonWert || bisWert;
  const bis = bisWert || vonWert;

  const vonGrenzen = holeMonatsGrenzen(von);
  const bisGrenzen = holeMonatsGrenzen(bis);

  if (!vonGrenzen || !bisGrenzen) return null;

  let start = vonGrenzen.start;
  let end = bisGrenzen.end;

  if (start > end) {
    [start, end] = [end, start];
  }

  return { start, end };
}

function formatiereMonatsbereich(vonWert, bisWert) {
  if (!vonWert && !bisWert) return "";

  const von = vonWert || bisWert;
  const bis = bisWert || vonWert;

  if (von === bis) {
    return formatiereMonatJahr(von);
  }

  return `${formatiereMonatJahr(von)} bis ${formatiereMonatJahr(bis)}`;
}

function baueDateinameMonatsbereich(vonWert, bisWert) {
  if (!vonWert && !bisWert) return "ohne-filter";

  const von = vonWert || bisWert;
  const bis = bisWert || vonWert;

  if (von === bis) {
    return von;
  }

  return `${von}-bis-${bis}`;
}

function hymnePasstZumMonatsbereich(hymne, vonWert, bisWert) {
  if (!vonWert && !bisWert) return true;

  const bereich = holeMonatsbereich(vonWert, bisWert);
  if (!bereich) return true;

  const datum = hymne.startDate || "";

  if (!datum) {
    return false;
  }

  return datum >= bereich.start && datum <= bereich.end;
}

function holeGefilterteHymnen(kategorie) {
  const alle = daten[kategorie] || [];

  if (!hatAktivenMonatsFilter()) {
    return alle;
  }

  return alle.filter((hymne) =>
    hymnePasstZumMonatsbereich(hymne, aktiverMonatsFilterVon, aktiverMonatsFilterBis)
  );
}

function baueZaehlerText(kategorie) {
  const alleHymnen = daten[kategorie] || [];
  const sichtbareHymnen = holeGefilterteHymnen(kategorie);

  const basis = hatAktivenMonatsFilter() ? sichtbareHymnen : alleHymnen;

  const gesamt = basis.length;
  const erledigt = basis.filter(item => item.checked).length;
  const offen = gesamt - erledigt;

  if (hatAktivenMonatsFilter()) {
    return `${gesamt} von ${alleHymnen.length} Hymnen • ${erledigt} erledigt • ${offen} offen`;
  }

  return `${gesamt} Hymnen • ${erledigt} erledigt • ${offen} offen`;
}

function aktualisiereMonatInfo() {
  if (!monatInfo) return;

  if (!hatAktivenMonatsFilter()) {
    monatInfo.textContent = "";
    return;
  }

  const anzahlHymnen = KATEGORIEN.reduce((summe, kategorie) => {
    return summe + holeGefilterteHymnen(kategorie).length;
  }, 0);

  monatInfo.textContent = `${anzahlHymnen} Hymnen für ${formatiereMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)} gefunden.`;
}

function aktiviereMonatsFilter() {
  let von = monatSucheVonInput?.value || "";
  let bis = monatSucheBisInput?.value || "";

  if (!von && !bis) {
    alert("Bitte wähle mindestens einen Monat aus.");
    return;
  }

  if (!von) von = bis;
  if (!bis) bis = von;

  if (von > bis) {
    [von, bis] = [bis, von];
  }

  aktiverMonatsFilterVon = von;
  aktiverMonatsFilterBis = bis;

  if (monatSucheVonInput) monatSucheVonInput.value = von;
  if (monatSucheBisInput) monatSucheBisInput.value = bis;

  renderAlleOrdner();
}

function filterZuruecksetzen() {
  aktiverMonatsFilterVon = "";
  aktiverMonatsFilterBis = "";

  if (monatSucheVonInput) monatSucheVonInput.value = "";
  if (monatSucheBisInput) monatSucheBisInput.value = "";

  renderAlleOrdner();
}

async function macheSvgBilderScreenshotSicher(rootElement) {
  const svgBilder = [...rootElement.querySelectorAll("img.ordner-icon-svg")];

  await Promise.all(
    svgBilder.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src) return;

      try {
        const absoluteUrl = new URL(src, window.location.href).href;
        const response = await fetch(absoluteUrl);

        if (!response.ok) {
          throw new Error(`SVG konnte nicht geladen werden: ${absoluteUrl}`);
        }

        let svgText = await response.text();

        svgText = svgText
          .replace(/<\?xml[\s\S]*?\?>/g, "")
          .replace(/<!DOCTYPE[\s\S]*?>/gi, "");

        const wrapper = document.createElement("div");
        wrapper.className = "ordner-icon-svg-inline";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        wrapper.style.display = "block";

        wrapper.innerHTML = svgText;

        const svg = wrapper.querySelector("svg");
        if (svg) {
          svg.style.width = "100%";
          svg.style.height = "100%";
          svg.style.display = "block";
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }

        img.replaceWith(wrapper);
      } catch (error) {
        console.error("Fehler beim Umwandeln des SVG für Screenshot:", error);
      }
    })
  );
}

async function screenshotHerunterladen() {
  if (!hatAktivenMonatsFilter()) {
    alert("Bitte wähle zuerst einen Zeitraum aus und suche danach.");
    return;
  }

  if (!window.html2canvas) {
    alert("Screenshot-Bibliothek wurde nicht geladen.");
    return;
  }

  if (!ordnerListe || ordnerListe.children.length === 0) {
    alert("Es gibt keine passenden Hymnen für diesen Monat.");
    return;
  }

  const exportBox = document.createElement("div");
  exportBox.style.position = "fixed";
  exportBox.style.left = "-99999px";
  exportBox.style.top = "0";
  exportBox.style.width = "1200px";
  exportBox.style.background = "#1A3D64";
  exportBox.style.padding = "24px";
  exportBox.style.zIndex = "-1";

  const titel = document.createElement("h1");
  titel.textContent = `Lehrplan – ${formatiereMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)}`;
  titel.style.color = "white";
  titel.style.margin = "0 0 18px 0";
  titel.style.fontFamily = "Arial, sans-serif";

  const untertitel = document.createElement("div");
  untertitel.style.color = "#dbeafe";
  untertitel.style.marginBottom = "22px";
  untertitel.style.fontFamily = "Arial, sans-serif";

  const clone = ordnerListe.cloneNode(true);

  exportBox.appendChild(titel);
  exportBox.appendChild(untertitel);
  exportBox.appendChild(clone);
  document.body.appendChild(exportBox);

  try {
    await macheSvgBilderScreenshotSicher(clone);

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await window.html2canvas(exportBox, {
      backgroundColor: "#1A3D64",
      scale: 2,
      useCORS: true
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `lehrplan-${baueDateinameMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)}.png`;
    link.click();
  } catch (error) {
    console.error(error);
    alert("Fehler beim Erstellen des Screenshots.");
  } finally {
    exportBox.remove();
  }
}

function ermittleNaechstenSortIndex(kategorie) {
  const offene = (daten[kategorie] || []).filter(item => !item.checked);
  if (offene.length === 0) return 0;
  return Math.max(...offene.map(item => Number(item.sortIndex) || 0)) + 1;
}

function compareErledigteHymnen(a, b) {
  const aStart = a.startDate || "0000-01-01";
  const bStart = b.startDate || "0000-01-01";

  if (aStart !== bStart) {
    return bStart.localeCompare(aStart);
  }

  return (a.sortIndex || 0) - (b.sortIndex || 0);
}

function sortiereKategorie(kategorie) {
  const alle = [...(daten[kategorie] || [])];

  const erledigt = alle
    .filter(item => item.checked)
    .sort(compareErledigteHymnen);

  const offen = alle
    .filter(item => !item.checked)
    .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0));

  daten[kategorie] = [...erledigt, ...offen];
}

function holeElementNachPosition(container, y) {
  const elemente = [
    ...container.querySelectorAll(".hymne-row.verschiebbar:not(.dragging)")
  ];

  let naechstes = null;
  let groessterNegativerOffset = Number.NEGATIVE_INFINITY;

  for (const element of elemente) {
    const box = element.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > groessterNegativerOffset) {
      groessterNegativerOffset = offset;
      naechstes = element;
    }
  }

  return naechstes;
}

function uebernehmeOffeneReihenfolgeAusDOM(kategorie, container) {
  const idsInReihenfolge = [
    ...container.querySelectorAll(".hymne-row.verschiebbar")
  ].map(el => Number(el.dataset.id));

  const erledigte = daten[kategorie]
    .filter(item => item.checked)
    .sort(compareErledigteHymnen);

  const offeneMap = new Map(
    daten[kategorie]
      .filter(item => !item.checked)
      .map(item => [Number(item.id), item])
  );

  const offeneNeu = idsInReihenfolge
    .map((id, index) => {
      const item = offeneMap.get(id);
      if (!item) return null;
      item.sortIndex = index;
      return item;
    })
    .filter(Boolean);

  daten[kategorie] = [...erledigte, ...offeneNeu];
}

async function speichereOffeneReihenfolge(kategorie) {
  const email = localStorage.getItem("email");

  const ids = daten[kategorie]
    .filter(item => !item.checked)
    .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
    .map(item => item.id);

  const response = await fetch(`${API_BASE_URL}/api/lehrplan/reihenfolge`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      kategorie,
      ids
    })
  });

  if (!response.ok) {
    throw new Error("Fehler beim Speichern der Reihenfolge");
  }
}

async function ladeDatenVomServer() {
  const email = localStorage.getItem("email");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lehrplan?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      throw new Error("Fehler beim Laden des Lehrplans");
    }

    const eintraege = await response.json();

    daten = leeresDatenObjekt();

    eintraege.forEach((eintrag) => {
      if (!daten[eintrag.kategorie]) {
        daten[eintrag.kategorie] = [];
      }

      daten[eintrag.kategorie].push({
        id: eintrag.id,
        name: eintrag.titel,
        checked: !!eintrag.erledigt,
        startDate: normalisiereDatumFuerInput(eintrag.start_datum),
        endDate: normalisiereDatumFuerInput(eintrag.end_datum),
        sortIndex: Number(eintrag.sort_index) || 0,
        createdAt: eintrag.created_at
      });
    });
  } catch (error) {
    console.error(error);
    alert("Fehler beim Laden des Lehrplans.");
  }
}

function renderAlleOrdner() {
  ordnerListe.innerHTML = "";

  let anzahlKarten = 0;

  KATEGORIEN.forEach((kategorie) => {
    const gefilterte = holeGefilterteHymnen(kategorie);

    if (hatAktivenMonatsFilter() && gefilterte.length === 0) {
      return;
    }

    const card = baueOrdnerCard(kategorie);
    ordnerListe.appendChild(card);
    anzahlKarten++;
  });

  if (hatAktivenMonatsFilter() && anzahlKarten === 0) {
    const leer = document.createElement("div");
    leer.className = "keine-filter-treffer";
    leer.textContent = `Für ${formatiereMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)} wurden keine Hymnen gefunden.`;
    ordnerListe.appendChild(leer);
  }

  aktualisiereMonatInfo();
}

function baueOrdnerCard(kategorie) {
  const card = document.createElement("article");
  card.className = "ordner-card";

  const header = document.createElement("button");
  header.className = "ordner-header";
  header.type = "button";

  const headerLeft = document.createElement("div");
  headerLeft.className = "ordner-header-left";

  const icon = document.createElement("span");
  icon.className = "ordner-icon";

  const name = document.createElement("span");
  name.className = "ordner-name";
  name.textContent = kategorie;

  headerLeft.appendChild(icon);
  headerLeft.appendChild(name);

  wendeKategorieDesignAn(card, icon, kategorie);

  const headerRight = document.createElement("div");
  headerRight.className = "ordner-header-right";

  const count = document.createElement("span");
  count.className = "ordner-count";
  count.textContent = baueZaehlerText(kategorie);

  const plusButton = document.createElement("button");
  plusButton.className = "plus-button";
  plusButton.type = "button";
  plusButton.textContent = "+";
  plusButton.title = "Neue Hymne hinzufügen";

  headerRight.appendChild(count);
  headerRight.appendChild(plusButton);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);

  const content = document.createElement("div");
  content.className = "ordner-content";

  header.addEventListener("click", () => {
    card.classList.toggle("offen");

    if (card.classList.contains("offen")) {
      offeneKategorien.add(kategorie);
    } else {
      offeneKategorien.delete(kategorie);
    }
  });

  plusButton.addEventListener("click", (event) => {
    event.stopPropagation();
    card.classList.add("offen");
    zeigeAddForm(content, kategorie, count);
  });

  if ((hatAktivenMonatsFilter() && holeGefilterteHymnen(kategorie).length > 0) || offeneKategorien.has(kategorie)) {
    card.classList.add("offen");
  }

  renderOrdnerInhalt(content, kategorie, count);

  card.appendChild(header);
  card.appendChild(content);

  return card;
}

function renderOrdnerInhalt(content, kategorie, countElement) {
  content.innerHTML = "";

  sortiereKategorie(kategorie);

 const alleHymnen = daten[kategorie];
  const hymnen = holeGefilterteHymnen(kategorie);

countElement.textContent = baueZaehlerText(kategorie);

  const erledigte = hymnen.filter(item => item.checked);
  const offene = hymnen.filter(item => !item.checked);

  if (hymnen.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Noch keine Hymnen vorhanden.";
    content.appendChild(emptyText);
  } else {
    if (erledigte.length > 0) {
      const erledigtListe = document.createElement("div");
      erledigtListe.className = "hymnen-liste";

      erledigte.forEach((hymne) => {
        const row = baueHymneRow(hymne, kategorie, content, countElement);
        erledigtListe.appendChild(row);
      });

      content.appendChild(erledigtListe);
    }

    if (offene.length > 0) {
      const offeneListe = document.createElement("div");
      offeneListe.className = "hymnen-liste offen-dropzone";

      offene.forEach((hymne) => {
        const row = baueHymneRow(hymne, kategorie, content, countElement);
        offeneListe.appendChild(row);
      });

      offeneListe.addEventListener("dragover", (event) => {
        if (aktuellGezogeneKategorie !== kategorie) return;

        event.preventDefault();

        const afterElement = holeElementNachPosition(offeneListe, event.clientY);
        const draggingElement = offeneListe.querySelector(
          `.hymne-row[data-id="${aktuellGezogeneHymneId}"]`
        );

        if (!draggingElement) return;

        if (afterElement == null) {
          offeneListe.appendChild(draggingElement);
        } else {
          offeneListe.insertBefore(draggingElement, afterElement);
        }
      });

      offeneListe.addEventListener("drop", async (event) => {
        if (aktuellGezogeneKategorie !== kategorie) return;

        event.preventDefault();

        try {
          uebernehmeOffeneReihenfolgeAusDOM(kategorie, offeneListe);
          await speichereOffeneReihenfolge(kategorie);
          renderOrdnerInhalt(content, kategorie, countElement);
        } catch (error) {
          console.error(error);
          alert("Fehler beim Speichern der Reihenfolge.");
          await ladeDatenVomServer();
          renderOrdnerInhalt(content, kategorie, countElement);
        }
      });

      content.appendChild(offeneListe);
    }
  }

  const hint = document.createElement("div");
  hint.className = "edit-hint";
  hint.textContent = "Tipp: Doppelklick auf den Namen zum Bearbeiten von Name und Datum. Offene Hymnen kannst du per Gedrückthalten und Ziehen innerhalb dieser Box verschieben.";

  content.appendChild(hint);
}

function zeigeAddForm(content, kategorie, countElement) {
  const vorhandenesForm = content.querySelector(".add-form");
  if (vorhandenesForm) {
    const input = vorhandenesForm.querySelector(".add-input");
    if (input) input.focus();
    return;
  }

  const form = document.createElement("div");
  form.className = "add-form";

  const input = document.createElement("input");
  input.className = "add-input";
  input.type = "text";
  input.placeholder = "Name der Hymne eingeben";

  const saveButton = document.createElement("button");
  saveButton.className = "save-button";
  saveButton.type = "button";
  saveButton.textContent = "Speichern";

  const cancelButton = document.createElement("button");
  cancelButton.className = "cancel-button";
  cancelButton.type = "button";
  cancelButton.textContent = "Abbrechen";

  form.appendChild(input);
  form.appendChild(saveButton);
  form.appendChild(cancelButton);

  const hint = content.querySelector(".edit-hint");
  if (hint) {
    content.insertBefore(form, hint);
  } else {
    content.appendChild(form);
  }

  input.focus();

  async function speichereNeueHymne() {
    const text = input.value.trim();
    const email = localStorage.getItem("email");

    if (!text) {
      alert("Bitte gib einen Hymnennamen ein.");
      return;
    }

    try {
      saveButton.disabled = true;
      saveButton.textContent = "Speichert...";

      const response = await fetch(`${API_BASE_URL}/api/lehrplan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          kategorie,
          titel: text
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern");
      }

      const neuerEintrag = await response.json();

      daten[kategorie].push({
        id: neuerEintrag.id,
        name: neuerEintrag.titel,
        checked: !!neuerEintrag.erledigt,
        startDate: normalisiereDatumFuerInput(neuerEintrag.start_datum),
        endDate: normalisiereDatumFuerInput(neuerEintrag.end_datum),
        sortIndex: Number(neuerEintrag.sort_index) || ermittleNaechstenSortIndex(kategorie),
        createdAt: neuerEintrag.created_at
      });

      renderOrdnerInhalt(content, kategorie, countElement);
    } catch (error) {
      console.error(error);
      alert("Fehler beim Speichern der Hymne.");
      saveButton.disabled = false;
      saveButton.textContent = "Speichern";
    }
  }

  saveButton.addEventListener("click", speichereNeueHymne);

  cancelButton.addEventListener("click", () => {
    form.remove();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      speichereNeueHymne();
    }
  });
}

function baueHymneRow(hymne, kategorie, content, countElement) {
  const row = document.createElement("div");
  row.className = "hymne-row";
  row.dataset.id = String(hymne.id);

  if (hymne.checked) {
    row.classList.add("erledigt");
  }

  if (!hymne.checked) {
    row.classList.add("verschiebbar");
    row.draggable = true;

    row.addEventListener("dragstart", (event) => {
      aktuellGezogeneHymneId = hymne.id;
      aktuellGezogeneKategorie = kategorie;
      row.classList.add("dragging");

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
      }
    });

    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      aktuellGezogeneHymneId = null;
      aktuellGezogeneKategorie = null;
    });
  }

  const checkbox = document.createElement("input");
  checkbox.className = "hymne-check";
  checkbox.type = "checkbox";
  checkbox.checked = !!hymne.checked;

  const info = document.createElement("div");
  info.className = "hymne-info";

  const titleLine = document.createElement("div");
  titleLine.className = "hymne-title-line";

  const text = document.createElement("span");
  text.className = "hymne-text";
  text.textContent = hymne.name;

  const dateLabel = document.createElement("span");
  dateLabel.className = "hymne-date-label";

  titleLine.appendChild(text);
  titleLine.appendChild(dateLabel);

  const zeitraumBox = document.createElement("div");
  zeitraumBox.className = "zeitraum-box";

  const startInputWrap = document.createElement("div");
  startInputWrap.className = "date-input-wrap";

  const vonInput = document.createElement("input");
  vonInput.type = "date";
  vonInput.className = "date-input";
  vonInput.value = hymne.startDate || "";

  const startPlaceholder = document.createElement("span");
  startPlaceholder.className = "fake-placeholder";
  startPlaceholder.textContent = "Datum auswählen...";

  startInputWrap.appendChild(vonInput);
  startInputWrap.appendChild(startPlaceholder);

  zeitraumBox.appendChild(startInputWrap);

  info.appendChild(titleLine);
  info.appendChild(zeitraumBox);

  const actions = document.createElement("div");
  actions.className = "hymne-actions";

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "−";
  deleteButton.title = "Eintrag löschen";
  deleteButton.setAttribute("aria-label", `Eintrag ${hymne.name} löschen`);

  actions.appendChild(deleteButton);

  row.appendChild(checkbox);
  row.appendChild(info);
  row.appendChild(actions);

  function aktualisiereDateInputPlaceholder(input) {
    if (input.value) {
      input.classList.remove("show-placeholder");
    } else {
      input.classList.add("show-placeholder");
    }
  }

 function aktualisiereZeitraumAnzeige() {
  const zeitraumText = formatiereZeitraum(hymne.startDate);

  if (zeitraumText) {
    dateLabel.textContent = `(${zeitraumText})`;
    dateLabel.style.display = "inline-flex";
  } else {
    dateLabel.textContent = "";
    dateLabel.style.display = "none";
  }

  if (!hymne.checked) {
    zeitraumBox.style.display = "none";
  } else if (hymne.startDate) {
    zeitraumBox.style.display = "none";
  } else {
    zeitraumBox.style.display = "flex";
  }

  aktualisiereDateInputPlaceholder(vonInput);
}

  aktualisiereZeitraumAnzeige();

  checkbox.addEventListener("change", async () => {
    const email = localStorage.getItem("email");
    const vorherChecked = !checkbox.checked;
    const vorherStart = hymne.startDate;
    const vorherEnd = hymne.endDate;
    const vorherSortIndex = hymne.sortIndex;

    try {
      checkbox.disabled = true;
      vonInput.disabled = true;

      const body = {
        email,
        erledigt: checkbox.checked
      };

      if (!checkbox.checked) {
        body.start_datum = null;
        body.end_datum = null;
        body.sort_index = ermittleNaechstenSortIndex(kategorie);
      }

      const response = await fetch(`${API_BASE_URL}/api/lehrplan/${hymne.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren der Checkbox");
      }

      hymne.checked = checkbox.checked;

      if (!checkbox.checked) {
        hymne.startDate = "";
        hymne.endDate = "";
        hymne.sortIndex = body.sort_index;
        vonInput.value = "";
      }

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.checked = hymne.checked;
        eintrag.startDate = hymne.startDate;
        eintrag.endDate = hymne.endDate;
        if (!checkbox.checked) {
          eintrag.sortIndex = hymne.sortIndex;
        }
      }

      renderOrdnerInhalt(content, kategorie, countElement);

    } catch (error) {
      console.error(error);
      checkbox.checked = vorherChecked;
      hymne.checked = vorherChecked;
      hymne.startDate = vorherStart;
      hymne.endDate = vorherEnd;
      hymne.sortIndex = vorherSortIndex;
      vonInput.value = vorherStart || "";
      row.classList.toggle("erledigt", vorherChecked);
      aktualisiereZeitraumAnzeige();

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.checked = vorherChecked;
        eintrag.startDate = vorherStart;
        eintrag.endDate = vorherEnd;
        eintrag.sortIndex = vorherSortIndex;
      }

      renderOrdnerInhalt(content, kategorie, countElement);
      alert("Fehler beim Speichern der Checkbox.");

    } finally {
      checkbox.disabled = false;
      vonInput.disabled = false;
    }
  });

  async function speichereZeitraum() {
    if (!checkbox.checked) return;

    const email = localStorage.getItem("email");
    const neuesStart = vonInput.value || null;
    const vorherStart = hymne.startDate;

    try {
      vonInput.disabled = true;

      const response = await fetch(`${API_BASE_URL}/api/lehrplan/${hymne.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          erledigt: true,
          start_datum: neuesStart,
          end_datum: null
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern des Datums");
      }

      hymne.startDate = neuesStart || "";
      hymne.endDate = "";

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.startDate = hymne.startDate;
        eintrag.endDate = "";
        eintrag.checked = true;
      }

      aktualisiereZeitraumAnzeige();
      renderOrdnerInhalt(content, kategorie, countElement);
    } catch (error) {
      console.error(error);
      hymne.startDate = vorherStart;
      vonInput.value = vorherStart || "";
      aktualisiereZeitraumAnzeige();
      renderOrdnerInhalt(content, kategorie, countElement);
      alert("Fehler beim Speichern des Datums.");
    } finally {
      vonInput.disabled = false;
    }
  }

  vonInput.addEventListener("change", speichereZeitraum);

  deleteButton.addEventListener("click", async () => {
    const bestaetigt = confirm(`Möchtest du "${hymne.name}" wirklich löschen?`);
    if (!bestaetigt) return;

    const email = localStorage.getItem("email");

    try {
      deleteButton.disabled = true;

      const response = await fetch(
        `${API_BASE_URL}/api/lehrplan/${hymne.id}?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Löschen");
      }

      daten[kategorie] = daten[kategorie].filter((item) => item.id !== hymne.id);
      renderOrdnerInhalt(content, kategorie, countElement);
    } catch (error) {
      console.error(error);
      deleteButton.disabled = false;
      alert("Fehler beim Löschen der Hymne.");
    }
  });

  text.addEventListener("dblclick", () => {
    starteBearbeitung(text, hymne, kategorie, content, countElement);
  });

  return row;
}

function starteBearbeitung(textElement, hymne, kategorie, content, countElement) {
  const row = textElement.closest(".hymne-row");
  const info = row?.querySelector(".hymne-info");
  const actions = row?.querySelector(".hymne-actions");

  if (!row || !info || !actions) return;
  if (row.dataset.editing === "true") return;

  row.dataset.editing = "true";

  const alterName = hymne.name || "";
  const altesDatum = hymne.startDate || "";

  const deleteButton = actions.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.style.display = "none";
  }

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "edit-save-button";
  saveButton.textContent = "Speichern";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "cancel-button";
  cancelButton.textContent = "Abbrechen";

  actions.prepend(cancelButton);
  actions.prepend(saveButton);

  const editBox = document.createElement("div");
  editBox.className = "hymne-edit-box";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "hymne-edit-input";
  nameInput.value = alterName;
  nameInput.placeholder = "Name der Hymne";

  editBox.appendChild(nameInput);

  let dateInput = null;

  if (hymne.checked) {
    dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "date-input hymne-edit-date";
    dateInput.value = altesDatum;
    editBox.appendChild(dateInput);
  }

  info.innerHTML = "";
  info.appendChild(editBox);

  nameInput.focus();
  nameInput.select();

  let fertig = false;

  saveButton.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });

  cancelButton.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });

  async function beenden(uebernehmen) {
    if (fertig) return;

    if (!uebernehmen) {
      fertig = true;
      renderOrdnerInhalt(content, kategorie, countElement);
      return;
    }

    const neuerText = nameInput.value.trim();
    const neuesDatum = dateInput ? (dateInput.value || null) : null;

    if (!neuerText) {
      alert("Der Name darf nicht leer sein.");
      nameInput.focus();
      return;
    }

    fertig = true;
    const email = localStorage.getItem("email");

    try {
      const body = {
        email,
        titel: neuerText
      };

      if (hymne.checked) {
        body.start_datum = neuesDatum;
        body.end_datum = null;
        body.erledigt = true;
      }

      const response = await fetch(`${API_BASE_URL}/api/lehrplan/${hymne.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Fehler beim Bearbeiten");
      }

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.name = neuerText;

        if (hymne.checked) {
          eintrag.startDate = neuesDatum || "";
          eintrag.endDate = "";
        }
      }

      renderOrdnerInhalt(content, kategorie, countElement);
    } catch (error) {
      console.error(error);
      alert("Fehler beim Bearbeiten der Hymne.");
      fertig = false;
      nameInput.focus();
    }
  }

  saveButton.addEventListener("click", () => beenden(true));
  cancelButton.addEventListener("click", () => beenden(false));

  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      beenden(true);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      beenden(false);
    }
  });

  if (dateInput) {
    dateInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        beenden(true);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        beenden(false);
      }
    });
  }
}

if (monatSucheButton) {
  monatSucheButton.addEventListener("click", aktiviereMonatsFilter);
}

if (monatResetButton) {
  monatResetButton.addEventListener("click", filterZuruecksetzen);
}

if (monatScreenshotButton) {
  monatScreenshotButton.addEventListener("click", screenshotHerunterladen);
}

if (monatSucheVonInput) {
  monatSucheVonInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      aktiviereMonatsFilter();
    }
  });
}

if (monatSucheBisInput) {
  monatSucheBisInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      aktiviereMonatsFilter();
    }
  });
}

if (zurueckButton) {
  zurueckButton.addEventListener("click", () => {
    window.location.href = "/hymnen/hymnen.html";
  });
}
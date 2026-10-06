// Gedeelde huisstijl voor de DataLab-documenten (zelfde opmaak als het Sprint 1-rapport)
const d = require("docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, Header, Footer, PageNumber, LevelFormat, ImageRun,
  TableOfContents, PageBreak, TabStopType, VerticalAlign,
} = d;

const C = { navy: "17365D", blue: "2F5597", light: "4472C4", grey: "595959", ink: "000000",
            head: "D9EAF7", zebra: "F7FAFC", line: "D9D9D9", green: "0E5C56" };
const BODY_FONT = "Aptos";
const HEAD_FONT = "Calibri Light";
const PAGE_W = 12240, MARGIN_L = 1304, MARGIN_R = 1304;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R; // 9632 DXA

// --- inline opmaak: **vet**, *cursief*
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(new TextRun({ text: tok.slice(2, -2), bold: true, ...base }));
    else out.push(new TextRun({ text: tok.slice(1, -1), italics: true, ...base }));
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

const P = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run || {}), ...opts });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const H1nn = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] }); // zonder nummer (zelf in tekst)
const Bullet = (text, level = 0) => new Paragraph({ numbering: { reference: "bullets", level }, children: runs(text) });
const Num = (text, ref = "nums") => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(text) });
const Caption = (text) => new Paragraph({ children: runs(text, { italics: true, color: C.grey, size: 18 }), spacing: { before: 60, after: 240 } });
const Break = () => new Paragraph({ children: [new PageBreak()] });
const Empty = () => new Paragraph({ children: [] });
const Conclusie = (text) => new Paragraph({ children: runs(text, { bold: true }), spacing: { before: 60, after: 200 } });

// --- tabellen in de stijl van Sprint 1 (lichtblauwe kop, zebra-rijen)
const border = { style: BorderStyle.SINGLE, size: 4, color: C.line };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function cell(content, width, { fill, bold, size = 18, align } = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map((t) =>
    t instanceof Paragraph ? t :
    new Paragraph({ children: runs(String(t), { size, bold }), alignment: align, spacing: { after: 40 } }));
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, color: "auto", fill } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    verticalAlign: VerticalAlign.TOP,
    children: paras,
  });
}

function table(header, rows, widths, { size = 18, zebra = true, firstBold = false } = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  if (total !== CONTENT_W) { const f = CONTENT_W / total; widths = widths.map((w) => Math.round(w * f)); }
  const diff = CONTENT_W - widths.reduce((a, b) => a + b, 0); widths[widths.length - 1] += diff;
  const hdr = new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, widths[i], { fill: C.head, bold: true, size })) });
  const body = rows.map((r, ri) => new TableRow({
    cantSplit: true,
    children: r.map((c, i) => cell(c, widths[i], { fill: zebra && ri % 2 === 1 ? C.zebra : undefined, bold: firstBold && i === 0, size })),
  }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, borders, rows: [hdr, ...body] });
}

function kv(rows, widths = [2600, 7032]) { // label/waarde tabel zoals in het template
  return table([], rows, widths).constructor === Table ? new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, borders,
    rows: rows.map(([k, v], i) => new TableRow({ children: [cell(k, widths[0], { fill: C.head, bold: true, size: 20 }), cell(v, widths[1], { size: 20 })] })),
  }) : null;
}

function image(buf, widthIn, heightIn) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60, line: 240, lineRule: d.LineRuleType.AUTO },
    children: [new ImageRun({ type: "png", data: buf, transformation: { width: Math.round(widthIn * 96), height: Math.round(heightIn * 96) } })] });
}

function doc({ headerText, sections, tocTitle }) {
  return new Document({
    creator: "Groep 3, ADSAI-DH-1.A",
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: BODY_FONT, size: 21, color: C.ink }, paragraph: { spacing: { after: 120, line: 269, lineRule: d.LineRuleType.AUTO } } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: HEAD_FONT, size: 36, bold: true, color: C.navy }, paragraph: { spacing: { before: 360, after: 120 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: HEAD_FONT, size: 28, bold: true, color: C.blue }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: HEAD_FONT, size: 23, bold: true, color: C.light }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true, outlineLevel: 2 } },
        { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", run: { size: 21, bold: true }, paragraph: { spacing: { before: 100, after: 40 } } },
        { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", run: { size: 21 }, paragraph: { indent: { left: 440 }, spacing: { after: 40 } } },
      ],
    },
    numbering: { config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } } ] },
      { reference: "nums", levels: [ { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } } ] },
      { reference: "nums2", levels: [ { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } } ] },
      { reference: "nums3", levels: [ { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } } ] },
    ] },
    sections: sections.map((children) => ({
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1247, right: MARGIN_R, bottom: 1134, left: MARGIN_L, header: 720, footer: 720 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: headerText, size: 16, color: C.grey })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pagina ", size: 16, color: C.grey }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.ink })] })] }) },
      children,
    })),
  });
}

function cover({ kicker, title, subtitle, lines }) {
  const out = [];
  for (let i = 0; i < 9; i++) out.push(Empty());
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120, line: 240, lineRule: d.LineRuleType.AUTO }, children: [new TextRun({ text: kicker, bold: true, color: C.blue, size: 28, font: HEAD_FONT })] }));
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160, line: 240, lineRule: d.LineRuleType.AUTO }, children: [new TextRun({ text: title, bold: true, color: C.navy, size: 64, font: HEAD_FONT })] }));
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240, line: 240, lineRule: d.LineRuleType.AUTO }, children: [new TextRun({ text: subtitle, color: C.grey, size: 30, font: HEAD_FONT })] }));
  for (let i = 0; i < 6; i++) out.push(Empty());
  lines.forEach((l) => out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 276, lineRule: d.LineRuleType.AUTO }, children: runs(l, { size: 22 }) })));
  return out;
}

function toc() {
  return [
    new Paragraph({ children: [new TextRun({ text: "Inhoudsopgave", bold: true, color: C.navy, size: 36, font: HEAD_FONT })], spacing: { before: 240, after: 200 } }),
    new TableOfContents("Inhoudsopgave", { hyperlink: true, headingStyleRange: "1-2" }),
  ];
}

async function save(document, path) {
  const buf = await Packer.toBuffer(document);
  require("fs").writeFileSync(path, buf);
  console.log("geschreven:", path);
}

module.exports = { d, C, P, H1, H2, H3, H1nn, Bullet, Num, Caption, Break, Empty, Conclusie, table, kv, image, doc, cover, toc, save, runs, Paragraph, TextRun, AlignmentType, CONTENT_W };

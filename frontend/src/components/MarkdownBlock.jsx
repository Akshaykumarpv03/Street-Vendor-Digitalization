/**
 * MarkdownBlock.jsx — Lightweight markdown renderer tailored for the new brand/slate theme.
 * Handles: **bold**, *italic*, `code`, ## headings, lists, and beautiful tables.
 */

const THEMES = {
  light: {
    heading: "text-slate-900 font-bold",
    subheading: "text-slate-800 font-semibold",
    body: "text-slate-700",
    rule: "border-slate-200",
    code: "bg-brand-50 text-brand-700 font-mono font-medium rounded-[4px] px-1.5 py-0.5 text-[0.85em]",
    tableBorder: "border-slate-200",
    tableRow: "border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors",
    tableCell: "px-4 py-3 text-sm text-slate-700",
    tableHeaderCell: "px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border-b border-slate-200",
    bold: "font-bold text-slate-900",
  }
};

function parseInline(text, theme) {
  let html = text;
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, `<strong class="${theme.bold}">$1</strong>`);
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, `<code class="${theme.code}">$1</code>`);
  return html;
}

function renderLine(line, idx, theme, isHeaderRow = false) {
  const trimmed = line.trim();
  if (!trimmed) return <div key={idx} className="h-2" />;

  // H2
  if (trimmed.startsWith("## ")) {
    return (
      <h3
        key={idx}
        className={`${theme.heading} text-lg mt-5 mb-2.5`}
        dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(3), theme) }}
      />
    );
  }
  
  // H3 / H4
  if (trimmed.startsWith("### ")) {
    return (
      <h4
        key={idx}
        className={`${theme.subheading} text-base mt-4 mb-2`}
        dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(4), theme) }}
      />
    );
  }

  // Horizontal rule
  if (trimmed === "---" || trimmed === "***") {
    return <hr key={idx} className={`${theme.rule} my-4`} />;
  }

  // Bullet list item
  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    return (
      <li
        key={idx}
        className={`ml-5 pl-1 mb-1.5 text-[15px] ${theme.body} list-disc marker:text-brand-500`}
        dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(2), theme) }}
      />
    );
  }

  // Numbered list item
  const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
  if (numMatch) {
    return (
      <li
        key={idx}
        className={`ml-5 pl-1 mb-1.5 text-[15px] ${theme.body} list-decimal marker:text-brand-500 marker:font-medium`}
        dangerouslySetInnerHTML={{ __html: parseInline(numMatch[2], theme) }}
      />
    );
  }

  // Table row
  if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
    if (trimmed.replace(/[\s|:-]/g, "") === "") return null; // divider row
    
    // Split by | but ignore escaped ones or empty outer ones
    const rawCells = trimmed.split("|");
    const cells = rawCells.slice(1, rawCells.length - 1); // remove outer empty splits from leading/trailing |
    
    return (
      <tr key={idx} className={theme.tableRow}>
        {cells.map((cell, ci) => {
          const CellTag = isHeaderRow ? "th" : "td";
          const cellClass = isHeaderRow ? theme.tableHeaderCell : theme.tableCell;
          return (
            <CellTag
              key={ci}
              className={cellClass}
              dangerouslySetInnerHTML={{ __html: parseInline(cell.trim(), theme) }}
            />
          );
        })}
      </tr>
    );
  }

  // Regular paragraph
  return (
    <p
      key={idx}
      className={`text-[15px] ${theme.body} leading-relaxed mb-2.5 last:mb-0`}
      dangerouslySetInnerHTML={{ __html: parseInline(trimmed, theme) }}
    />
  );
}

export default function MarkdownBlock({ content, variant = "light" }) {
  if (!content) return null;

  const theme = THEMES.light;
  const lines = content.split("\n");

  const elements = [];
  let inList = false;
  let listType = "ul"; // or "ol"
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (listItems.length) {
      const ListTag = listType;
      elements.push(
        <ListTag key={`list-${elements.length}`} className="my-3">
          {listItems}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length) {
      // The first row should be placed in <thead>, the rest in <tbody>
      const headRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-hidden overflow-x-auto my-5 rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-slate-50">
              {headRow}
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bodyRows}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const isBulletItem = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const isNumItem = /^\d+\.\s/.test(trimmed);
    const isListItem = isBulletItem || isNumItem;
    const isTableRow = trimmed.startsWith("|") && trimmed.endsWith("|");

    if (isListItem) {
      flushTable();
      if (!inList) {
        inList = true;
        listType = isNumItem ? "ol" : "ul";
      }
      listItems.push(renderLine(line, `li-${idx}`, theme));
    } else if (isTableRow) {
      flushList();
      const isDivider = trimmed.replace(/[\s|:-]/g, "") === "";
      if (!inTable) {
        inTable = true;
      }
      if (!isDivider) {
        // If it's the very first row of the table, treat it as header row
        const isHeader = tableRows.length === 0;
        const rowEl = renderLine(line, `tr-${idx}`, theme, isHeader);
        if (rowEl) tableRows.push(rowEl);
      }
    } else {
      flushList();
      flushTable();
      const el = renderLine(line, idx, theme);
      if (el) elements.push(el);
    }
  });

  flushList();
  flushTable();

  return <div className="markdown-body">{elements}</div>;
}

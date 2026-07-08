/**
 * MarkdownBlock.jsx — lightweight markdown renderer without an external lib.
 * Handles: **bold**, *italic*, `code`, ## headings, bullet lists, numbered
 * lists, horizontal rules, and line breaks.
 * Keeps bundle size minimal — no react-markdown dependency needed.
 */

function parseInline(text) {
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-sand px-1 py-0.5 rounded text-xs font-mono text-terracotta">$1</code>');
  return text;
}

function renderLine(line, idx) {
  const trimmed = line.trim();

  if (!trimmed) return <div key={idx} className="h-2" />;

  // H2 / H3
  if (trimmed.startsWith("## ")) {
    return (
      <h3
        key={idx}
        className="text-teal font-semibold text-base mt-4 mb-2"
        dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(3)) }}
      />
    );
  }
  if (trimmed.startsWith("### ")) {
    return (
      <h4
        key={idx}
        className="text-charcoal font-semibold text-sm mt-3 mb-1"
        dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(4)) }}
      />
    );
  }

  // Horizontal rule
  if (trimmed === "---" || trimmed === "***") {
    return <hr key={idx} className="border-sand my-3" />;
  }

  // Bullet list item
  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    return (
      <li
        key={idx}
        className="ml-4 text-sm text-charcoal list-disc leading-relaxed"
        dangerouslySetInnerHTML={{ __html: parseInline(trimmed.slice(2)) }}
      />
    );
  }

  // Numbered list item
  const numMatch = trimmed.match(/^(\d+)\.\s(.+)/);
  if (numMatch) {
    return (
      <li
        key={idx}
        className="ml-4 text-sm text-charcoal list-decimal leading-relaxed"
        dangerouslySetInnerHTML={{ __html: parseInline(numMatch[2]) }}
      />
    );
  }

  // Table row (basic)
  if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
    if (trimmed.replace(/[\s|:-]/g, "") === "") return null; // divider row
    const cells = trimmed.split("|").filter(Boolean);
    return (
      <tr key={idx} className="border-b border-sand">
        {cells.map((cell, ci) => (
          <td
            key={ci}
            className="px-2 py-1 text-xs text-charcoal"
            dangerouslySetInnerHTML={{ __html: parseInline(cell.trim()) }}
          />
        ))}
      </tr>
    );
  }

  // Regular paragraph
  return (
    <p
      key={idx}
      className="text-sm text-charcoal leading-relaxed"
      dangerouslySetInnerHTML={{ __html: parseInline(trimmed) }}
    />
  );
}

export default function MarkdownBlock({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const hasTable = lines.some((l) => l.trim().startsWith("|"));

  const elements = [];
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-0.5 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
          <table className="w-full text-xs border-collapse border border-sand rounded-lg overflow-hidden">
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const isListItem =
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      /^\d+\.\s/.test(trimmed);
    const isTableRow = trimmed.startsWith("|");

    if (isListItem) {
      if (!inList) inList = true;
      listItems.push(renderLine(line, `li-${idx}`));
    } else if (isTableRow) {
      flushList();
      if (!inTable) inTable = true;
      const row = renderLine(line, `tr-${idx}`);
      if (row) tableRows.push(row);
    } else {
      flushList();
      flushTable();
      const el = renderLine(line, idx);
      if (el) elements.push(el);
    }
  });

  flushList();
  flushTable();

  return <div className="space-y-1">{elements}</div>;
}

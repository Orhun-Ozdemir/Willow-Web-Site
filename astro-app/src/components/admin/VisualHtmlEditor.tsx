"use client";

type BlockType = "paragraph" | "heading" | "list";

type ContentBlock = {
  type: BlockType;
  text: string;
};

interface VisualHtmlEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function blocksFromPlainText(value: string): ContentBlock[] {
  const parts = value
    .split(/\n{2,}/g)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return [{ type: "paragraph", text: "" }];

  return parts.map((part) => {
    const lines = part.split(/\n/g).map((line) => line.trim()).filter(Boolean);
    const isList = lines.length > 1 && lines.every((line) => /^[-*•]\s+/.test(line));
    if (isList) {
      return { type: "list", text: lines.map((line) => line.replace(/^[-*•]\s+/, "")).join("\n") };
    }
    return { type: "paragraph", text: part };
  });
}

export function htmlToBlocks(value: string): ContentBlock[] {
  const html = value || "";
  if (!/<[a-z][\s\S]*>/i.test(html)) return blocksFromPlainText(html);

  const blocks: ContentBlock[] = [];
  const matches = html.matchAll(/<(h2|h3|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi);

  for (const match of matches) {
    const tag = match[1].toLowerCase();
    const body = match[2] || "";

    if (tag === "h2" || tag === "h3") {
      blocks.push({ type: "heading", text: stripTags(body) });
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const items = [...body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((item) => stripTags(item[1] || ""))
        .filter(Boolean);
      if (items.length) blocks.push({ type: "list", text: items.join("\n") });
      continue;
    }

    const text = stripTags(body);
    if (text) blocks.push({ type: "paragraph", text });
  }

  return blocks.length ? blocks : blocksFromPlainText(stripTags(html));
}

export function blocksToHtml(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      const text = block.text.trim();
      if (!text) return "";

      if (block.type === "heading") {
        return `<h2>${escapeHtml(text)}</h2>`;
      }

      if (block.type === "list") {
        const items = text
          .split(/\n/g)
          .map((item) => item.replace(/^[-*•]\s+/, "").trim())
          .filter(Boolean);
        if (!items.length) return "";
        return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      }

      return `<p>${escapeHtml(text)}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

export function htmlToPlainPreview(value: string, maxLength = 260): string {
  const text = htmlToBlocks(value)
    .map((block) => block.text.replace(/\n+/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

export default function VisualHtmlEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Haber metnini buraya yazın",
}: VisualHtmlEditorProps) {
  const blocks = htmlToBlocks(value);

  const updateBlocks = (next: ContentBlock[]) => {
    onChange?.(blocksToHtml(next));
  };

  const updateBlock = (idx: number, patch: Partial<ContentBlock>) => {
    updateBlocks(blocks.map((block, blockIdx) => (blockIdx === idx ? { ...block, ...patch } : block)));
  };

  const addBlock = (type: BlockType) => {
    updateBlocks([...blocks, { type, text: "" }]);
  };

  const removeBlock = (idx: number) => {
    const next = blocks.filter((_, blockIdx) => blockIdx !== idx);
    updateBlocks(next.length ? next : [{ type: "paragraph", text: "" }]);
  };

  const moveBlock = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    updateBlocks(next);
  };

  if (readOnly) {
    return (
      <div className="ws-visual-preview">
        {blocks.filter((block) => block.text.trim()).length ? (
          blocks.map((block, idx) => {
            if (block.type === "heading") return <h5 key={idx}>{block.text}</h5>;
            if (block.type === "list") {
              return (
                <ul key={idx}>
                  {block.text.split(/\n/g).filter(Boolean).map((item, itemIdx) => <li key={itemIdx}>{item}</li>)}
                </ul>
              );
            }
            return <p key={idx}>{block.text}</p>;
          })
        ) : (
          <p className="ws-visual-empty">İçerik yok</p>
        )}
      </div>
    );
  }

  return (
    <div className="ws-visual-editor">
      <div className="ws-visual-toolbar">
        <button type="button" onClick={() => addBlock("paragraph")}>Paragraf ekle</button>
        <button type="button" onClick={() => addBlock("heading")}>Başlık ekle</button>
        <button type="button" onClick={() => addBlock("list")}>Liste ekle</button>
      </div>

      <div className="ws-visual-blocks">
        {blocks.map((block, idx) => (
          <div key={idx} className="ws-visual-block">
            <div className="ws-visual-block-head">
              <select value={block.type} onChange={(e) => updateBlock(idx, { type: e.target.value as BlockType })}>
                <option value="paragraph">Paragraf</option>
                <option value="heading">Başlık</option>
                <option value="list">Liste</option>
              </select>
              <div>
                <button type="button" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>Yukarı</button>
                <button type="button" onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}>Aşağı</button>
                <button type="button" onClick={() => removeBlock(idx)}>Sil</button>
              </div>
            </div>
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(idx, { text: e.target.value })}
              rows={block.type === "list" ? 4 : 3}
              placeholder={block.type === "list" ? "Her maddeyi yeni satıra yazın" : placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// text 面的排版工具:显示宽度(CJK 记 2 列)、填充、折行、对齐列、字符条形。
// 全部纯函数、零依赖;niceeval show 的终端输出与 Row 分栏都建立在这几样上。

/** 终端显示宽度:CJK / 全角记 2 列,其余记 1。启发式覆盖常用区段,够对齐表格用。 */
export function charDisplayWidth(codePoint: number): number {
  if (
    (codePoint >= 0x1100 && codePoint <= 0x115f) ||
    (codePoint >= 0x2e80 && codePoint <= 0x303e) ||
    (codePoint >= 0x3041 && codePoint <= 0x33ff) ||
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) ||
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0xa000 && codePoint <= 0xa4cf) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe4f) ||
    (codePoint >= 0xff00 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
    (codePoint >= 0x20000 && codePoint <= 0x3fffd)
  ) {
    return 2;
  }
  return 1;
}

export function stringWidth(text: string): number {
  let width = 0;
  for (const ch of text) width += charDisplayWidth(ch.codePointAt(0)!);
  return width;
}

/** 右侧补空格到目标显示宽度(超宽不截断,如实溢出)。 */
export function padDisplay(text: string, width: number): string {
  const gap = width - stringWidth(text);
  return gap > 0 ? text + " ".repeat(gap) : text;
}

/** 左侧补空格(数字右对齐用)。 */
export function padStartDisplay(text: string, width: number): string {
  const gap = width - stringWidth(text);
  return gap > 0 ? " ".repeat(gap) + text : text;
}

/**
 * 按显示宽度折行:优先在空格处断,连续超宽(如中文)按列宽硬断。
 * 返回至少一行(空串输入 → [""])。
 */
export function wrapDisplay(text: string, width: number): string[] {
  const max = Math.max(4, width);
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    let lineWidth = 0;
    const flush = () => {
      lines.push(line);
      line = "";
      lineWidth = 0;
    };
    for (const word of paragraph.split(" ")) {
      const wordWidth = stringWidth(word);
      if (lineWidth > 0 && lineWidth + 1 + wordWidth > max) flush();
      if (wordWidth > max) {
        // 单词本身超宽(URL / 中文长句):逐字符硬断
        for (const ch of word) {
          const w = charDisplayWidth(ch.codePointAt(0)!);
          if (lineWidth + w > max) flush();
          line += ch;
          lineWidth += w;
        }
        continue;
      }
      if (lineWidth > 0) {
        line += " ";
        lineWidth += 1;
      }
      line += word;
      lineWidth += wordWidth;
    }
    flush();
  }
  return lines.length > 0 ? lines : [""];
}

/** 每行前加缩进。 */
export function indentBlock(block: string, indent: string): string {
  return block
    .split("\n")
    .map((line) => (line.length > 0 ? indent + line : line))
    .join("\n");
}

/** 对齐列渲染:每列宽 = 该列最宽格,列间 3 空格。首行是表头。 */
export function renderAlignedRows(rows: string[][]): string {
  const columnCount = Math.max(...rows.map((r) => r.length), 0);
  const widths: number[] = [];
  for (let c = 0; c < columnCount; c++) {
    widths.push(Math.max(...rows.map((r) => stringWidth(r[c] ?? ""))));
  }
  return rows
    .map((row) =>
      row
        .map((cell, c) => (c === row.length - 1 ? cell : padDisplay(cell, widths[c])))
        .join("   ")
        .replace(/\s+$/, ""),
    )
    .join("\n");
}

/** 字符条形:filled 比例 → █ 填充、░ 补齐到 barWidth。 */
export function textBar(ratio: number, barWidth: number): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  const filled = Math.round(clamped * barWidth);
  return "█".repeat(filled) + "░".repeat(barWidth - filled);
}

/** 多块并排(Row 的 text 面):逐行拼接,各栏折到自己的宽度,短栏补齐。 */
export function joinColumns(blocks: string[], columnWidths: number[], separator = " │ "): string {
  const columns = blocks.map((block) => block.split("\n"));
  const height = Math.max(...columns.map((lines) => lines.length), 0);
  const out: string[] = [];
  for (let i = 0; i < height; i++) {
    const parts = columns.map((lines, c) => padDisplay(lines[i] ?? "", columnWidths[c]));
    out.push(parts.join(separator).replace(/\s+$/, ""));
  }
  return out.join("\n");
}

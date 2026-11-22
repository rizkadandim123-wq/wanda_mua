import { Fragment, type ReactNode } from 'react';

interface FormattedTextProps {
  text: string;
}

type FormatMarker = '*' | '#' | '$';

const MARKERS: FormatMarker[] = ['*', '#', '$'];

/**
 * Mencari pasangan penutup yang valid untuk tanda format (*, #, $) pada baris yang sama.
 * Menghindari false-positive seperti "$100" atau "#1" atau tanda yang diikuti/didahului spasi.
 */
function findClosingMarker(input: string, startIdx: number, marker: FormatMarker): number {
  const afterOpen = input[startIdx + 1];
  if (!afterOpen || /\s/.test(afterOpen) || afterOpen === marker) {
    return -1;
  }

  for (let i = startIdx + 2; i < input.length; i++) {
    const ch = input[i];
    if (ch === '\n') return -1;
    if (ch === marker) {
      const beforeClose = input[i - 1];
      if (beforeClose && !/\s/.test(beforeClose)) {
        return i;
      }
    }
  }
  return -1;
}

function parseInlineFormatting(
  input: string,
  activeMarkers: Set<FormatMarker>,
  keyPrefix = 'f'
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let plainStart = 0;
  let i = 0;
  let segmentIndex = 0;

  while (i < input.length) {
    const ch = input[i] as FormatMarker;
    if (MARKERS.includes(ch) && !activeMarkers.has(ch)) {
      const closeIdx = findClosingMarker(input, i, ch);
      if (closeIdx !== -1) {
        if (i > plainStart) {
          nodes.push(
            <Fragment key={`${keyPrefix}-t-${segmentIndex++}`}>
              {input.slice(plainStart, i)}
            </Fragment>
          );
        }

        const innerText = input.slice(i + 1, closeIdx);
        const nextActive = new Set(activeMarkers);
        nextActive.add(ch);
        const children = parseInlineFormatting(
          innerText,
          nextActive,
          `${keyPrefix}-${segmentIndex}`
        );

        const nodeKey = `${keyPrefix}-m-${segmentIndex++}`;
        if (ch === '*') {
          nodes.push(
            <em key={nodeKey} className="italic">
              {children}
            </em>
          );
        } else if (ch === '#') {
          nodes.push(
            <strong key={nodeKey} className="font-bold">
              {children}
            </strong>
          );
        } else {
          nodes.push(
            <del key={nodeKey} className="line-through decoration-[1.5px] opacity-80">
              {children}
            </del>
          );
        }

        i = closeIdx + 1;
        plainStart = i;
        continue;
      }
    }
    i += 1;
  }

  if (plainStart < input.length) {
    nodes.push(
      <Fragment key={`${keyPrefix}-t-${segmentIndex++}`}>
        {input.slice(plainStart)}
      </Fragment>
    );
  }

  return nodes;
}

/**
 * Menghapus tanda format (*miring*, #bold#, $coret$) untuk keperluan aria-label / teks polos.
 */
export function stripTextFormatting(text: string): string {
  if (!text) return '';
  let result = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i] as FormatMarker;
    if (MARKERS.includes(ch)) {
      const closeIdx = findClosingMarker(text, i, ch);
      if (closeIdx !== -1) {
        result += stripTextFormatting(text.slice(i + 1, closeIdx));
        i = closeIdx + 1;
        continue;
      }
    }
    result += text[i];
    i += 1;
  }
  return result;
}

/**
 * Merender teks dengan dukungan format inline yang aman dari XSS (tanpa HTML mentah):
 * - *kata* -> miring (italic)
 * - #kata# -> tebal (bold)
 * - $kata$ -> coret (strikethrough)
 * Mendukung kombinasi bersarang seperti #*tebal miring*#.
 */
export function FormattedText({ text }: FormattedTextProps) {
  if (!text) return null;
  return <>{parseInlineFormatting(text, new Set())}</>;
}

/** Alias untuk komponen judul yang sudah memakai FormattedTitle */
export function FormattedTitle({ text }: FormattedTextProps) {
  return <FormattedText text={text} />;
}

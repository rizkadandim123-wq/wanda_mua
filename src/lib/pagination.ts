export interface PaginationWindow {
  currentPage: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  pages: number[];
  hasPrevWindow: boolean;
  hasNextWindow: boolean;
  prevWindowTarget: number;
  nextWindowTarget: number;
}

/**
 * Menghitung jendela nomor halaman pagination maksimal `maxVisible` halaman sekaligus.
 * Contoh untuk maxVisible = 10 & totalPages = 25:
 * - Halaman 1..10  -> [1..10], hasPrevWindow=false, hasNextWindow=true (target 11)
 * - Halaman 11..20 -> [11..20], hasPrevWindow=true (target 10), hasNextWindow=true (target 21)
 */
export function getPaginationWindow(
  currentPage: number,
  totalPages: number,
  maxVisible = 10
): PaginationWindow {
  const safeTotal = Math.max(0, Math.floor(totalPages));
  const safeMax = Math.max(1, Math.floor(maxVisible));

  if (safeTotal === 0) {
    return {
      currentPage: 1,
      totalPages: 0,
      startPage: 1,
      endPage: 0,
      pages: [],
      hasPrevWindow: false,
      hasNextWindow: false,
      prevWindowTarget: 1,
      nextWindowTarget: 1,
    };
  }

  const safeCurrent = Math.min(Math.max(1, Math.floor(currentPage)), safeTotal);
  const windowIndex = Math.floor((safeCurrent - 1) / safeMax);
  const startPage = windowIndex * safeMax + 1;
  const endPage = Math.min(safeTotal, startPage + safeMax - 1);

  const pages: number[] = [];
  for (let p = startPage; p <= endPage; p += 1) {
    pages.push(p);
  }

  return {
    currentPage: safeCurrent,
    totalPages: safeTotal,
    startPage,
    endPage,
    pages,
    hasPrevWindow: startPage > 1,
    hasNextWindow: endPage < safeTotal,
    prevWindowTarget: Math.max(1, startPage - 1),
    nextWindowTarget: Math.min(safeTotal, endPage + 1),
  };
}

export function formatIdrCurrency(value: number): string {
  const safeValue = Math.max(0, Math.round(value));
  return `Rp ${safeValue.toLocaleString('id-ID')}`;
}

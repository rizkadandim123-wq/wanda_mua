export function TextFormatHint({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-[#594448]/75 leading-relaxed ${className}`}>
      Format teks:{' '}
      <code className="rounded bg-[#F8E6EB]/70 px-1 py-0.5 text-[#8F454B]">*miring*</code> →{' '}
      <em className="italic">miring</em> ·{' '}
      <code className="rounded bg-[#F8E6EB]/70 px-1 py-0.5 text-[#8F454B]">#tebal#</code> →{' '}
      <strong className="font-bold">tebal</strong> ·{' '}
      <code className="rounded bg-[#F8E6EB]/70 px-1 py-0.5 text-[#8F454B]">$coret$</code> →{' '}
      <del className="line-through opacity-80">coret</del>{' '}
      <span className="opacity-80">(bisa digabung, mis. <code>#*tebal miring*#</code>)</span>
    </p>
  );
}

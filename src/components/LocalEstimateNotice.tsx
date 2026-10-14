export function LocalEstimateNotice({ message }: { message: string }) {
  return (
    <p role="note" className="rounded-xl border border-[#FFB020]/30 bg-[#FFB020]/10 p-3 text-xs font-medium text-[#FFB020]">
      {message}
    </p>
  );
}

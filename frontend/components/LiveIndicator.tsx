export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-live animate-live-pulse" />
      <span className="text-live text-[10px] font-extrabold tracking-wider">LIVE</span>
    </span>
  );
}

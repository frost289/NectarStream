export default function EqualizerBars() {
  return (
    <div className="flex items-end gap-0.5 h-3.5 w-3.5">
      <span className="w-1 h-full origin-bottom rounded-full bg-gradient-to-t from-wave-cyan to-wave-orange animate-[eq-bounce_0.9s_ease-in-out_infinite]" />
      <span className="w-1 h-full origin-bottom rounded-full bg-gradient-to-t from-wave-cyan to-wave-orange animate-[eq-bounce_1.1s_ease-in-out_infinite]" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-full origin-bottom rounded-full bg-gradient-to-t from-wave-cyan to-wave-orange animate-[eq-bounce_0.8s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
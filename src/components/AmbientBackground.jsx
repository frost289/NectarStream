export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-wave-cyan/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-wave-orange/10 rounded-full blur-3xl" />
    </div>
  );
}
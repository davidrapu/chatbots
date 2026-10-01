export default function Loader() {
  return (
    <div className="flex items-center gap-1 py-1.5" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 rounded-full bg-stone-400 motion-safe:animate-bounce dark:bg-stone-500"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export default function FormError({ message }) {
  if (!message) return null;

  return (
    <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
      {message}
    </p>
  );
}

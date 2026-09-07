// Always renders its line box, even with no message, so a field's error
// text appearing/disappearing never shifts the layout below it.
export default function FieldError({ message, className = "" }) {
  return (
    <p className={`text-red-500 text-xs min-h-[1rem] ${className}`}>
      {message || " "}
    </p>
  );
}

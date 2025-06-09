export default function Toast({ message }) {
  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50 animate-fade-in">
      {message}
    </div>
  );
}

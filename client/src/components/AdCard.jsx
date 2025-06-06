function AdCard({ ad }) {
  const imageUrl = ad.image
    ? `http://localhost:5000/uploads/${ad.image}`
    : null;

  return (
    <div className="border rounded-lg shadow p-4 bg-white">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={ad.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}
      <h2 className="text-xl font-semibold">{ad.title}</h2>
      <p className="text-gray-600 mb-2">{ad.description}</p>
      <p className="text-green-700 font-bold">{ad.price} €</p>
      <p className="text-sm text-gray-500">📍 {ad.location || 'Unbekannt'}</p>
    </div>
  );
}

export default AdCard;

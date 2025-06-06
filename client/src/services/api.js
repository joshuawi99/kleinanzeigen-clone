const API_URL = 'http://localhost:5000/api';

export async function fetchAds() {
  const response = await fetch(`${API_URL}/ads`);
  if (!response.ok) throw new Error('Fehler beim Laden der Anzeigen');
  return response.json();
}

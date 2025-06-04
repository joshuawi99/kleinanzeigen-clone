import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/ads'

function App() {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ title: '', description: '', price: '' })

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()
        setAds(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAds()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const created = await res.json()
      setAds([created, ...ads])
      setFormData({ title: '', description: '', price: '' })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="App">
      <h1>Kleinanzeigen</h1>

      <form onSubmit={handleSubmit} className="ad-form">
        <input
          name="title"
          placeholder="Titel"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Beschreibung"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          name="price"
          type="number"
          placeholder="Preis"
          value={formData.price}
          onChange={handleChange}
        />
        <button type="submit">Erstellen</button>
      </form>

      {loading ? (
        <p>Lade...</p>
      ) : (
        <ul className="ads-list">
          {ads.map((ad) => (
            <li key={ad._id} className="ad-item">
              <h3>{ad.title}</h3>
              {ad.description && <p>{ad.description}</p>}
              {ad.price !== undefined && <p>{ad.price} €</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App

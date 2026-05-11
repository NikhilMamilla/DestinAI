export default async function handler(req, res) {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat or lon parameters' });
  }

  const query = `[out:json][timeout:25];(node["tourism"~"hotel|hostel|guest_house"](around:5000,${lat},${lon});way["tourism"~"hotel|hostel|guest_house"](around:5000,${lat},${lon}););out center;`;
  
  const mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter"
  ];

  for (const mirror of mirrors) {
    try {
      const url = `${mirror}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DestinAI/1.0 (https://destin-ai-iota.vercel.app)'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch (error) {
      console.error(`Mirror ${mirror} failed in proxy:`, error);
    }
  }

  res.status(502).json({ error: 'All Overpass mirrors failed' });
}

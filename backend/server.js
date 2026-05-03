// Station Météo IoT — Backend Node.js/Express pour Vercel + MongoDB Atlas
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

// Connexion MongoDB cachée (important pour Vercel serverless)
let cachedConn = null;
async function connectDB() {
  if (cachedConn) return cachedConn;
  cachedConn = await mongoose.connect(process.env.MONGODB_URI);
  return cachedConn;
}

// Modèle MongoDB
const weatherSchema = new mongoose.Schema({
  temperature: { type: Number, required: true, min: -40, max: 80  },
  humidity:    { type: Number, required: true, min: 0,   max: 100 },
  device_id:   { type: String, default: 'esp32-wokwi' },
  timestamp:   { type: Date,   default: Date.now }
});
weatherSchema.index({ timestamp: -1 });
const Weather = mongoose.models.WeatherData || mongoose.model('WeatherData', weatherSchema);

// Vérification clé API
function checkKey(req, res, next) {
  const key = (req.body && req.body.api_key) || req.headers['x-api-key'];
  if (!key || key !== process.env.API_KEY)
    return res.status(401).json({ error: 'Clé API invalide' });
  next();
}

// POST /api/data - recevoir données ESP32/Wokwi
app.post('/api/data', checkKey, async (req, res) => {
  try {
    await connectDB();
    const { temperature, humidity, device_id } = req.body;
    if (temperature == null || humidity == null)
      return res.status(400).json({ error: 'temperature et humidity requis' });
    if (temperature < -40 || temperature > 80)
      return res.status(400).json({ error: 'Temperature hors plage' });
    if (humidity < 0 || humidity > 100)
      return res.status(400).json({ error: 'Humidite hors plage' });
    const entry = await Weather.create({
      temperature: Math.round(parseFloat(temperature) * 10) / 10,
      humidity:    Math.round(parseFloat(humidity) * 10) / 10,
      device_id:   device_id || 'esp32-wokwi'
    });
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/data - données pour le dashboard
app.get('/api/data', async (req, res) => {
  try {
    await connectDB();
    const limit = Math.min(parseInt(req.query.limit) || 60, 200);
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 3600000);
    const data = await Weather
      .find({ timestamp: { $gte: since } })
      .sort({ timestamp: -1 }).limit(limit).lean();
    res.json({ success: true, count: data.length, data: data.reverse() });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/stats - statistiques
app.get('/api/stats', async (req, res) => {
  try {
    await connectDB();
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 3600000);
    const [s] = await Weather.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: {
        _id: null,
        avgT: { $avg: '$temperature' }, minT: { $min: '$temperature' }, maxT: { $max: '$temperature' },
        avgH: { $avg: '$humidity' },    minH: { $min: '$humidity' },    maxH: { $max: '$humidity' },
        cnt: { $sum: 1 }
      }}
    ]);
    if (!s) return res.json({ success: true, stats: null });
    res.json({ success: true, stats: {
      temperature: { avg: +s.avgT.toFixed(1), min: s.minT, max: s.maxT },
      humidity:    { avg: +s.avgH.toFixed(1), min: s.minH, max: s.maxH },
      total_readings: s.cnt
    }});
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/latest - dernière mesure
app.get('/api/latest', async (req, res) => {
  try {
    await connectDB();
    const doc = await Weather.findOne().sort({ timestamp: -1 }).lean();
    res.json({ success: true, data: doc || null });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Servir le dashboard
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Export pour Vercel (OBLIGATOIRE - remplace app.listen)
module.exports = app;

// Démarrage local uniquement
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB().then(() =>
    app.listen(PORT, () => console.log('Local: http://localhost:' + PORT))
  );
}

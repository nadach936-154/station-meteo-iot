// Station Météo IoT — Backend Node.js/Express pour Vercel + MongoDB Atlas
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Dashboard HTML intégré directement (pas de fichiers statiques) ──
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Station Météo IoT</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
:root{--bg:#07090f;--surf:#0e1120;--bdr:#1c2640;--blue:#4a90ff;--cyan:#00e5ff;--orange:#ff6b35;--green:#22c55e;--red:#ef4444;--txt:#e8eef8;--mut:#4a5878;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Syne',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;}
body::before{content:'';position:fixed;inset:0;z-index:0;background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(74,144,255,.07),transparent),linear-gradient(rgba(74,144,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(74,144,255,.02) 1px,transparent 1px);background-size:100%,48px 48px,48px 48px;pointer-events:none;}
header{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:20px 36px;border-bottom:1px solid var(--bdr);background:rgba(14,17,32,.85);backdrop-filter:blur(24px);}
.brand{display:flex;align-items:center;gap:14px;}
.brand-icon{width:44px;height:44px;background:linear-gradient(135deg,var(--blue),var(--cyan));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 24px rgba(74,144,255,.3);}
.brand-name{font-size:1.15rem;font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,#fff,var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.brand-sub{font-family:'Space Mono',monospace;font-size:.6rem;color:var(--mut);-webkit-text-fill-color:var(--mut);}
.status-bar{display:flex;align-items:center;gap:8px;font-family:'Space Mono',monospace;font-size:.68rem;color:var(--mut);}
.dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:blink 2s infinite;}
.dot.err{background:var(--red);box-shadow:0 0 10px var(--red);animation:none;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
main{position:relative;z-index:5;max-width:1240px;margin:0 auto;padding:36px 20px;}
.live-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px;}
.live-card{background:var(--surf);border:1px solid var(--bdr);border-radius:22px;padding:30px 34px;position:relative;overflow:hidden;transition:border-color .3s;}
.live-card:hover{border-color:rgba(74,144,255,.4);}
.live-card::after{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;filter:blur(50px);opacity:.07;pointer-events:none;}
.live-card.temp::after{background:var(--orange);}.live-card.hum::after{background:var(--cyan);}
.lc-label{font-family:'Space Mono',monospace;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--mut);margin-bottom:14px;}
.lc-value{font-size:3.8rem;font-weight:800;line-height:1;letter-spacing:-.05em;}
.live-card.temp .lc-value{color:var(--orange);}.live-card.hum .lc-value{color:var(--cyan);}
.lc-unit{font-size:1.4rem;font-weight:400;color:var(--mut);margin-left:2px;}
.lc-bar{height:4px;border-radius:4px;margin-top:18px;background:var(--bdr);overflow:hidden;}
.lc-fill{height:100%;border-radius:4px;transition:width .8s ease;}
.live-card.temp .lc-fill{background:linear-gradient(90deg,var(--blue),var(--orange));}
.live-card.hum  .lc-fill{background:linear-gradient(90deg,var(--blue),var(--cyan));}
.lc-time{font-family:'Space Mono',monospace;font-size:.6rem;color:var(--mut);margin-top:10px;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px;}
.stat-card{background:var(--surf);border:1px solid var(--bdr);border-radius:14px;padding:18px 22px;}
.stat-label{font-family:'Space Mono',monospace;font-size:.58rem;color:var(--mut);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px;}
.stat-val{font-size:1.5rem;font-weight:800;letter-spacing:-.03em;}
.c-or{color:var(--orange);}.c-bl{color:var(--blue);}.c-cy{color:var(--cyan);}.c-gr{color:var(--green);}
.charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px;}
.chart-card{background:var(--surf);border:1px solid var(--bdr);border-radius:20px;padding:26px;}
.chart-hd{font-family:'Space Mono',monospace;font-size:.6rem;color:var(--mut);text-transform:uppercase;letter-spacing:.12em;margin-bottom:18px;}
.chart-wrap{position:relative;height:210px;}
.log-card{background:var(--surf);border:1px solid var(--bdr);border-radius:20px;padding:26px;}
.log-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
.log-title{font-family:'Space Mono',monospace;font-size:.6rem;color:var(--mut);text-transform:uppercase;letter-spacing:.12em;}
.btn-ref{font-family:'Space Mono',monospace;font-size:.62rem;color:var(--blue);background:rgba(74,144,255,.1);border:1px solid rgba(74,144,255,.3);padding:5px 14px;border-radius:7px;cursor:pointer;transition:all .2s;}
.btn-ref:hover{background:rgba(74,144,255,.2);}
table{width:100%;border-collapse:collapse;}
th{font-family:'Space Mono',monospace;font-size:.58rem;color:var(--mut);text-align:left;padding:9px 14px;text-transform:uppercase;border-bottom:1px solid var(--bdr);}
td{padding:11px 14px;font-size:.82rem;border-bottom:1px solid rgba(28,38,64,.6);}
tr:last-child td{border-bottom:none;}tr:hover td{background:rgba(74,144,255,.04);}
.td-temp{font-family:'Space Mono',monospace;font-weight:700;color:var(--orange);}
.td-hum{font-family:'Space Mono',monospace;font-weight:700;color:var(--cyan);}
.td-ts{font-family:'Space Mono',monospace;font-size:.68rem;color:var(--mut);}
.empty{text-align:center;padding:50px;font-family:'Space Mono',monospace;font-size:.75rem;color:var(--mut);}
footer{text-align:center;padding:28px;font-family:'Space Mono',monospace;font-size:.6rem;color:var(--mut);border-top:1px solid var(--bdr);position:relative;z-index:5;}
@media(max-width:760px){header{padding:16px 20px;flex-wrap:wrap;gap:12px;}.live-grid,.charts-grid,.stats-grid{grid-template-columns:1fr;}.lc-value{font-size:3rem;}}
</style>
</head>
<body>
<header>
  <div class="brand">
    <div class="brand-icon">🌡️</div>
    <div>
      <div class="brand-name">WeatherStation IoT</div>
      <div class="brand-sub">WOKWI · VERCEL · MONGODB ATLAS · TEMPS RÉEL</div>
    </div>
  </div>
  <div class="status-bar">
    <div class="dot" id="dot"></div>
    <span id="statusTxt">Connexion...</span>
  </div>
</header>
<main>
  <div class="live-grid">
    <div class="live-card temp">
      <div class="lc-label">🌡 Température actuelle</div>
      <div class="lc-value" id="valTemp">--<span class="lc-unit">°C</span></div>
      <div class="lc-bar"><div class="lc-fill" id="barTemp" style="width:0%"></div></div>
      <div class="lc-time" id="timeTemp">En attente de données...</div>
    </div>
    <div class="live-card hum">
      <div class="lc-label">💧 Humidité actuelle</div>
      <div class="lc-value" id="valHum">--<span class="lc-unit">%</span></div>
      <div class="lc-bar"><div class="lc-fill" id="barHum" style="width:0%"></div></div>
      <div class="lc-time" id="timeHum">En attente de données...</div>
    </div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-label">🔥 Temp. max 24h</div><div class="stat-val c-or" id="sMaxT">--</div></div>
    <div class="stat-card"><div class="stat-label">❄️ Temp. min 24h</div><div class="stat-val c-bl" id="sMinT">--</div></div>
    <div class="stat-card"><div class="stat-label">〜 Moy. humidité</div><div class="stat-val c-cy" id="sAvgH">--</div></div>
    <div class="stat-card"><div class="stat-label">📊 Total mesures</div><div class="stat-val c-gr" id="sCnt">--</div></div>
  </div>
  <div class="charts-grid">
    <div class="chart-card">
      <div class="chart-hd">▸ Température — dernières mesures</div>
      <div class="chart-wrap"><canvas id="cTemp"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-hd">▸ Humidité — dernières mesures</div>
      <div class="chart-wrap"><canvas id="cHum"></canvas></div>
    </div>
  </div>
  <div class="log-card">
    <div class="log-hd">
      <div class="log-title">▸ Journal des mesures</div>
      <button class="btn-ref" onclick="loadAll()">↺ Actualiser</button>
    </div>
    <div id="tableWrap"><div class="empty">Démarre Wokwi pour voir les données apparaître ici</div></div>
  </div>
</main>
<footer>Station Météo Connectée · ESP32 (Wokwi) · Node.js (Vercel) · MongoDB Atlas · Mise à jour toutes les 10s</footer>
<script>
const API=window.location.origin;
const copts={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},animation:{duration:400},scales:{x:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4a5878',font:{family:'Space Mono',size:9},maxTicksLimit:7}},y:{grid:{color:'rgba(255,255,255,.03)'},ticks:{color:'#4a5878',font:{family:'Space Mono',size:9}}}}};
const cTemp=new Chart(document.getElementById('cTemp'),{type:'line',options:{...copts,scales:{...copts.scales,y:{...copts.scales.y,suggestedMin:10,suggestedMax:45}}},data:{labels:[],datasets:[{data:[],borderColor:'#ff6b35',backgroundColor:'rgba(255,107,53,.08)',borderWidth:2,fill:true,tension:.45,pointRadius:2,pointHoverRadius:5}]}});
const cHum=new Chart(document.getElementById('cHum'),{type:'line',options:{...copts,scales:{...copts.scales,y:{...copts.scales.y,suggestedMin:20,suggestedMax:95}}},data:{labels:[],datasets:[{data:[],borderColor:'#00e5ff',backgroundColor:'rgba(0,229,255,.06)',borderWidth:2,fill:true,tension:.45,pointRadius:2,pointHoverRadius:5}]}});
const fmtHM=s=>new Date(s).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
const fmtFull=s=>new Date(s).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
async function loadAll(){
  try{
    const r=await fetch(API+'/api/data?limit=60&hours=24');
    const j=await r.json();
    if(!j.success||!j.data.length){
      document.getElementById('statusTxt').textContent='Aucune donnée';
      document.getElementById('dot').className='dot err';
      document.getElementById('tableWrap').innerHTML='<div class="empty">Aucune donnée · Démarre Wokwi et attends 10 secondes</div>';
      return;
    }
    const data=j.data,last=data[data.length-1];
    const tPct=Math.min(100,Math.max(0,((last.temperature-10)/(45-10)*100)));
    document.getElementById('valTemp').innerHTML=\`\${last.temperature}<span class="lc-unit">°C</span>\`;
    document.getElementById('valHum').innerHTML=\`\${last.humidity}<span class="lc-unit">%</span>\`;
    document.getElementById('barTemp').style.width=tPct+'%';
    document.getElementById('barHum').style.width=Math.min(100,last.humidity)+'%';
    document.getElementById('timeTemp').textContent='Dernière mesure : '+fmtFull(last.timestamp);
    document.getElementById('timeHum').textContent='Dernière mesure : '+fmtFull(last.timestamp);
    const labels=data.map(d=>fmtHM(d.timestamp));
    cTemp.data.labels=labels;cTemp.data.datasets[0].data=data.map(d=>d.temperature);cTemp.update('active');
    cHum.data.labels=labels;cHum.data.datasets[0].data=data.map(d=>d.humidity);cHum.update('active');
    const rows=[...data].reverse().slice(0,12).map(d=>\`<tr><td class="td-temp">\${d.temperature} °C</td><td class="td-hum">\${d.humidity} %</td><td style="color:#4a5878;font-size:.72rem">\${d.device_id||'esp32-wokwi'}</td><td class="td-ts">\${fmtFull(d.timestamp)}</td></tr>\`).join('');
    document.getElementById('tableWrap').innerHTML=\`<table><thead><tr><th>Température</th><th>Humidité</th><th>Device</th><th>Timestamp</th></tr></thead><tbody>\${rows}</tbody></table>\`;
    document.getElementById('statusTxt').textContent='En ligne · '+j.count+' mesures';
    document.getElementById('dot').className='dot';
    const sr=await fetch(API+'/api/stats?hours=24');
    const sj=await sr.json();
    if(sj.success&&sj.stats){
      document.getElementById('sMaxT').textContent=sj.stats.temperature.max+'°C';
      document.getElementById('sMinT').textContent=sj.stats.temperature.min+'°C';
      document.getElementById('sAvgH').textContent=sj.stats.humidity.avg+'%';
      document.getElementById('sCnt').textContent=sj.stats.total_readings;
    }
  }catch(e){
    document.getElementById('statusTxt').textContent='Erreur de connexion';
    document.getElementById('dot').className='dot err';
  }
}
loadAll();setInterval(loadAll,10000);
</script>
</body>
</html>
`;

// ── Connexion MongoDB cachée pour Vercel serverless ──
let cachedConn = null;
async function connectDB() {
  if (cachedConn) return cachedConn;
  cachedConn = await mongoose.connect(process.env.MONGODB_URI);
  return cachedConn;
}

// ── Modèle MongoDB ──
const weatherSchema = new mongoose.Schema({
  temperature: { type: Number, required: true, min: -40, max: 80  },
  humidity:    { type: Number, required: true, min: 0,   max: 100 },
  device_id:   { type: String, default: 'esp32-wokwi' },
  timestamp:   { type: Date,   default: Date.now }
});
weatherSchema.index({ timestamp: -1 });
const Weather = mongoose.models.WeatherData || mongoose.model('WeatherData', weatherSchema);

// ── Vérification clé API ──
function checkKey(req, res, next) {
  const key = (req.body && req.body.api_key) || req.headers['x-api-key'];
  if (!key || key !== process.env.API_KEY)
    return res.status(401).json({ error: 'Clé API invalide' });
  next();
}

// POST /api/data
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
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/data
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

// GET /api/stats
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

// GET /api/latest
app.get('/api/latest', async (req, res) => {
  try {
    await connectDB();
    const doc = await Weather.findOne().sort({ timestamp: -1 }).lean();
    res.json({ success: true, data: doc || null });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET / — Servir le dashboard HTML
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(DASHBOARD_HTML);
});

// Export pour Vercel
module.exports = app;

// Démarrage local
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB().then(() =>
    app.listen(PORT, () => console.log('Local: http://localhost:' + PORT))
  );
}

# 🌡️ Station Météo IoT — Cloud 100% Gratuit

## Stack utilisée (tout gratuit, zéro carte bancaire)

| Service | Rôle | Prix |
|---------|------|------|
| **Wokwi.com** | Simulation ESP32 + DHT11 dans le navigateur | 🆓 Gratuit |
| **GitHub** | Héberger le code | 🆓 Gratuit |
| **Vercel** | Backend Node.js serverless (sans sleep !) | 🆓 Gratuit |
| **MongoDB Atlas M0** | Base de données cloud 512 MB | 🆓 Gratuit pour toujours |

---

## 📁 Structure du projet

```
station-meteo-iot/
├── vercel.json              ← Configuration Vercel (obligatoire)
├── wokwi/
│   ├── sketch.ino           ← Code Arduino pour Wokwi
│   └── diagram.json         ← Schéma de câblage ESP32 + DHT11
├── backend/
│   ├── server.js            ← API REST Node.js/Express
│   ├── package.json         ← Dépendances Node.js
│   ├── .env.example         ← Modèle de configuration
│   └── .gitignore           ← Protège les secrets
├── frontend/
│   └── index.html           ← Dashboard web complet
└── README.md
```

---

## 🚀 Guide de déploiement complet

---

### ÉTAPE 1 — MongoDB Atlas (5 min)

1. Aller sur **https://cloud.mongodb.com**
2. Créer un compte avec email (pas de carte bancaire)
3. Cliquer **"Build a Database"** → choisir **Free (M0)**
4. Choisir AWS + n'importe quelle région
5. **Créer un utilisateur :**
   - Username : `admin`
   - Password : `choisir-un-mot-de-passe`
6. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
7. **Database** → **Connect** → **Drivers** → copier l'URI :
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/weather_station
   ```
   *(Remplacer `<password>` par ton vrai mot de passe)*

---

### ÉTAPE 2 — GitHub (2 min)

1. Créer un compte sur **https://github.com**
2. Créer un nouveau dépôt public : `station-meteo-iot`
3. Uploader tous les fichiers du projet (glisser-déposer sur GitHub)
4. S'assurer que `.env` n'est PAS uploadé (il est dans `.gitignore`)

---

### ÉTAPE 3 — Vercel (3 min)

1. Aller sur **https://vercel.com**
2. Créer un compte avec GitHub (zéro CB)
3. **New Project** → importer le repo `station-meteo-iot`
4. Laisser les paramètres par défaut (Vercel lit `vercel.json` automatiquement)
5. **Environment Variables** → ajouter :

   | Variable | Valeur |
   |----------|--------|
   | `MONGODB_URI` | `mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/weather_station` |
   | `API_KEY` | `iot-secret-2024` |

6. Cliquer **Deploy**
7. Vercel te donne une URL publique (ex: `https://station-meteo-iot.vercel.app`)

---

### ÉTAPE 4 — Wokwi (3 min)

1. Aller sur **https://wokwi.com/projects/new/esp32**
2. Dans l'éditeur, cliquer sur l'onglet **sketch.ino** et coller le contenu de `wokwi/sketch.ino`
3. Cliquer sur l'onglet **diagram.json** et coller le contenu de `wokwi/diagram.json`
4. Dans `sketch.ino`, remplacer cette ligne :
   ```cpp
   const char* SERVER_URL = "https://TON-PROJET.vercel.app/api/data";
   ```
   par ton URL Vercel obtenue à l'étape 3

5. Cliquer **▶ Play**
6. Dans le Serial Monitor, tu verras :
   ```
   ✓ WiFi connecté : 10.0.0.2
   📊 Temp: 24.5°C  |  Hum: 58.0%
   ✓ Données envoyées vers Vercel !
   ```

---

### ÉTAPE 5 — Voir le Dashboard

Ouvrir dans le navigateur :
```
https://station-meteo-iot.vercel.app
```

Les données apparaissent automatiquement et se mettent à jour toutes les **10 secondes** !

---

## 🔧 Tester l'API depuis PowerShell (Windows)

```powershell
# Voir les données
Invoke-RestMethod "https://station-meteo-iot.vercel.app/api/data"

# Envoyer une mesure manuellement
Invoke-RestMethod -Uri "https://station-meteo-iot.vercel.app/api/data" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"temperature": 26.5, "humidity": 63.0, "api_key": "iot-secret-2024"}'

# Statistiques
Invoke-RestMethod "https://station-meteo-iot.vercel.app/api/stats"

# Dernière mesure
Invoke-RestMethod "https://station-meteo-iot.vercel.app/api/latest"
```

---

## 📡 Routes API disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/data` | Enregistrer une mesure (ESP32/Wokwi) |
| `GET` | `/api/data` | Récupérer les données (dashboard) |
| `GET` | `/api/stats` | Statistiques min/max/moyenne |
| `GET` | `/api/latest` | Dernière mesure |

---

## ⚙️ Modifier la température simulée sur Wokwi

Dans Wokwi, clique sur le capteur DHT22 dans le schéma pour changer :
- **temperature** : valeur simulée en °C (ex: `28.5`)
- **humidity** : valeur simulée en % (ex: `72.0`)

---

## 🛠️ Dépannage

| Problème | Solution |
|----------|----------|
| Wokwi — pas de WiFi | Le SSID `Wokwi-GUEST` est automatique, ne pas changer |
| Wokwi — erreur 401 | Vérifier que `API_KEY` dans le code = `API_KEY` dans Vercel |
| Wokwi — erreur réseau | Vérifier l'URL Vercel dans `SERVER_URL` |
| Vercel — Build failed | Vérifier que `vercel.json` est bien à la racine du projet |
| Atlas — connexion refusée | Vérifier `0.0.0.0/0` dans Network Access |
| Dashboard vide | Attendre 10 secondes après avoir lancé Wokwi |
=======
# station-meteo-iot


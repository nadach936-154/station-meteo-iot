/*
  ╔══════════════════════════════════════════════════════════════╗
  ║   STATION MÉTÉO IoT — Code ESP32 pour WOKWI.COM             ║
  ║   Simulation ESP32 + DHT11 → Vercel → MongoDB Atlas          ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  Instructions Wokwi :                                        ║
  ║  1. Aller sur wokwi.com → New Project → ESP32               ║
  ║  2. Coller ce code dans l'éditeur (onglet sketch.ino)        ║
  ║  3. Coller diagram.json dans l'onglet diagram.json           ║
  ║  4. Remplacer SERVER_URL par ton URL Vercel                  ║
  ║  5. Cliquer ▶ Play                                           ║
  ╚══════════════════════════════════════════════════════════════╝
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHTesp.h"

// ─── WiFi Wokwi (fonctionne automatiquement dans le simulateur) ──
const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// ─── !! REMPLACE PAR TON URL VERCEL !! ──────────────────────────
const char* SERVER_URL = "https://TON-PROJET.vercel.app/api/data";
const char* API_KEY    = "iot-secret-2024";

// ─── Capteur DHT11 ───────────────────────────────────────────────
#define DHT_PIN 15
DHTesp dht;

// ─── Timing : envoi toutes les 10 secondes ───────────────────────
const unsigned long INTERVAL = 10000;
unsigned long lastSend = 0;

// ════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  dht.setup(DHT_PIN, DHTesp::DHT11);
  delay(2000);

  Serial.println("\n╔══════════════════════════════╗");
  Serial.println("║  Station Météo Wokwi         ║");
  Serial.println("╚══════════════════════════════╝");

  Serial.print("→ Connexion WiFi Wokwi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✓ WiFi connecté : " + WiFi.localIP().toString());
  Serial.println("✓ Envoi vers : " + String(SERVER_URL));
  Serial.println("─────────────────────────────────");
}

// ════════════════════════════════════════════════════════════════
void loop() {
  if (millis() - lastSend < INTERVAL) return;
  lastSend = millis();

  // Lire capteur DHT11
  TempAndHumidity data = dht.getTempAndHumidity();
  float temp = data.temperature;
  float hum  = data.humidity;

  if (isnan(temp) || isnan(hum)) {
    Serial.println("✗ Erreur lecture DHT11 — vérifier le câblage");
    return;
  }

  Serial.printf("📊 Temp: %.1f°C  |  Hum: %.1f%%\n", temp, hum);

  // Construire le JSON
  StaticJsonDocument<200> doc;
  doc["temperature"] = round(temp * 10) / 10.0;
  doc["humidity"]    = round(hum  * 10) / 10.0;
  doc["device_id"]   = "esp32-wokwi";
  doc["api_key"]     = API_KEY;
  String body;
  serializeJson(doc, body);

  // Envoyer vers Vercel
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(body);
    if      (code == 201) Serial.println("✓ Données envoyées vers Vercel !");
    else if (code == 401) Serial.println("✗ Clé API invalide");
    else                  Serial.printf("⚠ Réponse serveur: %d\n", code);
    http.end();
  } else {
    Serial.println("⚠ WiFi déconnecté");
  }
}

/*
  SmartTerra - main.cpp
  - Integrates calibrated soil sensor + DHT11 + pump control
  - WebSocket client sends JSON readings to a server and receives commands

  Serial calibration commands (open Serial Monitor, 115200 baud, no NL/CR required):
   'a' -> record current soil raw as AIR (dry)
   'w' -> record current soil raw as WATER (wet)
   '?' -> print current calibration values
   's' -> save current calibration to flash (Preferences)
   'r' -> reset calibration to built-in defaults and save

  Notes:
   - Default calibration values are set to your measured values (AIR=4095, WATER=1115)
   - The code will load saved calibration from NVS (Preferences) if present; otherwise it uses defaults
   - WebSocket host/SSID/PASS should be edited in the CONFIG section below to match your network
*/

#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <DHT.h>
#include <Preferences.h>
#include <ArduinoJson.h>

// --------- CONFIG (edit to match your environment) ---------
// WiFi credentials and WebSocket server details
static const char* WIFI_SSID = "Wifi";       // <-- your SSID (or hotspot SSID)
static const char* WIFI_PASS = "12341234";   // <-- your WiFi / hotspot password
static const char* WS_HOST   = "10.77.84.55"; // <-- your server IP (the machine running the websocket server)
static const uint16_t WS_PORT = 3000;          // <-- server port
static const char* WS_PATH   = "/";          // <-- server path (usually "/")

// --------- Pins & sensors ---------
// Define pins connected to sensors and pump control
const int SOIL_PIN = 4;   // ADC pin for soil moisture probe (ADC1_CH3 on many boards)
const int DHT_PIN  = 13;  // DHT11 data pin
const int PUMP_PIN = 5;   // Pump control (L298 enable or relay input)
#define DHTTYPE DHT11

// Default calibration values for soil sensor (measured values)
const int DEFAULT_RAW_AIR   = 4095; // probe in air -> dry
const int DEFAULT_RAW_WATER = 1115; // probe submerged -> wet

// Pump thresholds / hysteresis (fallback if server doesn't provide an ideal value)
const float MOISTURE_ON_THRESH  = 35.0f; // turn pump ON when below this (fallback)
const float MOISTURE_OFF_THRESH = 45.0f; // turn pump OFF when above this (fallback)

// When server provides an `ideal` soil percent, use the following hysteresis margin
const float IDEAL_HYSTERESIS = 5.0f; // percent above/below ideal
float soilMin = 30.0f;
float soilMax = 70.0f;

// Sampling settings
const uint8_t SOIL_SAMPLES = 16;      // median-of-N samples for noise reduction

// Send interval for telemetry data
const unsigned long SEND_INTERVAL_MS = 4000UL; // how often to send telemetry to server

// ---------- Globals ----------
// Initialize sensor and communication objects
DHT dht(DHT_PIN, DHTTYPE);
WebSocketsClient webSocket;
Preferences prefs;

// Calibration values (loaded or default)
int rawAir = DEFAULT_RAW_AIR;
int rawWater = DEFAULT_RAW_WATER;

// Pump control flags
bool pumpOn = false;
bool pumpManualControl = false; // if true, server controls pump state directly
float idealSoil = -1.0f;        // if >=0, use this as desired soil % (server-provided)

// ---------------- Helpers ----------------

// Reads soil sensor raw ADC value using median filtering for stability
int readSoilRaw() {
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);
  uint16_t buf[SOIL_SAMPLES];
  for (uint8_t i = 0; i < SOIL_SAMPLES; i++) {
    buf[i] = analogRead(SOIL_PIN);
    delay(2);
  }
  // Sort samples to find median value (insertion sort for small N)
  for (uint8_t i = 1; i < SOIL_SAMPLES; i++) {
    uint16_t key = buf[i];
    int j = i - 1;
    while (j >= 0 && buf[j] > key) {
      buf[j + 1] = buf[j];
      j--;
    }
    buf[j + 1] = key;
  }
  return buf[SOIL_SAMPLES / 2];
}

// Converts raw soil ADC value to percentage moisture based on calibration
float rawToPercent(int raw) {
  if (rawAir == rawWater) return 0.0f; // avoid division by zero
  float pct;
  if (rawWater < rawAir)
    pct = 100.0f * (rawAir - raw) / (float)(rawAir - rawWater);
  else
    pct = 100.0f * (raw - rawAir) / (float)(rawWater - rawAir);
  return constrain(pct, 0.0f, 100.0f);
}

// Saves current calibration values to non-volatile storage
void saveCalibration() {
  prefs.begin("smart", false);
  prefs.putInt("air", rawAir);
  prefs.putInt("water", rawWater);
  prefs.end();
  Serial.printf("[Cal] saved air=%d water=%d\n", rawAir, rawWater);
}

// Loads calibration values from non-volatile storage or uses defaults
void loadCalibration() {
  prefs.begin("smart", true);
  rawAir = prefs.getInt("air", DEFAULT_RAW_AIR);
  rawWater = prefs.getInt("water", DEFAULT_RAW_WATER);
  prefs.end();
  Serial.printf("[Cal] loaded air=%d water=%d\n", rawAir, rawWater);
}

// Handles serial input commands for calibration and saving/loading
void maybeHandleSerialCalibration() {
  if (!Serial.available()) return;
  char c = Serial.read();
  if (c == 'a' || c == 'A') {
    // Set air calibration value (not saved yet)
    rawAir = readSoilRaw();
    Serial.printf("[Cal] set rawAir=%d (not saved)\n", rawAir);
  } else if (c == 'w' || c == 'W') {
    // Set water calibration value (not saved yet)
    rawWater = readSoilRaw();
    Serial.printf("[Cal] set rawWater=%d (not saved)\n", rawWater);
  } else if (c == 's' || c == 'S') {
    // Save calibration values to storage
    saveCalibration();
  } else if (c == '?') {
    // Print current calibration values
    Serial.printf("[Cal] rawAir=%d rawWater=%d\n", rawAir, rawWater);
  } else if (c == 'r' || c == 'R') {
    // Reset calibration to defaults and save
    rawAir = DEFAULT_RAW_AIR;
    rawWater = DEFAULT_RAW_WATER;
    saveCalibration();
    Serial.println("[Cal] reset to defaults and saved");
  }
}

// ---------------- WebSocket event handler ----------------
// Handles WebSocket connection events and incoming messages
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("[WSc] Connected to server");
      // announce device identity to server
      webSocket.sendTXT("{\"device\":\"SmartTerra-ESP\"}");
      break;
    case WStype_TEXT: {
      String msg = String((char*)payload).substring(0, length);
      Serial.printf("[WSc] Received: %s\n", msg.c_str());

      // Only try to parse if message looks like JSON object
      if (msg.startsWith("{") && msg.endsWith("}")) {
        DynamicJsonDocument doc(512);
        DeserializationError err = deserializeJson(doc, msg);
        if (!err) {
          // Handle commands from server JSON
          if (doc.containsKey("soilMoistureMin") && doc.containsKey("soilMoistureMax")) {
            soilMin = doc["soilMoistureMin"].as<float>();
            soilMax = doc["soilMoistureMax"].as<float>();
            Serial.printf("[Cmd] set soil range = %.1f - %.1f %%\n", soilMin, soilMax);
          }
        } else {
          Serial.printf("[WSc] JSON parse error: %s\n", err.c_str());
        }
      } else {
        Serial.printf("[WSc] Non-JSON message: %s\n", msg.c_str());
      }
      break;
    }
    case WStype_PONG:
      Serial.println("[WSc] PONG received");
      break;
    default:
      break;
  }
}

// ---------------- setup / loop ----------------
void setup() {
  // Initialize serial for debug output
  Serial.begin(115200);
  delay(300);
  Serial.println("\n=== SmartTerra v1.0 ===");

  // Setup pump control pin as output and turn pump off initially
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);

  // Initialize DHT sensor
  dht.begin();

  // Configure ADC resolution and attenuation for soil sensor pin
  analogReadResolution(12);
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);

  // Load calibration values from flash or use defaults
  loadCalibration();

  // Connect to WiFi network
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("[WiFi] Connecting to %s...\n", WIFI_SSID);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print('.');
    if (millis() - start > 20000UL) {
      Serial.println("\n[WiFi] connection timeout");
      break;
    }
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected, IP=%s\n", WiFi.localIP().toString().c_str());
  }

  // Initialize WebSocket client and set event handler
  Serial.println("[WSc] init");
  webSocket.begin(WS_HOST, WS_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  webSocket.enableHeartbeat(15000, 3000, 2);
}

void loop() {
  // Handle any serial commands for calibration
  maybeHandleSerialCalibration();

  // Maintain WebSocket connection and handle incoming messages
  webSocket.loop();

  // Periodically send sensor data and control pump
  static unsigned long lastSend = 0;
  if (millis() - lastSend >= SEND_INTERVAL_MS) {
    lastSend = millis();

    // Read soil moisture raw value and convert to percentage
    int raw = readSoilRaw();
    float soilPct = rawToPercent(raw);

    // Read humidity and temperature from DHT sensor
    float hum = dht.readHumidity();
    float temp = dht.readTemperature();
    if (isnan(hum)) hum = -99.0f;   // error value if read failed
    if (isnan(temp)) temp = -99.0f;

    // Pump control logic based on soil moisture and ideal values
    if (soilPct < soilMin) {
      if (!pumpOn) {
        pumpOn = true;
        digitalWrite(PUMP_PIN, HIGH);
      }
    } else if (soilPct > soilMax) {
      if (pumpOn) {
        pumpOn = false;
        digitalWrite(PUMP_PIN, LOW);
      }
    }

    // Build JSON telemetry object to send to server
    DynamicJsonDocument outDoc(512);
    outDoc["soil"] = soilPct;
    outDoc["raw"] = raw;
    outDoc["temperature"] = temp;
    outDoc["humidity"] = hum;
    outDoc["pump"] = pumpOn;
    if (idealSoil >= 0.0f) outDoc["ideal"] = idealSoil;

    // Send telemetry if WebSocket is connected
    if (webSocket.isConnected()) {
      String out;
      serializeJson(outDoc, out);
      webSocket.sendTXT(out);
      Serial.printf("[Send] %s\n", out.c_str());
    } else {
      Serial.println("[Send] WebSocket not connected, skipping");
    }
  }

  delay(10);
}
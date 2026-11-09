import { connect, type MqttClient } from "mqtt";

export type HumidityReading = {
  value: number;
  receivedAt: string;
};

let client: MqttClient | null = null;
let latestHumidity: HumidityReading | null = null;

export function startMqtt(): void {
  if (client) return;

  const brokerUrl = process.env.MQTT_URL ?? "mqtt://localhost:1883";
  const topic = process.env.MQTT_HUMIDITY_TOPIC ?? "projet/serre/humidite";
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;

  client = connect(brokerUrl, {
    reconnectPeriod: 5000,
    ...(username && password ? { username, password } : {}),
  });

  client.on("connect", () => {
    console.log(`Connecté au broker MQTT: ${brokerUrl}`);
    client?.subscribe(topic, (error) => {
      if (error) {
        console.error(`Erreur d'abonnement MQTT au topic ${topic}:`, error.message);
        return;
      }
      console.log(`Abonné au topic MQTT: ${topic}`);
    });
  });

  client.on("message", (receivedTopic, payload) => {
    if (receivedTopic !== topic) return;

    const text = payload.toString().trim();
    const value = Number(text);
    if (!text || !Number.isFinite(value) || value < 0 || value > 100) {
      console.error(`Mesure d'humidité invalide reçue: ${text}`);
      return;
    }

    latestHumidity = { value, receivedAt: new Date().toISOString() };
    console.log(`Humidité reçue: ${value}%`);
  });

  client.on("error", (error) => {
    console.error("Erreur MQTT:", error.message);
  });
}

export function getLatestHumidity(): HumidityReading | null {
  return latestHumidity;
}

export function stopMqtt(): void {
  client?.end();
  client = null;
}
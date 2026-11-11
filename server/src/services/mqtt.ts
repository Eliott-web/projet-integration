import { connect, type MqttClient } from "mqtt";

export type SensorKind = "temperature" | "humidite";

export type SensorReading = {
  value: number;
  receivedAt: string;
};

export type WindowCommand = {
  command: "open" | "close";
  sentAt: string;
};

type PendingReading = {
  promise: Promise<SensorReading>;
  resolve: (reading: SensorReading) => void;
  reject: (error: Error) => void;
};

const sensorTopics: Record<SensorKind, string> = {
  temperature: process.env.MQTT_TEMPERATURE_TOPIC ?? "projet/serre/temperature",
  humidite: process.env.MQTT_HUMIDITY_TOPIC ?? "projet/serre/humidite",
};

const commandTopics: Record<SensorKind, string> = {
  temperature:
    process.env.MQTT_TEMPERATURE_COMMAND_TOPIC ?? `${sensorTopics.temperature}/cmd`,
  humidite:
    process.env.MQTT_HUMIDITY_COMMAND_TOPIC ?? `${sensorTopics.humidite}/cmd`,
};

const windowTopic = process.env.MQTT_WINDOW_TOPIC ?? "projet/serre/fenetre";
const readingTimeoutMs = 8000;

let client: MqttClient | null = null;
let mqttReady = false;
let lastWindowCommand: WindowCommand | null = null;
let lastManualWindowCommand: WindowCommand | null = null;
const pendingReadings: Partial<Record<SensorKind, PendingReading>> = {};

function rejectPendingReadings(error: Error): void {
  for (const kind of Object.keys(pendingReadings) as SensorKind[]) {
    pendingReadings[kind]?.reject(error);
  }
}

function parseReading(kind: SensorKind, text: string): SensorReading | null {
  const value = Number(text);
  const maxValue = kind === "temperature" ? 50 : 100;
  if (!text || !Number.isFinite(value) || value < 0 || value > maxValue) {
    console.error(`Mesure ${kind} invalide reçue : ${text}`);
    return null;
  }

  return { value, receivedAt: new Date().toISOString() };
}

export function startMqtt(): void {
  if (client) return;

  const brokerUrl = process.env.MQTT_URL ?? "mqtt://localhost:1883";
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;

  client = connect(brokerUrl, {
    reconnectPeriod: 5000,
    ...(username && password ? { username, password } : {}),
  });

  client.on("connect", () => {
    mqttReady = false;
    console.log("Connecté au broker MQTT.");
    client?.subscribe(Object.values(sensorTopics), { qos: 1 }, (error) => {
      if (error) {
        console.error("Erreur d'abonnement aux topics capteurs :", error.message);
        return;
      }
      mqttReady = true;
      console.log("Abonné aux topics température et humidité.");
    });
  });

  client.on("message", (receivedTopic, payload) => {
    const kind = (Object.keys(sensorTopics) as SensorKind[]).find(
      (candidate) => sensorTopics[candidate] === receivedTopic,
    );
    if (!kind) return;

    const reading = parseReading(kind, payload.toString().trim());
    if (reading) pendingReadings[kind]?.resolve(reading);
  });

  client.on("close", () => {
    mqttReady = false;
    rejectPendingReadings(new Error("Connexion au broker MQTT interrompue."));
  });

  client.on("error", (error) => {
    console.error("Erreur MQTT :", error.message);
  });
}

export function requestSensorReading(kind: SensorKind): Promise<SensorReading> {
  if (!client || !mqttReady) {
    return Promise.reject(new Error("Le backend n'est pas connecté au broker MQTT."));
  }

  const existingRequest = pendingReadings[kind];
  if (existingRequest) return existingRequest.promise;

  let resolvePromise!: (reading: SensorReading) => void;
  let rejectPromise!: (error: Error) => void;
  const promise = new Promise<SensorReading>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  let timeout: ReturnType<typeof setTimeout>;
  const pending: PendingReading = {
    promise,
    resolve: (reading) => {
      clearTimeout(timeout);
      if (pendingReadings[kind] === pending) delete pendingReadings[kind];
      resolvePromise(reading);
    },
    reject: (error) => {
      clearTimeout(timeout);
      if (pendingReadings[kind] === pending) delete pendingReadings[kind];
      rejectPromise(error);
    },
  };
  pendingReadings[kind] = pending;
  timeout = setTimeout(() => {
    pending.reject(new Error(`Aucune réponse MQTT reçue pour ${kind} dans le délai prévu.`));
  }, readingTimeoutMs);

  try {
    client.publish(commandTopics[kind], "read", { qos: 1 }, (error) => {
      if (error) pending.reject(error);
    });
  } catch (error) {
    pending.reject(error instanceof Error ? error : new Error(String(error)));
  }

  return promise;
}

export function sendWindowCommand(
  command: WindowCommand["command"],
  source: "manual" | "automation" = "manual",
): Promise<WindowCommand> {
  if (!client || !mqttReady) {
    return Promise.reject(new Error("Le backend n'est pas connecté au broker MQTT."));
  }

  return new Promise((resolve, reject) => {
    client!.publish(windowTopic, command, { qos: 1 }, (error) => {
      if (error) {
        reject(error);
        return;
      }

      lastWindowCommand = { command, sentAt: new Date().toISOString() };
      if (source === "manual") lastManualWindowCommand = lastWindowCommand;
      resolve(lastWindowCommand);
    });
  });
}

export function getLastWindowCommand(): WindowCommand | null {
  return lastWindowCommand;
}

export function getLastManualWindowCommand(): WindowCommand | null {
  return lastManualWindowCommand;
}

export function isMqttConnected(): boolean {
  return mqttReady;
}

export function stopMqtt(): void {
  mqttReady = false;
  rejectPendingReadings(new Error("Le backend MQTT s'arrête."));
  client?.end();
  client = null;
}

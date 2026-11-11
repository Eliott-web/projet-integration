import {
  getLastWindowCommand,
  isMqttConnected,
  requestSensorReading,
  sendWindowCommand,
  type WindowCommand,
} from "./mqtt.js";

const dayStartsAtHour = 8;
const nightStartsAtHour = 18;
const checkIntervalMs = 30_000;

let interval: ReturnType<typeof setInterval> | null = null;
let checkInProgress = false;

export function getDesiredWindowCommand(
  temperature: number,
  humidity: number,
  now: Date = new Date(),
): WindowCommand["command"] {
  const hour = now.getHours();
  if (hour < dayStartsAtHour || hour >= nightStartsAtHour) return "open";

  if (temperature < 15) return "close";
  if (temperature > 25) return "open";
  if (humidity > 70) return "open";
  if (humidity < 35) return "close";
  return "close";
}

async function checkWindow(): Promise<void> {
  if (checkInProgress || !isMqttConnected()) return;

  checkInProgress = true;
  try {
    const now = new Date();
    let command: WindowCommand["command"];

    if (now.getHours() < dayStartsAtHour || now.getHours() >= nightStartsAtHour) {
      command = "open";
    } else {
      const [temperature, humidity] = await Promise.all([
        requestSensorReading("temperature"),
        requestSensorReading("humidite"),
      ]);
      command = getDesiredWindowCommand(temperature.value, humidity.value, now);
    }

    if (getLastWindowCommand()?.command !== command) {
      await sendWindowCommand(command);
      console.log(`Automatisation fenêtre : ${command}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Échec de la vérification automatique de la fenêtre :", message);
  } finally {
    checkInProgress = false;
  }
}

export function startWindowAutomation(): void {
  if (interval) return;

  void checkWindow();
  interval = setInterval(() => void checkWindow(), checkIntervalMs);
}

export function stopWindowAutomation(): void {
  if (interval) clearInterval(interval);
  interval = null;
}
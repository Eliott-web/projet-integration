import {
  getLastManualWindowCommand,
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

function getNightCycleKey(date: Date): string | null {
  const hour = date.getHours();
  if (hour >= dayStartsAtHour && hour < nightStartsAtHour) return null;

  const cycleStart = new Date(date);
  if (hour < dayStartsAtHour) cycleStart.setDate(cycleStart.getDate() - 1);
  return `${cycleStart.getFullYear()}-${cycleStart.getMonth()}-${cycleStart.getDate()}`;
}

export function getDesiredWindowCommand(
  temperature: number,
  humidity: number,
  now: Date = new Date(),
  nightScheduleOverridden = false,
): WindowCommand["command"] | null {
  if (getNightCycleKey(now) !== null && !nightScheduleOverridden) return "open";

  if (temperature < 15) return "close";
  if (temperature > 25) return "open";
  if (humidity > 70) return "open";
  if (humidity < 35) return "close";
  return null;
}

async function checkWindow(): Promise<void> {
  if (checkInProgress || !isMqttConnected()) return;

  checkInProgress = true;
  try {
    const now = new Date();
    const nightCycleKey = getNightCycleKey(now);
    const lastManualCommand = getLastManualWindowCommand();
    const nightScheduleOverridden =
      nightCycleKey !== null &&
      lastManualCommand !== null &&
      getNightCycleKey(new Date(lastManualCommand.sentAt)) === nightCycleKey;
    let command: WindowCommand["command"] | null;

    if (nightCycleKey !== null && !nightScheduleOverridden) {
      command = "open";
    } else {
      const [temperature, humidity] = await Promise.all([
        requestSensorReading("temperature"),
        requestSensorReading("humidite"),
      ]);
      command = getDesiredWindowCommand(
        temperature.value,
        humidity.value,
        now,
        nightScheduleOverridden,
      );
    }

    if (command === null) return;

    if (getLastWindowCommand()?.command !== command) {
      await sendWindowCommand(command, "automation");
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
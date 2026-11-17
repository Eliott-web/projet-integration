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

type WindowDecision = {
  command: WindowCommand["command"];
  reason: string;
};

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
  return getWindowDecision(temperature, humidity, now, nightScheduleOverridden)?.command ?? null;
}

function getWindowDecision(
  temperature: number | null,
  humidity: number | null,
  now: Date,
  nightScheduleOverridden: boolean,
): WindowDecision | null {
  if (getNightCycleKey(now) !== null && !nightScheduleOverridden) {
    return { command: "open", reason: "Horaire nocturne (entre 18 h et 8 h)." };
  }
  if (temperature === null || humidity === null) return null;

  if (temperature < 15) {
    return { command: "close", reason: `Température basse (${temperature} °C, seuil : 15 °C).` };
  }
  if (temperature > 25) {
    return { command: "open", reason: `Température élevée (${temperature} °C, seuil : 25 °C).` };
  }
  if (humidity > 70) {
    return { command: "open", reason: `Humidité élevée (${humidity} %, seuil : 70 %).` };
  }
  if (humidity < 35) {
    return { command: "close", reason: `Humidité basse (${humidity} %, seuil : 35 %).` };
  }
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
    let decision: WindowDecision | null;

    if (nightCycleKey !== null && !nightScheduleOverridden) {
      decision = getWindowDecision(null, null, now, false);
    } else {
      const [temperature, humidity] = await Promise.all([
        requestSensorReading("temperature"),
        requestSensorReading("humidite"),
      ]);
      decision = getWindowDecision(
        temperature.value,
        humidity.value,
        now,
        nightScheduleOverridden,
      );
    }

    if (decision === null) return;

    if (getLastWindowCommand()?.command !== decision.command) {
      await sendWindowCommand(decision.command, "automation", decision.reason);
      console.log(`Automatisation fenêtre : ${decision.command} (${decision.reason})`);
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
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  getLastWindowCommand,
  isMqttConnected,
  requestSensorReading,
  sendWindowCommand,
  type WindowCommand,
} from "./mqtt.js";

const checkIntervalMs = 30_000;
const settingsPath = resolve(__dirname, "../../data/window-automation.json");

export type WindowAutomationSettings = {
  enabled: boolean;
  temperatureLow: number;
  temperatureHigh: number;
  humidityLow: number;
  humidityHigh: number;
  openAt: string;
  closeAt: string;
};

const defaultSettings: WindowAutomationSettings = {
  enabled: true,
  temperatureLow: 15,
  temperatureHigh: 25,
  humidityLow: 35,
  humidityHigh: 70,
  openAt: "18:00",
  closeAt: "08:00",
};

let interval: ReturnType<typeof setInterval> | null = null;
let checkInProgress = false;
let settings = { ...defaultSettings };
let lastScheduledCommandKey: string | null = null;

type WindowDecision = {
  command: WindowCommand["command"];
  reason: string;
};

function isTime(value: unknown): value is string {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isWindowAutomationSettings(value: unknown): value is WindowAutomationSettings {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.enabled === "boolean" &&
    typeof candidate.temperatureLow === "number" &&
    Number.isFinite(candidate.temperatureLow) &&
    candidate.temperatureLow >= 0 &&
    candidate.temperatureLow <= 50 &&
    typeof candidate.temperatureHigh === "number" &&
    Number.isFinite(candidate.temperatureHigh) &&
    candidate.temperatureHigh >= 0 &&
    candidate.temperatureHigh <= 50 &&
    candidate.temperatureLow < candidate.temperatureHigh &&
    typeof candidate.humidityLow === "number" &&
    Number.isFinite(candidate.humidityLow) &&
    candidate.humidityLow >= 0 &&
    candidate.humidityLow <= 100 &&
    typeof candidate.humidityHigh === "number" &&
    Number.isFinite(candidate.humidityHigh) &&
    candidate.humidityHigh >= 0 &&
    candidate.humidityHigh <= 100 &&
    candidate.humidityLow < candidate.humidityHigh &&
    isTime(candidate.openAt) &&
    isTime(candidate.closeAt) &&
    candidate.openAt !== candidate.closeAt
  );
}

export async function loadWindowAutomationSettings(): Promise<void> {
  try {
    const savedSettings: unknown = JSON.parse(await readFile(settingsPath, "utf8"));
    if (!isWindowAutomationSettings(savedSettings)) {
      throw new Error("Le fichier de configuration de l’automatisation fenêtre est invalide.");
    }
    settings = savedSettings;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
}

export function getWindowAutomationSettings(): WindowAutomationSettings {
  return { ...settings };
}

export async function saveWindowAutomationSettings(value: unknown): Promise<WindowAutomationSettings> {
  if (!isWindowAutomationSettings(value)) {
    throw new TypeError("Les réglages d’automatisation de la fenêtre sont invalides.");
  }

  await mkdir(dirname(settingsPath), { recursive: true });
  const temporaryPath = `${settingsPath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, settingsPath);
  settings = { ...value };
  return getWindowAutomationSettings();
}

export function getDesiredWindowCommand(
  temperature: number,
  humidity: number,
  thresholds: WindowAutomationSettings = settings,
): WindowCommand["command"] | null {
  return getWindowDecision(temperature, humidity, thresholds)?.command ?? null;
}

function getWindowDecision(
  temperature: number | null,
  humidity: number | null,
  thresholds: WindowAutomationSettings,
): WindowDecision | null {
  if (temperature === null || humidity === null) return null;

  if (temperature < thresholds.temperatureLow) {
    return {
      command: "close",
      reason: `Température basse (${temperature} °C, seuil : ${thresholds.temperatureLow} °C).`,
    };
  }
  if (temperature > thresholds.temperatureHigh) {
    return {
      command: "open",
      reason: `Température élevée (${temperature} °C, seuil : ${thresholds.temperatureHigh} °C).`,
    };
  }
  if (humidity > thresholds.humidityHigh) {
    return {
      command: "open",
      reason: `Humidité élevée (${humidity} %, seuil : ${thresholds.humidityHigh} %).`,
    };
  }
  if (humidity < thresholds.humidityLow) {
    return {
      command: "close",
      reason: `Humidité basse (${humidity} %, seuil : ${thresholds.humidityLow} %).`,
    };
  }
  return null;
}

async function checkWindow(): Promise<void> {
  if (!settings.enabled || checkInProgress || !isMqttConnected()) return;

  checkInProgress = true;
  try {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const scheduledCommand =
      currentTime === settings.openAt
        ? { command: "open" as const, key: `${dateKey}-open` }
        : currentTime === settings.closeAt
          ? { command: "close" as const, key: `${dateKey}-close` }
          : null;

    if (scheduledCommand && lastScheduledCommandKey !== scheduledCommand.key) {
      await sendWindowCommand(
        scheduledCommand.command,
        "automation",
        `Horaire programmé : ${scheduledCommand.command === "open" ? "ouverture" : "fermeture"} à ${currentTime}.`,
      );
      lastScheduledCommandKey = scheduledCommand.key;
    }

    const [temperature, humidity] = await Promise.all([
      requestSensorReading("temperature"),
      requestSensorReading("humidite"),
    ]);
    if (!settings.enabled) return;

    const decision = getWindowDecision(temperature.value, humidity.value, settings);
    if (decision === null || getLastWindowCommand()?.command === decision.command) return;

    await sendWindowCommand(decision.command, "automation", decision.reason);
    console.log(`Automatisation fenêtre : ${decision.command} (${decision.reason})`);
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

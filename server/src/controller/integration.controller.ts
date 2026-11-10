import type { Request, Response } from "express";
import {
    getLastWindowCommand,
    requestSensorReading,
    sendWindowCommand,
    type SensorKind,
} from "../services/mqtt.js";

async function getSensorReading(kind: SensorKind, response: Response): Promise<void> {
    try {
        response.json(await requestSensorReading(kind));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Impossible de lire le capteur ${kind} :`, message);
        response.status(503).json({ error: message });
    }
}

export function getTemperature(_request: Request, response: Response): Promise<void> {
    return getSensorReading("temperature", response);
}

export function getHumidity(_request: Request, response: Response): Promise<void> {
    return getSensorReading("humidite", response);
}

export function getWindowCommand(_request: Request, response: Response): void {
    response.json({ lastCommand: getLastWindowCommand() });
}

export async function setWindowCommand(request: Request, response: Response): Promise<void> {
    const body: unknown = request.body;
    const command =
        typeof body === "object" && body !== null && "command" in body
            ? body.command
            : undefined;

    if (command !== "open" && command !== "close") {
        response.status(400).json({ error: "La commande doit être 'open' ou 'close'." });
        return;
    }

    try {
        response.json(await sendWindowCommand(command));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Impossible d'envoyer la commande fenêtre :", message);
        response.status(503).json({ error: message });
    }
}
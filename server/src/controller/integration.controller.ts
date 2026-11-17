import type { Request, Response } from "express";
import {
    getLastWindowCommand,
    isMqttConnected,
    requestSensorReading,
    sendWindowCommand,
    type SensorKind,
} from "../services/mqtt.js";
import {
    clearWindowNotifications,
    deleteWindowNotification,
    getWindowNotifications,
} from "../services/windowNotifications.js";

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
    response.json({
        lastCommand: getLastWindowCommand(),
        brokerConnected: isMqttConnected(),
    });
}

export function getNotifications(request: Request, response: Response): void {
    const after = request.query.after;
    if (after === undefined) {
        response.json({ notifications: getWindowNotifications() });
        return;
    }

    if (typeof after !== "string") {
        response.status(400).json({ error: "Le curseur de notification est invalide." });
        return;
    }

    const afterId = Number(after);
    if (!Number.isSafeInteger(afterId) || afterId < 0) {
        response.status(400).json({ error: "Le curseur de notification est invalide." });
        return;
    }

    response.json({ notifications: getWindowNotifications(afterId) });
}

export function removeWindowNotification(request: Request, response: Response): void {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        response.status(400).json({ error: "L’identifiant de notification est invalide." });
        return;
    }

    if (!deleteWindowNotification(id)) {
        response.status(404).json({ error: "Cette notification n’existe plus." });
        return;
    }

    response.status(204).end();
}

export function removeAllWindowNotifications(_request: Request, response: Response): void {
    response.json({ deleted: clearWindowNotifications() });
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
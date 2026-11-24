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
import Plante from '../tables/plante.js';
import {
    getWindowAutomationSettings,
    isWindowAutomationSettings,
    saveWindowAutomationSettings,
} from "../services/windowAutomation.js";

export function getWindowAutomation(_request: Request, response: Response): void {
    response.json(getWindowAutomationSettings());
}

export async function setWindowAutomationEnabled(request: Request, response: Response): Promise<void> {
    const body: unknown = request.body;
    const enabled =
        typeof body === "object" && body !== null && "enabled" in body
            ? body.enabled
            : undefined;

    if (typeof enabled !== "boolean") {
        response.status(400).json({ error: "Le réglage 'enabled' doit être un booléen." });
        return;
    }

    try {
        response.json(await saveWindowAutomationSettings({
            ...getWindowAutomationSettings(),
            enabled,
        }));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Impossible de modifier l’activation de l’automatisation fenêtre :", message);
        response.status(500).json({ error: "Impossible de modifier l’activation de l’automatisation." });
    }
}

export async function updateWindowAutomation(request: Request, response: Response): Promise<void> {
    if (!isWindowAutomationSettings(request.body)) {
        response.status(400).json({ error: "Les réglages d’automatisation de la fenêtre sont invalides." });
        return;
    }

    try {
        response.json(await saveWindowAutomationSettings(request.body));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Impossible d’enregistrer les réglages de l’automatisation fenêtre :", message);
        response.status(500).json({ error: "Impossible d’enregistrer les réglages de l’automatisation." });
    }
}

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


export const getPlantes = async (_req: Request, res: Response) => {
    try {
        const plantes = await Plante.findAll({ order: [['date', 'DESC']] });
        res.json(plantes);
    } catch (error) {
        console.error('Erreur lors de la récupération des plantes :', error);
        res.status(500).json({ error: 'Impossible de récupérer les plantes' });
    }
};
export async function createPlante(request: Request, response: Response): Promise<void> {
    const body: unknown = request.body;
    if (typeof body !== "object" || body === null) {
        response.status(400).json({ error: "Les données de la plante sont invalides." });
        return;
    }

    const { nom, description, date } = body as Record<string, unknown>;

    if (typeof nom !== "string" || nom.trim() === "" || nom.trim().length > 255) {
        response.status(400).json({ error: "Le nom est obligatoire (255 caractères maximum)." });
        return;
    }

    if (description !== undefined && description !== null && (typeof description !== "string" || description.length > 255)) {
        response.status(400).json({ error: "La description est invalide (255 caractères maximum)." });
        return;
    }

    const parsedDate = typeof date === "string" ? new Date(date) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        response.status(400).json({ error: "La date est invalide." });
        return;
    }

    try {
        const plante = await Plante.create({
            nom: nom.trim(),
            description: typeof description === "string" && description.trim() !== "" ? description.trim() : null,
            date: parsedDate,
        });
        response.status(201).json(plante);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Impossible d'ajouter la plante :", message);
        response.status(500).json({ error: "Impossible d'ajouter la plante." });
    }
}
export async function deletePlante(request: Request, response: Response): Promise<void> {
    const id = Number(request.params.id);

    // Vérification de l'identifiant
    if (!Number.isSafeInteger(id) || id < 1) {
        response.status(400).json({ error: "L'identifiant de la plante est invalide." });
        return;
    }

    try {
        // Suppression de la plante dans la base de données
        const deleted = await Plante.destroy({
            where: { IdPlante: id }
        });

        // Vérification qu'une plante a bien été supprimée
        if (deleted === 0) {
            response.status(404).json({ error: "Cette plante n'existe pas." });
            return;
        }

        response.status(204).end();

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Impossible de supprimer la plante :", message);

        response.status(500).json({
            error: "Impossible de supprimer la plante."
        });
    }
}
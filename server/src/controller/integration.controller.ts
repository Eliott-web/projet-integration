import type { Request, Response } from "express";
import { getLatestHumidity } from "../services/mqtt.js";

export function getHumidity(_request: Request, response: Response): void {
    const reading = getLatestHumidity();
    if (!reading) {
        response.status(503).json({ error: "Aucune mesure d'humidité reçue pour le moment." });
        return;
    }

    response.json(reading);
}
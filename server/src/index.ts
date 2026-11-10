import "dotenv/config";
import cors from "cors";
import express from "express";
import { getLatestHumidity, startMqtt, stopMqtt } from "./services/mqtt.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: clientOrigins }));

app.get("/", (_request, response) => {
  response.type("text").send(`http://localhost:${port}`);
});

app.get("/api/humidite", (_request, response) => {
  const reading = getLatestHumidity();
  if (!reading) {
    response.status(503).json({ error: "Aucune mesure d'humidité reçue pour le moment." });
    return;
  }

  response.json(reading);
});

startMqtt();

const server = app.listen(port, () => {
  console.log(`Serveur HTTP démarré : http://localhost:${port}`);
  console.log(`API humidité : http://localhost:${port}/api/humidite`);
});

function shutdown(): void {
  stopMqtt();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
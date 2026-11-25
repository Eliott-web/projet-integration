import "dotenv/config";
import cors from "cors";
import express from "express";
import routes from "./routes/routes.js";
import {
  loadWindowAutomationSettings,
  startWindowAutomation,
  stopWindowAutomation,
} from "./services/windowAutomation.js";
import { startMqtt, stopMqtt } from "./services/mqtt.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: clientOrigins }));
app.use(express.json());
app.use(routes);

let server: ReturnType<typeof app.listen> | null = null;

function shutdown(): void {
  stopWindowAutomation();
  stopMqtt();
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function startServer(): Promise<void> {
  await loadWindowAutomationSettings();
  startMqtt();
  startWindowAutomation();
  server = app.listen(port, () => {
    console.log(`Serveur HTTP démarré : http://localhost:${port}/`);
  });
}

void startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Impossible de démarrer le serveur :", message);
  process.exitCode = 1;
});
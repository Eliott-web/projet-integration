import "dotenv/config";
import cors from "cors";
import express from "express";
import routes from "./routes/routes.js";
import { startWindowAutomation, stopWindowAutomation } from "./services/windowAutomation.js";
import { startMqtt, stopMqtt } from "./services/mqtt.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: clientOrigins }));
app.use(express.json());
app.use(routes);

startMqtt();
startWindowAutomation();

const server = app.listen(port, () => {
  console.log(`Serveur HTTP démarré : http://localhost:${port}/`);
});

function shutdown(): void {
  stopWindowAutomation();
  stopMqtt();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
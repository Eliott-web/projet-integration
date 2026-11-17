import { Router } from "express";
import {
    getHumidity,
    getNotifications,
    getTemperature,
    getWindowCommand,
    removeAllWindowNotifications,
    removeWindowNotification,
    setWindowCommand,
} from "../controller/integration.controller.js";

const router = Router();
const port = Number(process.env.PORT ?? 3000);

router.get("/", (_request, response) => {
    response.type("text").send(`http://localhost:${port}`);
});

router.get("/api/humidite", getHumidity);
router.get("/api/temperature", getTemperature);
router.get("/api/fenetre", getWindowCommand);
router.post("/api/fenetre", setWindowCommand);
router.get("/api/notifications", getNotifications);
router.delete("/api/notifications", removeAllWindowNotifications);
router.delete("/api/notifications/:id", removeWindowNotification);

export default router;

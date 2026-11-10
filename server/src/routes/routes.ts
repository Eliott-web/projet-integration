import { Router } from "express";
import {
    getHumidity,
    getTemperature,
    getWindowCommand,
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

export default router;

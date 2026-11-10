import { Router } from "express";
import { getHumidity } from "../controller/integration.controller.js";

const router = Router();
const port = Number(process.env.PORT ?? 3000);

router.get("/", (_request, response) => {
    response.type("text").send(`http://localhost:${port}`);
});

router.get("/api/humidite", getHumidity);

export default router;

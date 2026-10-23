import express from 'express';
import sequelize from './config/database';
import './tables/serre';
import './tables/humidite';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (_request, response) => {
	response.json({ message: 'API du projet intégration' });
});
sequelize.sync({ alter: true })
    .then(() => {
        console.log("✅ Base de données PostgreSQL synchronisée");

        app.listen(port, () => {
            console.log(`🚀 Serveur lancé sur : http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("❌ Erreur lors de la synchronisation :", error);
    });
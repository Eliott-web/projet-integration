import express from 'express';
import sequelize from './config/database';

import './tables/serre';
import './tables/plante';
import './tables/serre_plante';

import './tables/capteur';
import './tables/humidite';
import './tables/temperature';
import './tables/capteur_humidite';
import './tables/capteur_temperature';

import './tables/serre_humidite';
import './tables/serre_temperature';

import './tables/pompe';
import './tables/stock_eau';
import './tables/renouvellement';

import './tables/associations';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (_request, response) => {
    response.json({
        message: 'API du projet intégration'
    });
});

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log('Connexion PostgreSQL réussie');

        await sequelize.sync({ alter: true });

        console.log('Base de données PostgreSQL synchronisée');

        app.listen(port, () => {
            console.log(`Serveur lancé sur : http://localhost:${port}`);
    });

} catch (error) {
    console.error('Erreur PostgreSQL :', error);
    process.exit(1);
}
}

startServer();
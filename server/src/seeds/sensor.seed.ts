import sequelize from '../config/database';


import Capteur from '../tables/capteur';
import Humidite from '../tables/humidite';
import Temperature from '../tables/temperature';
import CapteurHumidite from '../tables/capteur_humidite';
import CapteurTemperature from '../tables/capteur_temperature';

import '../tables/associations';

async function seedSensors() {
    const transaction = await sequelize.transaction();

    try {
        const [capteur] = await Capteur.findOrCreate({
            where: {
                Description: 'CAPTEUR_TEST_SEED',
            },
            defaults: {
                Description: 'CAPTEUR_TEST_SEED',
            },
            transaction,
        });

        const humidites = [62.5, 64.2, 63.1];

        for (let i = 0; i < humidites.length; i++) {
            const humidite = await Humidite.create({
                pourcentage: humidites[i],
                dateMesure: new Date(Date.now() - (2 - i) * 60000),
            }, { transaction });

            await CapteurHumidite.create({
                IdCapteur: capteur.IdCapteur,
                IdHumidite: humidite.IdHumidite,
            }, { transaction });
        }

        const temperatures = [21.5, 22.1, 22.8];

        for (let i = 0; i < temperatures.length; i++) {
            const temperature = await Temperature.create({
                degres: temperatures[i],
                dateMesure: new Date(Date.now() - (2 - i) * 60000),
            }, { transaction });

            await CapteurTemperature.create({
                IdCapteur: capteur.IdCapteur,
                IdTemperature: temperature.IdTemperature,
            }, { transaction });
        }

        await transaction.commit();

        console.log('Seed des capteurs terminé !');
        console.log(`Identifiant du capteur : ${capteur.IdCapteur}`);

    } catch (error) {
        await transaction.rollback();
        throw error;
    } finally {
        await sequelize.close();
    }
}

seedSensors().catch((error) => {
    console.error('Erreur pendant le seed :', error);
    process.exitCode = 1;
});

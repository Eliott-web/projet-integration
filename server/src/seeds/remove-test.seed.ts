import sequelize from '../config/database';
import Capteur from '../tables/capteur';
import CapteurHumidite from '../tables/capteur_humidite';
import CapteurTemperature from '../tables/capteur_temperature';
import Humidite from '../tables/humidite';
import Temperature from '../tables/temperature';

async function removeTest() {
    const transaction = await sequelize.transaction();

    try {
        const capteur = await Capteur.findOne({
            where: { Description: 'CAPTEUR_TEST_SEED' },
            transaction
        });

        if (!capteur) {
            console.log('Aucun capteur de test trouvé.');
            await transaction.rollback();
            return;
        }

        const liensHumidite = await CapteurHumidite.findAll({
            where: { IdCapteur: capteur.IdCapteur },
            transaction
        });

        const liensTemperature = await CapteurTemperature.findAll({
            where: { IdCapteur: capteur.IdCapteur },
            transaction
        });

        for (const lien of liensHumidite) {
            await Humidite.destroy({
                where: { IdHumidite: lien.IdHumidite },
                transaction
            });
        }

        for (const lien of liensTemperature) {
            await Temperature.destroy({
                where: { IdTemperature: lien.IdTemperature },
                transaction
            });
        }

        await CapteurHumidite.destroy({
            where: { IdCapteur: capteur.IdCapteur },
            transaction
        });

        await CapteurTemperature.destroy({
            where: { IdCapteur: capteur.IdCapteur },
            transaction
        });

        await capteur.destroy({ transaction });

        await transaction.commit();
        console.log('Données de test supprimées.');
    } catch (error) {
        await transaction.rollback();
        throw error;
    } finally {
        await sequelize.close();
    }
}

removeTest().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
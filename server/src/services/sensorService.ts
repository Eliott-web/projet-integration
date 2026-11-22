import sequelize from "../config/database.js";

import Humidite from "../tables/humidite.js";
import Temperature from "../tables/temperature.js";

import CapteurHumidite from "../tables/capteur_humidite.js";
import CapteurTemperature from "../tables/capteur_temperature.js";

import SerreHumidite from "../tables/serre_humidite.js";
import SerreTemperature from "../tables/serre_temperature.js";

function getDatabaseIds() {
    const idCapteur = Number(process.env.MQTT_SENSOR_ID);
    const idSerre = Number(process.env.MQTT_GREENHOUSE_ID);

    if (
        !Number.isInteger(idCapteur) || idCapteur <= 0 ||
        !Number.isInteger(idSerre) || idSerre <= 0
    ) {
        throw new Error(
            "Identifiants du capteur ou de la serre invalides dans .env"
        );
    }

    return { idCapteur, idSerre };
}

export async function saveHumidity(value: number) {
    const { idCapteur, idSerre } = getDatabaseIds();

    return sequelize.transaction(async (transaction) => {
        const mesure = await Humidite.create(
            {
                pourcentage: value,
                dateMesure: new Date()
            },
            { transaction }
        );

        await CapteurHumidite.create(
            {
                IdCapteur: idCapteur,
                IdHumidite: mesure.IdHumidite
            },
            { transaction }
        );

        await SerreHumidite.create(
            {
                IdSerre: idSerre,
                IdHumidite: mesure.IdHumidite
            },
            { transaction }
        );

        console.log(
            "Humidité enregistrée :",
            mesure.IdHumidite,
            value
        );

        return mesure;
    });
}

export async function saveTemperature(value: number) {
    const { idCapteur, idSerre } = getDatabaseIds();

    return sequelize.transaction(async (transaction) => {

        const mesure = await Temperature.create(
            {
                degres: value,
                dateMesure: new Date()
            },
            { transaction }
        );

        await CapteurTemperature.create(
            {
                IdCapteur: idCapteur,
                IdTemperature: mesure.IdTemperature
            },
            { transaction }
        );

        await SerreTemperature.create(
            {
                IdSerre: idSerre,
                IdTemperature: mesure.IdTemperature
            },
            { transaction }
        );

        console.log(
            "Température enregistrée :",
            mesure.IdTemperature,
            value
        );

        return mesure;
    });
}

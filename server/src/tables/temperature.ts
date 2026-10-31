// Création table Temperature par Eliott

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class temperature extends Model {
    declare IdTemperature: number;
    declare IdCapteur: number;
    declare degres: number;
}

temperature.init({
    IdTemperature: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdCapteur: { type: DataTypes.INTEGER, allowNull: false },
    degres: { type: DataTypes.FLOAT, allowNull: false },
}, {
    sequelize,
    modelName: 'temperature',
    tableName: 'temperature',
    timestamps: false,
});

export default temperature;
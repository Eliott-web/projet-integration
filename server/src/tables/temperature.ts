// Création table Temperature par Eliott

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class temperature extends Model {
    declare IdTemperature: number;
    declare degres: number;
    declare dateMesure: Date;
}

temperature.init({
    IdTemperature: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    degres: { type: DataTypes.FLOAT, allowNull: false },
    dateMesure: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'temperature',
    tableName: 'temperature',
    timestamps: false,
});

export default temperature;
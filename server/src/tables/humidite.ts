// Création table Humidité par Rayan

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Humidite extends Model {
    declare IdHumidite: number;
    declare pourcentage: number;
}

Humidite.init({
    IdHumidite: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pourcentage: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'humidite',
    tableName: 'humidite',
    timestamps: false,
});

export default Humidite;
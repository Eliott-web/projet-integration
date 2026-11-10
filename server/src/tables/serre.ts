// Création table Serre par Rayan

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Serre extends Model {
    declare IdSerre: number;
    declare IdPlante: number;
    declare IdTemperature: number;
    declare IdHumidite: number;
    declare IdTerre: number;
    declare IdPompe: number;
    declare IdStock: number;
}

Serre.init({
    IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdPlante: { type: DataTypes.INTEGER, allowNull: false },
    IdTemperature: { type: DataTypes.INTEGER, allowNull: false },
    IdHumidite: { type: DataTypes.INTEGER, allowNull: false },
    IdTerre: { type: DataTypes.INTEGER, allowNull: false },
    IdPompe: { type: DataTypes.INTEGER, allowNull: false },
    IdStock: { type: DataTypes.INTEGER, allowNull: false },
}, {
    sequelize,
    modelName: 'serre',
    tableName: 'serre',
    timestamps: false,
});

export default Serre;
// Création table Pompes par eliott

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Pompes extends Model {
    declare IdPompe: number;
    declare IdSerre: number;
    declare IdStock: number;
}

Pompes.init({
    IdPompe: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdSerre: { type: DataTypes.INTEGER, allowNull: false },
    IdStock: { type: DataTypes.INTEGER, allowNull: false },
}, {
    sequelize,
    modelName: 'pompes',
    tableName: 'pompes',
    timestamps: false,
});

export default Pompes;
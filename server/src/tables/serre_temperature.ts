import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class SerreTemperature extends Model {
    declare IdSerre: number;
    declare IdTemperature: number;
}

SerreTemperature.init({
    IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    IdTemperature: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
}, {
    sequelize,
    modelName: 'SerreTemperature',
    tableName: 'serre_temperature',
    timestamps: false,
});

export default SerreTemperature;
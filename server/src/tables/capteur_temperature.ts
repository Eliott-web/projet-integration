import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CapteurTemperature extends Model {
    declare IdCapteur: number;
    declare IdTemperature: number;
}

CapteurTemperature.init({
    IdCapteur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    IdTemperature: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
}, {
    sequelize,
    modelName: 'CapteurTemperature',
    tableName: 'capteurTemperature',
    timestamps: false,
});

export default CapteurTemperature;
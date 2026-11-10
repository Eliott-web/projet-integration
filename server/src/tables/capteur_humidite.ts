import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CapteurHumidite extends Model {
    declare IdCapteur: number;
    declare IdHumidite: number;
}

CapteurHumidite.init({
    IdCapteur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    IdHumidite: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
}, {
    sequelize,
    modelName: 'CapteurHumidite',
    tableName: 'capteurHumidite',
    timestamps: false,
});

export default CapteurHumidite;
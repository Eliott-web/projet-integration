import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class SerreHumidite extends Model {
    declare IdSerre: number;
    declare IdHumidite: number;
}

SerreHumidite.init({
    IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    IdHumidite: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
}, {
    sequelize,
    modelName: 'SerreHumidite',
    tableName: 'serre_humidite',
    timestamps: false,
});

export default SerreHumidite;
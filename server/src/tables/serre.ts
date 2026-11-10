import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Serre extends Model {
    declare IdSerre: number;
}

Serre.init({
    IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
}, {
    sequelize,
    modelName: 'serre',
    tableName: 'serre',
    timestamps: false,
});

export default Serre;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class SerrePlante extends Model {
    declare IdSerre: number;
    declare IdPlante: number;
}

SerrePlante.init({
    IdSerre: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    IdPlante: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
}, {
    sequelize,
    modelName: 'SerrePlante',
    tableName: 'serre_plante',
    timestamps: false,
});

export default SerrePlante;
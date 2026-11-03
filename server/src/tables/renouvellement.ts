import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Renouvellement extends Model {
    declare idAncienStock: number;
    declare idNouveauStock: number;
    declare ancienStock: number;
    declare nouveauStock: number;
}

Renouvellement.init({
    idAncienStock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    idNouveauStock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    ancienStock: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    nouveauStock: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Renouvellement',
    tableName: 'renouvellement',
    timestamps: false,
});

export default Renouvellement;
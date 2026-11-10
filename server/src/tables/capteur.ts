import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Capteur extends Model {
    declare IdCapteur: number;
    declare Description: string;
}

Capteur.init({
    IdCapteur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Description: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Capteur',
    tableName: 'capteur',
    timestamps: false,
});

export default Capteur;
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Plante extends Model {
    declare IdPlante: number;
    declare nom: string;
    declare date: Date;
}

Plante.init({
    IdPlante: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Plante',
    tableName: 'plante',
    timestamps: false,
});

export default Plante;
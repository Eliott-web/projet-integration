import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class StockEau extends Model {
    declare IdStock: number;
    declare IdSerre: number;
    declare stockMax: number;
    declare stockActuel: number;
    declare stockage: Date;
}

StockEau.init({
    IdStock: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    IdSerre: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    stockMax: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    stockActuel: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    stockage: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'StockEau',
    tableName: 'stock_eau',
    timestamps: false,
});

export default StockEau;
// Capteurs
import Capteur from './capteur';
import Humidite from './humidite';
import Temperature from './temperature';
import CapteurHumidite from './capteur_humidite';
import CapteurTemperature from './capteur_temperature';

import Serre from './serre';
import Plante from './plante';
import SerrePlante from './serre_plante';
import SerreHumidite from './serre_humidite';
import SerreTemperature from './serre_temperature';


import Pompe from './pompe';
import StockEau from './stock_eau';
import Renouvellement from './renouvellement';

// ==========================================
// ASSOCIATIONS CAPTEURS
// ==========================================

// Capteur - Humidite
Capteur.hasMany(CapteurHumidite, {
    foreignKey: 'IdCapteur',
    as: 'capteursHumidite'
});

CapteurHumidite.belongsTo(Capteur, {
    foreignKey: 'IdCapteur',
    as: 'capteur'
});

// Humidite - CapteurHumidite
Humidite.hasMany(CapteurHumidite, {
    foreignKey: 'IdHumidite',
    as: 'capteurs'
});

CapteurHumidite.belongsTo(Humidite, {
    foreignKey: 'IdHumidite',
    as: 'humidite'
});


// Capteur - Temperature
Capteur.hasMany(CapteurTemperature, {
    foreignKey: 'IdCapteur',
    as: 'capteursTemperature'
});

CapteurTemperature.belongsTo(Capteur, {
    foreignKey: 'IdCapteur',
    as: 'capteur'
});

// Temperature - CapteurTemperature
Temperature.hasMany(CapteurTemperature, {
    foreignKey: 'IdTemperature',
    as: 'capteurs'
});

CapteurTemperature.belongsTo(Temperature, {
    foreignKey: 'IdTemperature',
    as: 'temperature'
});


// ==========================================
// ASSOCIATIONS SERRE
// ==========================================

// Serre - Plante (Many-to-Many)
Serre.belongsToMany(Plante, {
    through: SerrePlante,
    foreignKey: 'IdSerre',
    otherKey: 'IdPlante',
    as: 'plantes'
});

Plante.belongsToMany(Serre, {
    through: SerrePlante,
    foreignKey: 'IdPlante',
    otherKey: 'IdSerre',
    as: 'serres'
});


// Serre - Humidite (Many-to-Many)
Serre.belongsToMany(Humidite, {
    through: SerreHumidite,
    foreignKey: 'IdSerre',
    otherKey: 'IdHumidite',
    as: 'humidites'
});

Humidite.belongsToMany(Serre, {
    through: SerreHumidite,
    foreignKey: 'IdHumidite',
    otherKey: 'IdSerre',
    as: 'serres'
});


// Serre - Temperature (Many-to-Many)
Serre.belongsToMany(Temperature, {
    through: SerreTemperature,
    foreignKey: 'IdSerre',
    otherKey: 'IdTemperature',
    as: 'temperatures'
});

Temperature.belongsToMany(Serre, {
    through: SerreTemperature,
    foreignKey: 'IdTemperature',
    otherKey: 'IdSerre',
    as: 'serres'
});


// ==========================================
// ASSOCIATIONS STOCK D'EAU
// ==========================================

// Serre - StockEau (One-to-Many)
Serre.hasMany(StockEau, {
    foreignKey: 'IdSerre',
    as: 'stocksEau'
});

StockEau.belongsTo(Serre, {
    foreignKey: 'IdSerre',
    as: 'serre'
});


// ==========================================
// ASSOCIATIONS RENOUVELLEMENT
// ==========================================

// StockEau - Renouvellement (Ancien stock)
StockEau.hasMany(Renouvellement, {
    foreignKey: 'idAncienStock',
    as: 'renouvellementsAnciens'
});

Renouvellement.belongsTo(StockEau, {
    foreignKey: 'idAncienStock',
    as: 'stockPrecedent'
});

// StockEau - Renouvellement (Nouveau stock)
StockEau.hasMany(Renouvellement, {
    foreignKey: 'idNouveauStock',
    as: 'renouvellementsNouveaux'
});

Renouvellement.belongsTo(StockEau, {
    foreignKey: 'idNouveauStock',
    as: 'stockSuivant'
});

Serre.hasMany(Pompe, {
    foreignKey: 'IdSerre',
    as: 'pompes'
});

Pompe.belongsTo(Serre, {
    foreignKey: 'IdSerre',
    as: 'serre'
});
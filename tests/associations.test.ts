import '../server/src/tables/associations';

import Capteur from '../server/src/tables/capteur';
import Humidite from '../server/src/tables/humidite';
import Temperature from '../server/src/tables/temperature';
import CapteurHumidite from '../server/src/tables/capteur_humidite';
import CapteurTemperature from '../server/src/tables/capteur_temperature';

import Serre from '../server/src/tables/serre';
import Plante from '../server/src/tables/plante';
import SerrePlante from '../server/src/tables/serre_plante';
import SerreHumidite from '../server/src/tables/serre_humidite';
import SerreTemperature from '../server/src/tables/serre_temperature';

import StockEau from '../server/src/tables/stock_eau';
import Renouvellement from '../server/src/tables/renouvellement';

describe('Associations Sequelize', () => {
    describe('Associations des capteurs', () => {
        it('doit associer Capteur à CapteurHumidite', () => {
            expect(Capteur.associations.capteursHumidite).toBeDefined();
            expect(CapteurHumidite.associations.capteur).toBeDefined();
        });

        it('doit associer Humidite à CapteurHumidite', () => {
            expect(Humidite.associations.capteurs).toBeDefined();
            expect(CapteurHumidite.associations.humidite).toBeDefined();
        });

        it('doit associer Capteur à CapteurTemperature', () => {
            expect(Capteur.associations.capteursTemperature).toBeDefined();
            expect(CapteurTemperature.associations.capteur).toBeDefined();
        });

        it('doit associer Temperature à CapteurTemperature', () => {
            expect(Temperature.associations.capteurs).toBeDefined();
            expect(CapteurTemperature.associations.temperature).toBeDefined();
        });
    });

    describe('Associations Serre', () => {
        it('doit associer Serre et Plante en Many-to-Many', () => {
            expect(Serre.associations.plantes).toBeDefined();
            expect(Plante.associations.serres).toBeDefined();
            expect(Serre.associations.plantes.associationType)
                .toBe('BelongsToMany');
        });

        it('doit utiliser la table de liaison SerrePlante', () => {
            expect(Serre.associations.plantes.through.model).toBe(SerrePlante);
        });

        it('doit associer Serre et Humidite en Many-to-Many', () => {
            expect(Serre.associations.humidites).toBeDefined();
            expect(Humidite.associations.serres).toBeDefined();
            expect(Serre.associations.humidites.associationType)
                .toBe('BelongsToMany');
            expect(Serre.associations.humidites.through.model)
                .toBe(SerreHumidite);
        });

        it('doit associer Serre et Temperature en Many-to-Many', () => {
            expect(Serre.associations.temperatures).toBeDefined();
            expect(Temperature.associations.serres).toBeDefined();
            expect(Serre.associations.temperatures.associationType)
                .toBe('BelongsToMany');
            expect(Serre.associations.temperatures.through.model)
                .toBe(SerreTemperature);
        });
    });

    describe('Associations StockEau', () => {
        it('doit associer Serre et StockEau en One-to-Many', () => {
            expect(Serre.associations.stocksEau).toBeDefined();
            expect(StockEau.associations.serre).toBeDefined();
        });

        it('doit utiliser IdSerre comme clé étrangère', () => {
            expect(Serre.associations.stocksEau.foreignKey)
                .toBe('IdSerre');
        });
    });

    describe('Associations Renouvellement', () => {
        it('doit associer StockEau aux anciens stocks', () => {
            expect(StockEau.associations.renouvellementsAnciens)
                .toBeDefined();

            expect(Renouvellement.associations.stockPrecedent)
                .toBeDefined();

            expect(Renouvellement.associations.stockPrecedent.foreignKey)
                .toBe('idAncienStock');
        });

        it('doit associer StockEau aux nouveaux stocks', () => {
            expect(StockEau.associations.renouvellementsNouveaux)
                .toBeDefined();

            expect(Renouvellement.associations.stockSuivant)
                .toBeDefined();

            expect(Renouvellement.associations.stockSuivant.foreignKey)
                .toBe('idNouveauStock');
        });
    });
});

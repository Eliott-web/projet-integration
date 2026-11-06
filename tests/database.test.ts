
import sequelize from '../server/src/config/database';

describe('Connexion à la base de données', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('doit se connecter à PostgreSQL', async () => {
        await expect(
            sequelize.authenticate()
        ).resolves.toBeUndefined();
    }, 15000);

    it('doit utiliser PostgreSQL', () => {
        expect(sequelize.getDialect()).toBe('postgres');
    });
});

import sequelize from '../server/src/config/database';
import capteurRepository from '../server/src/repositories/CapteurRepository';

describe('CapteurRepository - Tests d’intégration', () => {
    const descriptionTest = `TEST_INTEGRATION_${Date.now()}`;

    let capteurId: number | undefined;

    beforeAll(async () => {
        await sequelize.authenticate();
    });

    afterAll(async () => {
        if (capteurId !== undefined) {
            await capteurRepository.delete(capteurId);
        }

        await sequelize.close();
    });

    test('doit effectuer les opérations CRUD sur un vrai capteur', async () => {
        const capteur = await capteurRepository.create({
            Description: descriptionTest
        });

        capteurId = capteur.IdCapteur;

        expect(capteur.IdCapteur).toBeDefined();
        expect(capteur.Description).toBe(descriptionTest);

        const capteurTrouve = await capteurRepository.findById(capteurId);

        expect(capteurTrouve).not.toBeNull();
        expect(capteurTrouve?.Description).toBe(descriptionTest);

        const capteurParDescription =
            await capteurRepository.findByDescription(descriptionTest);

        expect(capteurParDescription?.IdCapteur).toBe(capteurId);

        const tousLesCapteurs = await capteurRepository.findAll();

        expect(
            tousLesCapteurs.some(c => c.IdCapteur === capteurId)
        ).toBe(true);

        const nouvelleDescription = `${descriptionTest}_MODIFIE`;

        const capteurModifie = await capteurRepository.update(
            capteurId,
            { Description: nouvelleDescription }
        );

        expect(capteurModifie?.Description).toBe(nouvelleDescription);

        const suppression = await capteurRepository.delete(capteurId);

        expect(suppression).toBe(true);

        const capteurSupprime = await capteurRepository.findById(capteurId);

        expect(capteurSupprime).toBeNull();

        capteurId = undefined;
    }, 30000);
});
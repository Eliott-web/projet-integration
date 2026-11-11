import capteurService from '../server/src/services/CapteurServices';
import capteurRepository from '../server/src/repositories/CapteurRepository';

jest.mock('../server/src/repositories/CapteurRepository', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    }
}));

describe('CapteurService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('doit récupérer tous les capteurs', async () => {
        const capteurs = [
            { IdCapteur: 1, Description: 'Capteur humidité' },
            { IdCapteur: 2, Description: 'Capteur température' }
        ];

        (capteurRepository.findAll as jest.Mock)
            .mockResolvedValue(capteurs);

        const result = await capteurService.getAllCapteurs();

        expect(result).toEqual(capteurs);
        expect(capteurRepository.findAll).toHaveBeenCalledTimes(1);
    });

    test('doit récupérer un capteur par son identifiant', async () => {
        const capteur = {
            IdCapteur: 1,
            Description: 'Capteur humidité'
        };

        (capteurRepository.findById as jest.Mock)
            .mockResolvedValue(capteur);

        const result = await capteurService.getCapteurById(1);

        expect(result).toEqual(capteur);
        expect(capteurRepository.findById).toHaveBeenCalledWith(1);
    });

    test('doit créer un capteur', async () => {
        const capteur = {
            IdCapteur: 1,
            Description: 'Nouveau capteur'
        };

        (capteurRepository.create as jest.Mock)
            .mockResolvedValue(capteur);

        const result = await capteurService.createCapteur('Nouveau capteur');

        expect(result).toEqual(capteur);
        expect(capteurRepository.create).toHaveBeenCalledWith({
            Description: 'Nouveau capteur'
        });
    });

    test('doit supprimer un capteur', async () => {
        (capteurRepository.delete as jest.Mock)
            .mockResolvedValue(true);

        const result = await capteurService.deleteCapteur(1);

        expect(result).toBe(true);
        expect(capteurRepository.delete).toHaveBeenCalledWith(1);
    });
});
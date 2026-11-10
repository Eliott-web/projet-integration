import capteurRepository from '../server/src/repositories/CapteurRepository';
import Capteur from '../server/src/tables/capteur';

jest.mock('../server/src/tables/capteur', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn()
    }
}));

describe('CapteurRepository', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('doit récupérer tous les capteurs', async () => {
        const capteurs = [
            { IdCapteur: 1, Description: 'Capteur humidité' }
        ];

        (Capteur.findAll as jest.Mock).mockResolvedValue(capteurs);

        const result = await capteurRepository.findAll();

        expect(result).toEqual(capteurs);
        expect(Capteur.findAll).toHaveBeenCalledTimes(1);
    });

    test('doit récupérer un capteur par son ID', async () => {
        const capteur = {
            IdCapteur: 1,
            Description: 'Capteur humidité'
        };

        (Capteur.findByPk as jest.Mock).mockResolvedValue(capteur);

        const result = await capteurRepository.findById(1);

        expect(result).toEqual(capteur);
        expect(Capteur.findByPk).toHaveBeenCalledWith(1);
    });

    test('doit créer un capteur', async () => {
        const capteur = {
            IdCapteur: 1,
            Description: 'Nouveau capteur'
        };

        (Capteur.create as jest.Mock).mockResolvedValue(capteur);

        const result = await capteurRepository.create({
            Description: 'Nouveau capteur'
        });

        expect(result).toEqual(capteur);
        expect(Capteur.create).toHaveBeenCalledWith({
            Description: 'Nouveau capteur'
        });
    });

    test('doit rechercher un capteur par description', async () => {
        const capteur = {
            IdCapteur: 1,
            Description: 'Capteur humidité'
        };

        (Capteur.findOne as jest.Mock).mockResolvedValue(capteur);

        const result = await capteurRepository.findByDescription('Capteur humidité');

        expect(result).toEqual(capteur);
        expect(Capteur.findOne).toHaveBeenCalledWith({
            where: { Description: 'Capteur humidité' }
        });
    });
});
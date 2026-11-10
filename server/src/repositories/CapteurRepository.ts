import Capteur from '../tables/capteur';
import { BaseRepository } from './BaseRepository';

class CapteurRepository extends BaseRepository<Capteur> {

    constructor() {
        super(Capteur);
    }

    async findByDescription(description: string): Promise<Capteur | null> {
        return Capteur.findOne({
            where: { Description: description }
        });
    }
}

export default new CapteurRepository();
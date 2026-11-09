import capteurRepository from '../repositories/CapteurRepository';

class CapteurService {

    async getAllCapteurs() {
        return capteurRepository.findAll();
    }

    async getCapteurById(id: number) {
        return capteurRepository.findById(id);
    }

    async createCapteur(description: string) {
        return capteurRepository.create({
            Description: description
        });
    }

    async deleteCapteur(id: number) {
        return capteurRepository.delete(id);
    }
}

export default new CapteurService();
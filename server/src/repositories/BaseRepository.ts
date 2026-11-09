import {
    Model,
    ModelStatic,
    CreationAttributes
} from 'sequelize';

import { IndexBaseRepository } from './interfaces/IndexBaseRepository';

export class BaseRepository<T extends Model>
    implements IndexBaseRepository<T> {

    constructor(
        protected model: ModelStatic<T>
    ) {}

    async findAll(): Promise<T[]> {
        return this.model.findAll();
    }

    async findById(id: number): Promise<T | null> {
        return this.model.findByPk(id);
    }

    async create(data: CreationAttributes<T>): Promise<T> {
        return this.model.create(data);
    }

    async update(
        id: number,
        data: Partial<T['_attributes']>
    ): Promise<T | null> {
        const entity = await this.model.findByPk(id);

        if (!entity) {
            return null;
        }

        await entity.update(data);

        return entity;
    }

    async delete(id: number): Promise<boolean> {
        const entity = await this.model.findByPk(id);

        if (!entity) {
            return false;
        }

        await entity.destroy();

        return true;
    }
}
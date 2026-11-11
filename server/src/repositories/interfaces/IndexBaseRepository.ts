import { Model, CreationAttributes } from 'sequelize';

export interface IndexBaseRepository<T extends Model> {
    findAll(): Promise<T[]>;
    findById(id: number): Promise<T | null>;
    create(data: CreationAttributes<T>): Promise<T>;
    update(id: number, data: Partial<T['_attributes']>): Promise<T | null>;
    delete(id: number): Promise<boolean>;
}
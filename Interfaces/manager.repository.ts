import { IManager } from "./common.interface";

export interface IManagerRepository {
  findByEmail(email: string): Promise<IManager | null>;
  findByHotel(hotel: string): Promise<IManager | null>;
  create(managerData: Partial<IManager>): Promise<IManager>;
  findById(id: string): Promise<IManager | null>;
  update(id: string, updateData: Partial<IManager>): Promise<IManager | null>;
}
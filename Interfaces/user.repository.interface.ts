import { IUser } from "./common.interface";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  findByResetToken(token: string): Promise<IUser | null>;
  reset(email: string, token: string, tokenExpires: Date): Promise<void>;
  updateWallet(userId: string, amount: number): Promise<IUser | null>;
}

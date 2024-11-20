import { Model } from "mongoose";
import { IUser } from "../Interfaces/common.interface";
import { IUserRepository } from "../Interfaces/user.repository.interface";

export class UserRepository implements IUserRepository {
  private userModel : Model<IUser>

  constructor(userModel: Model<IUser>) {
    if (!userModel) {
      throw new Error("User model is required");
  }
      console.log("Instantiating UserRepository with model:", userModel);

    this.userModel = userModel;
  }  
  
  async findByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email });
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const newUser = new this.userModel(userData);
    return await newUser.save(); 
  }

  async findById(id: string): Promise<IUser | null> {
    return this.userModel.findById(id);
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    const userDoc = await this.userModel.findById(id); 
    if (!userDoc) {
      throw new Error('User not found');
    }
    Object.assign(userDoc, user); 
    return await userDoc.save(); 
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }

  async reset(email: string, token: string, tokenExpires: Date): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = tokenExpires;

    await user.save();
  }
}
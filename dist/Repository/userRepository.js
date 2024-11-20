"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
class UserRepository {
    constructor(userModel) {
        if (!userModel) {
            throw new Error("User model is required");
        }
        console.log("Instantiating UserRepository with model:", userModel);
        this.userModel = userModel;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email });
    }
    async create(userData) {
        const newUser = new this.userModel(userData);
        return await newUser.save();
    }
    async findById(id) {
        return this.userModel.findById(id);
    }
    async update(id, user) {
        const userDoc = await this.userModel.findById(id);
        if (!userDoc) {
            throw new Error('User not found');
        }
        Object.assign(userDoc, user);
        return await userDoc.save();
    }
    async findByResetToken(token) {
        return this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }
    async reset(email, token, tokenExpires) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new Error("User not found.");
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpires;
        await user.save();
    }
}
exports.UserRepository = UserRepository;

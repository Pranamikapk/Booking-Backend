"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
class AdminRepository {
    constructor(userModel, managerModel, hotelModel) {
        this.userModel = userModel;
        this.managerModel = managerModel;
        this.hotelModel = hotelModel;
    }
    async findAdminByEmail(email) {
        return this.userModel.findOne({ email });
    }
    async createAdmin(adminData) {
        const admin = new this.userModel(adminData);
        return admin.save();
    }
    async findUserById(id) {
        return this.userModel.findById(id);
    }
    async findAllClients() {
        return this.userModel.find({ role: 'client' });
    }
    async findAllManagers() {
        return this.managerModel.find();
    }
    async updateUser(user) {
        const userData = new this.userModel(user);
        return userData.save();
    }
    async findAllHotels() {
        return this.hotelModel.find();
    }
    async findHotelById(id) {
        return this.hotelModel.findById(id);
    }
    async updateHotel(hotel) {
        const newHotel = new this.hotelModel(hotel);
        return newHotel.save();
    }
}
exports.AdminRepository = AdminRepository;

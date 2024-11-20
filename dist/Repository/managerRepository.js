"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerRepository = void 0;
class ManagerRepository {
    constructor(managerModel) {
        this.managerModel = managerModel;
    }
    async findByEmail(email) {
        const manager = this.managerModel.findOne({ email }).lean();
        console.log(manager);
        return manager;
    }
    async findByHotel(hotel) {
        return this.managerModel.findOne({ hotel });
    }
    async create(managerData) {
        const manager = new this.managerModel(managerData);
        return manager.save();
    }
    async findById(id) {
        return this.managerModel.findById(id);
    }
    async update(id, updateData) {
        return this.managerModel.findByIdAndUpdate(id, updateData, { new: true });
    }
}
exports.ManagerRepository = ManagerRepository;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const database_connection = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log('Database Connected');
    }
    catch (error) {
        console.log('Database not connected', error);
    }
};
exports.default = database_connection;

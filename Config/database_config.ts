import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const database_connection = async() : Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
        console.log('Database Connected');
        
    } catch (error) {
        console.log('Database not connected',error);
        
    }
}

export default database_connection
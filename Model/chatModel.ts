import mongoose, { Schema } from 'mongoose';
import { IChat } from '../Interfaces/common.interface';

const chatSchema: Schema = new Schema({
  bookingId: { type: String, required: true, unique: true },
  manager: { type: mongoose.Schema.Types.ObjectId,
    ref: "Manager",
    required: true, 
  },
  user: { type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
  },
  messages: [{
    sender: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
});

export default mongoose.model<IChat>('Chat', chatSchema);


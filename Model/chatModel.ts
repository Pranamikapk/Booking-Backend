import mongoose, { Schema } from 'mongoose';
import { IChat } from '../Interfaces/common.interface';

const messageSchema = new Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Manager']
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const chatSchema = new Schema({
  bookingId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  manager: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manager",
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastMessage = new Date();
  }
  next();
});

export default mongoose.model<IChat>('Chat', chatSchema);

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  date: Date,
  location: String,
  organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // References to users who are organizing
  votes: {
    type: Number,
    default: 0
  },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // <-- Add this to track voters
  approved: {
    type: Boolean,
    default: false
  },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // References to users who registered
  // Fields for after the event is completed
  winnerName: {
    type: String
  },
  postEventDescription: {
    type: String
  },
  photos: {
    type: [String]
  }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
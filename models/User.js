import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 32
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: 'This user has not set a bio.',
    maxlength: 200
  },
  places: {
    type: Array,
    default: []
  },
  reviews: {
    type: Array,
    default: []
  },
  reservations: {
    type: Array,
    default: []
  }
});

export default mongoose.model('user', UserSchema);

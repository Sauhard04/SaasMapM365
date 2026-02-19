import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String }, // For local admin login
    role: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    jobTitle: { type: String },
    avatar: { type: String },
    entraGroups: [{ type: String }],
    tenantId: { type: String },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);

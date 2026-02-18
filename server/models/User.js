const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    jobTitle: { type: String },
    avatar: { type: String },
    entraGroups: [{ type: String }],
    tenantId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

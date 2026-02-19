import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true },
    price: { type: String },
    priceINR: { type: String },
    priceAnnual: { type: String },
    priceAnnualINR: { type: String },
    color: { type: String },
    features: [{ type: String }], // Array of Feature IDs
}, { timestamps: true });

export default mongoose.model('Plan', PlanSchema);

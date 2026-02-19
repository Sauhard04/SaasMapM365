import mongoose from 'mongoose';

const TierSchema = new mongoose.Schema({
    tierName: { type: String, required: true },
    includedInPlanIds: [{ type: String }],
    capabilities: [{ type: String }],
}, { _id: false });

const TierComparisonSchema = new mongoose.Schema({
    title: { type: String },
    tiers: [TierSchema],
}, { _id: false });

const FeatureSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    link: { type: String },
    tierComparison: TierComparisonSchema,
}, { timestamps: true });

export default mongoose.model('Feature', FeatureSchema);

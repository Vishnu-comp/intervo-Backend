import mongoose from 'mongoose';

const AptitudeUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    faceImage: { type: String }, // URL or path to the stored image
    idCardImage: { type: String } // URL or path to the stored image
}, { timestamps: true });

const AptitudeUser= mongoose.model('AptitudeUser',AptitudeUserSchema);

export default AptitudeUser;

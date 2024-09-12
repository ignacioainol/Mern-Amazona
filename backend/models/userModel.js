import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false, required: true },
    },
    {
        timestamps: true
    }
)

userSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        // const fieldRepeated = JSON.stringify(error).trim().split('{')[1];
        // next(new Error(fieldRepeated));
        // next(new Error('There was a duplicate key error'));
        next(new Error('El email ya está registrado.'));
    } else {
        next();
    }
});

const User = mongoose.model('User', userSchema);
export default User;
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email:          { type: String, required: true, unique: true },
    passwordHash:   { type: String, required: true },

    isActivated:    { type: Boolean, default: false },
    activationLink: { type: String },

    nickname:       { type: String, required: true, unique: true },

    profilePicture: { type: String },
    bannerPicture:  { type: String },

    name:           { type: String },
    surname:        { type: String },
    country:        { type: String },
    city:           { type: String },
    bio:            { type: String },
});

module.exports = model('User', userSchema);
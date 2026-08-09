const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    food_name: { type: String, required: true },
    weight: { type: Number, default: null },
    image_path: { type: String, required: true },
    expiration_date: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Food', foodSchema);
const mongoose = require('mongoose');
// notification Schema 
const locationSchema = mongoose.Schema({
    area: {
        type: String,
        required: true
    }
});

locationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

locationSchema.set('toJSON', {
    virtuals: true,
});

exports.Location = mongoose.model('location', locationSchema);
const mongoose = require('mongoose');
// user Schema 
const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    EmailAddress: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    userImage: {
        type: String,
        default: "https://cdn.pngsumo.com/profile-vector-at-getdrawings-free-download-profile-vector-png-980_980.png"
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    userArea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location',
        required: true
    },
    securityQuestion: {
        type: String,
        required: true
    }

})
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});



exports.User = mongoose.model('user', userSchema);
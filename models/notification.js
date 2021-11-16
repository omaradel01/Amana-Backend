const mongoose = require('mongoose');
// notification Schema 
const notificationSchema = mongoose.Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }],
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    notificationHeader: {
        type: String,
        required: true
    },
    notificationText: {
        type: String,
        required: true
    },
    notificationDate: {
        type: String,
        default: new Date().toLocaleTimeString('en-US')
        // default: new Date().toTimeString()

    }
});

notificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

notificationSchema.set('toJSON', {
    virtuals: true,
});

exports.Notification = mongoose.model('notification', notificationSchema);
const mongoose = require('mongoose');
var dateFormat = require('dateformat')
// user Schema 
const postSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    postImage: {
        type: String,
        default: 'https://www.turnkeytec.com/wp-content/uploads/2020/07/placeholder-image.jpg',
        required: true
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    flags: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        username: {
            type: String
        },
        userImage: {
            type: String
        },
        text: {
            type: String,
        },
        date: {
            type: Date,
            default: dateFormat(new Date(), "yyyy-mm-dd h:MM")
        },
        admin: {
            type: Boolean
        }
    }],
    postTitle: {
        type: String,
        required: true
    },
    postDescription: {
        type: String,
        required: true
    },
    creationDate: {
        type: String,
        default: dateFormat(new Date(), "yyyy-mm-dd h:MM")
    },
    rewardValue: {
        type: Number,
        default: 0
    },
    postType: {
        // true : lost
        // false: Found
        type: Boolean,
        required: true
    },
    // if found change status to false
    // if lost change status to true
    postStatus: {
        type: Boolean,
        default: false
    },
    isSpam: {
        type: Boolean,
        default: false
    },
    itemLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location',
        required: true
    },
    //Devices Attributes
    ssn: {
        type: String,
        default: 'Not Defined'
    },
    DeviceBrand: {
        type: String,
        default: 'Not Defined'

    },
    color: {
        type: String,
        default: 'Not Defined'
    },

    //Accessories Attributes
    Size: {
        type: Number,
        default: 0
    },
    accessoryType: {
        type: String,
        default: 'Not Defined'
    },
    // Bag Attributes
    bagType: {
        type: String,
        default: 'Not Defined'
    },
    // Personal Belongings Attributes
    PB_type: {
        type: String,
        default: 'Not Defined'
    }

})
postSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

postSchema.set('toJSON', {
    virtuals: true,
});

exports.Post = mongoose.model('post', postSchema);
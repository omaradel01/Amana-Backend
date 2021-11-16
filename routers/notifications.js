const {
    Notification
} = require('../models/notification')
const {
    User
} = require('../models/user')
const {
    Post
} = require('../models/post')
const express = require('express')
const routers = express.Router()


// Get all Notifications
routers.get(`/`, async (req, res) => {
    const notificationsList = await Notification.find().populate('user').populate('postID');
    res.send(notificationsList);
})

// Get all Notifications
routers.get(`/get/users`, async (req, res) => {
    const userList = await User.find({
        isAdmin: false
    })

    if (!userList) {
        res.status(400).send('No Notifications Found')
    }

    const userIDS = userList.map(item => item.id)
    console.log(userIDS)
    const notificationsList = await Notification.find({
        "user": {
            $in: userIDS
        }
    }).populate('user').populate('postID');
    console.log(notificationsList)
    res.send(notificationsList);
    if (!notificationsList) {
        res.status(500).json({
            success: false,
            message: "Notification is not found"
        })
    }
})



// Get all Notifications
// routers.get(`/get/admins`, async (req, res) => {
//     const user = await User.find({
//         isAdmin: true
//     })
//     console.log(user)
//         const notificationsList = await Notification.find({
//         user: {$eq: req.user.userID}
//     }).populate('user').populate('postID');
//     res.send(notificationsList);
//     if (!notificationsList) {
//         res.status(500).json({
//             success: false,
//             message: "Notification is not found"
//         })
//     }
// })




// get all notifications for admins
routers.get(`/get/admins`, async (req, res) => {
    const userList = await User.find({
        isAdmin: true
    })

    if (!userList) {
        res.status(400).send('No Notifications Found')
    }

    const userIDS = userList.map(item => item.id)
    console.log(userIDS)
    const notificationsList = await Notification.find({
        "user": {
            $in: userIDS
        }
    }).populate('user').populate('postID');
    console.log(notificationsList)
    res.send(notificationsList);
    if (!notificationsList) {
        res.status(500).json({
            success: false,
            message: "Notification is not found"
        })
    }
})

// Get notification by ID
routers.get(`/:id`, async (req, res) => {
    const notification = await Notification.findById(req.params.id).populate('postID').populate('user')
    if (!notification) {
        res.status(500).json({
            success: false,
            message: "Notification is not found"
        })
    }
    res.send(notification)
})


// Get notifications for a specific user by his ID
routers.get(`/user/:id`, async (req, res) => {
    const id = [req.params.id]
    const userNotificationsList = await Notification.find({
        user: {
            $in: id
        }
    }).sort({
        "notificationDate": -1
    }).populate('user').populate('postID')
    res.send(userNotificationsList)
})

// Delete Notification
routers.delete(`/:id`, async (req, res) => {
    Notification.findByIdAndRemove(req.params.id).then(notification => {
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found !"
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Notification is deleted successfully !!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            message: "Invalid Notification",
            error: err
        })
    })
})

module.exports = routers
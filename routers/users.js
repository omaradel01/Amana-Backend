const {
    User
} = require('../models/user')
const express = require('express');
const routers = express.Router();
const bcrypt = require("bcryptjs");
const JWT = require('jsonwebtoken');
// Multer for server Upload 
// Multer Library for uplaoding Files 
const multer = require('multer');

const FILE_TYPES = {
    // using MIME TYPES type/subtype
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPES[file.mimetype];
        let uploadError = new Error("Invalid Upload type")
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname;
        const extension = FILE_TYPES[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})
var uploadOptions = multer({
    storage: storage
})

// dotenv configuration 
require('dotenv/config')
const {
    check,
    validationResult
} = require('express-validator');
// GET all users 
routers.get(`/`, async (req, res) => {
    const userList = await User.find().populate('userArea');
    res.send(userList)
})


// GET user by ID
routers.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).populate('userArea');
    if (!user) {
        res.status(500).json({
            success: false,
            message: "User is not found"
        })
    }
    console.log("The Selected User is " + user);
    res.send(user)
});

// GET All Admins Users
routers.get(`/get/admins`, async (req, res) => {
    const adminList = await User.find({
        isAdmin: true
    })
    return res.send(adminList)
})


/// Get users count
routers.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count)
    if (!userCount) {
        res.status(500).json({
            success: false,
            message: "user is not found"
        })
    }
    res.send({
        UserCount: userCount
    })
});



// Register Users 
routers.post(`/register`,
    uploadOptions.single('userImage'),
    [
        check('EmailAddress', 'Please Enter a valid Email').isEmail().normalizeEmail(),
        check('phoneNumber', 'Please Make Sure that they are 11 Numbers').isLength({
            min: 11,
            max: 11
        }),
        check('password', "Password Must be More than 6 characterss").isLength({
            min: 6
        })
    ], async (req, res) => {
        const Errors = validationResult(req)
        console.log(Errors)
        if (!Errors.isEmpty()) {
            return res.status(400).json({
                Errors: Errors.array()
            })
        }
        const {
            EmailAddress,
        } = req.body

        try {
            //// check if user is already exists
            let user = await User.findOne({
                EmailAddress
            })
            if (user) {
                console.log(user)
                return res.status(404).json({
                    Errors: [{
                        msg: 'User already Exists !! '
                    }]
                })
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error!')
        }
        let imagepath;
        const file = req.file;
        if (file !== undefined) {
            const fileName = file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagepath = `${basePath}${fileName}`;
        } else {
            imagepath = 'https://www.kindpng.com/picc/m/10-104902_simple-user-icon-user-icon-white-png-transparent.png';
        }
        // here to push attributes data to database using POST HTTP REQUEST
        let user = new User({
            firstName: req.body.firstName,
            userImage: imagepath,
            lastName: req.body.lastName,
            EmailAddress: req.body.EmailAddress,
            userName: req.body.userName,
            phoneNumber: req.body.phoneNumber,
            userImage: imagepath,
            // using bcrypt javascript library will help in hashing password with 10 max characters
            password: bcrypt.hashSync(req.body.password, 10),
            isAdmin: req.body.isAdmin,
            userArea: req.body.userArea,
            securityQuestion: bcrypt.hashSync(req.body.securityQuestion, 10)
        })
        //save database
        await user.save().then(() => {
            // send JSONWEBTOKEN
            const payload = {
                user: {
                    id: user.id
                }
            }
            JWT.sign(payload, process.env.SECRET, {
                expiresIn: 36000
            }, (err, token) => {
                if (err) throw err
                res.status(200).json({
                    token
                })
            })
        }).catch((err) => {
            console.log(err)
            res.status(500).json({
                error: err,
                success: false
            })
        })
    });


/// Login Connections

// Login Section
routers.post('/login', [
        check('EmailAddress', 'Please Enter a valid Email').isEmail().not().isEmpty(),
        check('password', 'Please Enter your password').not().isEmpty(),
        check('password', "Password Must be More than 6 characters").isLength({
            min: 6,
        })
    ],
    async (req, res) => {
        const Errors = validationResult(req)
        console.log(Errors)
        if (!Errors.isEmpty()) {
            return res.status(400).json({
                Errors: Errors.array()
            })

        }
        const user = await User.findOne({
            EmailAddress: req.body.EmailAddress,
        })
        const secret = process.env.SECRET;
        if (!user) {
            console.log(user)
            return res.status(404).json({
                Errors: [{
                    msg: 'User is not found ! '
                }]
            })
        }
        if (user && bcrypt.compareSync(req.body.password, user.password)) {
            // JWT for creating a token for each user
            const token = JWT.sign({
                    userID: user.id,
                    isAdmin: user.isAdmin,
                    userName: user.userName
                },
                // Generated Token ID for this user
                secret, {
                    //options of tokens
                    // token expires after 1 Month
                    expiresIn: '3600d'
                }
            )
            console.log("The Token ", token)
            return res.status(200).send({
                user: user.id,
                token: token
            })
        } else {
            return res.status(404).send("The Password is wrong!")
        }
    })


/// check email address for forgetting password
routers.post('/checkemail', async (req, res) => {
    try {
        const user = await User.findOne({
            EmailAddress: req.body.EmailAddress,
        })
        console.log(user)
        console.log(req.body.securityQuestion)
        if (user && bcrypt.compareSync(req.body.securityQuestion, user.securityQuestion)) {
            const secret = process.env.SECRET;
            const token = JWT.sign({
                    userID: user.id,
                    isAdmin: user.isAdmin,
                    userName: user.userName
                },
                // Generated Token ID for this user
                secret, {
                    //options of tokens
                    // token expires after 1 Month
                    expiresIn: '3600d'
                }
            )
            console.log(user)
            return res.status(200).send({
                user: user.id,
                token: token
            })
        } else if (!user) {
            console.log(user)
            return res.status(404).json({
                Errors: [{
                    msg: 'User is not found ! '
                }]
            })
        } else {
            return res.status(404).json({
                Errors: [{
                    msg: 'Account is not found ! '
                }]
            })
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error!')
    }
})

//// Delete Users 
routers.delete(`/:id`, async (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found !"
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "user is deleted successfully !!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            message: "Invalid user",
            error: err
        })
    })
})



// Edit user
routers.put('/:id', uploadOptions.single('userImage'), [
    check('EmailAddress', 'Please Enter a valid Email').isEmail().not().isEmpty(),
    check('phoneNumber', 'Please Make Sure that they are 11 Numbers').isLength({
        min: 11,
        max: 11
    })
], async (req, res) => {
    const Errors = validationResult(req)
    console.log(Errors)
    if (!Errors.isEmpty()) {
        return res.status(400).json({
            Errors: Errors.array()
        })

    }
    const validUser = await User.findById(req.params.id)
    if (!validUser) {
        return res.status(400).send('Invalid User Id');
    }
    const file = req.file;
    if (file !== undefined) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = validUser.userImage
    }
    console.log(validUser)
    const user = await User.findByIdAndUpdate(
        req.params.id, {
            EmailAddress: req.body.EmailAddress === '' ? validUser.EmailAddress : req.body.EmailAddress,
            phoneNumber: req.body.phoneNumber === '' ? validUser.phoneNumber : req.body.phoneNumber,
            userImage: imagepath
        }, {
            new: true
        }
    )
    console.log(user)

    if (!user)
        return res.status(400).send('the user cannot be updated!')
    res.send(user);
})


// confirm user new password
routers.put('/newpass/:id', [
    check('password', "Password Must be More than 6 characterss").isLength({
        min: 6
    })
], async (req, res) => {
    const Errors = validationResult(req)
    console.log(Errors)
    if (!Errors.isEmpty()) {
        return res.status(400).json({
            Errors: Errors.array()
        })

    }
    const validUser = await User.findById(req.params.id)
    if (!validUser) {
        return res.status(400).send('Invalid User Id');
    }
    console.log(validUser)
    const user = await User.findByIdAndUpdate(
        req.params.id, {
            password: bcrypt.hashSync(req.body.password, 10)
        }, {
            new: true
        }
    )
    console.log(user)
    if (!user)
        return res.status(404).send('the Password cannot be updated!')
    res.send(user);
})


module.exports = routers
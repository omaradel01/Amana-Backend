const {
    Post
} = require('../models/post')
const {
    Category
} = require('../models/category')
const {
    User
} = require('../models/user')

const {
    Location
} = require('../models/location')
var stringSimilarity = require('string-similarity')

const {
    Notification
} = require('../models/notification')
const express = require('express');
const routers = express.Router();
const {
    check,
    validationResult
} = require('express-validator');
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
    destination: function(req, file, cb) {
        const isValid = FILE_TYPES[file.mimetype];
        let uploadError = new Error("Invalid Upload type")
        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function(req, file, cb) {
        const fileName = file.originalname;
        const extension = FILE_TYPES[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})


var uploadOptions = multer({
    storage: storage
})


// GET all Posts that have posts type are true or false (Admin Page)
routers.get(`/admin`, async(req, res) => {
    const postList = await Post.find({
        postStatus: false
    }).populate('userID');
    res.send(postList)
})

// GET all Posts that have posts type are true (Home Page)
routers.get(`/`, async(req, res) => {
    const postList = await Post.find({
        postStatus: true
    }).populate('userID').populate('itemLocation');
    res.send(postList)
})

// Get all Lost Posts are already Published
routers.get(`/admin/lost`, async(req, res) => {
    const postList = await Post.find({
        postStatus: true,
        postType: true
    }).populate('userID').populate('itemLocation');
    res.send(postList)
})

// Get all Found Posts are already Published
routers.get(`/admin/found`, async(req, res) => {
    const postList = await Post.find({
        postStatus: true,
        postType: false
    }).populate('userID').populate('itemLocation');
    res.send(postList)
})

// GET Posts by ID
routers.get(`/:id`, async(req, res) => {
    const post = await (await Post.findById(req.params.id).populate('categoryID').populate('userID').populate('itemLocation'))
    if (!post) {
        res.status(500).json({
            success: false,
            message: "Post is not found"
        })
    }
    console.log("The Selected Post is " + post);
    res.send(post)
});


// Get Matched Post
routers.get(`/:id/matchpost`, async(req, res) => {
    const post = await Post.findById(req.params.id, {
        id: 1,
        postTitle: 1,
        postType: 1,
        postDescription: 1,
        itemLocation: 1,
        userID: 1
    }).populate('itemLocation').populate('userID').populate('categoryID')
    console.log("The Post", post)
    const allLostPosts = await Post.find({
        postStatus: true,
        postType: true,
        itemLocation: post.itemLocation,
        userID: {
            $ne: post.userID.id
        },
        categoryID: post.categoryID
    }).populate('itemLocation').populate('userID').populate('categoryID')
    const allFoundPost = await Post.find({
        postStatus: true,
        postType: false,
        itemLocation: post.itemLocation,
        userID: {
            $ne: post.userID.id
        },
        categoryID: post.categoryID

    }).populate('itemLocation').populate('userID').populate('categoryID')
    console.log("The Required Post", post)
    console.log("The All Lost Posts", allLostPosts)
    console.log("The All Found Posts", allFoundPost)
    if (post.postType === false) {
        allPostTitleLost = []
        allPostDescLost = []
        allLostPosts.map(item => {
            allPostTitleLost.push(item.postTitle)
            allPostDescLost.push(item.postDescription)
        })
        if (allLostPosts.length == 0) {
            return res.status(404).send('No Matching Posts')
        } else {
            // console.log(matching(post.postTitle, allLostPosts, 'postTitle'));
            var PostTitleSimilarity = stringSimilarity.findBestMatch(post.postTitle, allPostTitleLost)
            var postDescSimilarity = stringSimilarity.findBestMatch(post.postDescription, allPostDescLost)
            console.log(PostTitleSimilarity.bestMatch)
            console.log(PostTitleSimilarity.bestMatchIndex)
            console.log('--------------------')
            console.log(postDescSimilarity.bestMatch)
            console.log(postDescSimilarity.bestMatchIndex)

            if (PostTitleSimilarity.bestMatchIndex === postDescSimilarity.bestMatchIndex) {
                var MatchedLostPost = allLostPosts[PostTitleSimilarity.bestMatchIndex];
                MatchedLostPost.id = post._id
                console.log("The Matching found post id", MatchedFoundPost)
                console.log(MatchedLostPost.userID)
                console.log(MatchedLostPost._id)
                console.log(MatchedLostPost.userID.firstName)
                let notificationForUser = new Notification({
                    user: [MatchedLostPost.userID],
                    postID: post._id,
                    notificationHeader: 'There Is a Matching Post !',
                    notificationText: `Hey ${MatchedLostPost.userID.firstName}, There is a Matching Post to your Post ${MatchedLostPost.postTitle} check it out  !`
                })
                notificationForUser.save(function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result)
                    }
                })
                console.log("The Matching Lost Post", MatchedLostPost)
                return res.status(200).send(MatchedLostPost);
            } else {
                return res.status(404).json("No Matching Lost Posts Found !!")
            }
        }
    } else if (post.postType === true) {
        allPostTitleFound = []
        allPostDescFound = []
        allFoundPost.map(item => {
            allPostTitleFound.push(item.postTitle)
            allPostDescFound.push(item.postDescription)
        })
        if (allFoundPost.length == 0) {
            return res.status(404).send('No Matching Posts ')
        } else {
            var PostTitleSimilarity = stringSimilarity.findBestMatch(post.postTitle, allPostTitleFound)
            var postDescSimilarity = stringSimilarity.findBestMatch(post.postDescription, allPostDescFound)
            console.log(PostTitleSimilarity.bestMatch)
            console.log(PostTitleSimilarity.bestMatchIndex)
            console.log('--------------------')
            console.log(postDescSimilarity.bestMatch)
            console.log(postDescSimilarity.bestMatchIndex)
            if (PostTitleSimilarity.bestMatchIndex === postDescSimilarity.bestMatchIndex) {
                var MatchedFoundPost = allFoundPost[PostTitleSimilarity.bestMatchIndex];
                MatchedFoundPost.id = post._id
                console.log("The Matching found post id", MatchedFoundPost)
                console.log(MatchedFoundPost.userID)
                console.log(post.userID.id)
                let notificationForUser = new Notification({
                    user: [MatchedFoundPost.userID],
                    postID: post._id,
                    notificationHeader: 'There Is a Matching Post !',
                    notificationText: `Hey ${MatchedFoundPost.userID.firstName}, There is a Matching Post to your Post ${MatchedFoundPost.postTitle} check it out  !`
                })
                notificationForUser.save(function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result)
                    }
                })
            }
            console.log("The Matching Found Post", MatchedFoundPost)
            return res.status(200).send(MatchedFoundPost);
        }
    } else {
        return res.status(404).send("No Matching Found Posts Found !!")
    }

})




//// Get Location Statistics

// get location statistics
routers.get('/location-stats/:location', async(req, res) => {
    try {
        var locationID;
        await Location.findOne({
            area: `${req.params.location}`
        }, function(err, doc) {
            if (err) {
                console.log(err)
            } else {
                locationID = doc._id
            }
        })
        const locationStats = await Post.aggregate([{
                $match: {
                    itemLocation: { $eq: locationID },
                    postStatus: { $eq: true }
                }
            },
            {
                $group: {
                    _id: 1,
                    num: { $sum: 1 },
                    avgFound: { $avg: { $cond: [{ $eq: ['$postType', false] }, 1, 0] } },
                    avgLost: { $avg: { $cond: [{ $eq: ['$postType', true] }, 1, 0] } }
                }
            }
        ])
        res.send(locationStats)
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
})

/// get category statistics at a location
routers.get('/categories-location-stats/:location', async(req, res) => {
    try {
        var locationID;
        await Location.findOne({
            area: `${req.params.location}`
        }, function(err, doc) {
            if (err) {
                console.log(err)
            } else {
                locationID = doc._id
            }
        })
        const locationStats = await Post.aggregate([{
                $match: {
                    itemLocation: { $eq: locationID },
                    postStatus: { $eq: true }
                }
            },
            {
                $group: {
                    _id: '$categoryID',
                    num: { $sum: 1 },
                    // avgFound: { $avg: { $cond: [{ $eq: ['$postType', false] }, 1, 0] } },
                    // avgLost: { $avg: { $cond: [{ $eq: ['$postType', true] }, 1, 0] } }
                }
            },
            {
                $sort: { num: -1 }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'Category'
                }
            }
        ])
        if (Object.entries(locationStats).length === 0) {
            res.status(204).send()
        } else {
            res.send(locationStats)
        }
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
})




/// Count Number of ALL POSTS
routers.get(`/admin/dash`, async(req, res) => {
    const Lostposts = await Post.find({
        postStatus: true,
        postType: true
    }).countDocuments({})
    const FoundPosts = await Post.find({
        postStatus: true,
        postType: false
    }).countDocuments({})

    const PendingPosts = await Post.find({
        postStatus: false,
    }).countDocuments({})

    const AllUsers = await User.find({}).countDocuments({})

    const AllCategories = await Category.find({}).countDocuments({})

    const AllLocation = await Location.find({}).countDocuments({})

    return res.status(200).json({
        Lostposts: Lostposts,
        FoundPosts: FoundPosts,
        PendingPosts: PendingPosts,
        AllUsers: AllUsers,
        AllCategories: AllCategories,
        AllLocation: AllLocation
    })
})




// GET Posts by User ID
routers.get(`/dashboard/:userid`, async(req, res) => {
    const postUserList = await Post.find({
        userID: req.params.userid
    }).populate('categoryID').populate('userID')


    if (!postUserList) {
        res.status(500).json({
            success: false
        })
    }
    res.send(postUserList);
})


// Count Posts by User ID Lost and Found
routers.get(`/dashboard/user/:userid`, async(req, res) => {
    const user = await User.findById(req.params.userid).populate('userArea')
    const postLostUser = await Post.find({
        userID: req.params.userid,
        postStatus: true,
        postType: true
    }).countDocuments({})
    const postFoundUser = await Post.find({
        userID: req.params.userid,
        postStatus: true,
        postType: false
    }).countDocuments({})
    if (!postLostUser || !postFoundUser) {
        res.status(500).json({
            success: false
        })
    }
    res.status(200).json({
        success: true,
        postLostUser: postLostUser,
        postFoundUser: postFoundUser,
    })
})

/// Get Posts count
routers.get(`/get/count`, async(req, res) => {
    const postCount = await Post.countDocuments((count) => count)
    if (!postCount) {
        res.status(500).json({
            success: false,
            message: "post is not found"
        })
    }
    res.send({
        postCount: postCount
    })
});


// Add New Posts     
routers.post(`/`,
    uploadOptions.single('postImage'), async(req, res) => {
        // here to push attributes data to database using POST HTTP REQUEST
        const category = await Category.findById(req.body.categoryID);
        const user = await User.findById(req.body.userID).select('-password')
        if (!category) {
            console.log(category)
            return res.status(400).send('Invalid Category');
        } else if (!user) {
            console.log(user)
            return res.status(400).send('Invalid User')
        }
        let imagepath;
        const file = req.file
        if (file !== undefined) {
            const fileName = file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagepath = `${basePath}${fileName}`;
        } else {
            imagepath = 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=640';
        }
        let post = new Post({
            postTitle: req.body.postTitle,
            postImage: imagepath,
            postDescription: req.body.postDescription,
            creationDate: req.body.creationDate,
            categoryID: req.body.categoryID,
            userID: req.body.userID,
            rewardValue: req.body.rewardValue,
            postType: req.body.postType,
            postStatus: req.body.postStatus,
            itemLocation: req.body.itemLocation,
            ssn: req.body.ssn,
            DeviceBrand: req.body.DeviceBrand,
            Size: req.body.Size,
            accessoryType: req.body.accessoryType,
            bagType: req.body.bagType,
            PB_type: req.body.PB_type,
            color: req.body.color
        })

        let adminUsers = await User.find({
            isAdmin: true
        })
        let adminIDs = []
        for (var i = 0; i < adminUsers.length; i++) {
            adminIDs.push(adminUsers[i]._id)
        }
        //save database
        post.save().then((postCreated) => {
            console.log("post result:")
            let post_id = postCreated._id
            let notificationForAdmin = new Notification({
                user: adminIDs,
                postID: post_id,
                notificationHeader: 'New Post Added !',
                notificationText: `Hey Admin, User ${user.userName} is pending a new post with title ${req.body.postTitle}, check it out !`
            })
            notificationForAdmin.save(function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            })

            res.status(200).json(postCreated);


        }).catch((err) => {
            console.log(err)
            res.status(500).json({
                error: err,
                success: false
            })
        })
    });

//// Delete Posts by post ID
routers.delete(`/:id`, async(req, res) => {
    Post.findByIdAndRemove(req.params.id).then(post => {
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "post not found !"
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Post is deleted successfully !!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            message: "Invalid post",
            error: err
        })
    })
})



///Delete all Comments using Admin authority
routers.get(`/admins/:userid`, async(req, res) => {
    const userAdminsList = await User.find({
        _id: req.params.userid,
        isAdmin: true
    })
    console.log(userAdminsList)
    if (userAdminsList.length == 0) {
        return res.status(400).send('User is Not Admin')
    }
    return res.status(200).send(userAdminsList);
})

// Get all posts comments 
routers.delete(`/comments/:post_id/:comment_id`, async(req, res) => {
    const post = await Post.findById(req.params.post_id, {
            comments: 1
        })
        // console.log(post)
    if (!post.comments) {
        res.status(500).json({
            success: false,
            message: "Post is not found"
        })
    }
    console.log("The Selected Comments is " + post.comments);
    const selectedComment = post.comments.find(comment => comment._id == req.params.comment_id)
    selectedComment.remove();
    await post.save()
    res.send(post.comments)
})

//// Delete Selected Comment using Admin User
routers.delete(`admin/:id/comments/:post_id/:comment_id`, async(req, res) => {
    const userAdmin = await User.find({
        _id: req.params.id,
        isAdmin: true
    })
    console.log(userAdmin)
    if (userAdmin.length == 0) {
        return res.status(400).send('User is Not Admin')
    }
    const post = await Post.findById(req.params.post_id, {
        comments: 1
    })
    if (!post) {
        res.status(500).json({
            success: false,
            message: "Comment is not found"
        })
    }
    post.comments.findById(req.params.comment_id)
    console.log(post.comments.findById(req.params.comment_id))
})


// Edit post by id
routers.put("/:id", uploadOptions.single("postImage"), async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const user = await User.findById(req.user.userID)
        console.log(user)
        const postTitle = req.body.postTitle;
        const file = req.file;
        if (file !== undefined) {
            const fileName = file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagepath = `${basePath}${fileName}`;
        } else {
            imagepath = post.userImage
        }
        console.log(imagepath)
            //save database
        let adminUsers = await User.find({
            isAdmin: true
        })
        let adminIDs = []
        for (var i = 0; i < adminUsers.length; i++) {
            adminIDs.push(adminUsers[i]._id)
        }
        const posts = await Post.findByIdAndUpdate(
            req.params.id, {
                postImage: imagepath,
                postTitle: postTitle,
                postDescription: req.body.postDescription,
                rewardValue: req.body.rewardValue,
                postStatus: false
            }, {
                new: true,
            }
        ).then(postupdated => {
            let notificationForAdmin = new Notification({
                user: adminIDs,
                postID: postupdated._id,
                notificationHeader: 'Post is Updated !',
                notificationText: `Hey Admin, User ${user.userName} is Updating his post with title ${postupdated.postTitle}, check it out !`
            })
            notificationForAdmin.save(function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result)
                    return res.status(200).send(posts)
                }
            })
        })
    } catch (err) {
        console.log(err)
    }

})


// Edit Post Status to True if post is valid to be published
routers.put('/admin/:id', async(req, res) => {
        const post = await Post.findByIdAndUpdate(
            req.params.id, {
                postStatus: true
            }, {
                new: true
            }
        )
        let notificationForUser = new Notification({
            user: [post.userID],
            postID: req.params.id,
            notificationHeader: 'Post is Published !',
            notificationText: `Your post with title ${post.postTitle} is approved. You can now see it in the posts feed.`
        })
        notificationForUser.save(function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result)
            }
        })

        if (!post)
            return res.status(400).send('the Post cannot be updated!')

        res.send(post);
    })
    // Delete Post for User whose Post is Against Community Standard
routers.delete('/admin/:id', async(req, res) => {
    Post.findByIdAndRemove(req.params.id).then(post => {
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "post not found !"
            })
        } else {
            let notificationForUser = new Notification({
                user: [post.userID],
                postID: req.params.id,
                notificationHeader: 'Post is Rejected !',
                notificationText: `Your post with title ${post.postTitle} is Not Published because it is against Our community standards.`
            })
            notificationForUser.save(function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result)
                }
            })
            return res.status(200).json({
                success: true,
                message: "Post is deleted successfully !!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            message: "Invalid post",
            error: err
        })
    })
})






/// Add New Post Comment using Post ID
routers.post('/comments/:id', check('Text', 'Comment Must Be Filled').not().isEmpty(), async(req, res) => {
    // here to push attributes data to database using POST HTTP REQUEST
    try {
        const post = await Post.findById(req.params.id)
        const user = await User.findById(req.user.userID)
        console.log(user)
        if (!post) {
            return res.status(400).send('Invalid Post')
        } else {
            console.log(user)
            let NewComments = {
                user: req.user.userID,
                text: req.body.text,
                username: user.userName,
                userImage: user.userImage,
                admin: user.isAdmin
            };
            // Push Comments Over Each other
            post.comments.push(NewComments)
            console.log("The Post UserID ", post.userID)
            console.log("The Currrent User ID ", req.user.userID)
            console.log("The User Loggged In ", req.user)
                //save to the database
            await post.save()
            if (post.userID._id == req.user.userID) {
                console.log("Post Comment Done and Notification will not send ")
                return res.status(200).send(post)
            } else {
                let notificationForUser = new Notification({
                    user: [post.userID],
                    postID: req.params.id,
                    notificationHeader: 'New comment on your post !',
                    notificationText: `Your post with title ${post.postTitle} has a new comment. Go check it out!`
                })
                notificationForUser.save(function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result)
                    }
                })
                return res.status(201).json(post.comments)
            }
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

routers.put('/flags/:id', async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user.id)
            /// we have to check that post is not flageed by same user many time
        if (post.flags.filter(flag => flag.user.toString() === req.user.userID).length > 0) {
            return res.status(400).json({
                Msg: 'Post Is Already Flagged'
            })
        }
        post.flags.unshift({
            user: req.user.userID
        })
        await post.save();
        if (post.flags.length === 7) {
            // notification warning
            let notificationForUser = new Notification({
                user: [post.userID],
                postID: req.params.id,
                notificationHeader: 'Warning!',
                notificationText: `Your post with title ${post.postTitle} has 7 flags. It wil be deleted when it reaches 10 flags`
            })
            notificationForUser.save(function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result)
                }
            })
            return res.json(post.flags)
        }
        if (post.flags.length === 10) {
            // delete this post
            post.remove()

            // notification deletion
            let notificationForUser = new Notification({
                user: [post.userID],
                postID: req.params.id,
                notificationHeader: 'Post deleted!',
                notificationText: `Your post with title ${post.postTitle} has been deleted because it reached the maximum number of flags (10 flags).`
            })
            notificationForUser.save(function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result)
                }
            })
            return res.status(200).json("Post deleted")
        } else {
            return res.json(post.flags)
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error')
    }
})

/// Add Post unflags using Post ID

routers.put('/unflags/:id', async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user.id)
        console.log(req.user.userID)
        console.log(post.flags.user)
            /// we have to check that post is not flageed by same user many time
        if (post.flags.filter(flag => flag.user.toString() === req.user.userID).length === 0) {
            return res.status(400).json({
                Msg: 'Post Has Not been flagged'
            })
        }
        // Get Remove Index
        const removeIndex = post.flags.map(flag => flag.user.toString()).indexOf(req.user.userID)
        post.flags.splice(removeIndex, 1)
        await post.save();
        res.json(post.flags)
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error')
    }
})






module.exports = routers
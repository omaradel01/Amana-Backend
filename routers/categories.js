const {
    Category
} = require('../models/category')
const express = require('express');
const routers = express.Router();
const bcrypt = require("bcryptjs");
const JWT = require('jsonwebtoken');

// GET all Categories 
routers.get(`/`, async (req, res) => {
    const catList = await Category.find();
    res.send(catList)
})

// GET Category by ID
routers.get(`/:id`, async (req, res) => {
    const category = await Category.findById(req.params.id)
    if (!post) {
        res.status(500).json({
            success: false,
            message: "Category is not found"
        })
    }
    console.log("The Selected Category is " + post);
    res.send(category)
});



// Add New Category
routers.post(`/`, (req, res) => {
    // here to push attributes data to database using POST HTTP REQUEST
    const categroy = new Category({
        name: req.body.name,
        icon: req.body.icon
    })
    //save database
    categroy.save().then((categoryCreated) => {
        res.status(201).json(categoryCreated);
    }).catch((err) => {
        res.status(500).json({
            error: err,
            success: false
        })
    })
});


//// Delete Category 
routers.delete(`/:id`, async (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found !"
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Category is deleted successfully !!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            message: "Invalid Category",
            error: err
        })
    })
})

// Edit Category
routers.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            icon: req.body.icon
        }, {
            new: true
        }
    )

    if (!category)
        return res.status(400).send('the user cannot be updated!')

    res.send(category);
})


module.exports = routers
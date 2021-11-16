const {
    Location
} = require('../models/location')

const express = require('express')
const routers = express.Router()


// Get all Locations
routers.get(`/`, async (req, res) => {
    const locations = await Location.find();
    if (!locations) {
        return res.status(404).send('Locations Not Found')
    }
    return res.status(200).send(locations)
})


// Post New Location

// Add New Posts     
routers.post(`/`, async (req, res) => {
    let loc = new Location({
        area: req.body.area
    })
    loc.save().then((location) => {
        res.status(200).json(location);
    }).catch((err) => {
        console.log(err)
        res.status(500).json({
            error: err,
            success: false
        })
    })
});


module.exports = routers
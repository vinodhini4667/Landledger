const express = require('express');
const Land = require('../models/Land');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', auth, async (req, res) => {
  try {
    const {
      title,
      area,
      address,
      city,
      state,
      country,
      pincode,
      coordinates,
      description
    } = req.body;

    if (!title || !area || !address || !city || !state || !country || !pincode) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const land = new Land({
      title,
      area: parseFloat(area),
      address,
      city,
      state,
      country,
      pincode,
      coordinates: coordinates || '',
      description: description || '',
      owner: req.user._id
    });

    await land.save();
    await land.populate('owner', 'name email');

    res.status(201).json({
      message: 'Land registered successfully',
      land: {
        id: land._id,
        title: land.title,
        area: land.area,
        address: land.address,
        city: land.city,
        state: land.state,
        country: land.country,
        pincode: land.pincode,
        coordinates: land.coordinates,
        description: land.description,
        status: land.status,
        owner: {
          id: land.owner._id,
          name: land.owner.name,
          email: land.owner.email
        },
        registeredAt: land.createdAt
      }
    });

  } catch (error) {
    console.error('Land registration error:', error);
    res.status(500).json({ error: 'Server error during land registration' });
  }
});

router.get('/my-lands', auth, async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    const formattedLands = lands.map(land => ({
      id: land._id,
      title: land.title,
      area: land.area,
      address: land.address,
      city: land.city,
      state: land.state,
      country: land.country,
      status: land.status,
      coordinates: land.coordinates,
      description: land.description,
      registeredAt: land.createdAt,
      owner: {
        id: land.owner._id,
        name: land.owner.name,
        email: land.owner.email
      }
    }));

    res.json({
      lands: formattedLands,
      count: formattedLands.length
    });

  } catch (error) {
    console.error('Get lands error:', error);
    res.status(500).json({ error: 'Server error fetching lands' });
  }
});

module.exports = router;
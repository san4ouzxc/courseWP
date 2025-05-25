const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await Trip.find({ user: userId }).sort({ date: -1 });
    res.json({ trips });
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { from, to, date, passengers } = req.body;
  const userId = req.user.id;

  if (!from || !to || !date || !passengers) {
    return res.status(400).json({ message: 'Всі поля є обов’язковими' });
  }

  try {
    const newTrip = new Trip({
      user: userId,
      from,
      to,
      date,
      passengers
    });

    await newTrip.save();
    res.status(201).json({ message: 'Поїздка додана', trip: newTrip });
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;

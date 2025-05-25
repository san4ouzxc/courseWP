const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); // <-- импорт





router.patch('/update-username', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: 'Новий логін обов’язковий' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'Цей логін уже зайнятий' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    res.json({ message: 'Логін оновлено', username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;

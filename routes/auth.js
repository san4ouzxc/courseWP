const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); 

const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadPath = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Настройки хранения файла
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
  }
});

const upload = multer({ storage });

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body; 

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Username, Email и пароль обязательны' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Пользователь с таким email уже существует' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


// Вход
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
if (!identifier || !password) {
  return res.status(400).json({ message: 'Логін/Email та пароль обов\'язкові' });
}

const user = await User.findOne({
  $or: [
    { email: identifier },
    { username: identifier }
  ]
});

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Неверный email или пароль' });

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRES_IN || '1d'
    });

    res.json({
      token,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl || '/uploads/default-avatar.png'
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не завантажено' });
  }

  const avatarUrl = `public/uploads/${req.file.filename}`;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true });
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    res.json({ message: 'Аватар оновлено', avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = router;

require('dotenv').config({ path: './test.env' });

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const authRoutes = require('../routes/auth');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {


  it('помилка при відсутності email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'user',
      password: 'password123'
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Ім’я користувача, email та пароль обов’язкові');
  });

  it('помилка при повторній реєстрації', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    await User.create({ username: 'user', email: 'dupe@example.com', passwordHash });

    const res = await request(app).post('/api/auth/register').send({
      username: 'user2',
      email: 'dupe@example.com',
      password: '123456'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Користувач з таким email вже існує');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create({ username: 'loginuser', email: 'login@example.com', passwordHash });
  });



  it('успішний вхід за username', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: 'loginuser',
      password: 'password123'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('login@example.com');
    expect(res.body.username).toBe('loginuser');
  });

  it('помилка при неправильному паролі', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: 'loginuser',
      password: 'wrongpassword'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Невірний email або пароль');
  });

  it('помилка при відсутності обов’язкових полів', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: '',
      password: ''
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Логін/Email та пароль обов’язкові");
  });
});

// Для теста загрузки аватара нужен JWT токен и файл
describe('POST /api/auth/avatar', () => {
  let token;
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({ username: 'avataruser', email: 'avatar@example.com', passwordHash });

    token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN || '1d' }
    );
  });

  it('успішне оновлення аватара', async () => {
    const res = await request(app)
      .post('/api/auth/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', path.join(__dirname, 'test-files', 'avatar.png')); // нужно добавить файл avatar.png в tests/test-files

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Аватар оновлено');
    expect(res.body.avatarUrl).toContain('public/uploads/');
  });

  it('помилка при відсутності файлу', async () => {
    const res = await request(app)
      .post('/api/auth/avatar')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Файл не завантажено');
  });

});

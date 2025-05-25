require('dotenv').config({ path: './test.env' });
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const tripsRoutes = require('../routes/trips');
const Trip = require('../models/Trip');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/trips', tripsRoutes);

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Создадим пользователя для тестов
  const user = await User.create({ username: 'testuser', email: 'test@example.com', passwordHash: 'hashed' });
  userId = user._id;

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
});

afterEach(async () => {
  await Trip.deleteMany();
});

afterAll(async () => {
  await User.deleteMany();
  await mongoose.connection.close();
});

describe('GET /api/trips', () => {
  it('повинен повертати список поїздок користувача', async () => {
    await Trip.create({ user: userId, from: 'Kyiv', to: 'Lviv', date: new Date(), passengers: 2 });

    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.trips)).toBe(true);
    expect(res.body.trips.length).toBeGreaterThan(0);
  });

  it('повинен повертати 401 без токена', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/trips', () => {
  it('успішне створення поїздки', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ from: 'Kyiv', to: 'Odessa', date: '2025-06-01', passengers: 3 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Поїздка додана');
    expect(res.body.trip).toHaveProperty('from', 'Kyiv');
  });

  it('повертає 400 якщо відсутні обов’язкові поля', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ from: 'Kyiv' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Всі поля є обов’язковими');
  });

  it('повертає 401 без токена', async () => {
    const res = await request(app)
      .post('/api/trips')
      .send({ from: 'Kyiv', to: 'Odessa', date: '2025-06-01', passengers: 3 });

    expect(res.statusCode).toBe(401);
  });
});

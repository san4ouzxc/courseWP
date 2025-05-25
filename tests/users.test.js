require('dotenv').config({ path: './test.env' });
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const usersRoutes = require('../routes/users');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/users', usersRoutes);

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.create({ username: 'oldname', email: 'user@example.com', passwordHash: 'hashed' });
  userId = user._id;
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await User.deleteMany();
  await mongoose.connection.close();
});

describe('PATCH /api/users/update-username', () => {
  it('успішне оновлення логіну', async () => {
    const res = await request(app)
      .patch('/api/users/update-username')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'newname' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Логін оновлено');
    expect(res.body.username).toBe('newname');
  });

  it('помилка, якщо відсутній username', async () => {
    const res = await request(app)
      .patch('/api/users/update-username')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Новий логін обов’язковий');
  });



  it('помилка без токена', async () => {
    const res = await request(app)
      .patch('/api/users/update-username')
      .send({ username: 'newname' });

    expect(res.statusCode).toBe(401);
  });
});

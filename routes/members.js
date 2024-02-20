const express = require('express');
const router = express.Router();
const { Member } = require('../models');

router.get('/', async (req, res) => {
  let members = await Member.findAll();
  return res.json(members);
});

router.get('/find/:phone', async (req, res) => {
  let member = await Member.findOne({
    where: {
      phone: req.params.phone,
    }
  });

  if(!member){
    return res.json({
      status: 404,
      message: 'Anggota tidak ditemukan!'
    });
  }

  return res.json({
    status: 200,
    message: 'Anggota ditemukan!',
    data: member
  });
});

router.get('/presence/:phone', async (req, res) => {
  let member = await Member.findOne({
    where: {
      phone: req.params.phone,
    }
  });

  if(!member){
    return res.json({
      status: 404,
      message: 'Anggota tidak ditemukan!'
    });
  }

  await Member.update({
    status: true,
  }, {
    where: {
      id: member.id
    }
  })

  return res.json({
    status: 200,
    message: 'Anggota ditemukan!',
    data: member
  });
});

router.get('/cancel/:phone', async (req, res) => {
  let member = await Member.findOne({
    where: {
      phone: req.params.phone,
    }
  });

  if(!member){
    return res.json({
      status: 404,
      message: 'Anggota tidak ditemukan!'
    });
  }

  await Member.update({
    status: false,
  }, {
    where: {
      id: member.id
    }
  })

  return res.json({
    status: 200,
    message: 'Anggota ditemukan!',
    data: member
  });
});

router.post('/', async (req, res) => {
  const { name, phone, notes } = req.body;
  let data = {
    name: name,
    phone: phone,
    notes: notes,
  }
  await Member.create(data);
  return res.json({
    message: 'Berhasil menambahkan anggota!'
  });
});

module.exports = router;

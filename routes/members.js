const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const { Member } = require('../models');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (file.mimetype === 'text/plain') {
      callback(null, true);
    } else {
      callback(new Error('Hanya file .txt yang diizinkan!', false));
    }
  }
});

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

  if (!member) {
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

  if (!member) {
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

  if (!member) {
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
    message: 'Anggota ditemukan!',
    data: member
  });
});

router.get('/report', async (req, res) => {
  const responses = await Member.findAll();
  const members = responses.map(response => response.dataValues);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  worksheet.addRow(Object.keys(members[0]));
  members.forEach(member => {
    worksheet.addRow(Object.values(member));
  });

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

  res.send(buffer);
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

router.post('/import', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.json({
      status: 500,
      message: 'File .txt diperlukan!'
    });
  }

  const fileText = file.buffer.toString('utf-8');
  const dataArray = fileText.split('\n');
  let members = [];
  dataArray.forEach(data => {
    let memberDummy = data.split(',');
    let notes = memberDummy[2].replace(/-/g, '\n');
    let member = {
      name: memberDummy[0],
      phone: memberDummy[1],
      notes: notes
    };
    members.push(member);
  });

  await Member.bulkCreate(members);
  return res.json({
    message: 'Berhasil menambahkan banyak anggota!'
  });
});

module.exports = router;

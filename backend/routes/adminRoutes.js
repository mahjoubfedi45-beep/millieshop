const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();
const SECRET = "SECRET123";

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: "Admin non trouvé" });

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) return res.status(401).json({ message: "Mot de passe incorrect" });

  const token = jwt.sign({ id: admin._id }, SECRET);
  res.json({ token });
});

module.exports = router;

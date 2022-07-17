const express = require('express');
const router = express.Router();
const controller = require('../controllers/game');

router.get('/', controller.game);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/board');
const multer = require('multer');

router.get('/new', controller.newArticles);
router.get('/best', controller.best);
router.get('/best/:term', controller.bestTerm);
router.get('/search', controller.search);

router.get('/:page', controller.page);
router.get('/:boardSlug', controller.list);
router.get('/:boardSlug/new', controller.new);
router.post('/:boardSlug/new', multer().fields([{ name: 'files' }]), controller.new);

router.get('/:boardSlug/:articleId', controller.read);
router.get('/:boardSlug/:articleId/edit', controller.edit);
router.post('/:boardSlug/:articleId/edit', controller.edit);
router.post('/:boardSlug/:articleId/update', multer().fields([{ name: 'files' }]), controller.update);

router.get('/:boardSlug/pullUp', controller.pullUp);

module.exports = router;
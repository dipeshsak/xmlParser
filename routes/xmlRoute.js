const express = require('express');
const {xmlValidation} = require('../helpers/validations');
const {xmlParseController} = require('../controllers/xmlController')

const router = express.Router();


router.post('/xml-parse',xmlValidation,xmlParseController);


module.exports = router;
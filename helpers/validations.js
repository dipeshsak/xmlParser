const {check} = require('express-validator');

exports.xmlValidation =[ 
    check('xmlVal','Need to pass XML').not().isEmpty()
]
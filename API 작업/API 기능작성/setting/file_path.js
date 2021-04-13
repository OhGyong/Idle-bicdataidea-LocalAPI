const multer = require('multer');
const upload = multer({
    dest : 'public/image'
 });

 module.exports =upload;
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, 'public/image');
    },
    filename: function(req, file, callback){
        callback(null, file.originalname);
    }
 });

let upload = multer({
    storage: storage
})

 module.exports =upload;
const multer = require('multer');
const upload = multer({
    dest : 'public'
 });

 module.exports =upload

 /*
const multer = require('multer');

const upload = multer({
   dest : 'public'
});

router.post('/profile', upload.single('image'),  (req, res)=>{
    const image = req.file.path;
    console.log(req.file);

})
*/
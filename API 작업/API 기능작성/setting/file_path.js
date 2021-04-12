const multer = require('multer');
const upload = multer({
    dest : 'public/image'
 });

 module.exports =upload

// 게시물 올릴때 사용
// const multer = require('multer');
// var upload = require('../setting/file_path.js');

// router.post('/profile', upload.single('image'), (req, res)=>{
//     const image = req.file.path;    
//     console.log(req.file);
// })
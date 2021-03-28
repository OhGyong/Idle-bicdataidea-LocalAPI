var nodemailer = require('nodemailer');

// 보내는 사람 설정
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASS
    }
});

module.exports=transporter;
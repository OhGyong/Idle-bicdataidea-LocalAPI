/**
 * 설정 세팅
 */
var express = require('express');
var router = express.Router();

// db 연결
//var getConection = require('../setting/db.js');
/*
getConnection((conn)=>{
    var check_email="oky7143@naver.com"
    conn.query('SELECT member_email FROM member WHERE member_email=?;', check_email, function(err, rows){
        console.log(rows);
    });
    conn.release();
})
*/
// 메일 설정
var trans_mail = require('../setting/mail.js')

// 세션 연결
var session = require('../setting/session.js')
router.use(session)

// 현재 시간
var now_time = new Date();

// 다음 날 (현재 시간 + 24시간)
var tomorrow_time = new Date(now_time.setDate(now_time.getDate() + 1));

/** 
 *  관리자 등록 필요없음
*/

/**
 * 관리자 이메일 중복 확인, http://localhost:3000/idle/admins/has-same-id
 * 1. 입력된 이메일에서 value 값(이메일)만 가져옴
 * 2. member 테이블에 입력받은 이메일 값이 있는지 확인해서 있으면 생성불가, 없으면 생성가능 응답처리
 * 
*/
router.post('/idle/has-same-id', (req, res) => {

    
    connection.connect();
    // 포스트맨에서 얻어온 이메일 값
    var check_email = req.body.admin_email;
    console.log("입력 이메일 확인 : " + check_email);

    // db에서 member_email 값들 가져와서 check_email 과 같은지 비교    
    var same_email_sql = 'SELECT admin_email FROM admin WHERE admin_email=?;';
    connection.query(same_email_sql, check_email, function (err, rows) {//두번째 인자에 배열로 된 값을 넣어줄 수 있다.
        try {
            if (rows[0].admin_email == check_email) {
                var success_res = {
                    "admin_has_same_email": "동일 이메일 존재"
                }
                res.send(success_res);
            }
        } catch {
            var error_res = {
                "admin_has_same_email": "동일 아이디 없음"
            }
            res.send(error_res);
        }
    });
});

module.exports = router;
/**
 * 설정 세팅
 */
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

// db 연결
var getConnection = require('../setting/db.js');

// 응답 설정
var { success_request, error_request } = require('../setting/request.js');

// 메일 설정
var trans_mail = require('../setting/mail.js')

// 시간 설정
var { now_time, tomorrow_time } = require('../setting/time.js');

// 게시판 설정
var { idea_list, inter_anno_list } = require('../setting/board.js');

// jwt 컨트롤러
var jwt_middleware = require('../setting/jwt_middleware');
const { access } = require('fs');



/*                    본문시작                    */


/**
 * 회원가입 전 이용약관 동의 API, http://localhost:3000/members/idle/signup/agree/check
 * 1. [선택]항목 클릭하면 전역변수 값 agree_check 값 변경 → 회원가입 API에서 사용
 * 2. json 응답처리
*/
router.get('/idle/signup/agree/check', (req, res) => {

    let check_num = req.body.signup_agree;
    console.log(check_num);

    //세션 저장
    req.session.signup_check = check_num;
    req.session.save(function (err) {
        if (err) {
            error_request.data = null;
            error_request.message = "세션 에러"
            res.send(error_request);
        }
        success_request.data = check_num;
        success_request.message = "이욕약관 선택 여부 확인";
        return res.send(success_request); //save 함수 안에서 쓰면 안됨  
    })
});


/**
 * 회원 이메일 중복 확인, http://localhost:3000/members/idle/has-same-email
 * session.js 확인
 * 1. 입력된 json 값 value 값만 가져오기
 * 2. member 테이블에 입력받은 이메일 값이 있는지 확인해서 있으면 생성불가, 없으면 생성가능 응답처리
*/
router.post('/idle/has-same-email', (req, res) => {

    // 사용자가 입력한 이메일 값
    let check_email = req.body.same_email;
    console.log("사용자가 입력한 이메일 : " + check_email)

    // db 연결
    getConnection(async (conn) => {
        try {
            await new Promise((res, rej) => {
                // db에서 member_email 값들 가져와서 check_email 과 같은지 비교    
                let same_email_sql = 'SELECT member_email FROM member WHERE member_email=?;';
                conn.query(same_email_sql, check_email, function (err, rows) {
                    if (err) {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "member 테이블 조회 실패";
                        return rej(error_request);
                    } else if (rows == '') {
                        success_request.data = { "use_email": check_email }
                        success_request.message = "아이디 생성가능"
                        return rej(success_request)
                    }
                    res();
                });
            });
            conn.release();
            error_request.data = null;
            error_request.message = "아이디 생성 불가능"
            res.send(error_request);
        } catch (req) {
            res.send(req);
        }
    })
});


/**
 * 회원 이메일 인증키 보내기, http://localhost:3000/members/idle/sign-up/send-email
 * 1. 난수 6자리 생성
 * 2. json 입력받은 값 value 값만 뽑아내기
 * 3. 현재시간, 24시간 뒤 계산해서 유효기간 설정
 * 4. 메일 보내기 
 * 5. 메일 보내면 (난수 6자리, 유효기간, 이메일) email_auth 테이블에 저장
 * 6. 세션에 입력한 이메일 저장
*/
router.post('/idle/sign-up/send-email', (req, res) => {

    getConnection(async (conn) => {
        try {
            // 난수 6자리 생성
            let Raondom_Key = function (min, max) {
                let ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
                return ranNum;
            }
            const send_key = Raondom_Key(111111, 999999);

            // 포스트맨에서 입력받은 키 값(이메일) 지정
            let get_email = req.body.send_email

            // 인증메일 보내기
            trans_mail.sendMail({
                from: process.env.GMAIL_EMAIL,
                to: process.env.NAVER_EMAIL,
                subject: '이메일 인증키 보내기',
                text: "인증키 입니다 : " + send_key // 난수 입력
            }, async function (err) {
                if (err) {
                    error_request.data = err;
                    error_request.message = "인증 메일 보내기 실패";
                    res.send(error_request)
                }

                // 인증키, 유효기간, 수신메일 db에 저장
                await new Promise((res, rej) => {
                    let send_email_sql = 'INSERT INTO email_auth (email_key, email_date, rec_email) VALUES(?,?,?)';
                    let send_email_params = [send_key, tomorrow_time(), get_email]; //파라미터를 값들로 줌(배열로 생성)
                    conn.query(send_email_sql, send_email_params, function (err, rows) {
                        if (err || rows == '') {
                            conn.release();
                            error_request.data = err;
                            error_request.message = "email_auth 테이블 저장 실패";
                            rej(error_request);
                        }
                        res(rows);
                    })
                })

                conn.release();

                await new Promise((res, rej) => {
                    //세션 저장
                    req.session.signup_email = get_email;
                    req.session.save(function (err) {
                        if (err) {
                            error_request.data = err;
                            error_request.message = "세션 저장실패";
                            rej(error_request);
                        }
                        // 응답처리
                        let success_res = {
                            send_email: get_email,
                            send_key: send_key
                        }
                        success_request.data = success_res;
                        res();
                    })
                })
                success_request.message = "이메일 전송 및 세션 저장 성공";
                return res.send(success_request); // db 입력하고 보내는것까지 성공. 이메일과 인증키 전송(서버에서 사용)

            })
        } catch (err) {
            res.send(err)
        }
    })
});


/**
 * 회원 이메일 인증키 입력, http://localhost:3000/members/idle/sign-up/check-email-num
 * 1. 서버에서 이메일 값을 받아서 email_auth 테이블에서 이메일, 인증값, 폐기 값이 0인 데이터를 찾음
 * 2. 1.조건을 만족하지 못한 경우 처리
 * 3. 1.조건을 만족하면 현재날짜와 유효기간을 비교 ( 현재날짜가 더 크면 폐기처리)
 * 4. 3.에서 종료가 안되면 인증이 되었다는 표시 → 인증 값과 폐기 값을 1로 업데이트
*/
router.post('/idle/sign-up/check-email-num', (req, res) => {

    // 회원 이메일 인증키 보내기에서 얻은 이메일과 키값
    let check_email = req.session.signup_email;
    let check_key = req.body.check_key;

    getConnection(async (conn) => {
        try {

            let check_date; // 인증키 유효기간

            // email_auth 테이블에서 이메일과 키가 일치하고 인증값과 폐기 값이 0인 값이 있을경우 현재시간과 유효기간을 비교
            let check_email_sql = 'SELECT email_date FROM email_auth WHERE rec_email=? AND email_auth_flag=? AND email_dispose=? AND email_key=?;';
            let check_email_param = [check_email, 0, 0, check_key];
            await new Promise((res, rej) => {
                conn.query(check_email_sql, check_email_param, function (err, rows) {
                    console.log(rows)
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "잘못된 키 값을 입력하였습니다.";
                        return rej(error_request);
                    }
                    check_date = rows[0].email_date;
                    res();
                });
            })

            //현재날짜와 비교해서 현재날짜가 크면 폐기처리(1로 변경)하고 종료
            if (check_date < now_time()) {
                // 폐기 값 1로 변경
                let set_dispose_sql = 'UPDATE email_auth SET email_dispose=? WHERE rec_email=? AND email_key=?;';
                let set_dispose_param = [1, check_email, check_key];

                await new Promise((res, rej) => {
                    conn.query(set_dispose_sql, set_dispose_param, function (err, rows) {
                        if (err || rows == '') {
                            conn.release();
                            error_request.data = err;
                            error_request.message = "email_auth 테이블 오류";
                            return rej(error_request);
                        } else {
                            conn.release()
                            error_request.data = null;
                            error_request.message = "이미 폐기된 인증키 입니다.";
                            return rej(error_request);
                        }
                    });
                })
            }

            // 정상으로 진행되면 인증완료와 폐기처리를 해주어야 한다. (db에 인증여부와 폐기 값을 1로 변경)
            let set_sql = 'UPDATE email_auth SET email_auth_flag=?, email_dispose=? WHERE rec_email=? AND email_key=?;';
            let set_parm = [1, 1, check_email, check_key];
            await new Promise((res, rej) => {
                conn.query(set_sql, set_parm, function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "페기처리 실패";
                        return rej(error_request)
                    }
                    res();
                })
            })
            conn.release();
            success_request.data = { "member_email": check_email }
            success_request.message = "인증키 확인 성공";
            res.send(success_request);
        } catch (err) {
            res.send(err)
        }
    })
});


/**
 * 회원가입 API , http://localhost:3000/members/idle/signup/fillout
 * try catch 로 primary키 오류 발생 못잡음 
 * 1. 배열에 입력받은 값과 member 테이블의 NOTNULL인 값들 처리해서 저장
 * 2. 패스워드 해시키 변경 (crypto 사용)
 * 3. db에 입력받은 값 member 테이블에 삽입
 * 4. 삽입 이후의 시간 계산해서 member_log 테이블에 삽입
*/
router.post('/idle/signup/fillout', (req, res, err) => {

    // POSTMAN에서 넘겨 받은 json을 key|value 나누는 작업
    let member_key = new Array();
    let member_value = new Array();

    //Mysql workbench에서 member_ban과 chosen_agree에 default 값 0으로로 설정해야함
    for (k in req.body) {
        member_key.push(k);
        member_value.push(req.body[k]);
    }

    //회원가입 전 [선택]동의 여부
    member_key[8] = 'chosen_agree';
    member_value[8] = req.session.signup_check;

    //암호 해시키 변경
    member_value[6] = crypto.createHash('sha512').update(member_value[6]).digest('base64');

    //사용한 세션 삭제
    req.session.destroy(function () {
        req.session;
    })

    getConnection(async (conn) => {
        try {
            // member 테이블에 해당 값 넣어주기
            await new Promise((res, rej) => {
                let member_fillout_sql = 'INSERT INTO member (member_email, member_name, member_gender, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree) VALUES(?,?,?,?,?,?,?,?,?);';
                conn.query(member_fillout_sql, member_value, function (err, rows) {
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.data = err;
                        error_request.message = "member 테이블 오류"
                        return rej(error_request);
                    }
                    res();
                })
            })

            // member_log 테이블 시간 삽입
            await new Promise((res, rej) => {
                let singup_date_sql = 'INSERT INTO member_log (member_email,member_log_join) VALUES(?,?)';
                let parm_time = [member_value[0], now_time()];
                conn.query(singup_date_sql, parm_time, function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "member_log 테이블 오류"
                        return rej(error_request);
                    }
                    res();
                });
            });

            conn.release();
            success_request.data = req.body;
            success_request.message = "회원가입 성공"
            return res.send(success_request);
        } catch (err) {
            res.send(err);
        }
    })
});


/**
 * 회원 비밀번호 찾기(메일전송), http://localhost:3000/members/idel/find-password
 * 1. 사용자가 입력한 이메일이 db에 저장되어 있는지 확인
 * 2. pw_find 테이블에서 비밀번호 키 값 생성 (random 7자리 만들어서 해시화)해서 메일 전송
 * 3. 전송하면서 유효기간 설정
 */
router.post('/idle/find-password', (req, res) => {

    // 포스트맨에서 받은 값
    var check_email = req.body.member_email;

    console.log("회원비밀번호 찾기 : " + check_email);

    getConnection(async (conn) => {
        try {

            await new Promise((res, rej) => {
                // 1. 사용자가 입력한 이메일이 db에 있는지 확인
                var find_password_sql = 'SELECT member_email FROM member WHERE member_email = ?;';
                conn.query(find_password_sql, check_email, function (err, rows) {
                    console.log(rows)
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "db에 해당 이메일 없음";
                        return rej(error_request);
                    }
                    res();
                })
            })

            // 랜덤키 생성
            var Raondom_Key = function (min, max) {
                var ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
                return ranNum;
            }

            // 해시키처리
            var hash_key = crypto.createHash('sha512').update(String(Raondom_Key(111, 999))).digest('base64');
            var hash_key = hash_key.substr(0, 7); // 7자리로 짜르기
            var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi; //특수문자 제거
            hash_key = hash_key.replace(regExp, "");

            // 받는 사람 설정, 인증메일 보내기
            // json으로 바꿔보기    
            await new Promise((res, rej) => {
                trans_mail.sendMail({
                    from: process.env.GMAIL_EMAIL,
                    to: process.env.NAVER_EMAIL,
                    subject: '회원 비밀번호 찾기',
                    text: "http://localhost:3000/idel/reset-password?hask_key=" + hash_key // 난수 입력   
                }, function (err, info) {
                    if (err) {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "메일전송 실패"
                        return rej(error_request);
                    }
                    // 해시키, 유효기간 메일 pw_find 테이블 삽입
                    var find_password_sql = 'INSERT INTO pw_find (pw_key, pw_date, member_email) VALUES(?,?,?)';
                    var find_password_params = [hash_key, tomorrow_time(), check_email]; //파라미터를 값들로 줌(배열로 생성)
                    conn.query(find_password_sql, find_password_params, function (err, rows) {
                        if (err || rows == '') {
                            console.log(err)
                            conn.release();
                            error_request.data = err;
                            error_request.message = "pw_find 테이블 에러"
                            return rej(error_request);
                        }
                        res();
                    });
                });
            })
            conn.release();
            success_request.data = {
                send_email: check_email,
                send_key: hash_key
            }
            success_request.message = "인증메일 전송 성공";
            res.send(success_request); // db 입력하고 보내는것까지 성공   
        } catch (err) {
            res.send(err)
        }

    })
})


/**
 * 회원 비밀번호 재설정, http://localhost:3000/members/idle/reset-password=?해시키
 * 1. url에 있는 query 값으로 이메일과 해시값을 가져옴
 * 2. pw_find 테이블에서 해당이메일 해시값이 일치하고 재설정 값, 폐기값이 0인 경우를 찾는다.
 * 3. 현재날짜와 비교해서 폐기여부를 정한다.
 * 4. 사용자가 입력한 비밀번호를 해시화하여 member 테이블에 업로드하고 재설정 값과 폐기값을 1로 변경한다.
 */
router.put('/idle/reset-password', (req, res) => {

    // 회원 비밀번호 찾기에서 응답값으로 얻은 이메일과 해시값
    let member_email = req.query.member_email;
    let hash_key = req.query.hash_key;
    let pw_date;

    getConnection(async (conn) => {
        try {

            await new Promise((res, rej) => {
                // 해당 해시키를 가진 유저가 있는지 확인
                var reset_pass_sql = 'SELECT * FROM pw_find WHERE pw_key=? AND pw_edit=? AND pw_dispose=? AND member_email=?;';
                var reset_pass_params = [hash_key, 0, 0, member_email];
                conn.query(reset_pass_sql, reset_pass_params, function (err, rows) {

                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "인증키 유효기간이 지났거나 해당 회원이 없습니다."
                        return rej(error_request);
                    }
                    pw_date = rows[0].pw_date;
                    res();
                })
            })

            //현재날짜와 비교해서 현재날짜가 크면 폐기처리(1로 변경)
            await new Promise((res, rej) => {
                if (pw_date < now_time()) {
                    // 폐기 값 1로 변경
                    var set_dispose_sql = 'UPDATE pw_find SET pw_dispose=? WHERE member_email=? AND pw_key=?;';
                    var set_dispose_param = [1, member_email, hash_key];
                    conn.query(set_dispose_sql, set_dispose_param, function (err, rows) {
                        if (err || rows == '') {
                            conn.release();
                            error_request.data = err;
                            error_request.message = "폐기 값 1 업데이트 에러";
                            return rej(error_res)
                        }
                        conn.release();
                        error_request.data = null;
                        error_request.message = "폐기되었습니다.";
                        rej(error_request)
                    });
                    res();
                } else {
                    res();
                }
            })
            console.log(4)
            // 비밀번호 변경 (해시화)
            var new_password = req.body.new_password;
            new_password = crypto.createHash('sha512').update(String(new_password)).digest('base64');

            await new Promise((res, rej) => {
                // 해시화 된 새 비밀번호 db에 저장
                reset_pass_sql = 'UPDATE member SET member_pw=? WHERE member_email=?;';
                reset_pass_params = [new_password, member_email];
                conn.query(reset_pass_sql, reset_pass_params, function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "비밀번호 업데이트 실패";
                        return rej(error_request)
                    }
                    res(rows);
                })
            })
            console.log(5)
            await new Promise((res, rej) => {
                // 재설정 값과 폐기값 1로 변경
                reset_pass_sql = 'UPDATE pw_find SET pw_edit=?, pw_dispose=? WHERE member_email=? AND pw_key=?;';
                reset_pass_params = [1, 1, member_email, hash_key];
                conn.query(reset_pass_sql, reset_pass_params, function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "재설정 값, 폐기 값 오류";
                        rej(error_request);
                    }
                    res(rows);
                })
            })
            conn.release;
            success_request.data = {
                "member_email": member_email,
                "hash_key": hash_key
            }
            success_request.message = "비밀번호 재설정 성공";
            res.send(success_request);
        } catch (err) {
            res.send(err);
        }
    })
})


/**
 * 회원 로그인, http://localhost:3000/members/idle/signin
 * 1. 회원이 입력한 이메일과 비밀번호를 array에 저장
 * 2. 입력한 비밀번호는 해시화해서 db에서 조회
 * 3. 로그시간 업로드
 * 4. 세션 저장
 */
router.post('/idle/signin', (req, res) => {

    let member_email = req.body.member_email; // 입력한 이메일
    let member_pw = req.body.member_pw; // 입력한 비밀번호

    //비밀번호 해시화
    member_pw = crypto.createHash('sha512').update(member_pw).digest('base64');

    // db 연결
    getConnection(async (conn) => {
        try {

            await new Promise((res, rej) => {
                // db에 일치하는 이메일과 비밀번호가 있는지 확인
                let login_sql = 'SELECT member_email FROM member WHERE member_email=? AND member_pw=? AND member_secede=?;';
                let login_params = [member_email, member_pw, 0];
                conn.query(login_sql, login_params, (err, row) => {
                    if (err || row == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "이메일 혹은 비밀번호가 틀렸습니다.";
                        rej(error_request)
                    }
                    res(row);
                })
            })

            // 로그인한 시간 확인, member_log 테이블 업데이트)
            await new Promise((res, rej) => {
                memberlog_sql = 'UPDATE member_log SET member_login_lately=? WHERE member_email=?;';
                memberlog_params = [now_time(), member_email]
                conn.query(memberlog_sql, memberlog_params, (err, row) => {
                    if (err || row == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "member_log 테이블 에러";
                        rej(error_request);
                    }
                    res(row);
                });
            })

            // 로그인 시간 데이터 축적, member_login_log 테이블 추가
            await new Promise((res, rej) => {
                var memberloginlog_sql = 'INSERT INTO member_login_log (member_login, member_email) VALUES(?,?);';
                conn.query(memberloginlog_sql, memberlog_params, (err, row) => {
                    if (err || row == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "member_login_log 테이블 에러";
                        rej(error_request);
                    }
                    res(row);
                });
            })

            // 회원 이름 가져오기
            let memberName;
            await new Promise((res, rej) => {
                var memberNameSql = 'Select member_name From member WHERE member_email=?'
                conn.query(memberNameSql, member_email, (err, row) => {
                    if (err || row == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "memberName 가져오기 에러";
                        rej(error_request);
                    }
                    memberName = row[0].member_name
                    res(row);
                })
            })

            // 세션 저장
            await new Promise((res, rej) => {
                req.session.member_email = member_email;
                req.session.save(function (err) {
                    if (err) {
                        error_request.data = err;
                        error_request.message = "세션 저장 실패";
                        rej(error_request);
                    }
                    res();
                })
            })

            // Access Token, Refresh Token 생성
            let accessToken, refreshToken;
            

            await new Promise((res, rej) => {
                // Access Token 인증시간 15분
                jwt.sign(
                    {
                        token_email: member_email,
                        token_name: memberName
                    }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '15m' }, (err, token) => {
                        if (err) {
                            error_request.data = err;
                            error_request.message = "AccessToken 생성 실패";
                            rej(error_request);
                        }
                        accessToken=token;
                        res()
                    }
                )
            })

            await new Promise((res, rej) => {
                // Refresh Token 인증기간 2주
                jwt.sign(
                    {
                        token_email: member_email,
                        token_name: memberName
                    }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '14d' }, (err, token) => {
                        if (err) {
                            error_request.data = err;
                            error_request.message = "RefreshToken 생성 실패";
                            rej(error_request);
                        }
                        refreshToken = token
                        res()
                    }
                )
            })

            // refresh_token 테이블 삽입
            await new Promise((res, rej) => {
                var refreshTokenSQL = 'INSERT INTO refresh_token (token_owner, token) VALUES(?,?);';
                var refreshTokenPARAMS = [memberName, refreshToken]
                conn.query(refreshTokenSQL, refreshTokenPARAMS, (err, row) => {
                    if (err || row == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "refresh_token 삽입 오류";
                        rej(error_request);
                    }
                    res(row);
                });
            })

            conn.release();

            // json 성공 응답
            success_request.data = {
                member_email: member_email
            }
            success_request.accessToken = accessToken;
            success_request.refreshToken = refreshToken;

            success_request.message = "로그인 성공";
            res.send(success_request);

        } catch (err) {
            res.send(err);
        }
    })
})


/**
 * 회원 로그아웃, http://localhost:3000/members/idle/logout
 * 1. destroy로 삭제
 */
router.post('/idle/logout', (req, res) => {

    getConnection(async conn => {
        try {
            let member_email = req.session.member_email;
            let refresh_token = req.body.refresh_token

            // refresh_token 테이블에서 invalid 값 1로 변경
            await new Promise((res, rej) => {
                let refreshTokenSQL = 'UPDATE refresh_token SET token_invalid=? WHERE token=?';
                conn.query(refreshTokenSQL, [1, refresh_token], function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "refresh_token 테이블 오류";
                        rej(error_request);
                    }
                    res()
                })
            })

            req.session.destroy(function () {
                req.session;
                success_request.data = { "member_email": member_email }
                success_request.message = "로그아웃에 성공하였습니다.";
                res.send(success_request)
                //res.redirect('/home'); // 홈으로 이동하게 하자
            });

        } catch {
            error_request.data = null;
            error_request.message = "로그아웃에 실패하였습니다.";
            res.send(error_res)
        }
    })
})


/**
 * 회원정보 불러오기(수정페이지에 사용), http://localhost:3000/members/idle/mypage/update
 * 1. 세션 테이블에서 현재 로그인한 이메일을 찾는다.
 * 2. member 테이블에서 위에서 찾은 이메일과 일치하는 정보들을 가져온다.
 * 3. json 응답처리
 */
router.get('/idle/mypage/update', jwt_middleware, (req, res) => {
    getConnection(conn => {
        try {

            // 수정을 위한 회원 정보 가져오기
            let update_sql = 'SELECT member_email, member_name, member_pw, member_gender, member_birth, member_phone, member_company, member_state FROM member WHERE member_email=?';
            conn.query(update_sql, req.memberEmail, function (err, rows) {
                if (err || rows == '') {
                    conn.release();
                    error_request.data = err;
                    error_request.message = "회원 정보 가져오기 실패";
                    res.send(error_request);
                }
                conn.release();

                success_request.message = "회원 정보 가져오기 성공";
                success_request.data = rows;
                success_request.accessToken = req.accessToken;
                success_request.refreshToken = req.refreshToken;
                res.send(success_request);

            })
        } catch (err) {
            res.send(err);
        }
    })
})


/**
 * 회원정보 수정, http://localhost:3000/members/idle/mypage/update/modify
 * 1. 세션이메일 사용
 * 2. array에 입력받은 값 저장하고 쿼리에 쓸 sql과 param 작성, db 업데이트
 * 3. json 응답
 */
router.put('/idle/mypage/update/modify', jwt_middleware, (req, res) => {

    getConnection(conn => {
        try {

            // 입력받은 값
            let memberModify = new Array();
            for (idx in req.body) {
                memberModify.push(req.body[idx]);
            }
            memberModify.push(req.memberEmail); // 쿼리 조건을 위해서 푸쉬

            //암호 해시키 변경
            memberModify[1] = crypto.createHash('sha512').update(memberModify[1]).digest('base64');

            let modifySql = 'UPDATE member SET member_name=?, member_pw=?, member_gender=?, member_birth=?, member_phone=?, member_company=?, member_state=? WHERE member_email=?'
            conn.query(modifySql, memberModify, function (err, rows) {
                if (err || rows == '') {
                    console.log(err)
                    conn.release();
                    error_request.data = err;
                    error_request.message = "수정 실패하였습니다."
                    return res.send(error_request);
                }
                conn.release;

                success_request.message = "정보가 수정되었습니다.";
                success_request.data = {
                    "member_email": memberModify[7],
                    "member_name": memberModify[0],
                    "member_pw": memberModify[1],
                    "member_gender": memberModify[2],
                    "member_birth": memberModify[3],
                    "member_phone": memberModify[4],
                    "member_company": memberModify[5],
                    "member_state": memberModify[6],
                }
                success_request.accessToken = req.accessToken;
                success_request.refreshToken = req.refreshToken;
                res.send(success_request);
            })
        } catch (err) {
            return res.send(err);
        }
    })
})


/**
 * 회원탈퇴, http://localhost:3000/members/idle/member-secede
 * 1. 세션 이메일 사용 (로그인 되어있는 상태여야 회원탈퇴 가능)
 * 2. member 테이블에서 member_secede 값을 1로 변경 (애초에 secede 값이 1이면 로그인 불가)
 * 3. 세션 날리고 홈으로 이동
 */
router.put('/idle/member-secede', jwt_middleware,(req, res) => {

    getConnection(async (conn) => {
        try {

            await new Promise((res, rej) => {
                var secedeSql = 'UPDATE member SET member_secede=? WHERE member_email=?;';
                var secedeParams = [1, req.memberEmail];
                conn.query(secedeSql, secedeParams, function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "회원 탈퇴 실패";
                        res(error_request);
                    }
                    res(rows);
                })
            });

            success_request.data = { "member_email": req.memberEmail }
            success_request.message = "회원 탈퇴 성공";
            res.send(success_request);
            //res.redirect('/home'); // 홈으로 이동하게 하자
        } catch (err) {
            res.send(err)
        }
    })
})


/**
 * 회원 포인트 현황, http://localhost:3000/members/idle/mypage/point/state
 * 1. 세션 이메일을 가지고 member 테이블에서 일치하는 이메일을 찾아 보유 포인트, 누적 포인트, 사용 포인트를 가져온다.
 * 2. member 테이블에서 누적 포인트 값을 다 가져와서 키 값으로 분류하고 내림차순 정렬 (정지 안당한 사람)
 * 3. 정련된 값에서 나의 누적포인트랑 같은 값을 찾는다 (랭킹)
 * 4. 랭킹 값을 테이블에 저장
 * 5. 현재 포인트, 누적 포인트, 사용 포인트, 랭킹을 json 으로 보내기
 */
router.get('/idle/mypage/point/state', jwt_middleware, (req, res) => {

    getConnection(async (conn) => {
        try {

            // 현재 세션의 이메일을 사용하여 포인트 정보 가져오기
            await new Promise((res, rej) => {
                // 보유포인트, 누적포인트, 사용포인트 가져오기
                var myPointSql = 'SELECT member_point, save_point, use_point FROM member WHERE member_email=?'
                conn.query(myPointSql, req.memberEmail, function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.data = err;
                        error_request.message = "현재 회원 포인트 가져오기 실패"
                        rej(error_request);
                    }

                    conn.release();

                    success_request.message = "회원 포인트 현황 반환 성공"
                    success_request.data = rows;
                    success_request.accessToken = req.accessToken;
                    success_request.refreshToken = req.refreshToken;

                    return res.send(success_request);
                })
            })
        } catch (err) {
            res.send(err);
        }
    })
})


/**
 * 회원 포인트 사용내역, http://localhost:3000/members/idle/mypage/point/use.
 * 1. 세션이메일을 가지고 point 테이블에서 사용날짜 사용내역을 가져온다. , 회원이 사용안한경우 처리
 * 2. json 응답처리
 */
router.get('/idle/mypage/point/use', jwt_middleware, (req, res) => {

    getConnection(conn => {
        try {
            let pageNum = (req.query.page - 1) * 10; // 페이지 번호

            // 사용내역 가져오기
            var usePointSql = 'SELECT use_contents, point, use_date FROM point WHERE member_email=? LIMIT 10 OFFSET ?;';
            var usePointParams = [req.memberEmail, pageNum];
            conn.query(usePointSql, usePointParams, function (err, rows) {
                // point를 사용한적이 없어서 point테이블에 회원이 등록이 안된 경우
                if (err || rows == '') {
                    console.log(err)
                    conn.release();
                    error_request.data = err;
                    error_request.message = "사용내역이 없습니다.";
                    return res.send(error_request);
                }
                conn.release();

                //사용내역 응답
                success_request.message = "사용내역 가져오기 성공";
                success_request.accessToken = req.accessToken;
                success_request.refreshToken = req.refreshToken;
                return res.send(success_request)
            })
        } catch (err) {
            return res.send(err);
        }
    })
})


/**
 * 회원 포인트 적립내역, http://localhost:3000/members/idle/mypage/point/save
 * 1. 세션이메일을 가지고 idea 테이블에서 제목, 얻은 포인트, 적립날짜를 가져온다. (사용 포인트는 1000) , 회원이 등록안힌경우 처리
 * 2. json 응답처리
 */
router.get('/idle/mypage/point/save', (req, res) => {
    getConnection(conn => {
        try {

            let pageNum = (req.query.page - 1) * 10; // 페이지 번호

            // idea 테이블에서 제목, 얻은 포인트, 적립날짜 가져오기
            var savePointSql = 'SELECT idea_title, add_point, date_point FROM idea WHERE member_email=? LIMIT 10 OFFSET ?;';
            let savePointParams = [req.memberEmail, pageNum];
            conn.query(savePointSql, savePointParams, function (err, rows) {
                if (err || rows == '') {
                    conn.release();
                    error_request.data = err;
                    error_request.message = "등록된 아이디어가 없습니다.";
                    return res.send(error_request);
                }
                conn.release();

                //사용내역 응답
                success_request.message = "적립내역 불러오기 성공";
                success_request.data = rows;
                success_request.accessToken = req.accessToken;
                success_request.refreshToken = req.refreshToken;
                res.send(success_request);
            })
        } catch (err) {
            return res.send(err)
        }
    })
})


/**
 * 회원 아이디어 목록, http://localhost:3000/members/idle/mypage/idea
 * 1. 세션이메일을 가지고 idea 테이블에서 제목, 내용, 작성일을 가져온다. (삭제여부가 0일 때) , 회원이 등록안힌경우 처리
 * 2. json 응답처리
 */
router.get('/idle/mypage/idea', jwt_middleware, (req, res) => {
    
    let admin_check = 0;

    idea_list(req.memberEmail, req.query.idea_search, req.query.page, admin_check).then(memberIdeaList => {
        memberIdeaList.accessToken = req.accessToken;
        memberIdeaList.refreshToken = req.refreshToken;
        res.send(memberIdeaList);
    });
})


/**
 * 관심사업 등록, http://localhost:3000/members/idle/mypage/marked-on
 * inter_anno 테이블에 체크됐는지 안됐는지 팔별해주는 컬럼하나 넣고 등록 해제 api 한번에 하는거 괜찮아 보임
 * 1. 내가 누른 공고게시물의 id값 저장 ( 포스트맨에서 받기 )
 * 2. 세션 이메일 즐겨찾기 등록하면 inter_anno 테이들에 삽입
 * 3. json 응답처리
 */
router.post('/idle/mypage/marked-on', jwt_middleware,(req, res) => {

    getConnection(conn => {
        try {
            var annoMarkOnId = req.body.anno_id; // 공보정보게시판 id   
            console.log(annoMarkOnId)

            // inter_anno 테이블에 삽입
            var annoMarkOnSql = 'INSERT INTO inter_anno (member_email, anno_id) VALUES(?,?)'
            var annoMarkOnParams = [req.memberEmail, annoMarkOnId]
            conn.query(annoMarkOnSql, annoMarkOnParams, function (err, rows) {

                if (err || rows == '') {
                    console.log(err)
                    conn.release();
                    error_request.data = err;
                    error_request.message = "관심사업 등록실패";
                    return res.send(error_request);
                }
                // json 응답처리
                success_request.message = "관심사업 등록성공";
                success_request.data = {
                    "anno_id": annoMarkOnId,
                    "member_email": req.memberEmail
                }
                success_request.accessToken = req.accessToken;
                success_request.refreshToken = req.refreshToken;
                return res.send(success_request);
            })
        } catch (err) {
            //json 응답처리
            return res.send(err);
        }
    })
})


/**
 * 관심사업 해제, http://localhost:3000/members/idle/mypage/marked-off
 * 1. 내가 누른 공고게시물의 id값 저장 ( 포스트맨에서 받기 )
 * 2. 세션 이메일 가지고 inter_anno 테이블에서 해당 id 찾아서 삭제
 * 3. json 응답처리
 */
router.delete('/idle/mypage/marked-off', (req, res) => {

    getConnection(conn => {
        try {
            var mem_email = req.session.member_email; // 세션 이메일
            console.log("세션 이메일 : " + mem_email);

            // 해제한 공고정보게시물 id값 
            var anno_markoff_id = req.body.anno_id;
            console.log("마크해제 id: " + anno_markoff_id)

            // 해당 id 값과 일치하는 데이터 삭제
            var anno_markoff_param = [anno_markoff_id, mem_email];
            var anno_markoff_sql = 'DELETE FROM inter_anno WHERE anno_id =? AND member_email=?;';
            conn.query(anno_markoff_sql, anno_markoff_param, function (err, rows) {
                if (err || rows == '' || rows.affectedRows == 0) {
                    conn.release();
                    //json 응답처리
                    error_request.data = err;
                    error_request.message = "관심사업 해제 실패";
                    return res.send(error_request);
                }

                //json 응답처리
                var anno_markoff_success_res = {
                    "anno_id": anno_markoff_id,
                }
                success_request.data = anno_markoff_success_res;
                success_request.message = "관심사업 해제 성공";
                return res.send(success_request)
            })
        } catch (err) {
            //json 응답처리
            return res.send(err);
        }
    })
})


/**
 * 관심사업 목록, http://localhost:3000/members/idle/mypage/marked
 * 1. 세션 이메일을 가지고 inter_anno 테이블, anno 테이블, anno_img_dir 테이블을 join해서 값을 가져온다. ( 삭제여부 값 0)
 * 2. json 응답처리
 */
router.get('/idle/mypage/marked', (req, res) => {

    console.log("세션 이메일: ", req.session.member_email) // 세션 이메일
    console.log("검색할 내용: ", req.query.inter_anno_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    inter_anno_list(req.session.member_email, req.query.inter_anno_search, req.query.page).then(member_inter_anno_list => {
        res.send(member_inter_anno_list);
    });

})


/**
 * 고객센터 메일전송, http://localhost:3000/members/idle/contact
 */
router.post('/idle/contact', (req, res) => {
    try {
        let get_email = req.body.email; // 보내는 사람 이메일
        let get_title = req.body.contact_title; // 보낼 제목
        let get_contents = req.body.contact_content // 보낼 내용

        // 메일 전송 ( 문의 넣은 살마 → 관리자 이메일)
        trans_mail.sendMail({
            from: get_email,
            to: process.env.GMAIL_EMAIL,
            subject: '고객센터 제목',
            text: "고객센터 내용"
        }, function (err) {
            if (err) {
                error_request.data = err;
                error_request.message = "메일 전송 실패";
                res.send(error_request);
            }
            getConnection(async (conn) => {
                try {
                    let conatct_id;
                    let contact_sql;
                    let contact_params;

                    // 인증키, 유효기간, 수신메일 db에 저장
                    await new Promise((res, rej) => {
                        contact_sql = 'INSERT INTO contact (email, contact_title, contact_contents) VALUES(?,?,?);';
                        contact_params = [get_email, get_title, get_contents]; //파라미터를 값들로 줌(배열로 생성)
                        conn.query(contact_sql, contact_params, function (err, rows) {
                            conatct_id = rows.insertId
                            if (err || rows == '') {
                                console.log(err)
                                conn.release();
                                error_request.data = err;
                                error_request.message = "contact 테이블 에러";
                                rej(error_request);
                            }
                            res();
                        })
                    })

                    await new Promise((res, rej) => {
                        contact_sql = 'INSERT INTO contact_log (contact_id, contact_send) VALUES(?,?);';
                        contact_params = [conatct_id, now_time()];
                        conn.query(contact_sql, contact_params, function (err, rows) {
                            if (err || rows == '') {
                                console.log(err)
                                conn.release();
                                error_request.data = err;
                                error_request.message = "contact_log 테이블 에러";
                                rej(error_request);
                            }
                            res();
                        })
                    })

                    conn.release();
                    success_request.data = {
                        "email": get_email,
                        "contact_title": get_title,
                        "contact_content": get_contents
                    }
                    success_request.message = "이메일 전송 성공";
                    return res.send(success_request); // db 입력하고 보내는것까지 성공. 이메일과 인증키 전송(서버에서 사용)
                } catch (err) {
                    res.send(err);
                }
            })
        })
    } catch (err) {
        res.send(err);
    }
})


module.exports = router;
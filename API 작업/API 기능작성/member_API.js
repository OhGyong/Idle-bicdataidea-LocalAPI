/**
 * 기본설정
*/
var mysql = require("mysql");
var nodemailer = require('nodemailer'); // 메일 모듈 불러오기
var nodeDate = require('date-utils');
const express = require('express');
const { send } = require("process");
const { time } = require("console");
const session = require('express-session');
const { Cookie } = require("express-session");
var MySQLStore = require('express-mysql-session')(session);

require('dotenv').config();
var app = module.exports = express();

//var app=require('./app.js');  //내일 질문할거

app.use(session({
    //key: 'sid', // 세션의 키 값
    secret: 'node-session', // 세션의 비밀 키(암호?)
    resave: false, // 세션을 항상 저장할 지 여부
    saveUninitialized: true, //세션이 저장되기 전에 uninitialize 상태로 저장
    /*
    cookie:{
        maxAge:5000
    },
    */
    store:new MySQLStore({
        port:3306,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'test_api'
    })
    
}))

app.use(express.json()); //json 사용하기 위해서
 
const port = 3000 //포트번호
 
// Mysql db 연결
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "test_api",
});

connection.connect();
 

 
/**
 * [다른 방법 생각]
 * 회원가입 전 이용약관 동의 API, http://localhost:3000/idle/signup/agree/check
 * ---
 * 1. [선택]항목 클릭하면 전역변수 값 agree_check 값 변경 → 회원가입 API에서 사용
 * 2. json 응답처리
*/
let member_chosen_agree=0; // 정책정보 제공을 위한 수집 및 이용에 대한 안내 동의 여부 default 값
app.post('/idle/signup/agree/check', (req, res)=>{
     
    // 이용약관 [선택] 항목에서 체크를 하면 json으로 1값이 넘어옴
    var agree_check=req.body.chose_check;
    console.log(agree_check)

    // 넘어온 값이 0인지 1인지에 따라 member_chosen_agree 값을 맞춰줌 → 회원가입에서 사용
    if(agree_check == 1){
        
        member_chosen_agree=1;
        
        //json 응답
        var success_res={
            "signup_agree" : "동의(1)"
        }
        res.send(success_res);
    }else{
        member_chosen_agree=0;
        
        //json 응답
        var success_res={
            "signup_agree" : "비동의(0)"
        }
        res.send(success_res);
    }
});
 
 
/**
 * 수정필요
 * 회원가입 API , http://localhost:3000/idle/signup/fillout
 * try catch 로 primary키 오류 발생 못잡음 
 * 1. 배열에 입력받은 값과 member 테이블의 NOTNULL인 값들 처리해서 저장
 * 2. 패스워드 해시키 변경 (crypto 사용)
 * 3. db에 입력받은 값 member 테이블에 삽입
 * 4. 삽입 이후의 시간 계산해서 member_log 테이블에 삽입
*/
app.post('/idle/signup/fillout',(req, res)=>{

    // POSTMAN에서 넘겨 받은 json을 key|value 나누는 작업
    var member_key = new Array(); 
    var member_value = new Array();

    //Mysql workbench에서 member_ban과 chosen_agree에 default 값 0으로로 설정해야함
    for(k in req.body){
        member_key.push(k);
        member_value.push(req.body[k]);
    }       
    //회원가입 전 [선택]동의 여부
    member_key[8]='chosen_agree';
    member_value[8]=member_chosen_agree;

    async function fillout_db(){
        try{
            // 암호 해시키 변경
            function change_hash(){
                const crypto =require('crypto');
                member_value[6]= crypto.createHash('sha512').update(member_value[6]).digest('base64');   
            }

            await change_hash();

            // member 테이블에 입력받은 값 삽입
            var sql= 'INSERT INTO member (member_email, member_name, member_gender, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree) VALUES(?,?,?,?,?,?,?,?,?);';
            connection.query(sql, member_value, function(err){
               if(err){
                    var error_res={
                        "member_login_result" : "member 테이블 오류"
                    }
                   return res.send(error_res);
                }else{
                    // 현재 회원가입한 날짜 
                    var now_time = new Date();
                    // member_log 테이블에 현재 시간 삽입
                    var sql= 'INSERT INTO member_log (member_email,member_log_join) VALUES(?,?)';
                    var parm_time = [member_value[0], now_time];
                    connection.query(sql, parm_time, function(err){
                        if(err){
                            error_res={
                                "member_login_result" : "member_log 테이블 오류"
                            }
                            return res.send(error_res);
                        }
                        else{
                            var success_res={
                                "member_login_result" : "회원가입 성공"
                            }
                            return res.send(success_res); 
                        }
                    });
                }
            });   
        }catch(err){
            var error_res={
                "member_login_result" : "회원가입 실패"
            }
            return res.send(error_res);
        }
    }
    fillout_db();  
});
 

/**
 * 회원 이메일 중복 확인, http://localhost:3000/idle/has-same-email
 * 1. 입력된 json 값 value 값만 가져오기
 * 2. member 테이블에 입력받은 이메일 값이 있는지 확인해서 있으면 생성불가, 없으면 생성가능 응답처리
*/
app.post('/idle/has-same-email',(req,res) =>{
    
    // 사용자가 입력한 이메일 값
    var check_email=req.body.member_email;

    // db에서 member_email 값들 가져와서 check_email 과 같은지 비교    
    var same_email_sql = 'SELECT member_email FROM member WHERE member_email=?;';
    connection.query(same_email_sql, check_email, function(err, rows){//두번째 인자에 배열로 된 값을 넣어줄 수 있다.
        try{
            if(rows[0].member_email == check_email){
                var error_res={
                    "member_has_same_email" : "아이디 생성불가(동일 이메일 존재)"
                }
                res.send(error_res);
            }
        }catch{
            var success_res={
                "member_has_same_email" : "아이디 생성가능(동일 아이디 없음)"
            }
            res.send(success_res);
        }
    });
});
 

/**
 * 회원 이메일 인증키 보내기, http://localhost:3000/idle/sign-up/send-email
 * 1. 난수 6자리 생성
 * 2. json 입력받은 값 value 값만 뽑아내기
 * 3. 현재시간, 24시간 뒤 계산해서 유효기간 설정
 * 4. 메일 보내기 
 * 5. 메일 보내면 (난수 6자리, 유효기간, 이메일) email_auth 테이블에 저장
*/
app.post('/idle/sign-up/send-email', (req,res) =>{
    
    try{
        // 난수 6자리 생성
        var Raondom_Key=function(min,max){
            var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
            return ranNum;
        }
        const send_key=Raondom_Key(111111,999999);

        // 포스트맨에서 입력받은 키 값(이메일) 지정
        var get_email=req.body.send_email

        // 시간 처리
        var now_time = new Date();   // 현재시간
        var tomorrow_time = new Date(now_time.setDate(now_time.getDate()+1)); // 내일시간, 유효기간 설정

        // 보내는 사람 설정
        var transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
                user : process.env.GMAIL_EMAIL,
                pass : process.env.GMAIL_PASS
            }
        });

        // 인증메일 보내기
        transporter.sendMail({    
            from : process.env.GMAIL_EMAIL,
            to : process.env.NAVER_EMAIL,
            subject : '이메일 인증키 보내기',
            text : "인증키 입니다 : " + send_key // 난수 입력
        }, function(err){

            if(err){
                error_res={
                    "send_email" : "메일 전송 실패"
                    
                } 
                return res.send(error_res); // 메일전송 실패
            }

            // 인증키, 유효기간, 수신메일 db에 저장
            var sql = 'INSERT INTO email_auth (email_key, email_date, rec_email) VALUES(?,?,?)';
            var params = [send_key, tomorrow_time, get_email]; //파라미터를 값들로 줌(배열로 생성)
            connection.query(sql, params, function(err){            
                if(err){
                    var error_res={
                        "send_email" : "db 입력 실패"
                    } 
                    return res.send(error_res); // db에 입력 실패
                } 
                else{
                    var success_res={
                        "send_email" : get_email,
                        "send_key" : send_key
                    } 
                    return res.send(success_res); // db 입력하고 보내는것까지 성공. 이메일과 인증키 전송(서버에서 사용)
                }
            }); 
        });
    }catch(err){
        error_res={
            "send_email" : "메일 전송 실패"
        } 
        return res.send(error_res); // 메일전송 실패
        
    }
});


/**
 * 회원 이메일 인증키 입력, http://localhost:3000/idle/sign-up/check-email-num
 * 1. 서버에서 이메일과 인증키 값을 받아서 email_auth 테이블에서 이메일과 키가 일치하고 인증값과 폐기 값이 0인 값이 있는지 확인
 * 2. 1.조건을 만족하지 못한 경우 처리
 * 3. 1.조건을 만족하면 현재날짜와 유효기간을 비교 ( 현재날짜가 더 크면 폐기처리)
 * 4. 3.에서 종료가 안되면 인증이 되었다는 표시 → 인증 값과 폐기 값을 1로 업데이트
*/
app.post('/idle/sign-up/check-email-num', (req, res)=>{

    try{
        // 회원 이메일 인증키 보내기에서 얻은 이메일과 키값
        var check_email=req.body.check_email;
        var check_key=req.body.check_key;

        // email_auth 테이블에서 이메일과 키가 일치하고 인증값과 폐기 값이 0인 값이 있을경우 현재시간과 유효기간을 비교
        var check_email_sql = 'SELECT * FROM email_auth WHERE rec_email=? AND email_key=? AND email_auth_flag=? AND email_dispose=?;';
        var check_email_param = [check_email, check_key, 0 , 0];
        connection.query(check_email_sql, check_email_param, function(err, rows){

            // 위 조건을 만족하지 못한경우 rows에 null 값 생성 (폐기0, 인증0, 이메일-키 일치)
            if(err || rows==''){
                var error_res={
                    "email_check" : "다시 인증하시기 바랍니다."
                }
                return res.send(error_res);
            }

            var now_time = [new Date()]; // 현재시간

            //현재날짜와 비교해서 현재날짜가 크면 폐기처리(1로 변경)
            var now_time = [new Date()]; // 현재시간
            if(rows[0].email_date<now_time){        
                // 폐기 값 1로 변경
                var set_dispose_sql = 'UPDATE email_auth SET email_dispose=? WHERE rec_email=? AND email_key=?;';
                var set_dispose_param = [1, check_email, check_key];
                connection.query(set_dispose_sql, set_dispose_param, function(err){
                    if(err){
                        var error_res={
                            "email_check" : "폐기 값 1 업데이트 에러"
                        } 
                        return res.send(error_res)
                    } 
                }); 
            }

            // 정상으로 진행되면 인증완료와 폐기처리를 해주어야 한다. (db에 인증여부와 폐기 값을 1로 변경)
            var set_sql='UPDATE email_auth SET email_auth_flag=?, email_dispose=? WHERE rec_email=? AND email_key=?;';
            var set_parm=[1,1,check_email,check_key];
            connection.query(set_sql, set_parm, function(err, rows){
                if(err){
                    var error_res={
                        "email_check" : "폐기 값, 인증 값 1 업데이트 에러"
                    } 
                    return res.send(error_res)
                }
                else{
                    var success_res={
                        "email_check" : "인증이 완료되었습니다."
                    } 
                    return res.send(success_res);
                }
            })        
        })
    }catch(err){
        error_res={
            "email_check" : "다시 인증하시기 바랍니다."
        }
        return res.send(error_res);
    }
});


/**
 * 회원 비밀번호 찾기(메일전송), http://localhost:3000/idel/find-password
 * 1. 사용자가 입력한 이메일이 db에 저장되어 있는지 확인
 * 2. pw_find 테이블에서 비밀번호 키 값 생성 (random 7자리 만들어서 해시화)해서 메일 전송
 * 3. 전송하면서 유효기간 설정
 */
 app.post('/idel/find-password', (req,res) =>{
    
    // 포스트맨에서 받은 값
    var check_email=req.body.member_email;

    console.log("회원비밀번호 찾기 : " + check_email);

    // 1. 사용자가 입력한 이메일이 db에 있는지 확인
    var sql = 'SELECT member_email FROM member WHERE member_email = ?;';
    connection.query(sql, check_email, function(err, rows){
        try{
            // 2.
            // 랜덤키 생성
            var Raondom_Key=function(min,max){
                var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
                return ranNum;
            }

            // 해시키처리
            const crypto =require('crypto');
            var hash_key= crypto.createHash('sha512').update(String(Raondom_Key(111,999))).digest('base64');
            var hash_key = hash_key.substr(0,7); // 7자리로 짜르기
            var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi; //특수문자 제거
            hash_key = hash_key.replace(regExp,"");
            console.log(hash_key)

            // 유효기간 설정
            var now_time = new Date(); // 현재시간
            var tomorrow_time = new Date(now_time.setDate(now_time.getDate()+1)); // 내일시간

            //보내는 사람 설정
            var transporter = nodemailer.createTransport({
                service:'gmail',
                auth: {
                    user : process.env.GMAIL_EMAIL,
                    pass : process.env.GMAIL_PASS
                }
            });

            // 받는 사람 설정, 인증메일 보내기       
            transporter.sendMail({                       
                from : process.env.GMAIL_EMAIL,
                to : process.env.NAVER_EMAIL,  
                subject : '회원 비밀번호 찾기',
                text : "http://localhost:3000/idel/reset-password?hask_key=" + hash_key // 난수 입력   
            }, function(err, info) {               
                var sql = 'INSERT INTO pw_find (pw_key, pw_date, member_email) VALUES(?,?,?)';           
                var params = [hash_key, tomorrow_time, check_email]; //파라미터를 값들로 줌(배열로 생성)
                    connection.query(sql, params);
                });
                var success_res={
                    "send_email" : check_email,
                    "send_key" : hash_key
                } 
                res.send(success_res); // db 입력하고 보내는것까지 성공            
        }catch(err){
            var error_res={
                "find_password" : "이메일 전송 실패"
            } 
            res.send(error_res);
        }
    })
})


/**
 * 회원 비밀번호 재설정, http://localhost:3000/idle/reset-password=?해시키
 * 1. url에 있는 query 값으로 이메일과 해시값을 가져옴
 * 2. pw_find 테이블에서 해당이메일 해시값이 일치하고 재설정 값, 폐기값이 0인 경우를 찾는다.
 * 3. 현재날짜와 비교해서 폐기여부를 정한다.
 * 4. 사용자가 입력한 비밀번호를 해시화하여 member 테이블에 업로드하고 재설정 값과 폐기값을 1로 변경한다.
 */
app.put('/idle/reset-password', (req, res)=>{
    
    // 회원 비밀번호 찾기에서 응답값으로 얻은 이메일과 해시값
    var mem_email=req.query.member_email;
    var hash_key=req.query.hash_key; 

    // 해당 해시키를 가진 유저가 있는지 확인
    var reset_pass_sql = 'SELECT * FROM pw_find WHERE pw_key=? AND pw_edit=? AND pw_dispose=? AND member_email=?;';
    var reset_pass_params=[hash_key, 0, 0, mem_email]
    console.log(reset_pass_params)
    connection.query(reset_pass_sql, reset_pass_params, function(err, rows){
        try{
            // 위의 조건을 만족하지 못해서 결과가 []로 나올경우
            if(err || rows==''){
                var error_res={
                    "member_rest_password" : "비밀번호 재설정 불가능"
                } 
                return res.send(error_res)
            }
            
            //현재날짜와 비교해서 현재날짜가 크면 폐기처리(1로 변경)
            var now_time = [new Date()]; // 현재시간
            if(rows[0].pw_date<now_time){        
                // 폐기 값 1로 변경
                var set_dispose_sql = 'UPDATE pw_find SET pw_dispose=? WHERE member_email=? AND pw_key=?;';
                var set_dispose_param = [1, mem_email, hash_key];
                connection.query(set_dispose_sql, set_dispose_param, function(err, rows){
                    if(err || rows==''){
                        var error_res={
                            "email_check" : "폐기 값 1 업데이트 에러"
                        } 
                        return res.send(error_res)
                    } 
                }); 
            }

            // 비밀번호 변경 (해시화)
            var new_password=req.body.new_password;
            const crypto =require('crypto');
            new_password = crypto.createHash('sha512').update(String(new_password[0])).digest('base64');
                
            // 해시화 된 새 비밀번호 db에 저장
            reset_pass_sql='UPDATE member SET member_pw=? WHERE member_email=?;';
            reset_pass_params=[new_password, mem_email];
            connection.query(reset_pass_sql, reset_pass_params, function(err,res){
                if(err || rows==''){
                    error_res={
                        "member_rest_password" : "비밀번호 변경 오류"
                    } 
                    return res.send(error_res)
                } 
                
                // 재설정 값과 폐기값 1로 변경
                reset_pass_sql='UPDATE pw_find SET pw_edit=?, pw_dispose WHERE member_email=? AND pw_key=?;';
                reset_pass_params=[1,1,mem_email,hash_key];
                console.log(reset_pass_params)
                connection.query(reset_pass_sql, reset_pass_params, function(err, rows) {
                    if(err || rows==''){
                        error_res={
                            "member_rest_password" : "재설정값, 폐기값 오류"
                        } 
                        return res.send(error_res);
                    }
                    else{
                        var success_res={
                            "member_rest_password" : "비밀번호 재설정 성공"
                        } 
                        return res.send(success_res);
                    }
                })     
            })
        }catch(err){
            console.log(err)
            error_res={
                "member_rest_password" : "비밀전호 재설정 실패"
            } 
            return res.send(error_res)
        }
    })
})


/**
 * 회원정보 불러오기(수정페이지에 사용), http://localhost:3000/idle/mypage/update
 * 1. 세션 테이블에서 현재 로그인한 이메일을 찾는다.
 * 2. member 테이블에서 위에서 찾은 이메일과 일치하는 정보들을 가져온다.
 * 3. json 응답처리
 */
 app.get('/idle/mypage/update', (req, res)=>{
    try{
        
        var mem_email=[req.session.member_email]; // 세션에 있는 이메일
        console.log(mem_email)
        
        // 수정을 위한 회원 정보 가져오기
        var update_sql='SELECT member_email, member_name, member_pw, member_gender, member_birth, member_phone, member_company, member_state FROM member WHERE member_email=?';
        connection.query(update_sql,mem_email, function(err, rows) {
            console.log(rows)
            res.send(rows)
        })
    }catch(err){
        console.log(err)
        var error_res={
            "member_update" : "Error"
        } 
        res.send(error_res)
    }
  
})


/**
 * 회원정보 수정, http://localhost:3000/idle/mypage/update/modify
 * 1. 세션이메일 사용
 * 2. array에 입력받은 값 저장하고 쿼리에 쓸 sql과 param 작성, db 업데이트
 * 3. json 응답
 */
app.put('/idle/mypage/update/modify', (req, res)=>{
    try{
        var mem_email=[req.session.member_email]; // 세션 이메일
        
        // 입력받은 값
        var member_modify=new Array();        
        for(modify_index in req.body){
            member_modify.push(req.body[modify_index])
        }
        console.log(member_modify)
        member_modify.push(mem_email) // 쿼리에 사용할 param 
        
        // 입력한 값으로 업데이트
        var modify_sql='UPDATE member SET member_email=?, member_name=?, member_pw=?, member_gender=?, member_birth=?, member_phone=?, member_company=?, member_state=? WHERE member_email=?'
        connection.query(modify_sql, member_modify, function(err, rows){
            var success_res={
                "member_modify" : "수정되었습니다."
            } 
            res.send(success_res);        
        }) 
    }catch{
        var error_res={
            "member_modify" : "수정 실패하였습니다."
        } 
        res.send(error_res);
    }
    
    
})


/**
 * 회원 로그인, http://localhost:3000/idle/signin
 * 1. 회원이 입력한 이메일과 비밀번호를 저장
 * 2. 입력한 비밀번호는 해시화해서 db에서 조회
 * 3. 로그시간 업로드
 * 4. 세션 저장
 */
 app.post('/idle/signin', (req, res)=>{

    // 회원이 입력한 이메일과 비밀번호
    var member = new Array();
    for(k in req.body){
        member.push(req.body[k])
    }

    //비밀번호 해시화
    const crypto =require('crypto');
    member[1]= crypto.createHash('sha512').update(member[1]).digest('base64');
    param_member=[member[0],member[1], 0];
    
    // db에 일치하는 이메일과 비밀번호가 있는지 확인
    var login_sql='SELECT * FROM member WHERE member_email=? AND member_pw=? AND member_secede=?;';
    connection.query(login_sql, param_member, function(err, rows, result){
        try{
            
            var mem_email=rows[0].member_email;

            // member_log , member_login_log 테이블에 로그인 시간 추가
            var now_time = new Date();
            var memberlog_sql='UPDATE member_log SET member_login_lately=? WHERE member_email=?;';

            //member_log  테이블 추가 (시간 업데이트)
            var parm_memberlog=[now_time, mem_email];
            connection.query(memberlog_sql, parm_memberlog);

            //member_login_log 테이블 추가 (시간 축적)
            var memberloginlog_sql='INSERT INTO member_login_log (member_login, member_email) VALUES(?,?);';
            connection.query(memberloginlog_sql, parm_memberlog); 

            //세션 저장
            req.session.member_email=rows[0].member_email;
            req.session.save(function(){
                var success_res={
                    "member_signin" : "로그인에 성공하였습니다."
                }
                //res.redirect('/home'); // 홈으로 이동하게 하자
                res.send(success_res) //save 함수 안에서 쓰면 안됨           
            })     
        }catch(err){
            console.log(err)
            var error_res={
                "member_signin" : "일치하는 아이디가 없거나 비밀번호가 틀렸습니다."
            }
            res.send(error_res)
        }
    })
})


/**
 * 회원 로그아웃, http://localhost:3000/idle/logout
 * 1. destroy로 삭제
 */
app.post('/idle/logout', (req, res)=>{
    try{
        req.session.destroy(function(){
            req.session;
            //res.redirect('/home'); // 홈으로 이동하게 하자
            var success_res={
                "member_logout" : "로그아웃에 성공하였습니다."
            }
            res.send(success_res)
        });
    }catch{
        var error_res={
            "member_logout" : "로그아웃에 실패하였습니다."
        }
        res.send(error_res)
    }
})


/**
 * 회원탈퇴, http://localhost:3000/idle/member-secede
 * 1. 세션 이메일 사용 (잘못된 이메일 일수가 없음)
 * 2. member 테이블에서 member_secede 값을 1로 변경 (애초에 secede 값이 1이면 로그인 불가)
 * 3. 세션 날리고 홈으로 이동
 */
app.put('/idle/member-secede', (req, res)=>{

    try{
        // 탈퇴할 이메일
        var mem_email=req.session.member_email;
        console.log(mem_email)

        // member 테이블에서 member_secede 값 1로 업데이트
        var secede_param=[1, mem_email];
        var secede_sql='UPDATE member SET member_secede=? WHERE member_email=?;';
        connection.query(secede_sql, secede_param, function(){   
            
         
            //json 응답처리
            success_res={
                "member_secede":"탈퇴처리 되었습니다."
            }

            req.session.destroy(function(){
                req.session;
                //res.redirect('/home'); // 홈으로 이동하게 하자
                return res.send(success_res)
            }) 
            
        })    
    }catch(err){
        var error_res={
            "member_secede":"Error"
        }
        return res.send(error_res)
    }
    
})


/**
 * 회원 포인트 현황, http://localhost:3000/idle/mypage/point/state
 * 1. 세션 이메일을 가지고 member 테이블에서 일치하는 이메일을 찾아 보유 포인트, 누적 포인트, 사용 포인트를 가져온다.
 * 2. member 테이블에서 누적 포인트 값을 다 가져와서 키 값으로 분류하고 내림차순 정렬
 * 3. 정련된 값에서 나의 누적포인트랑 같은 값을 찾는다 (랭킹)
 * 4. 랭킹 값을 테이블에 저장
 * 5. 현재 포인트, 누적 포인트, 사용 포인트, 랭킹을 json 으로 보내기
 */
app.get('/idle/mypage/point/state', (req, res)=>{

    try{
        var mem_email=req.session.member_email; // 세션 이메일
        console.log("세션 이메일 : "+ mem_email)

        // 보유포인트, 누적포인트, 사용포인트 가져오기
        var mypoint_sql='SELECT member_point, save_point, use_point FROM member WHERE member_email=?'
        connection.query(mypoint_sql, mem_email, function(err, rows) {

            var my_now_point = rows[0].member_point; // 현재 포인트
            var my_save_point = rows[0].save_point; // 누적 포인트
            var my_use_point = rows[0].use_point; // 사용 포인트
            
            console.log("내 포인트 정보 : "+ my_now_point + " " + my_save_point + " " + my_use_point);

            // 회원들 누적 포인트 가져오기
            var savepoint_sql='SELECT save_point FROM member';
            connection.query(savepoint_sql, function(err, rows) {
                
                var member_point=new Array()

                // 키 값( 포인트 값)만 빼내기
                for(k in rows){
                    member_point.push(rows[k].save_point);
                }
                
                console.log("포인트 점수 정렬 전 : " + member_point.sort());
                // 내림차순 정렬
                member_point.sort(function(a, b) {
                    return b-a; // 두 숫자의 차이가 양수인가 음수인가 이용
                })
                console.log("포인트 점수 정렬 확인 : " + member_point);

                // 나의 포인트 순위 찾기
                var my_rank;
                for(m in member_point){
                    if(my_save_point == member_point[m]){
                        my_rank=Number(m)+1 //m이 스트링으로 되어있어서 수정
                        break;
                    }
                }
                console.log(my_rank)
                
                // member 테이블에 순위 업데이트
                var myrank_sql='UPDATE member SET member_rank=? WHERE member_email=?'
                var myrank_params=[my_rank, mem_email]
                connection.query(myrank_sql, myrank_params, function(err, rows, result) {

                    // json 형태로 응답
                    point_state={
                        "현재 포인트": my_now_point,
                        "누적 포인트": my_save_point,
                        "사용 포인트": my_use_point,
                        "랭킹": my_rank
                    }
                    res.send(point_state);
                    
                })
            })  
        })
    }catch{
        var error_res={
            "point_state":"Error"
        }
        res.send(error_res);
    }
})


/**
 *  (TypeError: Cannot read property '0' of undefined) try catch로 안잡힘
 * 회원 포인트 사용내역, http://localhost:3000/idle/mypage/point/use.
 * 1. 세션이메일을 가지고 point 테이블에서 사용날짜 사용내역을 가져온다. , 회원이 사용안한경우 처리
 * 2. json 응답처리
 */
app.get('/idle/mypage/point/use', (req, res)=>{

    try{

        var mem_email=req.session.member_email; // 세션 이메일
        console.log("세션 이메일 : " + mem_email);

        // 사용내역 가져오기
        var use_point_sql='SELECT use_contents, point, use_date FROM point WHERE member_email=?;';
        connection.query(use_point_sql, mem_email, function(err,rows) {   
            
            // point를 사용한적이 없어서 point테이블에 회원이 등록이 안된 경우
            if(rows==''){
                var error_res={
                    "point_use":"사용내역이 없습니다"
                }
                res.send(error_res);
            }

            //사용내역 응답
            res.send(rows)        
        })
    }catch(err){
        console.log(err);
        error_res={
            "point_use":"Error"
        }
        res.send(error_res);
    }
})


/**
 * 회원 포인트 적립내역, http://localhost:3000/idle/mypage/point/save
 * 1. 세션이메일을 가지고 idea 테이블에서 제목, 얻은 포인트, 적립날짜를 가져온다. (사용 포인트는 1000) , 회원이 등록안힌경우 처리
 * 2. json 응답처리
 */
app.get('/idle/mypage/point/save', (req, res)=>{

    try{
        var mem_email=req.session.member_email; // 세션 이메일
        console.log("세션 이메일 : " + mem_email);
    
        // idea 테이블에서 제목, 얻은 포인트, 적립날짜 가져오기
        var save_point_sql = 'SELECT idea_title, add_point, date_point FROM idea WHERE member_email=?;'; 
        connection.query(save_point_sql, mem_email, function(err, rows){

            // idea 게시물을 올린적이 없어서 indea 테이블에 회원이 등록이 안된 경우
            if(rows==''){
                var error_res={
                    "point_save":"등록된 아이디어가 없습니다."
                }
                return res.send(error_res);
            }
            
            //사용내역 응답
            res.send(rows)
        })
    }catch(err){
        error_res={
            "point_save":"Error"
        }
        res.send(error_res)
    }
})


/**
 * 회원 아이디어 목록, http://localhost:3000/idle/mypage/idea
 * 1. 세션이메일을 가지고 idea 테이블에서 제목, 내용, 작성일을 가져온다. (삭제여부가 0일 때) , 회원이 등록안힌경우 처리
 * 2. json 응답처리
 */
app.get('/idle/mypage/idea',(req, res)=>{

    try{
        var mem_email=req.session.member_email; // 세션 이메일
        console.log("세션 이메일 : " + mem_email);

        // idea 테이블에서 제목, 내용, 작성일 가져오기
        var save_point_sql = 'SELECT idea_title, idea_contents, idea_date FROM idea WHERE member_email=? AND idea_delete=?;'; 
        var save_point_param = [mem_email, 0]
        connection.query(save_point_sql, save_point_param, function(err, rows){

            // idea 게시물을 올린적이 없어서 indea 테이블에 회원이 등록이 안된 경우
            if(rows==''){
                var error_res={
                    "idea_list":"등록된 아이디어가 없습니다."
                }
                return res.send(error_res);
            }
            
            //사용내역 응답
            res.send(rows)
        })
    }catch{
        error_res={
            "idea_list":"Error"
        }
        res.send(error_res)
    }
})


/**
 * inter_anno 테이블에 체크됐는지 안됐는지 팔별해주는 컬럼하나 넣고 등록 해제 api 한번에 하는거 괜찮아 보임
 * 관심사업 등록, http://localhost:3000/idle/mypage/marked-on
 * 1. 내가 누른 공고게시물의 id값 저장 ( 포스트맨에서 받기 )
 * 2. 세션 이메일 즐겨찾기 등록하면 inter_anno 테이들에 삽입
 * 3. json 응답처리
 */
app.post('/idle/mypage/marked-on', (req, res)=>{

    try{
        var mem_email = req.session.member_email; // 세션 이메일
        console.log("세션 이메일 : " + mem_email);

        var anno_markon_id=req.body.anno_id; // 공보정보게시판 id   
        console.log(anno_markon_id)

        // inter_anno 테이블에 삽입
        var anno_markon_sql = 'INSERT INTO inter_anno (member_email, anno_id) VALUES(?,?)'
        var anno_markon_param = [mem_email, anno_markon_id]
        connection.query(anno_markon_sql, anno_markon_param, function(){

            // json 응답처리
            var anno_markon_success_res={
                "anno_id":anno_markon_id,
                "member_email":mem_email
            }
            res.send(anno_markon_success_res);
        });
    }catch(err){

        //json 응답처리
        var anno_markon_error_res={
            "anno_markon":"관심사업 등록실패"
        }
        res.send(anno_markon_error_res);
    }
})


/**
 * 관심사업 해제, http://localhost:3000/idle/mypage/marked-off
 * 1. 내가 누른 공고게시물의 id값 저장 ( 포스트맨에서 받기 )
 * 2. 세션 이메일 가지고 inter_anno 테이블에서 해당 id 찾아서 삭제
 * 3. json 응답처리
 */
app.delete('/idle/mypage/marked-off', (req, res)=>{
   
    try{

        var mem_email = req.session.member_email; // 세션 이메일
        console.log("세션 이메일 : " + mem_email);

        // 해제한 공고정보게시물 id값 
        var anno_markoff_id=req.body.anno_id;
        console.log("마크해제 id: " + anno_markoff_id)
    
        // 해당 id 값과 일치하는 데이터 삭제
        var anno_markoff_param=[anno_markoff_id, mem_email];
        var anno_markoff_sql='DELETE FROM inter_anno WHERE anno_id =? AND member_email=?;';
        connection.query(anno_markoff_sql, anno_markoff_param, function(){
            //json 응답처리
            var anno_markoff_success_res={
                "anno_id":anno_markoff_id,
            }
            res.send(anno_markoff_success_res)  
        })
    }catch{

        //json 응답처리
        var anno_markoff_error_res={
            "anno_markoff":"관심사업 등록실패"
        }
        res.send(anno_markoff_error_res);
    }
})


/**
 * 관심사업 목록, http://localhost:3000/idle/mypage/marked
 * 1. 세션 이메일을 가지고 inter_anno 테이블, anno 테이블, anno_img_dir 테이블을 join해서 값을 가져온다. ( 삭제여부 값 0)
 * 2. json 응답처리
 */
app.get('/idle/mypage/marked', (req, res)=>{

    try{

        var mem_email = req.session.member_email; // 세션 이메일
        console.log("세션 이메일 : " + mem_email);

        // SELECT 원하는 값 FROM 첫번째 테이블 INNER JOIN 두번째 테이블 ON (기준조건(1-2)) INNER JOIN 세번째 테이블 ON 기준조건(2-3) WHERE 특정조건
        var anno_marked_sql='SELECT anno.anno_id, anno.anno_title, anno.anno_date FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? AND anno_delete=?;'; 
        var anno_marked_param=[mem_email, 0];
        connection.query(anno_marked_sql, anno_marked_param ,function(err, rows){
            console.log(rows)
            res.send(rows)
        })
    }catch(err){
        console.log(err)

        //json 응답처리y
        var anno_marked_error_res={
            "anno_marked":"Error"
        }
        res.send(anno_marked_error_res); 
    }
})


//////////////////////////////////////////////

/**
 *  관리자 등록 필요없음
 */


/**
 * 관리자 이메일 중복 확인, http://localhost:3000/idle/admins/has-same-id
 * 1. 입력된 이메일에서 value 값(이메일)만 가져옴
 * 2. member 테이블에 입력받은 이메일 값이 있는지 확인해서 있으면 생성불가, 없으면 생성가능 응답처리
 * 
*/
app.post('/idle/admins/has-same-id',(req,res) =>{
    
    // 포스트맨에서 얻어온 이메일 값
    var check_email = new Array();
    check_email.push(req.body.admin_email);
    console.log("입력 이메일 확인 : " + check_email);
    
    // db에서 member_email 값들 가져와서 check_email 과 같은지 비교    
    var same_email_sql = 'SELECT admin_email FROM admin WHERE admin_email=?;';
    connection.query(same_email_sql, check_email, function(err, rows){//두번째 인자에 배열로 된 값을 넣어줄 수 있다.
        try{
            if(rows[0].admin_email == check_email){
                var success_res={
                    "admin_has_same_email" : "동일 이메일 존재"
                }
                res.send(success_res);
            }
        }catch{
            var error_res={
                "admin_has_same_email" : "동일 아이디 없음"
            }
            res.send(error_res);
        }
    });
});


app.listen(port, () => {
    console.log(`listen ${port}`)
})

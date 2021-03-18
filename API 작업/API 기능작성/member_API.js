/**
 * 기본설정
*/

var mysql = require("mysql")
const express = require('express')
var app = express() //express 설정
 
app.use(express.json()) //json 사용하기 위해서
 
const port = 3000 //포트번호
 
// Mysql db 연결
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "zpzp12",
    database: "test_api",
})

connection.connect();
 
let member_chosen_agree=0; // 정책정보 제공을 위한 수집 및 이용에 대한 안내 동의 여부 default 값
 

/**
 * 회원가입 전 이용약관 동의 API, http://localhost:3000/idle/signup/agree?param=A
 * 
*/
app.post('/idle/signup/agree', (req, res)=>{
     
    // 이용약관 [선택] 항목에서 체크를 하면 json으로 1값이 넘어옴
    var agree_check=new Array();
    for(k in req.body){
        agree_check.push(req.body[k]);
    }

    // 넘어온 값이 0인지 1인지에 따라 member_chosen_agree 값을 맞춰줌 → 회원가입에서 사용
    if(agree_check == 1){
        member_chosen_agree=1;
        res.send('signup_agree:"Success"');
    }else{
        member_chosen_agree=0;
        res.send('signup_agree:"Error"');
    }
})
 
 
/**
 * 회원가입 API , http://localhost:3000/idle/signup/fillout
 * supervisor로 실행
*/
app.post('/idle/signup/fillout',(req, res)=>{

    // POSTMAN에서 넘겨 받은 json을 key|value 나누는 작업
    var member_key = new Array(); 
    var member_value = new Array();
    var count=0;//index

    /*
    Mysql workbench에서 member_ban과 chosen_agree에 default 값 1로 설정해야함
    스키마 member 테이블에서 스패너 모양 클릭
    */
    for(signup_index in req.body){
        member_key.push(signup_index);
        member_value.push(req.body[signup_index]);
        count++;
    }       

    //회원가입 전 [선택]동의 여부
    member_key[8]='chosen_agree'
    member_value[8]=member_chosen_agree;

    //비번 암호화 해시키 내장함수 crypto 사용
    function change_hash(){
        const crypto =require('crypto');
        member_value[6]= crypto.createHash('sha512').update(member_value[6]).digest('base64');    
    }

    // 비동기화
    async function fillout_db(){
        const hash_pw=await change_hash(); // 암호화 될 때까지 기다림
        //치환자 사용, member_value가 파라미터
        var sql= 'INSERT INTO member (member_email, member_name, member_sex, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree) VALUES(?,?,?,?,?,?,?,?,?)';
        connection.query(sql,member_value,function(err,rows,fields){
            if(err){
                res.send('member_login_result:  "Error"')
            }
            else{
                res.send('member_login_result:"Success"')            
            }
        });    
    }

    fillout_db();
    
})
 
 
/**
 * 회원 동일한 이메일 있는지 확인, http://localhost:3000/idle/has-same-email
 *  
*/
app.post('idle/has-same-email',(req,res) =>{
    var check_email=new Array(); // 포스트맨에서 받은 값
    let check_status="사용가능"; // 동일한지 아닌지 상태 값, 
 
    // 포스트맨에서 얻어온 이메일 값
    for(k in req.body){
        check_email.push(req.body[k]);
    }

    // db에서 member_email 값들 가져와서 check_email 과 같은지 비교
    connection.query('SELECT member_email FROM member', function(err, result){

        var email_list=new Array(); // member_email 값

        // 이메일이 일치(존재)하면 사용불가, 없으면 사용가능
        for(k in result){
            email_list.push(result[k].member_email);
             if(check_email==email_list[k]){
                check_status="사용불가";
            }
        }

        // 사용가능 상태에 따라 응답을 보냄
        if(check_status == "사용불가"){
            res.send('member_has_same_email:"Error"')
        }else{
            res.send('member_has_same_email:"Success"')
        }
    })
})
 
/**
 * 회원 이메일 인증키 보내기, http://localhost:3000/idle/sign-up/send-email
 * 
*/
app.post('/idle/sign-up/send-email', (req,res) =>{
    var nodemailer = require('nodemailer'); // 모듈 불러오기

    // 난수 6자리 생성
    var Raondom_Key=function(min,max){
        var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
        return ranNum;
    }

    const send_key=Raondom_Key(111111,999999)

    //포스트맨에서 입력받은 키 값(이메일) 지정
    var send_email=new Array(); 
    for(k in req.body){
        send_email.push(req.body[k]);
    }

    //보내는 사람 설정
    var transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user : '',
            pass : ''
        }
    });
    // 인증메일 보내기 
    transporter.sendMail({    
        from : '',
        to : send_email,
        subject : '메일 주인?',
        text : "인증키 입니다 : " + send_key // 난수 입력
    }, function(err, info) {

        var sql = 'INSERT INTO email_auth (email_key, email_date, rec_email) VALUES(?,?,?)';
        var params = [send_key, '1997-05-28', send_email];//파라미터를 값들로 줌(배열로 생성)
        connection.query(sql, params, function(err, rows, fields){// 쿼리문 두번째 인자로 파라미터로 전달함(값들을 치환시켜서 실행함. 보안과도 밀접한 관계가 있음(sql injection attack))
            if(err) console.log(err);
        });

        if ( err ) {
            res.send('email_check:"Error"');
        }
        else {
            res.send('email_check:"Success"');
        }
    });
})


/**
 * 회원 이메일 인증키 입력, http://localhost:3000/idle/sign-up/check-email-num
 * 
*/
app.post('/idle/sign-up/check-email-num', (req, res)=>{
    

})



app.listen(port, () => {
    console.log(`listen ${port}`)
})
 
 


 
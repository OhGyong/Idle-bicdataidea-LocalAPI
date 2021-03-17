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
        agree_check[0]=req.body[k];
    }

    // 넘어온 값이 0인지 1인지에 따라 member_chosen_agree 값을 맞춰줌 → 회원가입에서 사용
    if(agree_check == 1){
        member_chosen_agree=1;
        res.send("선택함");
    }else{
        member_chosen_agree=0;
        res.send("선택안함");
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

    //각 array에 매칭
    for(signup_index in req.body){
        member_key[count]=signup_index;
        member_value[count]=req.body[signup_index];
        count++;
    }

    member_key[8]='chosen_agree'
    member_value[8]=member_chosen_agree;

    //비번 암호화 해시키 내장함수 crypto 사용
    const crypto =require('crypto');
    member_value[6]=crypto.createHash('sha512').update(member_value[6]).digest('base64');
    
    //치환자 사용, member_value가 파라미터
    var sql= 'INSERT INTO member (member_email, member_name, member_sex, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree) VALUES(?,?,?,?,?,?,?,?,?)';
    connection.query(sql,member_value,function(err,rows,fields){
        if(err) console.log(err);
        console.log(rows.insertId);
    });

    res.send("Success")//성공 시 응답

})

app.listen(port, () => {
    console.log(`listen ${port}`)

})


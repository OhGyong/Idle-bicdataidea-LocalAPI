# 에러처리 throw로 날려서 한번에 처리하기 </br>
회원가입 API 부분

## 기존 코드

```
app.post('/idle/signup/fillout',(req, res)=>{

    // POSTMAN에서 넘겨 받은 json을 key|value 나누는 작업
    var member_key = new Array(); 
    var member_value = new Array();

    
    //Mysql workbench에서 member_ban과 chosen_agree에 default 값 0으로로 설정해야함
    for(signup_index in req.body){
        member_key.push(signup_index);
        member_value.push(req.body[signup_index]);
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
                    connection.query(sql, parm_time, function(err, rows, fields){
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
```

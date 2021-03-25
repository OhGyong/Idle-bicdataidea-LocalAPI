# 콜백함수에서 throw로 날려서 한번에 처리하기 </br>
회원가입 API 부분


## 기존 : throw err 를 통해서 catch에서 err를 한번에 처리

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
                    throw err; // 수정된 곳
               }else{
                    // 현재 회원가입한 날짜 
                    var now_time = new Date();
                    // member_log 테이블에 현재 시간 삽입
                    var sql= 'INSERT INTO member_log (member_email,member_log_join) VALUES(?,?)';
                    var parm_time = [member_value[0], now_time];
                    connection.query(sql, parm_time, function(err){
                        if(err){
                            throw err; // 수정된 곳
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
            console.log(err)
            var error_res={
                "member_login_result" : "회원가입 실패"
            }
            return res.send(error_res);
        }
    }
    fillout_db();  
});
```

**결과** </br>
![image](https://user-images.githubusercontent.com/52282493/112489851-2f336000-8dc2-11eb-9150-453b443969fc.png)
![image](https://user-images.githubusercontent.com/52282493/112490000-568a2d00-8dc2-11eb-9a36-1ec14487a134.png) </br>
---
`throw err` 처리가 되어서 `catch(err)` 로 넘어가지 않음 → 포스트맨에서 응답창에 에러 </br>
콘솔 창에서 PRIAMRY 오류라고 뜸

**원인**
비동기 콜백이 실행될 때 catch 블록이 존재하지 않기 때문에 비동기 예외는 catch 할 수 없음</br>
때문에 프로그램이 종료됨

## 수정 코드

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
```

성공
![image](https://user-images.githubusercontent.com/52282493/112487873-6bfe5780-8dc0-11eb-9c10-46c3cec7b1c2.png)

실패
![image](https://user-images.githubusercontent.com/52282493/112488067-95b77e80-8dc0-11eb-8bd5-2f4a6de52fd1.png)
![image](https://user-images.githubusercontent.com/52282493/112488930-53427180-8dc1-11eb-84a0-8637a92ddf06.png)

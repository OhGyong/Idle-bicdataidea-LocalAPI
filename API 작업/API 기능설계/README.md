# API 기능설계

* 상태 코드
    * 2xx → 보통 200으로 사용, 클라이언트의 요청을 서버가 정상적으로 처리
        * 201 → 클라이언트의 요청을 서버가 정상적으로 처리했고 새로운 리소스가 생김
        * 202 → 클라이언트의 요청은 정상적이나, 서버가 아직 요청을 완료하지 못함
        * 204 → 클라이언트의 요청은 정상적이지만, 컨텐츠를 제공하지 않음

    * 4xx → 클라이언트의 요청이 유효하지 않아 서버가 해당 요청을 수행하지 않음
        * 401 → 클라이언트가 권한이 없기 때문에 작업을 진행할 수 없는 경우(인증이 안되서)
        * 403 → 클라이언트가 권한이 없기 때문에 작업을 진행할 수 없는 경우(권한이 없는 자원에 접글할 때)
        * 404 → 클라이언트가 요청한 자원이 존재하지 않다.
        * 405 → 클라이언트의 요청이 허용되지 않는 메소드인 경우
        * 409 → 클라이언트의 요청이 서버의 상태와 충돌이 발생한 경우
        * 429 → 클라이언트가 일정 시간 동안 너무 많은 요청을 보낸 경우
        
    * 5xx → 서버 오류로 인해 요청을 수행할 수 없음
    

* URL 규칙
    * 마지막에 `/`를 포함하지 않는다.
    * `_` 대신 `-`를 사용한다.
    * 소문자를 사용한다.
    * 동작(행위)은 포함시키지 않는다.

* HTTP Headers
    * `application/json`을 우선으로 제공한다.

* HTTP methods 4가지
    * POST(생성, 쓰기) : 서버에 주어진 리소스의 정보를 요청한다.
    * GET(조회, 읽기) : 서버에 리소스를 제출한다.
    * PUT(업데이트, 수정) : 서버에 리소스를 제출한다.(POST와 달리 리소스 갱신 시 사용)
    * DELETE(삭제) : 서버에 주어진 리소스를 삭제 요청한다.

---
---

## 회원 관련API

### 회원가입 전 이용약관 동의

* **URL**

[POST] http://{IP}:{PORT}/idle/signup/agree

* **동작설명**

    이용약관에서 `[선택]`에 관한 정보를 확인을 눌렀을 때(누르면 1) 그 정보를 파라미터로 넘겨줘서 member 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{signup_agree:"동의(1)"}`
    </br>OR</br>
    `{signup_agree:"비동의(0)"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{signup_agree:"Error"}`

---

### 회원가입

* **URL**

    [POST] http://{IP}:{PORT}/idle/signup/fillout

* **PARAM**
```(json)
{    
    "member_email" : 사용자 이메일,
    "member_name" : 사용자 이름,
    "member_gender" : 사용자 성별,
    "member_birth" : 사용자 생년월일,
    "member_company" : 사용자 소속,
    "member_state" : 사용자 거주지,
    "member_pw" : 사용자 비밀번호,
    "member_phone" : 사용자 핸드폰번호
}
```

* **동작설명**

    member 테이블에서 동일 이메일이 있는지, 이메일 인즘검사를 했는지, 파라미터에 null 값이 있는지 확인 후 문제가 없으면 member 테이블에 추가한다.

    회원가입 시간은 member_log, member_login_log 테이블에 추가

* **성공시 응답**

    * **Code:** 200 </br>
    `{member_login_result:"회원가입 성공"}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{member_login_result:"member 테이블 에러"}`
    </br>OR</br>
_    `{member_login_result:"member_log 테이블 에러"}`

---

### 회원 이메일 중복 및 폐기 확인

* **URL**

    [POST] http://{IP}:{PORT}/idle/has-same-email

* **PARAM**
    ```(json)
    {
        "same_email" : 사용자 이메일
    }
    ```

* **동작설명**

    member 테이블에서 사용자 이메일을 조회하여 입력한 이메일과 비교하여 동일한 이메일이 있는지 확인한다.

* **성공시 응답**

     * **Code:** 200 </br>
    `{member_has_same_email:"아이디 생성가능(동일 아이디 없음)"}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{member_has_same_email:"아이디 생성불가(동일 아이디 존재)"}`

---

### 회원 이메일 인증키 보내기

* **URL**

    [POST]] http://{IP}:{PORT}/idle/sign-up/send-email

* **PARAM**
    ```(json)
    {
        "rec_email" : 수신 이메일
    }
    ```

* **동작설명**

    인증 버튼 누르면 난수 6자리를 생성해서 메일 전송하고 email_auth 수신이메일과 난수 6자리, 유효시간까지 테이블에 저장한다. </br>

* **성공시 응답**

     * **Code:** 200 </br>
    `{send_email:"이메일 전송 성공"}`

* **실패시 응답** 

    * **Code:** 400 </br>
    `{send_email:"db 입력 실패"}`
    </br>OR</br>
    `{send_email:"메일 전송 실패"}`

---

### 회원 이메일 인증키 입력

* **URL**

    [POST]] http://{IP}:{PORT}/idle/sign-up/check-email-num

* **PARAM**
    ```(json)
    {
        "check_email_num" : 난수번호
    }
    ```

* **동작설명**

    난수키를 입력하면 email_auth 테이블에서 수신이메일 체크해서 인증확인함

* **성공시 응답**

     * **Code:** 200 </br>
    `{check_email_num:"인증이 완료되었습니다."}`

* **실패시 응답** 

    * **Code:** 400 </br>
    `{check_email_num:"일치하는 메일 없음"}`
    </br>OR</br>
    `{check_email_num:"이미 완료되었거나 폐기된 키 입니다."}`
    </br>OR</br>
    `{check_email_num:"키값이 다르거나 없습니다."}`
    
    

---

### 회원 비밀번호 찾기

* **URL**

    [POST] http://{IP}:{PORT}/idle/find-password

* **PARM**

    ```(json)
    {
        "member_id" : 사용자 이메일
    }
    ```

* **동작설명**

    사용자 이메일을 입력하고 비밀번호 찾기를 누르면 member 테이블에서 일치하는 이메일이 있는지 조회한다.

    pw_find 테이블에서 비밀번호 키 값을 생성하여 `idle/reset_password/해시키` url을 해당 이메일로 전송한다.

    전송한 다음 유효기간을 설정한다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{find_password}:"메일이 전송되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{find_password:"Error"}`

---

### 회원 비밀번호 재설정

* **URL**

    [PUT]] http://{IP}:{PORT}/idle/reset-password/해시키

* **PARAM**

    ```(json)
    {
        "member_pw" : 사용자 비밀번호
    }
    ```

* **동작설명**

    재설정 페이지에 오게되면 폐기처리하여 dispose 값을 1로한다. </br>    
    member 테이블의 member_pw 값을 새로 입력한 값으로 변경한다. </br>
    재설정이 되면 pw_edit 값을 1로 변경한다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_rest_password:"비밀번호 재설정"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_rest_password:"비밀번호 재설정 "}`

---
### 삭제
### 회원 비밀번호 재확인 (회원정보수정 전)

* **URL**

    [POST] http://{IP}:{PORT}/idle/update/check-password

* **PARM**

    ```(json)
    {
        "member_pw" : 사용자 비밀번호
    }
    ``` 

* **동작설명**

    비밀번호 입력시 member 테이블에서 비밀번호가 일치하는지 확인


    * **성공 시 응답**

    * **Code:** 200 </br>
    `{check_password}:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{check_password:"Error"}`

---

### 회원정보 수정페이지


* **URL**

    [PUT] http://{IP}:{PORT}/idle/mypage/update

* **PARAM**
    ```(json)
    {
        "member_email" : 사용자 이메일,
        "member_name" : 사용자 이름,
        "member_pw" : 사용자 비밀번호,
        "member_sex" : 사용자 성별,
        "member_birth" : 사용자 생년월일,
        "member_phone" : 사용자 핸드폰번호
        "member_company" : 사용자 소속,
        "member_state" : 사용자 거주지
    }
    ```

* **동작설명**

    db에서 해당회원의 이메일, 이름, 비밀번호, 성별, 생년월일, 핸드폰번호, 소속, 거주지를 가져온다

* **성공시 응답**

     * **Code:** 200 </br>
    `{member_update:"멤버 정보: "+ rows[0]}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{member_update:"Error"}`

---

### 회원정보 수정

* **URL**

    [PUT] http://{IP}:{PORT}/idle/mypage/update/modify

* **PARAM**
    ```(json)
    {
        "member_email" : 사용자 이메일,
        "member_name" : 사용자 이름,
        "member_pw" : 사용자 비밀번호,
        "member_sex" : 사용자 성별,
        "member_birth" : 사용자 생년월일,
        "member_phone" : 사용자 핸드폰번호
        "member_company" : 사용자 소속,
        "member_state" : 사용자 거주지
    }
    ```

* **동작설명**

    회원정보수정창에서 입력받은 값으로 member 테이블의 값을 수정한다.

* **성공시 응답**

     * **Code:** 200 </br>
    `{member_modify:"Success"}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{member_modify:"Error"}`

---

### 회원 로그인

* **URL**

    [POST]] http://{IP}:{PORT}/idle/signin

* **PARAM**
    ```(json)
    {
        "member_email" : 사용자 이메일
        "member_pw" : 사용자 비밀번호
    }
    ```

* **동작설명**

    입력된 사용자 이메일과 비밀번호를 member 테이블에서 조회해서 일치하는 정보가 있는지 확인. 단, 정지여부 번호가 1이면 로그인 불가능.

    로그인이 되면 해당 시간을 member_log와 member_login_log 테이블에 추가

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_signin:"로그인에 성공하였습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_signin:"로그인에 실패하였습니다."}`
    </br>OR</br>
    `{member_signin:"일치하는 아이디가 없거나 비밀번호가 틀렸습니다."}`
    
    
---


### 회원 로그아웃

* **URL**

    [POST] http://{IP}:{PORT}/idle/logout
    </br>OR</br>
    [DELETE] http://{IP}:{PORT}/idle/logout

* **동작설명**

    로그아웃 버튼 누름(세션 날리고 홈으로 이동하는 것은 스크립트에서)

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_logout:"Success"}`

* **실패 시 응답**

     * **Code:** 400 </br>
    `{member_logout:"Error"}`

---


### 회원탈퇴

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/member-secede

* **동작설명**

    member 테이블에서 member_secede 값을 1로 변경시켜준다.
    </br>일치하는 이메일 secede 값이 0인 경우
        
* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_secede:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_secede:"Error"}`

---


### 회원 포인트 현황

* **URL**

[GET] http://{IP}:{PORT}/idle/mypage/point/state

* **동작설명**

    member 테이블에서 보유 포인트, 누적 포인트, 사용 포인트 가져오고 누적 포인트를 정렬해서 랭킹에 사용

* **성공 시 응답**

    * **Code:** 200 </br>
    `{point_state:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{point_state:"Error"}`

---

### 회원 포인트 사용내역

* **URL**

[GET] http://{IP}:{PORT}/idle/mypage/point/use

* **동작설명**

    point 테이블에서 사용 내역, 날짜 가져오기 </br>
    사용한 포인트는 ??

* **성공 시 응답**

    * **Code:** 200 </br>
    `{point_use:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{point_use:"Error"}`

---

### 회원 포인트 적립내역

* **URL**

[GET] http://{IP}:{PORT}/idle/mypage/point/save

* **동작설명**

    idea 테이블에서 아이디어 제목, 얻은 포인트, 적립 날짜 가져오기

* **성공 시 응답**

    * **Code:** 200 </br>
    `{point_save:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{point_save:"Error"}`

---

### 회원 아이디어 목록

* **URL**

[GET] http://{IP}:{PORT}/idle/mypage/idea

* **동작설명**

    idea 테이블에서 현재 로그인한 이메일과 일치하는 이메일을 찾아서 아이디어 리스트들을 내보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_list:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_list:"Error"}`

---

### 관심사업 등록

* **URL**

[GET] http://{IP}:{PORT}/idle/mypage/marked-on

* **동작설명**

    공고정보게시판에서 즐겨찾기를 눌러서 inter_anno 테이블에서 anno_id를 조회하여 게시물을 가져온다. 

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_markon:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_markon:"Error"}`

---

### 관심사업 해제

* **URL**

[GET] http://{IP}:{PORT}/idle/mypage/marked-off

* **동작설명**

    게시물을 즐겨찾기 해제하면 inter_anno 테이블에서 해당 게시물을 지운다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_markoff:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_markoff:"Error"}`


### 관심사업 목록

* **URL**

[GET] http://{IP}:{PORT}/idle/mypage/marked-off

* **동작설명**

    inter_anno 테이블, anno 테이블, anno_img_dir 테이블을 join해서 값을 가져온다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_marked:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_marked:"Error"}`

---
---
---




## 관리자 관련 API

### 관리자 등록, 삭제

  * **URL**

  [POST] http://{IP}:{PORT}/idle/admins/enroll/fillout

  * **PARAM**

    ```(json)
    {
        "admin_email" : 사용자 이메일,
        "admin_name" : 사용자 이름,
        "admin_gender" : 사용자 성별,
        "admin_birth" : 사용자 생년월일,
        "admin_state" : 사용자 거주지,
        "admin_pw" : 사용자 비밀번호,
        "admin_phone" : 사용자 핸드폰번호
        
        
          ```

* **동작설명**

    admin 테이블에서 동일 이메일가 있는지, 파라미터에 null 값이 있는지 확인 후, 없으면 admin 테이블에 추가한다.

    관리자 등록 시간은 admin_log 테이블에 추가

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin-signup:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin-signup:"Error"}`

---

### 관리자 이메일 중복 확인

* **URL**

    [GET] http://{IP}:{PORT}/admins/idle/has-same-id

* **PARAM**
    ```(json)
    {
        "same_email" : 관리자 이메일
        
          ```

* **동작설명**

    admin 테이블에서 사용자 이메일을 조회하여 입력한 이메일과 비교하여 동일한 이메일이 있는지 확인한다.

* **성공시 응답**

     * **Code:** 200 </br>
    `{admin_has_same_id:"Success"}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{admin_has_same_id:"Error"}`

---


### 관리자 로그인

* **URL**

    [POST]] http://{IP}:{PORT}/admins/idle/signin

* **PARAM**

    ```(json)
    {
        "admin_email" : 관리자 이메일
        "admin_pw" : 관리자 비밀번호
    }
    ```

* **동작설명**

    입력된 관리자 이메일과 비밀번호를 admin 테이블에서 조회해서 일치하는 정보가 있는지 확인.

    로그인이 되면 해당 시간을 admin_log 테이블에 추가

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_signin:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_signin:"Error"}`

---


### 관리자 로그아웃

* **URL**

    [POST] http://{IP}:{PORT}/admins/idle//logout

* **동작설명**

    로그아웃 버튼이 눌렸다고 인식(세션날리고 홈으로 이동하는 것은 스크립트에서)

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_logout:"Success"}`

* **실패 시 응답**

     * **Code:** 200 </br>
    `{admin_logout:"Error"}`

---


### 관리자 탈퇴처리

* **URL**

    [DELETE] http://{IP}:{PORT}/admins/idle/admin-secede

* **동작설명**
    
    관리자가 탈퇴를 할 경우, admin 테이블에서 관리자의 이메일, 이름, 성별, 생년월일 값을 가져오고 탈퇴한 일자를 계산해서 admin_sign_out 테이블에 추가한다.</br> 
    이후 admin 테이블에서 해당 사용자를 지운다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_secede:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_secede:"Error"}`

---


### 회원 리스트 목록

* **URL**

    [GET]] http://{IP}:{PORT}/admins/idle/member-list

* **동작설명**

    관리자가 회원 리스트를 확인할 수 있음 </br>
    member 테이블에서 이메일, 이름, 가입일자, 정지/탈퇴여부까지만 보여줌

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_list:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_list:"Error"}`

---

### 회원 리스트 검색

* **URL**

    [GET]] http://{IP}:{PORT}/admins/idle/member-list?검색어

* **PARAM**

    ```(json)
    {
        "member_inform" : 회원 이메일 or 이름
    }
    ```

* **동작설명**

    사용자 이메일 or 이름 (둘 중 하나)을 검색하면 해당 member 테이블에서 해당 사용자를 표시

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_search:"Error"}`

---


### 회원 상세 페이지

* **URL**

    [GET] http://{IP}:{PORT}/admins/idle/member-list/번호

* **동작설명**

    member 테이블에서 회원 정보를 다 가져옴 (회원정보수정 페이지처럼 쭉 보여줌)

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_list_detail}:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_list_detail:"Error"}`


### 회원 정지처리

* **URL**

    [PUT] http://{IP}:{PORT}/admins/idle/member_list/번호/ban

* **PARAM**

    ```(json)
    {
        "member_email" : 회원 이메일 
        "member_ban_reason" : 정지사유
    }
    ```

* **동작설명**

    정리를 하려는 사용자를 선택해서 정지사유를 적고 확인을 하면 member_ban 테이블에 기록되고, member 테이블에서 해당 사용자의 member_ban 값을 1로 변경된다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_ban:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_ban:"Error"}`

---

### 회원 상세로그 페이지

* **URL**

    [PUT] http://{IP}:{PORT}/admins/idle/member_list/번호/log

* **동작설명**

    member_login_log 테이블에서 member_login 값 다 보여줌

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_ban:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_ban:"Error"}`

---

### 회원 로그 페이지


* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/log/member

* **동작설명**

    member_log 테이블에서 사용자 로그들을 가져옴

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_log:"Error"}` 

---

### 회원 로그 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/log/member?검색어

* **PARAM**
    ```(json)
    {
        "member_email" : 사용자 이메일
    }
    ```

* **동작설명**

    관리자가 사용자 이메일을 입력하면 member_log 테이블에서 일치하는 아이디를 찾아서 값을 보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_log_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_log_search:"Error"}` 

---

### 회원 로그인 로그 

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/log/member/번호

* **동작설명**

    회원 로그 페이지
    에서 클릭할 경우 member_login_log 테이블에서 사용자의 로그인 시간 리스트를 확인


* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_login_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_login_log:"Error"}` 

---
### 관리자 로그 페이지


* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/admin-log

* **동작설명**

    admin_log 테이블에서 관리자 로그들을 가져옴

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_log:"Error"}` 

---

### 관리자 로그 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/admin-log?검색어

* **PARAM**

    ```(json)
    {
        "admin_email" : 사용자 이메일
    }
    ```

* **동작설명**

    관리자가 관리자 이메일을 입력하면 admin_log 테이블에서 일치하는 아이디를 찾아서 테이블의 값을 보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_log_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_log_search:"Error"}` 

---

### 문의게시판 로그 페이지


* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/cs-log

* **동작설명**

    cs_log 테이블에서 문의게시판 로그들을 가져옴

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_log:"Error"}` 

---

### 문의게시판 로그 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/cs-log?검색어

* **PARAM**
    ```(json)
    {
        "cs_title" : 문의글 제목
    }
    ```

* **동작설명**

    관리자가 문의글 제목을 입력하면 cs 테이블에서 일치하는 제목을 찾고 연결된 cs_log 테이블에서 테이블의 값을 보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_log_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_log_search:"Error"}` 

---

### 공지사항 로그 페이지


* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/notice-log

* **동작설명**

    notice_log 테이블에서 공지사항 로그들을 가져옴

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_log:"Error"}` 

---

### 공지사항 로그 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/notice-log?검색어

* **PARAM**

    ```(json)
    {
        "notice_title" : 공지사항 제목
    }
    ```

* **동작설명**

    관리자가 공지사항 제목을 입력하면 notice 테이블에서 일치하는 제목을 찾고 연결된 notice_log 테이블에서 값을 보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_log_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_log_search:"Error"}` 

---

### 고객센터 로그 페이지


* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/contact-log

* **동작설명**

    contact_log 테이블에서 고객센터 로그들을 가져옴

* **성공 시 응답**

    * **Code:** 200 </br>
    `{contact_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{contact_log:"Error"}` 

---

### 고객센터 로그 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/contact-log?검색어

* **PARAM**

    ```(json)
    {
        "contact_title" : 고객센터 문의글 제목
    }
    ```

* **동작설명**

    관리자가 고객센터 문의글 제목을 입력하면 contact 테이블에서 일치하는 제목을 찾고 연결된 contact_log에서 값을 보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{contact_log_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{contact_log_search:"Error"}` 

---

### 아이디어 로그 페이지


* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/idea-log

* **동작설명**

    idea_log 테이블에서 아이디어 로그들을 가져옴

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_log:"Error"}` 

---

### 아이디어 로그 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/idea-log?검색어

* **PARAM**
    ```(json)
    {
        "idea_title" : 아이디어 제목
    }
    ```

* **동작설명**

    관리자가 아이디어 제목을 입력하면 idle 테이블에서 일치하는 제목을 찾고 연결된 idea_log 테이블에서 값을 보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_log_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_log_search:"Error"}` 

---

### 공고정보 로그 페이지


* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/anno-log

* **동작설명**

    anno_log 테이블에서 공고정보 로그들을 가져옴

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_log:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_log:"Error"}` 

---

### 공고정보 로그 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/anno-log/검색어

* **PARAM**

    ```(json)
    {
        "anno_title" : 공고 제목
    }
    ```

* **동작설명**

    관리자가 공고 제목을 입력하면 anno 테이블에서 일치하는 제목을 찾고 연결된 anno_id 테이블에서 값을 보냄

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_log}:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_log:"Error"}` 

---
---




## 포인트 관련 API

### 관리자의 포인트 부여 및 회수

* **URL**

    [PUT]] http://{IP}:{PORT}/idle/admins/point-process

* **PARAM**

    ```(json)
    {
        "admin_point" : 포인트 점수 // +,- 값
    }
    ```

* **동작설명**

    관리자가 아이디어를 보고 포인트를 부여하거나 회수한다. </br>
    idea 테이블에서 </br>
    `얻은 포인트=얻은 포인트+admin_point` 로 변경 </br>
    member 테이블에서 </br>
    `사용자 포인트=사용자 포인트+admin_point` </br>
    `누적 포인트=누적 포인트+admin_point` 로 변경

    
    
    * **성공 시 응답**

    * **Code:** 200 </br>
    `{point_process:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{point_process:"Error"}`

---

### 회원 포인트 사용

* **URL**

    [PUT]] http://{IP}:{PORT}/idle/use-point

* **PARAM**

    ```(json)
    {
        "use_point" : 사용 포인트
    }
    ```

* **동작설명**

    1000포인트 당 상품권 1만원으로 변경 가능 </br>
    회원이 포인트를 입력하면 member 테이블에서 </br>
    `사용자 포인트=사용자 포인트-사용 포인트`
    `사용 포인트=사용 포인트+사용 포인트(PARAM)` 기록된다. </br>
    point 테이블에서는 사용 날짜와 내역이 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{use-point:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{use-point:"Error"}`

---
---




## 회원 관점 게시물 관련 API

### 공고정보 게시판 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/announcement

* **동작설명**

    공고정보 게시판으로 가는 버튼을 클릭하면 anno 테이블에서 게시물들을 가져옴 </br>
    단, anno_log 테이블에서 삭제 여부가 1인 게시물은 목록에 보이지 않음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_announcement:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_announcement:"Error"}`

---

### 공고정보 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/announcement/anno-look

* **동작설명**

    공고정보 게시물을 클릭하면 anno 테이블에서 공고내용을 펼침

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_anno_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_anno_look:"Error"}`

---

### 공고정보 게시판 출처 링크 바로가기

* **URL**

    [GET]] http://{IP}:{PORT}/idle/board/announcement/anno-link

* **동작설명**

    출처 링크 바로가기를 누르면 anno 테이블에서 anno_link를 불러와서 해당 링크로 이동

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_anno_link:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_anno_link:"Error"}`

---

### 공고정보 게시판 게시물 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/announcement?검색어

* **동작설명**

    사용자가 단어를 입력하면 anno 테이블에서 해당 제목이 들어간 게시물들을 나열

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_anno_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_anno_search:"Error"}`

---

### 공지사항 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/notice

* **동작설명**

    공지사항으로 가는 버튼을 클릭하면 notice 테이블에서 게시물들을 가져옴 </br>
    단, notice_log 테이블에서 삭제 여부가 1인 게시물은 목록에 보이지 않음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_notice:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_notice:"Error"}`

---

### 공지사항 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/notice/게시물 번호

* **동작설명**

    게시물을 클릭하면 notice 테이블에서 해당 게시물 정보를 가져와서 열어줌

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_notice_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_notice_look:"Error"}`

---

### 공지사항 게시물 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/notice?검색어

* **동작설명**

    사용자가 단어를 입력하면 notice 테이블에서 해당 제목이 들어간 게시물들을 나열

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_notice_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_notice_search:"Error"}`

---

### 공지사항 게시물 첨부파일 다운로드

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/notice/download

* **동작설명**

    첨부파일을 클릭하면 notice_file_dir 테이블에서 첨부파일 경로를 찾아서 다운로드

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_notice_download:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_notice_download:"Error"}`

---

### 문의게시판 게시물 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/cs

* **동작설명**

    문의게시판으로 가는 버튼을 클릭하면 cs 테이블에서 게시물들을 가져옴 </br>
    단, cs_log 테이블에서 문의글 삭제 여부가 1인 게시물은 목록에 보이지 않음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_cs:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_cs:"Error"}`

---

### 문의게시판 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/cs/게시물 번호

* **동작설명**

    게시물을 클릭하면 cs 테이블에서 해당 게시물 정보를 가져와서 열어줌 </br>
    단, 비밀글 여부가 1인 경우 자기 계정인 경우에만 볼 수 있음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_cs_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_cs_look:"Error"}`

---

### 문의게시판 게시물 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/cs?검색어

* **동작설명**

    사용자가 단어를 입력하면 cs 테이블에서 해당 제목이 들어간 게시물들을 나열 </br>
    단, 비밀이라고 치면 비밀글이여도 검색어에 나오지 않음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_cs_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_cs_search:"Error"}`

---

### 문의게시판 게시물 업로드

* **URL**

    [POST] http://{IP}:{PORT}/idle/board/cs/write

* **PARAM**

    ```(json)
    {
        "cs_contents" : 문의글 내용
        "cs_title" : 문의글 제목
        "cs_secret" : 비밀글 여부
        "cs_file_dir" : 첨부 파일
    }
    ```

* **동작설명**

    회원이 문의게시판을 올리면 내용, 제목, 비밀글 여부가 cs 테이블에 추가되고 첨부파일은 cs_file_dir에 기록 </br>
    비밀글이 체크되면 제목에 [비밀글] 이 붙음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_write:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_write:"Error"}`

---

### 문의게시판 게시물 첨부파일 다운로드

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/cs/download

* **동작설명**

    첨부파일을 클릭하면 cs_file_dir 테이블에서 첨부파일 경로를 찾아서 다운로드

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_cs_download:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_cs_download:"Error"}`

---

### 문의게시판 게시물 수정

* **URL**

    [PUT] http://{IP}:{PORT}/idle/board/cs/update

* **PARAM**

    ```(json)
    {
        "update_cs_contents" : 수정한 문의글 내용
        "update_cs_title" : 수정한 문의글 제목
        "update_cs_file_dir" : 첨부파일
    }
    ```

* **동작설명**

    회원이 문의게시판을 수정하면 수정한 내용과 제목이 cs 테이블에 추가</br>
    첨부파일은 cs_file_dir에 기록</br>
    수정전의 내용은 cs_log 테이블에 기록 

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_update:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_update:"Error"}`

---   

### 아이디어 플랫폼 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/idea

* **동작설명**

    아이디어 플랫폼으로 가는 버튼을 클릭하면 idea 테이블에서 게시물들을 가져옴 </br>
    게시물 제목에 *** 보호 처리 </br>
    단, idea_log 테이블에서 아이디어 삭제 여부가 1인 게시물은 목록에 보이지 않음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_idea:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_idea:"Error"}`

---

### 아이디어 플랫폼 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/idea/게시물 번호

* **동작설명**

    게시물을 클릭하면 idea 테이블에서 해당 게시물 정보를 가져와서 열어줌 </br>
    단, 본인이 작성한 게시물만 볼 수 있음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{menber_idea_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{menber_idea_look:"Error"}`

---

### 아이디어 플랫폼 게시물 업로드

 * **URL**

    [POST] http://{IP}:{PORT}/idle/board/idea/write

* **PARAM**

    ```(json)
    {
        "idea_title" : 아이디어 제목
        "idea_contents" : 아이디어 내용
    }
    ```

* **동작설명**

    회원이 아이디어를 올리면 일괄적으로 500p를 받아서 얻은 포인트와 적립 날짜, 제목, 내용을 idea 테이블에 기록</br>
    member 테이블의 사용자 포인트, 누적포인트에도 기록</br>
    `사용자 포인트=사용자 포인트+500`
    `누적 포인트=누적 포인트+500`

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_write:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_write:"Error"}`

---

### 아이디어 플랫폼 게시물 수정

* **URL**

    [PUT] http://{IP}:{PORT}/idle/board/idea/udpate

* **PARAM**

    ```(json)
    {
        "update_idea_title" : 수정한 아이디어 제목
        "update_idea_contents" : 수정한 아이디어 내용
    }
    ```

* **동작설명**

    사용자가 내용을 수정하면 idea_log 테이블에서 수정 전 내용과 수정일이 기록되고 idae 테이블에는 수정한 내용이 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_update:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_update:"Error"}`

---   
---




## 관리자 관점 게시물 관련 API

### 공고정보 게시판 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/announcement

* **동작설명**

    공고정보 게시판으로 가는 버튼을 클릭하면 anno 테이블에서 게시물들을 가져옴 </br>
    회원 목록과 달리 삭제여부(y/n)를 표시하여 모든 게시물을 볼 수 있음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_announcement:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_announcement:"Error"}`

---

### 공고정보 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/announcement/anno-look

* **동작설명**

    공고정보 게시물을 클릭하면 anno 테이블에서 공고내용을 펼침

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_anno_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_anno_look:"Error"}`

---

### 공고정보 게시판 출처 링크 바로가기

* **URL**

    [GET]] http://{IP}:{PORT}/idle/admins/board/announcement/anno-link

* **동작설명**

    출처 링크 바로가기를 누르면 anno 테이블에서 anno_link를 불러와서 해당 링크로 이동

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_anno_link:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_anno_link:"Error"}`

---

### 공고정보 게시판 게시물 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/announcement?검색어

* **동작설명**

    단어를 입력하면 anno 테이블에서 해당 제목이 들어간 게시물들을 나열

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_anno_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_anno_search:"Error"}`

---

### 공고정보 게시판 게시물 업로드

* **URL**

    [POST] http://{IP}:{PORT}/idle/admins/board/anno/write

* **PARAM**

    ```(json)
    {
        "anno_title" : 공고 제목
        "anno_contents" : 공고 내용
        "anno_link" : 공고 출처 링크
        "anno_ref" : 공고 출처
        "anno_img_path" : 공고 내용 이미지 경로
    }
    ```

* **동작설명**

    관리자가 공지사항을 올리면 anno 테이블에 기록</br>
    이미지는 anno_img_dir에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_write:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_write:"Error"}`

---

### 공고정보게시판 게시물 수정할 때

* **URL**

    [PUT] http://{IP}:{PORT}/idle/admins/board/anno/udpate

* **PARAM**

    ```(json)
    {
        "update_anno_title" : 수정한 공고글 제목
        "update_anno_contents" : 수정한 공고글 내용
        "update_anno_link" : 수정한 공고 출처 링크
        "update_anno_ref" : 수정한 공고 출처
        "update_anno_img_path" : 수정한 공고 내용 이미지 경로
    }
    ```

* **동작설명**

    관리자가 공고정보게시물을 수정하면 수정한 제목, 내용, 링크, 출처, 이미지가 anno 테이블에서 변경됨 </br>
    수정전의 내용은 anno_log 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_update:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_update:"Error"}`

---   

### 공고정보게시판 게시물 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/admins/board/anno/delete

* **동작설명**

    관리자가 게시물을 삭제하면 anno_log 테이블의 삭제 여부를 1로 변경</br>

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_delete:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_delete:"Error"}`

---

### 공지사항 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/notice

* **동작설명**

    공지사항으로 가는 버튼을 클릭하면 notice 테이블에서 게시물들을 가져옴 </br>
    회원 목록과 달리 삭제여부(y/n)를 표시하여 모든 게시물을 볼 수 있음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_notice:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_notice:"Error"}`

---

### 공지사항 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/notice/게시물 번호

* **동작설명**

    게시물을 클릭하면 notice 테이블에서 해당 게시물 정보를 가져와서 열어줌

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_notice_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_notice_look:"Error"}`

---

### 공지사항 게시물 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/notice?검색어

* **동작설명**

    단어를 입력하면 notice 테이블에서 해당 제목이 들어간 게시물들을 나열

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_notice_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_notice_search:"Error"}`

---

### 공지사항 게시물 첨부파일 다운로드

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/notice/download

* **동작설명**

    첨부파일을 클릭하면 notice_file_dir 테이블에서 첨부파일 경로를 찾아서 다운로드

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_notice_download:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_notice_download:"Error"}`

---

### 공지사항 업로드

* **URL**

    [POST] http://{IP}:{PORT}/idle/admins/board/notice/write

* **PARAM**

    ```(json)
    {
        "notice_title" : 공지사항 제목
        "notice_contents" : 공지사항 내용
        "notice_-file_path" : 첨부파일 경로
    }
    ```

* **동작설명**

    관리자가 공지사항을 올리면 notice 테이블에 기록 </br>
    첨부파일은 notice_file_dir 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_write:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_write:"Error"}`

---

### 공지사항 수정할 때

* **URL**

    [PUT] http://{IP}:{PORT}/idle/admins/board/notice/udpate

* **PARAM**

    ```(json)
    {
        "update_notice_contents" : 수정한 공지사항 내용
        "update_notice_title" : 수정한 공지사항 제목
        "update_notice_-file_path" : 첨부파일 경로
    }
    ```

* **동작설명**

    관리자가 공지사항을 수정하면 수정한 내용과 제목이 notice 테이블에 기록 </br>
    수정전의 내용과 날짜는 notice_log 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_update:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_update:"Error"}`

---

### 공지사항 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/admins/board/notice/delete

* **동작설명**

    관리자가 게시물을 삭제하면 notice_log 테이블의 삭제 여부 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_delete:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_delete:"Error"}`

---

### 문의게시판 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/cs

* **동작설명**

    문의게시판으로 가는 버튼을 클릭하면 cs 테이블에서 게시물들을 가져옴 </br>
    회원 목록과 달리 삭제여부(y/n)를 표시하여 모든 게시물을 볼 수 있음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_cs:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_cs:"Error"}`

---

### 문의게시판 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/cs/게시물 번호

* **동작설명**

    게시물을 클릭하면 cs 테이블에서 해당 게시물 정보를 가져와서 열어줌 </br>
    비밀글 상관없이 모든 게시물 볼 수 있음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_cs_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_cs_look:"Error"}`

---

### 문의게시판 게시물 검색

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/cs?검색어

* **동작설명**

    단어를 입력하면 cs 테이블에서 해당 제목이 들어간 게시물들을 나열 </br>
    단, 비밀이라고 치면 비밀글이여도 검색어에 나오지 않음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_cs_search:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_cs_search:"Error"}`

---

### 문의게시판 게시물 첨부파일 다운로드

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/cs/download

* **동작설명**

    첨부파일을 클릭하면 cs_file_dir 테이블에서 첨부파일 경로를 찾아서 다운로드

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_cs_download:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_cs_download:"Error"}`

---

### 문의게시판 답변하기

* **URL**

    [POST]] http://{IP}:{PORT}/idle/admins/board/cs/answer

* **PARAM**

    ```(json)
    {
        "cs_title" : 답변 제목
        "cs_answer" : 답변 내용
        "cs_file_dir" : 첨부파일
    }
    ```

* **동작설명**

    관리자가 문의글에 답변을 하면 내용과 제목이 idea 테이블에 기록</br>
    (회원과 관리자의 세션이 다르기 때문에 제목을 db에서 불러와야함)

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_answer:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_answer:"Error"}`

---

### 문의게시판 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/admins/board/cs/delete

* **동작설명**

    관리자가 게시물을 삭제하면 cs_log 테이블의 삭제 여부 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_delete:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_delete:"Error"}`

---

### 아이디어 플랫폼 목록

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/idea

* **동작설명**

    아이디어 플랫폼으로 가는 버튼을 클릭하면 idea 테이블에서 게시물들을 가져옴 </br>
    게시물 제목에 *** 보호처리 없음 </br>
    회원 목록과 달리 삭제여부(y/n)를 표시하여 모든 게시물을 볼 수 있음

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_idea:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_idea:"Error"}`

---

### 아이디어 플랫폼 게시물 보기

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/board/idea/게시물 번호

* **동작설명**

    게시물을 클릭하면 idea 테이블에서 해당 게시물 정보를 가져와서 열어줌

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_idea_look:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_idea_look:"Error"}`

---

### 아이디어 플랫폼 게시물 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/admins/board/idea/delete

* **동작설명**

    관리자가 삭제하면 idea_log 테이블의 삭제 여부 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_delete:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_delete:"Error"}`

---
---




## 고객센터 API

### 고객센터 페이지
(내용 작성하기)

* **URL**

    [POST] http://{IP}:{PORT}/idle/contact

* **PARAM**

    ```(json)
    {
        "email" : 문의자 이메일
        "contact_title" : 문의 제목
        "contact_contents" : 문의 내용
    }
    ```

* **동작설명**

    contact 테이블에 값이 기록</br>
    만약 로그인 되어있으면 해당 이메일을 기입</br>
    제목과 내용에 글을 작성하고 완료를 누르면 관리자에게 메일 전송

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno:"Error"}`
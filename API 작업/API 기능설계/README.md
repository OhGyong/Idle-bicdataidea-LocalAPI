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

* HTTP methods
    * POST(생성), GET(조회), PUT(업데이트), DELETE(삭제) 4가지는 반드시 제공한다.



## 회원 관련API

### 회원가입

* **URL**

    [POST] http://{IP}:{PORT}/idle/signup/fillout

* **PARAM**
```(json)
{    
    "member_email" : 사용자 이메일,
    "member_name" : 사용자 이름,
    "member_sex" : 사용자 성별,
    "member_birth" : 사용자 생년월일,
    "member_company" : 사용자 소속,
    "member_state" : 사용자 거주지,
    "member_ban" : 0,
    "member_pw" : 사용자 비밀번호,
    "member_phone" : 사용자 핸드폰번호
}
```

* **동작설명**

    동일 아이디가 있는지, 파라미터에 null 값이 있는지 확인 후, member 테이블에 추가한다.

* **성공시 응답**

    * **Code:** 200 </br>
    `{login_result:"회원가입에 성공하셨습니다."}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{login_result:"동일한 아이디가 있습니다. "}`    
        OR</br>
    `{login_result:"빈 항목이 있습니다."}`


---

### 동일 아이디 확인

* **URL**

    [GET] http://{IP}:{PORT}/idle/members/has-same-id

* **PARAM**
    ```(json)
    {
        "same_email" : 사용자 이메일
    }
    ```

* **동작설명**

    member 테이블에서 사용자 이메일을 조회하여 입력한 이메일과 비교하여 동일한 아이디가 있는지 확인한다.

* **성공시 응답**

     * **Code:** 200 </br>
    `{has_same_id:"동일한 아이디가 있습니다."}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{has_same_id:"중복되는 아이디가 없습니다."}`

---

### 회원탈퇴

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/members/sign-out

* **PARAM**
    ```(json)
    {
        "out_member_email" : 사용자 이메일
        "out_member_name" : 사용자 이름
        "out_sex" : 사용자 성별
        "out_birth" : 사용자 생년월일
        "out_date" : 사용자가 탈퇴한 일자
    }
    ```
 

* **동작설명**
    
    사용자가 회원탈퇴를 할 경우, member 테이블에서 사용자의 이메일, 이름, 성별, 생년월일을 조회하고 탈퇴한 일자를 뽑아서 member_sign_out에 추가한다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{sign_out:"정상적으로 계정이 삭제되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{sign_out:"회원탈퇴에 실패하였습니다."}`

---

### 사용자 정지처리

* **URL**

    [PUT] http://{IP}:{PORT}/idle/members/ban

* **PARAM**
    ```(json)
    {
        "member_email" : 사용자 이메일
        "member_ban_reason" : 정지사유
        "member_ban_date" : 정지일자
        "admin_email" : 관리자 이메일
    }
    ```

* **동작설명**

    관리자가 정지를 하려는 사용자의 member 테이블을 조회해서 member_ban 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_ban:"정상적으로 계정이 삭제되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_ban:"회원정지에 실패하였습니다."}`


---

### 로그인

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
    
    member 테이블에서 입력된 사용자 이메일을 조회해서 사용자 비밀번호가 일치하는지 확인

* **성공 시 응답**

    * **Code:** 200 </br>
    `{signin:"정상적으로 로그인되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{signin:"비밀번호가 일치하지 않습니다."}`

---

### 로그아웃

* **URL**

    [POST]]] http://{IP}:{PORT}/idle/logout

* **동작설명**

    로그아웃 버튼이 눌렸다고 인식(세션날리고 홈으로 이동하는 것은 스크립트에서)

* **성공 시 응답**

    * **Code:** 200 </br>
    `{logout:"로그아웃 되었습니다."}`

* **실패 시 응답**

     * **Code:** 200 </br>
    `{logout:"로그아웃에 실패하였습니다."}`

---

### 비밀번호 찾기

* **URL**

    [GET]] http://{IP}:{PORT}/idle/findpassword

* **PARAM**

    ```(json)
    {
        "member_email" : 사용자 이메일
    }
    ```

* **동작설명**

    이메일을 작성해서 보내면 member 테이블에서 해당 이메일을 조회하여 일치하는지 확인

* **성공 시 응답**

    * **Code:** 200 </br>
    `{find_password}:"이메일을 보냈습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{find_password:"이메일을 입력하세요."}`
    OR</br>
    `{find_password:"해당 이메일이 없습니다."}`

---

### 비밀번호 재설정

* **URL**

    [PUT]] http://{IP}:{PORT}/idle/reset-password

* **PARAM**

    ```(json)
    {
        "member_pw" : 사용자 비밀번호
    }
    ```

* **동작설명**

    새 비밀번호를 입력하면 member 테이블의 member_pw 값을 입력한 값으로 변경한다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{rest_password:""}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{rest_password:"비밀번호는 필수입니다."}`
    OR</br>
    `{rest_password:"잘못된 접근입니다."}`

---

### 회원가입 전 이용약관 동의

* **URL**

[POST] http://{IP}:{PORT}/idle/signup/agree

* **동작설명**

    이용약관동의 시 다음페이지로 이동

* **성공 시 응답**

    * **Code:** 200 </br>
    `{signup_agree:""}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{signup_agree:""}`



---




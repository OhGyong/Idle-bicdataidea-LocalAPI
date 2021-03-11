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
    "member_pw" : 사용자 비밀번호,
    "member_phone" : 사용자 핸드폰번호
}
```

* **동작설명**

    member 테이블에서 동일 이메일가 있는지, 파라미터에 null 값이 있는지 확인 후, 없으면 member 테이블에 추가한다.

    회원가입 시간은 member_log 테이블에 추가

* **성공시 응답**

    * **Code:** 200 </br>
    `{member_login_result:"회원가입에 성공하셨습니다."}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{member_login_result:"동일한 이메일이 있습니다. "}`    
        OR</br>
    `{member_login_result:"빈 항목이 있습니다."}`


---

### 회원동일 이메일 확인

* **URL**

    [GET] http://{IP}:{PORT}/idle/members/has-same-id

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
    `{member_has_same_id:"동일한 이메일이 있습니다."}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{member_has_same_id:"중복되는 이메일이 없습니다."}`

---

### 회원탈퇴

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/members/sign-out

* **동작설명**
    
    사용자가 회원탈퇴를 할 경우, member 테이블에서 사용자의 이메일, 이름, 성별, 생년월일 값을 가져오고 탈퇴한 일자를 계산해서 member_sign_out 테이블에 추가한다. 이후 member 테이블에서 해당 사용자를 지운다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_sign_out:"정상적으로 계정이 삭제되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_sign_out:"회원탈퇴에 실패하였습니다."}`

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
    `{member_signin:"정상적으로 로그인되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_signin:"비밀번호가 일치하지 않습니다."}`
    </br>OR</br>
    `{member_signin:"정지중인 계정입니다."}`

---

### 회원 로그아웃

* **URL**

    [POST]]] http://{IP}:{PORT}/idle/logout

* **동작설명**

    로그아웃 버튼이 눌렸다고 인식(세션 날리고 홈으로 이동하는 것은 스크립트에서)

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_logout:"로그아웃 되었습니다."}`

* **실패 시 응답**

     * **Code:** 400 </br>
    `{member_logout:"로그아웃에 실패하였습니다."}`

---

### 회원 비밀번호 찾기

* **URL**

    [GET]] http://{IP}:{PORT}/idle/findpassword

* **PARAM**

    ```(json)
    {
        "member_email" : 사용자 이메일
    }
    ```

* **동작설명**

    이메일을 작성해서 보내면 member 테이블에서 해당 이메일을 조회하여 일치하는지 확인하고 일치하는 이메일이 있으면 메일 전송

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_find_password}:"이메일을 보냈습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_find_password:"이메일을 입력하세요."}`
    </br>OR</br>
    `{member_find_password:"해당 이메일이 없습니다."}`

---

### 회원 비밀번호 재설정

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
    `{member_rest_password:"비밀번호가 변경되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_rest_password:"비밀번호는 필수입니다."}`
    </br>OR</br>
    `{member_rest_password:"잘못된 접근입니다."}`

---

### 회원가입 전 이용약관 동의

* **URL**

[POST] http://{IP}:{PORT}/idle/signup/agree

* **동작설명**

    이용약관 동의 시 다음페이지로 이동

* **성공 시 응답**

    * **Code:** 200 </br>
    `{signup_agree:"이용약관에 동의 하였습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{signup_agree:"이용약관에 동의 해주세요"}`

---

### 회원 랭킹

* **URL**

[POST] http://{IP}:{PORT}/idle/rank

* **PARM**

    ```(json)
    {
        "member_rank" : 포인트 순위
        "member_name" : 사용자 이름
        "member_save_point" : 누적 포인트
    }
    ```

* **동작설명**

    member 테이블의 누적 포인트를 이용하여 순위를 매긴다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{rank:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{rank:"Error"}`

---

### 관심사업

* **URL**

[POST] http://{IP}:{PORT}/idle/members/marked

* **PARM**

    ```(json)
    {
        "member_rank" : 포인트 순위
    }
    ``` ㅡ

* **동작설명**

    공고정보게시판에서 즐겨찾기를 누르면 

* **성공 시 응답**

    * **Code:** 200 </br>
    `{rank:"Success"}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{rank:"Error"}`

---



## 관리자 관련 API

### 관리자 가입

  * **URL**

[POST] http://{IP}:{PORT}/idle/admin-signup/fillout

* **PARAM**

    ```(json)
    {
        "admin_email" : 사용자 이메일,
        "admin_name" : 사용자 이름,
        "admin_sex" : 사용자 성별,
        "admin_birth" : 사용자 생년월일,
        "admin_state" : 사용자 거주지,
        "admin_pw" : 사용자 비밀번호,
        "admin_phone" : 사용자 핸드폰번호
    }
    ```

* **동작설명**

    admin 테이블에서 동일 이메일가 있는지, 파라미터에 null 값이 있는지 확인 후, 없으면 admin 테이블에 추가한다.

    관리자가입 시간은 admin_log 테이블에 추가

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin-signup:"회원가입에 성공하였습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin-signup:"회원가입에 실패하였습니다."}`

---

### 관리자 동일 이메일 확인

* **URL**

    [GET] http://{IP}:{PORT}/idle/admins/has-same-id

* **PARAM**
    ```(json)
    {
        "same_email" : 관리자 이메일
    }
    ```

* **동작설명**

    admin 테이블에서 사용자 이메일을 조회하여 입력한 이메일과 비교하여 동일한 이메일이 있는지 확인한다.

* **성공시 응답**

     * **Code:** 200 </br>
    `{admin_has_same_id:"동일한 이메일이 있습니다."}`

* **실패시 응답**

    * **Code:** 400 </br>
    `{admin_has_same_id:"중복되는 이메일이 없습니다."}`

---

### 관리자 제외처리

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/admin/sign-out

* **동작설명**
    
    관리자가 탈퇴를 할 경우, admin 테이블에서 관리자의 이메일, 이름, 성별, 생년월일 값을 가져오고 탈퇴한 일자를 계산해서 admin_sign_out 테이블에 추가한다. 이후 admin 테이블에서 해당 사용자를 지운다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{amdin_sign_out:"정상적으로 계정이 삭제되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_sign_out:"관리자탈퇴에 실패하였습니다."}`

---


### 관리자 로그인

* **URL**

    [POST]] http://{IP}:{PORT}/idle/admin/signin

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
    `{admin_signin:"정상적으로 로그인되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_signin:"비밀번호가 일치하지 않습니다."}`

---

### 관리자 로그아웃

* **URL**

    [POST]]] http://{IP}:{PORT}/idle/admin/logout

* **동작설명**

    로그아웃 버튼이 눌렸다고 인식(세션날리고 홈으로 이동하는 것은 스크립트에서)

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_logout:"로그아웃 되었습니다."}`

* **실패 시 응답**

     * **Code:** 200 </br>
    `{admin_logout:"로그아웃에 실패하였습니다."}`

---

### 관리자 비밀번호 찾기

* **URL**

    [GET]] http://{IP}:{PORT}/idle/admin/findpassword

* **PARAM**

    ```(json)
    {
        "admin_email" : 사용자 이메일
    }
    ```

* **동작설명**

    이메일을 작성해서 보내면 admin 테이블에서 해당 이메일을 조회하여 일치하는지 확인하고 일치하는 이메일이 있으면 메일 전송

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_find_password}:"이메일을 보냈습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_find_password:"이메일을 입력하세요."}`
    </br>OR</br>
    `{admin_find_password:"해당 이메일이 없습니다."}`

---

### 관리자 비밀번호 재설정

* **URL**

    [PUT]] http://{IP}:{PORT}/idle/admin/reset-password

* **PARAM**

    ```(json)
    {
        "admin_pw" : 사용자 비밀번호
    }
    ```

* **동작설명**

    새 비밀번호를 입력하면 admin 테이블의 admin_pw 값을 입력한 값으로 변경한다.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{admin_rest_password:"비밀번호가 변경되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{admin_rest_password:"비밀번호는 필수입니다."}`
    </br>OR</br>
    `{admin_rest_password:"잘못된 접근입니다."}`

---

### 회원 정지처리

* **URL**

    [PUT] http://{IP}:{PORT}/idle/admin/ban

* **PARAM**
    ```(json)
    {
        "member_ban_reason" : 정지사유
        "member_email" : 사용자 이메일
    }
    ```

* **동작설명**

    관리자가 정지를 하려는 사용자의 member 테이블을 조회해서 member_ban 값을 1로 변경

    member_ban 테이블에 파라미터 값 추가

* **성공 시 응답**

    * **Code:** 200 </br>
    `{member_ban:"정상적으로 계정이 삭제되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{member_ban:"회원정지에 실패하였습니다."}`


---




## 포인트 관련 API

### 관리자의 포인트 부여

* **URL**

    [PUT]] http://{IP}:{PORT}/idle/admin/give-point

* **PARAM**

    ```(json)
    {
        "add_point" : 얻은 포인트
    }
    ```

* **동작설명**

    관리자가 아이디어를 보고 포인트를 부여하여 idea 테이블에 파라미터 값 추가.

    포인트가 추가되면 member 테이블의 사용자 포인트, 누적 포인트도 추가.

* **성공 시 응답**

    * **Code:** 200 </br>
    `{give_point:"? 포인트를 주었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{give_point:"포인트 지급에 실패하였습니다."}`

---

### 회원이 포인트 사용할 때

* **URL**

    [PUT]] http://{IP}:{PORT}/idle/members/use-point

* **PARAM**

    ```(json)
    {
        "use_point" : 사용 포인트
    }
    ```

* **동작설명**

    회원이 포인트를 사용하면 member 테이블에 사용한 포인트가 기록.
    </br>point 테이블은 .....

* **성공 시 응답**

    * **Code:** 200 </br>
    `{give_point:"? 포인트를 사용하였습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{give_point:"포인트 사용에 실패하였습니다."}`

---




## 게시물 관련 API

### 문의게시판 올릴 때

* **URL**
    [POST] http://{IP}:{PORT}/idle/board/cs/write

* **PARAM**

    ```(json)
    {
        "cs_contents" : 문의글 내용
        "cs_title" : 문의글 제목
    }
    ```

* **동작설명**

    회원이 문의게시판을 올리면 내용과 제목이 cs 테이블에 추가

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_write:"게시물이 등록되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_write:"문의에 실패하였습니다."}`

---

### 문의게시판 수정할 때

* **URL**

    [PUT] http://{IP}:{PORT}/idle/board/cs/udpate

* **PARAM**

    ```(json)
    {
        "cs_contents" : 수정한 문의글 내용
        "cs_title" : 수정한 문의글 제목
    }
    ```

* **동작설명**

    회원이 문의게시판을 수정하면 수정한 내용과 제목이 cs 테이블에 추가

    수정전의 내용은 cs_log 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_update:"게시물이 수정되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_update:"Error"}`

---   

### 문의게시판 열어 볼 때

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/cs

* **동작설명**

    게시물의 제목 부분을 클릭

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs:"비밀글은 작성자 본인만 볼 수 있습니다."}`

---

### 문의게시판 답변하기

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/cs/answer

* **PARAM**

    ```(json)
    {
        "cs_answer" : 답변 내용
        "cs_title" : 답변 제목
    }
    ```

* **동작설명**

    관리자가 문의글에 답변을 하면 내용과 제목이 idea 테이블에 기록

    제목같은경우 회원과 관리자의 세션이 다르기 때문에 db에서 불러와야함

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_answer:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_answer:"Error."}`

---

### 문의게시판 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/board/cs/delete

* **동작설명**

    관리자가 게시물을 삭제하면 cs_log 테이블의 삭제 여부 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{cs_delete:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{cs_delete:"Error."}`

---

### 공지사항 올리기

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/notice

* **PARAM**

    ```(json)
    {
        "notice_title" : 공지사항 제목
        "notice_contents" : 공지사항 내용
        "notice_-file_path" : 첨부파일 경로
    }
    ```

* **동작설명**

    관리자가 공지사항을 올리면 notice 테이블에 기록

    첨부파일은 notice_file_dir 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_write:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_write:"Error."}`

---

### 공지사항 수정할 때

* **URL**

    [PUT] http://{IP}:{PORT}/idle/board/notice/udpate

* **PARAM**

    ```(json)
    {
        "notice_contents" : 수정한 공지사항 내용
        "notice_title" : 수정한 공지사항 제목
        "notice_-file_path" : 첨부파일 경로
    }
    ```

* **동작설명**

    관리자가 공지사항을 수정하면 수정한 내용과 제목이 notice 테이블에 기록

    수정전의 내용과 날짜는 notice_log 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_update:"게시물이 수정되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_update:"Error"}`

---

### 공지사항 열어 볼 때

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/notice

* **동작설명**

    게시물의 제목 부분을 클릭

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice:"Error."}`

---

### 공지사항 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/board/notice/delete

* **동작설명**

    관리자가 게시물을 삭제하면 notice_log 테이블의 삭제 여부 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{notice_delete:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{notice_delete:"Error."}`

---

### 공고정보게시판 올리기

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/anno

* **PARAM**

    ```(json)
    {
        "anno_title" : 공고 제목
        "anno_contents" : 공고 내용
        "anno_link" : 공고 출처 링크
        "anno_img_path" : 공고 내용 이미지 경로
    }
    ```

* **동작설명**

    관리자가 공지사항을 올리면 anno 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_write:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_write:"Error."}`

---

### 공고정보게시판 수정할 때

* **URL**

    [PUT] http://{IP}:{PORT}/idle/board/anno/udpate

* **PARAM**

    ```(json)
    {
        "anno_title" : 수정한 공고글 제목
        "anno_contents" : 수정한 공고글 내용
        "anno_link" : 공고 출처 링크
    }
    ```

* **동작설명**

    관리자가 공고정보게시물을 수정하면 수정한 제목, 내용, 링크가 cs 테이블에 추가

    수정전의 내용은 cs_log 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_update:"게시물이 수정되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_update:"Error"}`

---   

### 공고정보게시판 열어 볼 때

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/anno


* **동작설명**

    게시물을 클릭

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno:"Error."}`

---

### 공고정보게시판 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/board/anno/delete

* **동작설명**

    관리자가 게시물을 삭제하면 anno_log 테이블의 삭제 여부 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_delete:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_delete:"Error."}`

---


 ### 아이디어 올리기

 * **URL**

    [GET] http://{IP}:{PORT}/idle/board/idea

* **PARAM**

    ```(json)
    {
        "idea_title" : 아이디어 제목
        "idea_contents" : 아이디어 내용
    }
    ```

* **동작설명**

    회원이 아이디어를 올리면 idea 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_write}:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_write:"Error."}`

---

### 아이디어 수정할 때

* **URL**

    [PUT] http://{IP}:{PORT}/idle/board/idea/udpate

* **PARAM**

    ```(json)
    {
        "idea_title" : 수정한 아이디어 제목
        "idea_contents" : 수정한 아이디어 내용
    }
    ```

* **동작설명**

    관리자가 공고정보게시물을 수정하면 수정한 제목, 내용, 링크가 cs 테이블에 추가

    수정전의 내용은 cs_log 테이블에 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{idea_update:"게시물이 수정되었습니다."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{idea_update:"Error"}`

---   

### 아이디어 열어 볼 때

* **URL**

    [GET] http://{IP}:{PORT}/idle/board/idea


* **동작설명**

    게시물을 클릭

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno:"본인의 아이디어만 열람할 수 있습니다."}`

---

### 아이디어 삭제

* **URL**

    [DELETE] http://{IP}:{PORT}/idle/board/idea/delete

* **동작설명**

    관리자 또는 회원이 게시물을 삭제하면 idea_log 테이블의 삭제 여부 값을 1로 변경

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno_delete:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno_delete:"Error."}`

---



## 고객센터 API

### 고객센터 내용 작성하기

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

    contact 테이블에 값이 기록

* **성공 시 응답**

    * **Code:** 200 </br>
    `{anno:"Success."}`

* **실패 시 응답**

    * **Code:** 400 </br>
    `{anno:"본인의 아이디어만 열람할 수 있습니다."}`

---


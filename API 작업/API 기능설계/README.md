# API 기능설계

* HTTP 메서드
    * POST 생성
    * GET 조회
    * DELETE 삭제
    * PUT 업데이트
## 회원 관련API

### 회원가입

* **URL**

    [POST] http://{IP}:{PORT}/Idle/login

* **PARAM**
    |KEY|VALUE|
    |--------|--------|
    |member_email|사용자 이메일|
    |member_name|사용자 이름|
    |member_sex|사용자 성별|
    |member_birth|사용자 생년월일|
    |member_company|사용자 소속|
    |member_state|사용자 거주지|
    |member_ban|사용자 정지여부|
    |member_pw|사용자 비밀번호|
    |member_phone|사용자 핸드폰번호|
    |member_point|사용자 포인트|
    |save_point|누적 포인트|
    |use_point|사용 포인트|
    |member_rank|포인트 순위|

* **동작설명**

    동일아이디가 있는지, 파라미터에 null 값이 있는지 확인 후, member 테이블에 추가한다.

* **응답**

    login_result라는 키에 성공시 true, 실패시 false를 반환한다.
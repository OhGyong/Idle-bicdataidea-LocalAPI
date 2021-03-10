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

    KEY=member_email , VALUE=사용자 이메일
    KEY=member_name , VALUE=사용자 이름
    KEY=member_sex, VALUE=사용자 성별
    KEY=member_birth, VALUE=사용자 생년월일
    KEY=member_company, VALUE=사용자 소속
    KEY=member_state, VALUE=사용자 거주지
    KEY=member_ban, VALUE=사용자 정지여부
    KEY=member_pw, VALUE=사용자 비밀번호
    KEY=member_phone, VALUE=사용자 핸드폰번호
    KEY=member_point, VALUE=사용자 포인트
    KEY=save_point, VALUE=누적 포인트
    KEY=use_point, VALUE=사용 포인트
    KEY=member_rank, VALUE= 포인트 순위

* **동작설명**

    동일아이디가 있는지, 파라미터에 null 값이 있는지 확인 후, member 테이블에 추가한다.

* **응답**

    login_result라는 키에 성공시 true, 실패시 false를 반환한다.
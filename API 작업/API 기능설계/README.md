# API 기능설계

## 회원 관련API
* HTTP 메서드
    * POST 생성
    * GET 조회
    * DELETE 삭제
    * PUT 업데이트

### 회원가입
URL : [POST] http://{IP}:{PORT}/Idle/login

PARAM :
 {
    KEY=member_email , VALUE=사용자 이메일 </br>
    KEY=member_name , VALUE=사용자 이름 </br>
    KEY=member_sex, VALUE=사용자 성별 </br>
    KEY=member_company, VALUE=사용자 생년월일 </br>
    KEY=member_state, VALUE=사용자 소속 </br>
    KEY=member_ban, VALUE=사용자 거주지 </br>
    KEY=member_pw, VALUE=사용자 정지여부 </br>
    KEY=member_phone, VALUE=사용자 비밀번호 </br>
    KEY=member_point, VALUE=사용자 핸드폰번호 </br>
    KEY=save_point, VALUE=사용자 생년월일 </br>
    KEY=member_rank, VALUE=사용자 생년월일 </br>


 }

- 동작설명 : 
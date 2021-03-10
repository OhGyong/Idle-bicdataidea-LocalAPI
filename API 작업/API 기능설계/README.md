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
    KEY=member_email , VALUE=사용자 이메일
    KEY=member_name ,  VALUE=사용자 이름
    KEY=member_sex, VALUE=사용자 성별

 }
- 동작설명 : 
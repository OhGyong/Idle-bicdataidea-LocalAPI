## Express 라우팅에 관한 개념

### 라우팅 </br>
*라우팅(routing)*은 URI(Uniform Resource Identifier)의 정의, 그리고 URI가 클라이언트 요청에 응답하는 방식을 말함. </br>
(기본 라우팅은 URI 및 특정한 HTTP 요청 메소드(GET, POST)인 특정 엔드포인트에 대한 클라이언트 요청에 응답하는 방법을 결정하는 것)

![image](https://user-images.githubusercontent.com/52282493/112483026-fdb79600-8dbb-11eb-9ab6-bc16e41cd2d3.png)
- app은 express의 인스턴스
- METHOD는 HTTP의 요청 메소드
- PATH는 서버에서의 경로 (URL)
- HADNLER는 라우트가 일치할 때 실행되는 함수 → `(req, res)=>{'실행되는 함수'}`

* **Express** </br>
*Express*는 자체적인 최소한의 기능을 갖춘 라이퉁 및 미들웨어 웹 프레임워크</br>
Express 애플리케이션은 기본적으로 일련의 미들웨어 함수 호출
- 미들웨어 함수의 수행업무
    1. 모든 코드를 실행
    2. 요청 및 응답 오브젝트에 대한 변경을 실행
    3. 요청-응답 주기를 종료
    4. 스택 내의 그 다음 미들웨어 함수를 호출 </br>
    현재의 미들웨어 함수가 `3.요청-응답 주기`를 종료하지 안흔 경우에는 next()를 호출하여 그 다음 미들웨어 함수에 제어를 전달해야 함 </br>
    -> 그렇지 않으면 해당 요청은 정지된 채로 방치됨

Express 애플리케이션의 사용처
- 애플리케이션 레벨 미들웨어
- 라우터 레벨 미들웨어
- 오류 처리 미들웨어
- 기본 제공 미들웨어
- 써드파티 미들웨어

### 애플리케이션 레벨 미들웨어 </br>
app.use() 또는 app.METHOD()

### 라우터 레벨 미들웨어 </br>
router.use() 또는 router.METHOD() </br>
라우터 레벨 미들웨어가 express.Router() 인스턴스에 바인드 된다는 점을 제외하면 애플리케이션 레벨 미들웨어와 동일한 방식으로 작동


#### 참고
라우팅 설명 : http://expressjs.com/ko/guide/routing.html </br>
미들웨어 설명 : http://expressjs.com/ko/guide/using-middleware.html </br>
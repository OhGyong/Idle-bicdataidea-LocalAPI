# Express 라우팅에 관한 개념

## 라우팅 </br>
*라우팅(routing)*은 URI(Uniform Resource Identifier)의 정의, 그리고 URI가 클라이언트 요청에 응답하는 방식을 말함. </br>
(기본 라우팅은 URI 및 특정한 HTTP 요청 메소드(GET, POST)인 특정 엔드포인트에 대한 클라이언트 요청에 응답하는 방법을 결정하는 것)

![image](https://user-images.githubusercontent.com/52282493/112482465-70744180-8dbb-11eb-9279-e2b7b6830c9a.png)
- app은 express의 인스턴스
- METHOD는 HTTP의 요청 메소드
- PATH는 서버에서의 경로 (URL)
- HADNLER는 라우트가 일치할 때 실행되는 함수 → `(req, res)=>{'실행되는 함수'}`
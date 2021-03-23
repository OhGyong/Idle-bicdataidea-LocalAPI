* **mysql root 계정실행**
    - mysql -u root -p

* **데이터베이스 목록 보기**
    - show databases

* **root 계정 암호 변경**
    - use mysql // 데이터베이스 선택
    - select host, user, authentication_string from user; // 현재 암호 확인
    - alter user 'root'@'localhost' identified with mysql_native_password by '비밀번호'; // '' 빼는거아님
    - flush privileges; // 변경사항 적용
    - exit  // 탈출

* **데이터베이스 삭제**
    - drop database 데이터베이스이름;

* ** 데이터베이스 생성**
    - create database 데이터베이스이름;


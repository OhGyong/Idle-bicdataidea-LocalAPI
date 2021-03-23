# 우분투에서 Mysql 설치하기

## Mysql 사전준비
>sudo apt-get update

>sudo apt-get install mysql-server

>sudo mysql_secure_installation

## Mysql-server 설치
> $sudo apt-get update

## Mysql 기본 설정
포트 열어주기
> $sudo ufw allow mysql

Mysql 실행
> $sudo systemctl start mysql

우분투 서버 재시작시 Mysql 자동 재시작
> $sudo systemctl enable mysql

## Mysql 접속
> $sudo /usr/bin/mysql -u root -pd
 
>sudo mysql -u root -p

이후 비밀번호 입력 창 뜨는데 우분투 비번과 동일하다.

Mysql 프롬프트 시작됨

## Mysql 버전 확인
> mysql> show variables like "%version%";

## 우분투 Mysql <-> 로컬 workbench 연결 ( 외부접속 허용)
1. 우분투 외부접속 허용 설정
- 
  - sudo iptables -I INPUT 5 -i ens3 -p tcp --dport 3306 -m state --state NEW,ESTABLISHED -j ACCEPT
  - sudo iptables -L  

- root 계정 접속 → mysqld.cnf 파일 경로로 이동 → mysql.cnf 파일 변경
  - sudo su
  - cd /etc/mysql/mysql.conf.d
  - vi mysqld.cnf
- 파일 저장 → 서버 재시작 → mysql 서버 접속
  - wq
  - service mysql restart  여기서 만약 안되면 앞에 sudo 입력
  - mysql -u root -p  마찬가지로 안되면 앞에 sudo 입력 

2. 계정 만들기
- 데이터베이스 생성 → db 생성됐는지 확인 → 계정 생성
  - create database 명칭;   ex) create database idle;
  - show databases;
  - create user '계정이름'@'%'identified by '비밀번호'   ex) create user 'giyong'@'%'identified by '1234'

만약에 mysql 패스워드 권한으로 실패가 계속 난다면 확인해서 권환을 낮춰주어야 한다.

SHOW VARIABLES LIKE 'validate_password%';     패스워드 권한 보기

SET GLOBAL validate_password.policy=LOW;  패스워드 정책변경

3. 외부접속 설정
- 외부 접속 설정 및 저장
  - GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;   ex) GRANT ALL PRIVILEGES ON *.* TO 'giyong2'@'%' WITH GRANT OPTION;
  - flush privileges;

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
- root 계정 접속, mysqld.cnf 파일 경로로 이동 mysql.cnf 파일 변경
 - sudo su
 - cd /etc/mysql/mysql.conf.d
 - vi mysqld.cnf

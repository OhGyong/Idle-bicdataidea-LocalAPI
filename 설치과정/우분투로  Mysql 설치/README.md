# 우분투에서 Mysql 설치하기

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
이후 비밀번호 입력 창 뜨는데 우분투 비번과 동일하다.

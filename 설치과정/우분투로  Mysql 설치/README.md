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

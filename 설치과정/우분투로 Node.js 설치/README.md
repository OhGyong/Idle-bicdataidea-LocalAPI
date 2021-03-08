# 우분투에서 Node.js 설치하기

## 1. 준비
소스코드 빌드가 빌요하기 때문에 빌드 환경설치
> sudo apt-get install build-essential libssl-dev

## 2. NVM 설치
NVM 설치
> curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

NVM의 Path는 이미 유저 계정의 bash 설정 파일에 들어있지만 적용을 해줘야 한다.
> source ~/.bashrc 
이후로 NVM 명령을 사용할 수 있게된다.

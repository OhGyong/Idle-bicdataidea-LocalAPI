# 우분투에서 Node.js와 Angular 설치하기

## 1. 준비
소스코드 빌드가 빌요하기 때문에 빌드 환경설치
> sudo apt-get install build-essential libssl-dev

## 2. NVM 설치
NVM 설치
> curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

NVM의 Path는 이미 유저 계정의 bash 설정 파일에 들어있지만 적용을 해줘야 한다.
> source ~/.bashrc 
이후로 NVM 명령을 사용할 수 있게된다.

## Node.js 설치
> nvm install '버전'
예를 들면 nvm install 12.18.2

## Angular 설치
> npm install -g @angular/cli


### Angular 프로젝트 생성 및 실행
프로젝트 생성
> ng new <프로젝트 이름>

프로젝트 파일로 이동
> cd <프로젝트 이름>

프로젝트 실행(Angular CLI 실행)
> ng serve
> ng serve --port '포트번호'
> ng serve --open

만약 실행단계에서 안되면 아래 명령어로 뚫어줘야 함
> sudo iptables -I INPUT 5 -i ens3 -p tcp —dport 4201 -m state —state NEW,ESTABLISHED -j ACCEPT




/**
 * 설정 세팅
 */
 var express = require('express');
 var router = express.Router();

// 게시판 설정
var {
    idea_write, idea_update,
    cs_write, cs_update_page, cs_update,
    idea_write,
} = require('../setting/board.js');

// jwt 컨트롤러
var jwt_middleware = require('../setting/jwt_middleware');

// 파일 업로드 설정
var upload = require('../setting/file_path.js');

// 파일 다운로드 설정
var fs = require('fs');
var path = require('path');
var mime = require('mime');


/*                    본문시작                    */


const admin_check=0 // 관리자 확인 체크( 아닌경우 )


/**
 * 문의게시판 업로드, http://localhost:3000/user_boards/cs/write
 */
router.post('/cs/write', upload.single('image'), jwt_middleware,(req, res)=>{
    console.log("작성한 제목: ", req.body.cs_title);  // 제목
    console.log("작성한 내용: ", req.body.cs_contents); // 내용
    console.log("회원 이메일: ", req.session.member_email); // 회원 이메일
    console.log("비밀글 여부: ", req.body.cs_secret);
    console.log("첨부파일 : ", req.file);// 첨부 파일


    cs_write(req.session.member_email ,req.body.cs_title, req.body.cs_contents, req.body.cs_secret, req.file).then(csWrite=>{
        csWrite.accessToken = req.accessToken;
        csWrite.refreshToken = req.refreshToken;
        res.send(csWrite);
    });
})


/**
 * 문의게시판 수정 페이지, http://localhost:3000/user_boards/cs/번호/update
 */
router.get('/cs/:cs_num/update', jwt_middleware,(req, res)=>{
    console.log("회원 이메일: ", req.memberEmail)
    console.log("선택한 게시물: ", req.params.cs_num)  // 선택한 게시물

    cs_update_page(req.memberEmail, req.params.cs_num).then(csUpdatePage=>{
        csUpdatePage.accessToken = req.accessToken;
        csUpdatePage.refreshToken = req.refreshToken;
        res.send(csUpdatePage);
    });

})


/**
 * 문의게시판 내용수정, http://localhost:3000/user_boards/cs/번호/update
 */
router.put('/cs/:cs_num/update', upload.single('image'), jwt_middleware, (req, res)=>{
    console.log("수정한 제목: ", req.body.cs_title);  // 제목
    console.log("수정한 내용: ", req.body.cs_contents); // 내용
    console.log("회원 이메일: ", req.memberEmail); // 회원 이메일
    console.log("비밀글 여부: ", req.body.cs_secret);
    console.log("첨부파일 : ", req.file); // 첨부 파일

    console.log("선택한 게시물: ", req.params.cs_num)  // 선택한 게시물

    cs_update(req.memberEmail ,req.body.cs_title, req.body.cs_contents, req.body.cs_secret, req.file, req.params.cs_num).then(csUpdate=>{
        csUpdate.accessToken = req.accessToken;
        csUpdate.refreshToken = req.refreshToken;
        res.send(csUpdate);
    });
})


/**
 * 아이디어 업로드, http://localhost:3000/user_boards/idea/write
 */
router.post('/idea/write', upload.single('image'), jwt_middleware, (req, res)=>{
    console.log("작성한 제목: ", req.body.idea_title);  // 제목
    console.log("작성한 내용: ", req.body.idea_contents); // 내용
    console.log("회원 이메일: ", req.memberEmail); // 회원 이메일
    console.log("첨부파일 : ", req.file);// 첨부 파일


    idea_write(req.memberEmail ,req.body.idea_title, req.body.idea_contents, req.file).then(ideaWrite=>{
        ideaWrite.accessToken = req.accessToken;
        ideaWrite.refreshToken = req.refreshToken;
        res.send(ideaWrite);
    });
})


/**
 * 아이디어 내용수정, http://localhost:3000/user_boards/idea/번호/update
 */
router.put('/idea/:idea_num/update',upload.single('image'), jwt_middleware, (req, res)=>{
    console.log("수정한 제목: ", req.body.idea_title);  // 제목
    console.log("수정한 내용: ", req.body.idea_contents); // 내용
    console.log("회원 이메일: ", req.memberEmail); // 회원 이메일
    console.log("첨부파일 : ", req.file); // 첨부 파일

    console.log("선택한 게시물: ", req.params.idea_num)  // 선택한 게시물

    idea_update(req.memberEmail ,req.body.idea_title, req.body.idea_contents, req.file, req.params.idea_num).then(ideaUpdate=>{
        ideaUpdate.accessToken = req.accessToken;
        ideaUpdate.refreshToken = req.refreshToken;
        res.send(ideaUpdate);
    });
})

module.exports=router;
/**
 * 설정 세팅
 */
var express = require('express');
var router = express.Router();

// 게시판 설정
var{
    anno_list, anno_look,
    notice_list, notice_look,
    idea_list, idea_look, 
    cs_list, cs_look
} = require('../setting/board.js');

// jwt 컨트롤러
var jwt_middleware = require('../setting/jwt_middleware');

// 파일 다운로드 설정
var fs = require('fs');
var path = require('path');
var mime = require('mime');


/*                    본문시작                    */

let admin_check = 0;


/**
 * 공고정보게시판 목록, http://localhost:3000/common_boards/anno
 */
 router.get('/anno', jwt_middleware, (req, res)=>{
    
    console.log("검색할 내용: ",req.query.anno_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    anno_list(req.query.anno_search, req.query.page).then(annoList=>{
        annoList.accessToken = req.accessToken;
        annoList.refreshToken = req.refreshToken;
        res.send(annoList);
    });
})


/**
 * 공고정보게시판 내용, http://localhost:3000/common_boards/anno/번호
 */
 router.get('/anno/:anno_num', jwt_middleware, (req, res)=>{
    
    console.log("선택한 게시물: ", req.params.anno_num)  // 검색 내용

    anno_look(req.params.anno_num).then(annoLook=>{
        annoLook.accessToken = req.accessToken;
        annoLook.refreshToken = req.refreshToken;
        res.send(annoLook);
    });
})


/**
 * 공지사항 목록, http://localhost:3000/user_boards/notice
 */
 router.get('/notice', jwt_middleware, (req, res)=>{
    console.log("검색할 내용: ",req.query.notice_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    notice_list(req.query.notice_search, req.query.page, 0).then(noticeList=>{
        noticeList.accessToken = req.accessToken;
        noticeList.refreshToken = req.refreshToken;
        res.send(noticeList);
    });
})


/**
 * 공지사항 내용, http://localhost:3000/common_boards/notice/번호
 */
 router.get('/notice/:notice_num', jwt_middleware, (req, res)=>{
    console.log("선택한 게시물: ", req.params.notice_num)  // 검색 내용

    notice_look(req.params.notice_num).then(noticeLook=>{
        noticeLook.accessToken = req.accessToken;
        noticeLook.refreshToken = req.refreshToken;
        res.send(noticeLook);
    });
})


/**
 * 공지사항 첨부파일 다운로드, http://localhost:3000/common_boards/notice/:notice_num/:file_name
 */
router.get('/notice/:notice_num/:file_name', function (req, res) {
    var upload_folder = './public/image/';
    var file = upload_folder + req.params.file_name; // 파일 경로
    try {
        if (fs.existsSync(file)) { // 파일이 존재하는지 체크
            var filename = path.basename(file); // 파일 경로에서 파일명(확장자포함)만 추출
            var mimetype = mime.getType(file); // 파일의 타입(형식)을 가져옴

            res.setHeader('Content-disposition', 'attachment; filename=' + filename); // 다운받아질 파일명 설정
            res.setHeader('Content-type', mimetype); // 파일 형식 지정

            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        } else {
            return res.send('해당 파일이 없습니다.');
        }
    } catch (err) { // 에러 발생시
        console.log(err);
        return res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
    }
})


/**
 * 아이디어 목록, http://localhost:3000/user_boards/idea
 */
 router.get('/idea', jwt_middleware,(req, res)=>{
    console.log("검색할 내용: ",req.query.idea_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    idea_list(undefined, req.query.idea_search, req.query.page, admin_check).then(ideaList=>{
        ideaList.accessToken = req.accessToken;
        ideaList.refreshToken = req.refreshToken;
        res.send(ideaList);
    });
})


/**
 * 아이디어 내용, http://localhost:3000/common_boards/idea/번호
 */
 router.get('/idea/:idea_num', jwt_middleware, (req,res)=>{
    console.log("선택한 게시물: ", req.params.idea_num);  // 검색 내용
    console.log("회원 이메일: ", req.memberEmail);
    
    if(req.session.admin_email != undefined){ admin_check = 1; }

    //회원 이메일, 검색내용, 관리자 체크
    idea_look(req.memberEmail, req.params.idea_num, admin_check).then(ideaLook=>{
        ideaLook.accessToken = req.accessToken;
        ideaLook.refreshToken = req.refreshToken;
        res.send(ideaLook);
    });
})


/**
 * 아이디어 첨부파일 다운로드, http://localhost:3000/common_boards/idea/:idea_num/:file_name
 */
 router.get('/idea/:idea_num/:file_name', (req, res)=>{
    var upload_folder = './public/image/';
    var file = upload_folder + req.params.file_name; // 파일 경로
    try {
        if (fs.existsSync(file)) { // 파일이 존재하는지 체크
            var filename = path.basename(file); // 파일 경로에서 파일명(확장자포함)만 추출
            var mimetype = mime.getType(file); // 파일의 타입(형식)을 가져옴

            res.setHeader('Content-disposition', 'attachment; filename=' + filename); // 다운받아질 파일명 설정
            res.setHeader('Content-type', mimetype); // 파일 형식 지정

            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        } else {
            return res.send('해당 파일이 없습니다.');
        }
    } catch (err) { // 에러 발생시
        console.log(err);
        return res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
    }
})


/**
 * 문의게시판 목록, http://localhost:3000/user_boards/cs
 */
 router.get('/cs', jwt_middleware, (req, res)=>{
    console.log("검색할 내용: ",req.query.cs_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    // (회원 이메일, 검색 내용, 관리자 여부, 페이징 번호)
    cs_list(null, req.query.cs_search, req.query.page, admin_check).then(csList=>{
        csList.accessToken = req.accessToken;
        csList.refreshToken = req.refreshToken;
        res.send(csList);
    });
})


/**
 * 문의게시판 내용, http://localhost:3000/common_boards/cs/번호
 */
 router.get('/cs/:cs_num', jwt_middleware, (req, res)=>{
    console.log("선택한 게시물: ", req.params.cs_num)  // 검색 내용

    if(req.session.admin_email != undefined){ admin_check = 1; }

    //  검색내용, 관리자 체크
    cs_look(req.params.cs_num, admin_check).then(csLook=>{
        csLook.accessToken = req.accessToken;
        csLook.refreshToken =req.refreshToken;
        res.send(csLook);
    });
})


/**
 * 문의게시판 첨부파일 다운로드, http://localhost:3000/common_boards/cs/:cs_num/:file_name
 */
 router.get('/cs/:cs_num/:file_name', (req, res)=>{
    var upload_folder = './public/image/';
    var file = upload_folder + req.params.file_name; // 파일 경로
    try {
        if (fs.existsSync(file)) { // 파일이 존재하는지 체크
            var filename = path.basename(file); // 파일 경로에서 파일명(확장자포함)만 추출
            var mimetype = mime.getType(file); // 파일의 타입(형식)을 가져옴

            res.setHeader('Content-disposition', 'attachment; filename=' + filename); // 다운받아질 파일명 설정
            res.setHeader('Content-type', mimetype); // 파일 형식 지정

            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        } else {
            return res.send('해당 파일이 없습니다.');
        }
    } catch (err) { // 에러 발생시
        console.log(err);
        return res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
    }
})

module.exports = router;
/**
 * 설정 세팅
 */
 var express = require('express');
 var router = express.Router();

// 게시판 설정
var {
    admin_log_list,
    notice_list, notice_write
} = require('../setting/board.js');

// 파일 업로드 설정
var upload = require('../setting/file_path.js');


/**
 *      본문 시작
 */
 const admin_check=1 // 관리자 확인 체크


 /**
 * 관리자 로그 목록, http://localhost:3000/admin_boards/admin-log
 * 1. admin_log 테이블에서 모든 정보를 가져온다.
 */
router.get('/admin-log', (req, res)=>{

    console.log("검색할 내용: ",req.query.admin_log_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    admin_log_list(req.query.admin_log_search, req.query.page).then(admin_log=>{
        res.send(admin_log);
    });
});


/**
 * 공지사항 목록, http://localhost:3000/admin_boards/notice
 * 1. notice 테이블, notice_file_dir 테이블 JOIN
 */
 router.get('/notice', (req, res)=>{

    console.log("검색할 내용: ", req.query.notice_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    notice_list(req.query.notice_search, req.query.page, admin_check).then(notice_list=>{
        res.send(notice_list);
    });
})


/**
 * 공지사항 업로드, http://localhost:3000/admin_boards/notice/write
 */
 router.post('/notice/write', upload.single('image'), (req, res)=>{
    console.log("작성한 제목: ", req.body.notice_title);  // 제목
    console.log("작성한 내용: ", req.body.notice_contents); // 내용
    console.log("관리자 이메일: ", req.session.admin_email); // 회원 이메일
    console.log("첨부파일 : ", req.file);// 첨부 파일 


    notice_write(req.session.admin_email ,req.body.notice_title, req.body.notice_contents, req.file).then(notice_write=>{
        res.send(notice_write);
    });
})









 module.exports=router;
/**
 * 설정 세팅
 */
 var express = require('express');
 var router = express.Router();

 // db 연결
var getConnection = require('../setting/db.js');

// 응답 설정
var { success_request, error_request } = require('../setting/request.js');

// 게시판 설정
var { idea_list, 
    cs_list, cs_look,
    anno_list, anno_look,
    inter_anno_list, notice_list,
    notice_look, member_list,
    member_log_list,
    admin_log_list
} = require('../setting/board.js');


/**
 *      본문 시작
 */


/**
 * 공고정보게시판 목록, http://localhost:3000/user_boards/anno
 */
router.get('/anno', (req, res)=>{
    
    console.log("검색할 내용: ",req.query.anno_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    anno_list(req.query.anno_search, req.query.page).then(anno_list=>{
        res.send(anno_list);
    });
})


/**
 * 공고정보게시판 내용, http://localhost:3000/user_boards/anno/번호
 */
 router.get('/anno/:anno_num', (req, res)=>{
    
    console.log("선택한 게시물: ", req.params.anno_num)  // 검색 내용

    anno_look(req.params.anno_num).then(anno_look=>{
        res.send(anno_look);
    });
})


/**
 * 공지사항 목록, http://localhost:3000/user_boards/notice
 */
router.get('/notice', (req, res)=>{
    console.log("검색할 내용: ",req.query.notice_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    notice_list(req.query.notice_search, req.query.page).then(notice_list=>{
        res.send(notice_list);
    });
})


/**
 * 공지사항 내용, http://localhost:3000/user_boards/notice/번호
 */
router.get('/notice/:notice_num', (req, res)=>{
    console.log("선택한 게시물: ", req.params.notice_num)  // 검색 내용

    notice_look(req.params.notice_num).then(notice_look=>{
        res.send(notice_look);
    });
})


/**
 * 공지사항 첨부파일 다운로드
 */


/**
 * 문의게시판 목록, http://localhost:3000/user_boards/cs
 */
router.get('/cs', (req, res)=>{
    console.log("검색할 내용: ",req.query.cs_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    // (회원 이메일, 검색 내용, 관리자 여부, 페이징 번호)
    cs_list(null, req.query.cs_search, 0 ,req.query.page).then(notice_list=>{
        res.send(notice_list);
    });
})

/**
 * 문의게시판 내용, http://localhost:3000/user_boards/cs/번호
 */
router.get('/cs/:cs_num', (req, res)=>{
    console.log("선택한 게시물: ", req.params.cs_num)  // 검색 내용

    cs_look(req.params.cs_num, 0).then(cs_look=>{
        res.send(cs_look);
    });
})






module.exports=router;


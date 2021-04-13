/**
 * 설정 세팅
 */
 var express = require('express');
 var router = express.Router();

// 게시판 설정
var {
    admin_log_list,
    notice_list, notice_write, notice_update_page, notice_update, notice_delete, notice_log,
    idea_list, idea_log, idea_delete,
    cs_list, cs_delete
} = require('../setting/board.js');
const getConnection = require('../setting/db.js');

// 파일 업로드 설정
var upload = require('../setting/file_path.js');
const { error_request, success_request } = require('../setting/request.js');


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
    console.log("관리자 이메일: ", req.session.admin_email); // 관리자 이메일
    console.log("첨부파일 : ", req.file);// 첨부 파일 


    notice_write(req.session.admin_email ,req.body.notice_title, req.body.notice_contents, req.file).then(notice_write=>{
        res.send(notice_write);
    });
})


/**
 * 공지사항 수정 페이지, http://localhost:3000/admin_boards/notice/번호/update
 */
router.get('/notice/:notice_num/update', (req, res)=>{
    console.log("선택한 게시물: ", req.params.notice_num)  // 선택한 게시물

    notice_update_page(req.params.notice_num).then(notice_update=>{
        res.send(notice_update);
    });
})


/**
 * 공지사항 내용수정, http://localhost:3000/admin_boards/notice/번호/update
 */
 router.put('/notice/:notice_num/update', upload.single('image'), (req, res)=>{
    console.log("수정한 제목: ", req.body.notice_title);  // 제목
    console.log("수정한 내용: ", req.body.notice_contents); // 내용
    console.log("관리자 이메일: ", req.session.admin_email); // 회원 이메일
    console.log("첨부파일 : ", req.file); // 첨부 파일
    console.log("선택한 게시물: ", req.params.notice_num)  // 선택한 게시물

    notice_update(req.session.admin_email ,req.body.notice_title, req.body.notice_contents, req.file, req.params.notice_num).then(notice_update=>{
        res.send(notice_update);
    });
})


/**
 * 공지사항 삭제, http://localhost:3000/admin_boards/notice/번호/delete
 */
router.delete('/notice/:notice_num/delete', (req, res)=>{

    console.log("선택한 게시물: ", req.params.notice_num)  // 선택한 게시물

    notice_delete(req.params.notice_num).then(notice_delete=>{
        res.send(notice_delete);
    })
})


/**
 * 공지사항 수정 로그, http://localhost:3000/admin_boards/notice/번호/log
 * 공지사항 내용 볼 때 관리자는 수정 로그 보기 버튼 있음
 */
 router.get('/notice/:notice_num/log', (req, res)=>{
    console.log("선택한 게시물: ", req.params.notice_num)  // 선택한 게시물

    notice_log(req.params.notice_num).then(notice_log=>{
        res.send(notice_log);
    });
})


/**
 * 아이디어 목록, http://localhost:3000/admin_boards/idea
 */
 router.get('/idea', (req, res)=>{
    console.log("검색할 내용: ",req.query.idea_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    // 이메일, 검색내용, 페이지, 관리자 확인
    idea_list(undefined, req.query.idea_search, req.query.page, admin_check).then(idea_list=>{
        res.send(idea_list);
    });
})


/**
 * 아이디어 삭제, http://localhost:3000/admin_boards/idea/번호/delete
 */
 router.delete('/idea/:idea_num/delete', (req, res)=>{

    console.log("선택한 게시물: ", req.params.idea_num)  // 선택한 게시물

    idea_delete(req.params.idea_num).then(idea_delete=>{
        res.send(idea_delete);
    })
})


/**
 * 아이디어 수정 로그, http://localhost:3000/admin_boards/idea/번호/log
 */
 router.get('/idea/:idea_num/log', (req, res)=>{
    console.log("선택한 게시물: ", req.params.idea_num)  // 선택한 게시물

    idea_log(req.params.idea_num).then(idea_log=>{
        res.send(idea_log);
    });
})


/**
 * 문의게시판 목록, http://localhost:3000/admin_boards/cs
 */
 router.get('/cs', (req, res)=>{
    console.log("검색할 내용: ",req.query.cs_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    // (회원 이메일, 검색 내용, 관리자 여부, 페이징 번호)
    cs_list(null, req.query.cs_search, req.query.page, admin_check).then(notice_list=>{
        res.send(notice_list);
    });
})


/**
 * 문의게시판 삭제, http://localhost:3000/admin_boards/cs/:cs_num/delete
 */
 router.delete('/cs/:cs_num/delete', (req, res)=>{

    console.log("선택한 게시물: ", req.params.cs_num)  // 선택한 게시물

    cs_delete(req.params.cs_num).then(cs_delete=>{
        res.send(cs_delete);
    })
})


/**
 * 문의게시판 답변, http://localhost:3000/admin_boards/cs/:cs_num/answer
 */
router.post('/cs/:cs_num/answer', upload.single('image'), (req,res)=>{
    console.log("답변 내용: ", req.body.cs_contents); // 내용
    console.log("관리자 이메일: ", req.session.admin_email); // 관리자 이메일

    getConnection(conn=>{
        let cs_answer_sql = 'UPDATE cs SET admin_email=?, cs_resp=?, cs_resp_date=now() WHERE cs_id=?;';
        let cs_answer_params = [req.session.admin_email, req.body.cs_contents, req.params.cs_num];
        conn.query(cs_answer_sql, cs_answer_params, function(err, rows){
            if(err || rows==''){
                conn.release();
                error_request.message="답변 등록 실패";
                return res.send(error_request);
            }
            conn.release();

        })
    })

    success_request.data={
        "admin_email":req.session.admin_email,
        "cs_resp":req.body.cs_contents
    }
    success_request.message="답변 등록 성공";
    res.send(success_request)
})






 module.exports=router;
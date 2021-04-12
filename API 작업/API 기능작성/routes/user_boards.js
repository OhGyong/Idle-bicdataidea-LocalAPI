/**
 * 설정 세팅
 */
 var express = require('express');
 var router = express.Router();

// 게시판 설정
var {
    idea_list, idea_look, idea_write, idea_update,
    cs_list, cs_look, cs_write, cs_update_page, cs_update, 
    anno_list, anno_look,
    notice_list, notice_look, idea_write,
} = require('../setting/board.js');

// 파일 업로드 설정
var upload = require('../setting/file_path.js');

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

    notice_list(req.query.notice_search, req.query.page, 0).then(notice_list=>{
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

    //  검색내용, 관리자 체크
    cs_look(req.params.cs_num, 0).then(cs_look=>{
        res.send(cs_look);
    });
})


/**
 * 문의게시판 업로드, http://localhost:3000/user_boards/cs/write
 */
router.post('/cs/write', upload.single('image'), (req, res)=>{
    console.log("작성한 제목: ", req.body.cs_title);  // 제목
    console.log("작성한 내용: ", req.body.cs_contents); // 내용
    console.log("회원 이메일: ", req.session.member_email); // 회원 이메일
    console.log("비밀글 여부: ", req.body.cs_secret);
    console.log("첨부파일 : ", req.file);// 첨부 파일 


    cs_write(req.session.member_email ,req.body.cs_title, req.body.cs_contents, req.body.cs_secret, req.file).then(cs_write=>{
        res.send(cs_write);
    });
})


/**
 * 문의게시판 수정 페이지, http://localhost:3000/user_boards/cs/번호/update
 */
router.get('/cs/:cs_num/update', (req, res)=>{
    console.log("선택한 게시물: ", req.params.cs_num)  // 선택한 게시물

    cs_update_page(req.params.cs_num, 0).then(cs_update=>{
        res.send(cs_update);
    });

})


/**
 * 문의게시판 내용수정, http://localhost:3000/user_boards/cs/update
 */
router.put('/cs/:cs_num/update', upload.single('image'), (req, res)=>{
    console.log("수정한 제목: ", req.body.cs_title);  // 제목
    console.log("수정한 내용: ", req.body.cs_contents); // 내용
    console.log("회원 이메일: ", req.session.member_email); // 회원 이메일
    console.log("비밀글 여부: ", req.body.cs_secret);
    console.log("첨부파일 : ", req.file); // 첨부 파일

    console.log("선택한 게시물: ", req.params.cs_num)  // 선택한 게시물

    cs_update(req.session.member_email ,req.body.cs_title, req.body.cs_contents, req.body.cs_secret, req.file, req.params.cs_num).then(cs_update=>{
        res.send(cs_update);
    });
})


/**
 * 아이디어 목록, http://localhost:3000/user_boards/idea
 */
router.get('/idea', (req, res)=>{
    console.log("검색할 내용: ",req.query.idea_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    idea_list(undefined, req.query.idea_search, req.query.page).then(idea_list=>{
        res.send(idea_list);
    });
})


/**
 * 아이디어 내용, http://localhost:3000/user_boards/idea/번호
 */
router.get('/idea/:idea_num', (req,res)=>{
    console.log("선택한 게시물: ", req.params.idea_num);  // 검색 내용
    console.log("회원 이메일: ", req.session.member_email);


    //회원 이메일, 검색내용, 관리자 체크
    idea_look(req.session.member_email, req.params.idea_num, 0).then(idea_look=>{
        res.send(idea_look);
    });
})


/**
 * 아이디어 업로드, http://localhost:3000/user_boards/idea/write
 */
router.post('/idea/write', upload.single('image'), (req, res)=>{
    console.log("작성한 제목: ", req.body.idea_title);  // 제목
    console.log("작성한 내용: ", req.body.idea_contents); // 내용
    console.log("회원 이메일: ", req.session.member_email); // 회원 이메일
    console.log("첨부파일 : ", req.file);// 첨부 파일 


    idea_write(req.session.member_email ,req.body.idea_title, req.body.idea_contents, req.file).then(idea_write=>{
        res.send(idea_write);
    });
})


/**
 * 아이디어 내용수정, http://localhost:3000/user_boards/idea/번호/update
 */
router.put('/idea/:idea_num/update',upload.single('image'), (req, res)=>{
    console.log("수정한 제목: ", req.body.idea_title);  // 제목
    console.log("수정한 내용: ", req.body.idea_contents); // 내용
    console.log("회원 이메일: ", req.session.member_email); // 회원 이메일
    console.log("첨부파일 : ", req.file); // 첨부 파일

    console.log("선택한 게시물: ", req.params.idea_num)  // 선택한 게시물

    idea_update(req.session.member_email ,req.body.idea_title, req.body.idea_contents, req.file, req.params.idea_num).then(idea_update=>{
        res.send(idea_update);
    });
})






module.exports=router;


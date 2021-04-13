/**
 * 설정 세팅
 */
var express = require('express');
var router = express.Router();

// 게시판 설정
var{
    anno_list, anno_look,
    notice_look, idea_look, cs_look
} = require('../setting/board.js');


// 파일 다운로드 설정
var fs = require('fs');
var path = require('path');
var mime = require('mime');


/*                    본문시작                    */

let admin_check = 0;

/**
 * 공고정보게시판 목록, http://localhost:3000/common_boards/anno
 */
 router.get('/anno', (req, res)=>{
    
    console.log("검색할 내용: ",req.query.anno_search)  // 검색 내용
    console.log("페이지 번호: ", req.query.page) // 페이지 번호

    anno_list(req.query.anno_search, req.query.page).then(anno_list=>{
        res.send(anno_list);
    });
})


/**
 * 공고정보게시판 내용, http://localhost:3000/common_boards/anno/번호
 */
 router.get('/anno/:anno_num', (req, res)=>{
    
    console.log("선택한 게시물: ", req.params.anno_num)  // 검색 내용

    anno_look(req.params.anno_num).then(anno_look=>{
        res.send(anno_look);
    });
})


/**
 * 공지사항 내용, http://localhost:3000/common_boards/notice/번호
 */
 router.get('/notice/:notice_num', (req, res)=>{
    console.log("선택한 게시물: ", req.params.notice_num)  // 검색 내용

    notice_look(req.params.notice_num).then(notice_look=>{
        res.send(notice_look);
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
 * 아이디어 내용, http://localhost:3000/common_boards/idea/번호
 */
 router.get('/idea/:idea_num', (req,res)=>{
    console.log("선택한 게시물: ", req.params.idea_num);  // 검색 내용
    console.log("회원 이메일: ", req.session.member_email);
    
    if(req.session.admin_email != undefined){ admin_check = 1; }

    //회원 이메일, 검색내용, 관리자 체크
    idea_look(req.session.member_email, req.params.idea_num, admin_check).then(idea_look=>{
        res.send(idea_look);
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
 * 문의게시판 내용, http://localhost:3000/common_boards/cs/번호
 */
 router.get('/cs/:cs_num', (req, res)=>{
    console.log("선택한 게시물: ", req.params.cs_num)  // 검색 내용

    if(req.session.admin_email != undefined){ admin_check = 1; }

    //  검색내용, 관리자 체크
    cs_look(req.params.cs_num, admin_check).then(cs_look=>{
        res.send(cs_look);
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
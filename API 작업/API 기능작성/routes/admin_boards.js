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
 const admin_check=1 // 관리자 확인 체크






 module.exports=router;
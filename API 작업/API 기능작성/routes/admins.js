/**
 * 설정 세팅
 */
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const axios = require("axios");
const cheerio = require("cheerio");


// db 연결
var getConnection = require('../setting/db.js');

// 응답 설정
var { success_request, error_request } = require('../setting/request.js');

// 메일 설정
var trans_mail = require('../setting/mail.js')

// 세션 연결
var session = require('../setting/session.js');
router.use(session)

// 공고정보게시판 크롤링
var anno_data= require('../setting/anno_crawling.js');

var { now_time, tomorrow_time } = require('../setting/time.js');
const { get } = require('../setting/mail.js');
const { copyFileSync } = require('fs');


/**
 *  관리자 등록 필요없음
*/

/**
 * 관리자 이메일 중복 확인, http://localhost:3000/admins/idle/admins/has-same-id
 * 1. 입력된 이메일에서 value 값(이메일)만 가져옴
 * 2. member 테이블에 입력받은 이메일 값이 있는지 확인해서 있으면 생성불가, 없으면 생성가능 응답처리
 * 
*/
router.post('/idle/has-same-id', (req, res) => {

    // 포스트맨에서 얻어온 이메일 값
    var check_email = req.body.admin_email;
    console.log("입력 이메일 확인 : " + check_email);

    // db 연결
    getConnection(async(conn) => {
        try{
            await new Promise((res, rej)=>{
                // db에서 admin_email 값들 가져와서 check_email 과 같은지 비교
                var same_email_sql = 'SELECT admin_email FROM admin WHERE admin_email=?;';
                conn.query(same_email_sql, check_email, function (err, rows) {
                        if (err || rows == '') {
                            return rej(err)
                        }
                    res(rows);
                });
            });
            conn.release();
            error_request.message = "아이디 생성 불가능"
            res.send(error_request);
        }catch (err) {
            conn.release();
            success_request.message = "아이디 생성가능"
            res.send(success_request);
        }
    })
});


/**
 * 관리자 로그인, http://localhost:3000/admins/idle/signin
 * 1. 관리자가 입력한 이메일과 비밀번호를 array에 저장
 * 2. 입력한 비밀번호는 해시화해서 db에서 조회
 * 3. 로그시간 업로드
 * 4. 세션 저장
 */
router.post('/idle/signin', (req, res)=>{

    // 관리자가 입력한 이메일(0), 비밀번호 (1)
    var admin = new Array();
    for(k in req.body){
        admin.push(req.body[k]);
    }

    // 비밀번호 해시화
    admin[1]=crypto.createHash('sha512').update(admin[1]).digest('base64');

    //db 연결
    getConnection(async(conn)=>{
        try{
            // db에 일치하는 이메일과 비밀번호가 있는지 확인
            var admin_login_sql = 'SELECT * FROM admin WHERE admin_email=? AND admin_pw=? AND admin_secede=?;';
            var admin_login_param = [admin[0], admin[1], 0];
            await new Promise((res, rej)=>{
                conn.query(admin_login_sql, admin_login_param, function (err, rows){
                    if (err || rows == '') {
                        error_request.message="이메일 혹은 비밀번호가 틀렸습니다."
                        conn.release();
                        rej(error_request);
                    }
                    res(rows);
                })
            })
            
            // 로그인한 시간 확인, admin_log 테이블 업데이트
            var admin_log_sql ='UPDATE admin_log SET admin_login_lately=? WHERE admin_email=?;';
            var admin_log_param = [now_time, admin[0]];
            await new Promise((res,rej)=>{
                conn.query(admin_log_sql,admin_log_param, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="amdin_log 테이블 에러"
                        rej(error_request);
                    }
                    res(rows);
                })
            })

            //세션 저장
            req.session.admin_email = admin[0];
            req.session.save(function () {
                success_request.message="로그인에 성공하였습니다."
                conn.release();
                //res.redirect('/home'); // 홈으로 이동하게 하자
                return res.send(success_request)
            })
        }catch(err){
            res.send(err)
        }
    })
})


/**
 * 관리자 로그아웃, http://localhost:3000/admins/idle/logout
 * 1. destroy로 삭제
 */
 router.post('/idle/logout', (req, res) => {
    try {
        req.session.destroy(function () {
            req.session;
            //res.redirect('/home'); // 홈으로 이동하게 하자
           success_request.message("로그아웃에 성공하였습니다.")
            res.send(success_res)
        });
    } catch {
        error_request.message("로그아웃에 실패하였습니다.")
        res.send(error_res)
    }
})


/**
 * 관리자 탈퇴처리, http://localhost:3000/admins/idle/admin-secede
 * 1. 세션 이메일 사용
 * 2. admin 테이블에서 admin_secede 값을 1로 업데이트
 * 3. 세션 날리고 홈으로 이동
*/
router.delete('/idle/admin-secede', (req, res)=>{
    getConnection(async (conn)=>{
        try{
            var admin_email=req.session.admin_email; // 세션 이메일
            await new Promise((res, rej)=>{
                // admin 테이블에서 admin_secede 값 1로 업데이트
                var secede_sql = 'UPDATE admin SET admin_secede=? WHERE admin_email=?;';
                var secede_param = [1, admin_email];
                conn.query(secede_sql, secede_param, function (err, rows) {
                    if (err || rows == '') {
                        conn.release();
                        error_request.message="admin_secede 값 변경 실패";
                        return rej(error_request);
                    }
                    res(rows);
                });
            });

            // 세션 삭제
            req.session.destroy(function () {
                conn.release();
                //res.redirect('/home'); // 홈으로 이동하게 하자
                success_request.message="탈퇴되었습니다."
                return res.send(success_request);
            })
        }catch(err){
            res.send(err);
        }
    })
})


/**
 * 회원 목록, http://localhost:3000/admins/idle/member-list
 * 회원 리스트 목록을 페이지에 어떻게 표현할지 더 생각해보자 ( 회원 이메일, 이름, 성별, 가입일자, 정지여부 보여줌)
 * 1. member 테이블에서 회원 리스트 뽑음
 */
router.get('/idle/member-list', (req, res)=>{

    getConnection(async(conn)=>{
        try{
            
            var member_name = req.query.member_search_name; // 검색 값
            var member_list_sql;
            var member_list_param;

            // 회원 목록 뽑기
            await new Promise((res, rej)=>{
                if(member_name== undefined){
                    // 검색 안할 때
                    member_list_sql='SELECT * FROM member JOIN member_log ON (member.member_email=member_log.member_email)';
                    member_list_param=null;
                }else{
                    // 검색할때
                    member_list_sql='SELECT * FROM member JOIN member_log ON (member.member_email=member_log.member_email) WHERE MATCH(member_name) AGAINST(? IN boolean mode)';
                    member_list_param=[ member_name+'*'];
                }

                conn.query(member_list_sql, member_list_param, function(err, rows){
                    console.log(rows)
                    if(err || rows==''){
                        error_request.message="회원 조회 실패";
                        conn.release();
                        return rej(error_request);
                    }
                    success_request.data=rows; //응답 데이터
                    conn.release();
                    res(rows);
                });
            }); 

            success_request.message="회원 목록 조회 성공"
            res.send(success_request);
        }
        catch(err){
            res.send(err)
        }
    })
})


/**
 * 회원 상세 페이지, http://localhost:3000/admins/idle/member-list/회원 이메일
 * 1. member 테이블에서 해당 회원의 member 테이블 정보 가져오기
 */
router.get('/idle/member-list/:member_email', (req, res)=>{
    
    getConnection(async(conn)=>{
        try{
            var member_email=req.params.member_email; //url 회원 이메일
            //해당 회원 member 테이블 정보 가져오기
            await new Promise((res,rej)=>{
                var member_detail_inform = 'SELECT * FROM member WHERE member_email=?'
                conn.query(member_detail_inform, member_email, function(err, rows){
                    if(err || rows==''){
                        error_request.message="member 테이블에서 데이터 불러오기 실패";
                        conn.release();
                        return rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })

            conn.release();
            success_request.message="회원 정보 가져오기 성공";
            res.send(success_request)            
        }catch(err){
            res.send(err);
        }
    });
})


/**
 * 회원 로그확인, http://localhost:3000/admins/idle/member-list/회원 이메일/log
 * 회원가입시간, 로그인 시간 가져오자
 * 1. member_log 테이블에서 선택한 회원의 가입날짜 가져오기
 * 2. member_login_log 테이블에서 회원의 로그인 로그 가져오기
 * 3. 합쳐서 json 응답 보내기
 */
router.get('/idle/member-list/:member_email/log', (req, res)=>{
    
    
    // 응답 json 처리에 쓸 변수
    var member_log; // 회원가입 로그 정보
    var member_login_log; //  로그인 로그 정보

    getConnection(async(conn)=>{
        try{
            var member_email=req.params.member_email; // 회원 이메일
            
            // member_log 테이블에서 선택한 회원의 가입날짜 가져오기
            await new Promise((res,rej)=>{
                var member_log_sql='SELECT member_log_join FROM member_log WHERE member_email=?;';
                conn.query(member_log_sql, member_email, function(err, rows){
                    if(err || rows==''){
                        console.log(err)
                        conn.release();
                        error_request.message="log 정보 가져오기 실패";
                        return rej(error_request);
                    }
                    member_log=rows;
                    res(rows);
                })
            })

            // member_login_log 테이블에서 선택한 회원의 로그인 로그 가져오기
            await new Promise((res,rej)=>{
                var member_login_log_sql='SELECT member_login FROM member_login_log WHERE member_email=?;';
                conn.query(member_login_log_sql, member_email, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="login_log 정보 가져오기 실패";
                        return rej(error_request);
                    }
                    member_login_log=rows;
                    res(rows);
                })
            })

            // 응답 데이터
            var member_detail_log=[member_log, member_login_log];
            conn.release();
            success_request.message= "log 정보 가져오기 성공";
            success_request.data=member_detail_log
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
})


/**
 * 회원 아이디어 목록, http://localhost:3000/admins/idle/member-list/회원 이메일/idea-list
 * 1. idea 테이블에서 해당 회원의 데이터를 가져온다.
 */
router.get('/idle/member-list/:member_email/idea-list', (req, res)=>{

    getConnection(async(conn)=>{
        try{
            var member_email = req.params.member_email;
            var idea_title = req.query.idea_search; // 검색 변수

            // idea 테이블에서 해당회원의 데이터 가져옴
            await new Promise((res, rej)=>{

                var member_idealist_sql;
                var member_idealist_params;

                if(idea_title==undefined){
                    // 검색 안했을 때
                    member_idealist_sql='SELECT * FROM idea WHERE member_email=?;';
                    member_idealist_params=[member_email];
                }
                else{
                    // 검색 했을 때
                    member_idealist_sql='SELECT * FROM idea WHERE member_email=? AND MATCH(idea_title) AGAINST(? IN boolean mode);';
                    member_idealist_params=[member_email, idea_title+'*'];
                }
                
                conn.query(member_idealist_sql, member_idealist_params, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="아이디어 목록을 불러오는데 실패했습니다.";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })

            conn.release();
            success_request.message="아이디어 목록을 불러오는데 성공했습니다.";
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
})


/**
 * 회원 아이디어 내용 보기, http://localhost:3000/admins/idle/member-list/회원 이메일/idea-list/게시물 번호
 * 1. 회원 이메일 아이디 정보 가져오기
 * 2. idea 테이블에서 제목 내용 작성일 얻은포인트 관리자이메일 정보 필요(다 가져오자)
 * 사용하는 것은 아이디어 제목, 내용, 작성일, 얻은 포인트, 관리자 이메일
 */
router.get('/idle/member-list/:member_email/idea-list/:idea_id', (req, res)=>{
    
    getConnection(async(conn)=>{
        try{
            
            var member_email = req.params.member_email;
            var idea_id = req.params.idea_id;
            await new Promise((res,rej)=>{
                var idealist_look_sql='SELECT * FROM idea WHERE member_email=? AND idea_id=?;';
                var idealist_look_param=[member_email, idea_id];
                conn.query(idealist_look_sql, idealist_look_param, function(err, rows){
                    if(err || rows==''){
                        console.log(err)
                        conn.release();
                        error_request.message="해당 아이디어 정보를 가져오는데 실패했습니다.";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })

            conn.release();
            success_request.message="해당 아이디어 정보를 가져오는데 성공했습니다."
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
})


/**
 * 선택한 아이디어 수정 내용 목록, http://localhost:3000/admins/idle/member-list/회원 이메일/idea-list/게시물 번호/modified
 * 1. idea_log 테이블에서 idea_id와 일치한 정보가져오기
 */
router.get('/idle/member-list/:member_email/idea-list/:idea_id/modified',(req,res)=>{

    getConnection(async(conn)=>{
        try{
            var idea_id = req.params.idea_id; // 선택한 아이디어
            var idea_title = req.query.idea_search;
            console.log("검색 내용: "+ idea_title);

            await new Promise((res,rej)=>{
            
                var idea_modify_sql;
                var idea_modify_params;

                if(idea_title==undefined){
                    //검색 안했을 때
                    idea_modify_sql='SELECT * FROM idea_log WHERE idea_id=?;';
                    idea_modify_params=idea_id;
                }else{
                    //검색 했을 때
                    idea_modify_sql='SELECT * FROM idea_log WHERE idea_id=? AND MATCH(idea_title) AGAINST(? IN boolean mode);';
                    idea_modify_params=[idea_id, idea_title+'*'];
                }
                conn.query(idea_modify_sql, idea_modify_params, function(err, rows){
                    if(err || rows==''){
                        console.log(err)
                        conn.release();
                        error_request.message="아이디어 수정 전 데이터 가져오기 실패";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message="아디이어 수정 전 데이터 가져오기 성공";
            res.send(success_request);
        }catch(err){
            res.send(err)
        }
    })
})


/**
 * 선택한 아이디어 수정 내용 보기, http://localhost:3000/admins/idle/member-list/회원 이메일/idea-list/게시물 번호/modified/modify-num
 * 1. idea_log 테이블의 id num 값을 저장
 * 2. 해당 id를 가진 아이디어, 선택한 아이디어의 num로 idea_log 테이블을 조회하여 데이터 가져온다.
 */
router.get('/idle/member-list/:member_email/idea-list/:idea_id/modified/:modify_num', (req,res)=>{
    

    getConnection(async(conn)=>{
        try{
            var idea_id = req.params.idea_id;
            var modify_num = req.params.modify_num;

            // 해당 id를 가진 아이디어, 선택한 아이디어의 num로 idea_log 테이블을 조회하여 데이터 가져온다.
            await new Promise((res,rej)=>{
                var modifyidea_look_sql='SELECT * FROM idea_log WHERE idea_id=? AND idea_num=?;';
                var modifyidea_look_param=[idea_id, modify_num];
                conn.query(modifyidea_look_sql, modifyidea_look_param, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="수정 전 데이터 가져오기 실패";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })

            conn.release();
            success_request.message="수정 전 데이터 가져오기 성공";
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
})


/**
 * 회원 문의사항 목록, http://localhost:3000/admins/idle/member-list/회원 이메일/cs-list
 * 1. cs테이블에서 해당 회원 이메일 조회하여 데이터 가져오기, 파일 필요없음
 */
router.get('/idle/member-list/:member_email/cs-list', (req, res)=>{

    getConnection(async(conn)=>{
        try{
            var member_email=req.params.member_email;
            var cs_title = req.query.cs_search; // 검색 내용

            await new Promise((res, rej)=>{
                var member_cslist_sql;
                var member_cslist_params

                if(cs_title==undefined){
                    // 검색 안했을 때
                    member_cslist_sql='SELECT * FROM cs WHERE member_email=?;';
                    member_cslist_params=member_email;
                }else{
                    // 검색 했을 때
                    member_cslist_sql='SELECT * FROM cs WHERE member_email=? AND MATCH(cs_title) AGAINST(? IN boolean mode);';
                    member_cslist_params=[member_email, cs_title + '*'];
                }
                conn.query(member_cslist_sql, member_cslist_params, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="cs 정보 불러오기 실패";
                        rej(error_request);
                    } 
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message="cs 정보 불러오기 성공";
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
  
})


/**
 * 회원 문의사항 목록 검색
 */


/**
 * 회원 문의사항 내용 보기, http://localhost:3000/admins/idle/member-list/회원 이메일/cs-list/cs-id
 * 1. cs_file_dir 조인
 */
router.get('/idle/member-list/:member_email/cs-list/:cs_id', (req, res)=>{
    
    
    getConnection(async(conn)=>{
        try{
            var member_email=req.params.member_email;
            var cs_id=req.params.cs_id;

            await new Promise((res, rej)=>{
                var cslist_look_sql='SELECT * FROM cs JOIN cs_file_dir ON (cs.cs_id = cs_file_dir.cs_id) WHERE member_email=? AND cs.cs_id=?;';
                var cslist_look_param=[member_email, cs_id];
                conn.query(cslist_look_sql,cslist_look_param, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="해당 cs 정보를 가져오는데 실패했습니다.";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message = "해당 cs 정보를 가져오는데 성공했습니다.";
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
})


/**
 * 선택한 문의사항 수정 내용 목록, http://localhost:3000/admins/idle/member-list/회원 이메일/cs-list/cs-id/modified
 */
router.get('/idle/member-list/:member_email/cs-list/:cs_id/modified', (req,res)=>{

    getConnection(async(conn)=>{
        try{
            var cs_id = req.params.cs_id; // 선택한 아이디어
            var cs_before_title = req.query.cs_search; // 검색 내용

            await new Promise((res,rej)=>{

                var cs_modify_sql;
                var cs_modify_params;

                if(cs_before_title==undefined){
                    cs_modify_sql='SELECT * FROM cs_log WHERE cs_id=?;';
                    cs_modify_params=cs_id;
                }else{
                    cs_modify_sql='SELECT * FROM cs_log WHERE cs_id=? AND MATCH(cs_before_title) AGAINST(? IN boolean mode);';
                    cs_modify_params=[cs_id, cs_before_title+'*'];
                }
                conn.query(cs_modify_sql, cs_modify_params, function(err, rows){
                    if(err || rows==''){
                        console.log(err)
                        conn.release();
                        error_request.message="문의사항 수정 전 데이터 가져오기 실패";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message="문의사항 수정 전 데이터 가져오기 성공";
            res.send(success_request);
        }catch(err){
            res.send(err)
        }
    })
})


/**
 * 선택한 문의사항 수정 내용 보기, http://localhost:3000/admins/idle/member-list/회원 이메일/cs-list/cs-id/modified/문의사항 번호
 */
 router.get('/idle/member-list/:member_email/cs-list/:cs_id/modified/:modify_num', (req,res)=>{
    

    getConnection(async(conn)=>{
        try{
            var cs_id = req.params.cs_id;
            var modify_num = req.params.modify_num;

            // 해당 id를 가진 아이디어, 선택한 아이디어의 num로 idea_log 테이블을 조회하여 데이터 가져온다.
            await new Promise((res,rej)=>{
                var modifyidea_look_sql='SELECT * FROM cs_log JOIN cs_file_dir ON (cs_log.cs_id = cs_file_dir.cs_id) WHERE cs_log.cs_id=? AND cs_num=?;';
                var modifyidea_look_param=[cs_id, modify_num];
                conn.query(modifyidea_look_sql, modifyidea_look_param, function(err, rows){
                    if(err || rows==''){
                        console.log(err)
                        conn.release();
                        error_request.message="수정 전 데이터 가져오기 실패";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })

            conn.release();
            success_request.message="수정 전 데이터 가져오기 성공";
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
})


/**
 * 회원 관심사업 목록, http://localhost:3000/admins/idle/member-list/회원 이메일/inter-anno-list
 * 1. 해당회원의 anno 테이블 정보만 가져오자
 */
router.get('/idle/member-list/:member_email/inter-anno-list', (req, res)=>{
    getConnection(async(conn)=>{
        try{
            var member_email=req.params.member_email;
            await new Promise((res, rej)=>{
                var interanno_list_sql='SELECT * FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=?;';
                conn.query(interanno_list_sql, member_email, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="관심사업 목록 데이터 가져오기 실패";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message="관심사업 목록 데이터 가져오기 성공";
            res.send(success_request);            
        }catch(err){
            res.send(err)
        }
    })
})


/**
 * 회원 관심사업 목록 검색
 */


/**
 * 회원 관심사업 내용 보기, http://localhost:3000/admins/idle/member-list/회원 이메일/inter-anno-list/관심사업 번호
 */
router.get('/idle/member-list/:member_email/inter-anno-list/:anno_id', (req, res)=>{
    getConnection(async(conn)=>{
        try{
            var member_email = req.params.member_email;
            var anno_id = req.params.anno_id;

            await new Promise((res, rej)=>{
                var interanno_look_sql='SELECT * FROM anno JOIN anno_img_dir ON (anno.anno_id = anno_img_dir.anno_id) JOIN inter_anno ON (anno_img_dir.anno_id = inter_anno.anno_id) WHERE member_email=? AND anno.anno_id;';
                var interanno_look_params=[member_email, anno_id];
                conn.query(interanno_look_sql, interanno_look_params, function(err, rows){
                    if(err || rows==''){
                        console.log(err)
                        conn.release();
                        error_request.message="관심사업 데이터 불러오기 실패";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message="관심사업 데이터 불러오기 성공";
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
})

/**
 * 회원 정지처리, http://localhost:3000/admins/idle/member-list/회원 이메일/ban
 * 회원 목록에서 회원 클릭하면 마이페이지에서 여러개로 나뉘듯 여러 속성있음 (로그 보기 , 정지 처리 등...)
 * 회원 목록에서 회원 클릭할때 그 회원 이메일 세션에 저장
 * 1. 선택한 해당 회원 member 테이블에서 member_ban 값 1로 변경
 * 2. member_ban 테이블에 기록
 */
 router.post('/idle/member-list/:member_email/ban', (req, res) => {

    var member_email=req.params.member_email; // 회원 이메일
    var admin_email= req.session.admin_email; // 관리자 이메일

    getConnection(async (conn) => {
        try {
            // 선택한 회원을 찾아서 member_ban 값을 1로 변경
            await new Promise((res, rej) => {
                var member_ban_sql = 'UPDATE member SET member_ban=? WHERE member_email=?;';
                var member_ban_param = [1, member_email];
                conn.query(member_ban_sql, member_ban_param, function (err, rows) {
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "선택한 회원이 없음"
                        return rej(error_request);
                    }
                    res(rows);
                })
            })

            // member_ban 테이블에 기록
            await new Promise((res, rej) => {
                member_ban_sql = 'INSERT INTO member_ban (member_email, member_ban_reason, member_ban_date, admin_email) VALUES(?,?,?,?);';
                member_ban_param = [member_email, req.body.member_ban_reason, now_time, admin_email];
                conn.query(member_ban_sql, member_ban_param, function (err, rows) {
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "member_ban 테이블에 기록 실패";
                        return rej(error_request);
                    }
                    res(rows);
                });
            });

            conn.release();
            success_request.message = "정지처리가 성공적으로 되었습니다."
            res.send(success_request);
        } catch (err) {
            res.send(err);
        }
    })
})


/**
 * 관리자 로그 페이지, http://localhost:3000/admins/idle/admin-log
 * 1. admin_log 테이블에서 모든 정보를 가져온다.
 */
router.get('/idle/admin-log', (req, res)=>{
    getConnection(async(conn)=>{
        try{
            var admin_log_email=req.query.admin_log_search;

            await new Promise((res, rej)=>{
                var admin_log_sql;
                var admin_log_params;

                if(admin_log_email == undefined){
                    admin_log_sql='SELECT * FROM admin_log;';
                    admin_log_params=null;
                }else{
                    admin_log_sql='SELECT * FROM admin_log WHERE MATCH(admin_email) AGAINST(?);';
                    admin_log_params=admin_log_email + '*';
                }
                conn.query(admin_log_sql, admin_log_params, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="관리자 로그 정보를 가져오는데 실패했습니다.";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message="관리자 로그 정보를 가져오는데 성공했습니다.";
            res.send(success_request);
        }catch(err){
            res.send(err);
        }
    })
});


/**
 * 공지사항 목록, http://localhost:3000/admins/idle/notice-list
 * 1. notice 테이블, notice_file_dir 테이블 JOIN
 */
router.get('/idle/notice-log', (req, res)=>{
    getConnection(async(conn)=>{
        try {
            await new Promise((res, rej)=>{
                var notice_list_sql='SELECT * FROM notice;';
                conn.query(notice_list_sql, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="공지사항 데이터 가져오기 실패";
                        rej(error_request);
                    }
                    success_request.data=rows;
                    res(rows);
                })
            })
            conn.release();
            success_request.message="공지사항 데이터 가져오기 성공";
            res.send(success_request);
        } catch (err) {
            res.send(err);
        }
    })
})



/**
 * 공고정보게시판 올리기, http://localhost:3000/admins/idle/board/announcement
 * 아이디어 플랫폼에서 끌어오면 문제가 생길 수 있으니, 학교 도서관 게시물 사이트를 이용하자 (공부 목적)
 * 1. 학교 도서관 사이트를 크롤링
 * 2. 크롤링 한 데이터를 db에 저장
 */
router.get('/idle/board/announcement', (req, res) => {


    getConnection(async (conn) => {
        try {

            // db 입력 부분
            await new Promise((res, rej) => {
                console.log(5)
                console.log(anno_data)
                //var anno_list_sql='INSERT INTO anno (anno_id, anno_title, anno_contents, anno_date, anno_link) VALUES (?,?,?,?,?)'
                //var anno_list_params;
                res();
            })

            console.log(6)
        } catch (err) {

        }
    })
})



module.exports = router;
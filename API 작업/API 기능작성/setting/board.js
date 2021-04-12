var getConnection = require('./db.js');
var { success_request, error_request } = require('./request.js');
var {now_time} = require('./time.js');

//아이디어 목록 불러오기
async function idea_list(get_email, search_title, page) {

    try {
        var member_email = get_email; // 회원 이메일
        var idea_title = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        // 쿼리문 조건
        let idea_list_sql;
        let idea_list_params;

        if (member_email != undefined && idea_title == undefined) {
            // 회원 아이디어 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            idea_list_sql = 'SELECT idea_title, idea_contents, idea_date FROM idea WHERE member_email=? AND idea_delete=? LIMIT 10 OFFSET ?;';
            idea_list_params = [member_email, 0, page_num];

        } else if (member_email != undefined && idea_title != undefined) {
            // 회원 아이디어 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            idea_list_sql = 'SELECT idea_title, idea_contents, idea_date FROM idea WHERE member_email=? AND idea_delete=? AND MATCH(idea_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            idea_list_params = [member_email, 0, idea_title + '*', page_num];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(idea_list_sql, idea_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "아이디어 목록 불러오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "회원 아이디어 목록 불러오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 문의게시판 목록
async function cs_list(get_email, search_title, admin_check, page) {

    try {
        let member_email = get_email; // 회원 이메일
        let cs_title = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        // 쿼리문 조건
        let cs_list_sql;
        let cs_list_params;

        if (member_email != undefined && cs_title == undefined && admin_check == 1)  {
            // 회원 상세 문의게시판, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            cs_list_sql = 'SELECT * FROM cs WHERE member_email=? LIMIT 10 OFFSET ?;';
            cs_list_params = [member_email, page_num];
        } 
        else if (member_email != undefined && cs_title != undefined && admin_check == 1) {
            // 회원 상세 문의게시판 검색한 경우, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            cs_list_sql = 'SELECT * FROM cs WHERE member_email=? AND MATCH(cs_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            cs_list_params = [member_email, cs_title + '*', page_num];
        }else if (member_email == undefined && cs_title == undefined && admin_check == 0){
            // 유저 관점 문의게시판
            cs_list_sql = 'SELECT * FROM cs;';
            cs_list_params=page_num;
        }else if (member_email == undefined && cs_title != undefined && admin_check == 0){
            // 유저 관점 문의게시판 검색한 경우
            cs_list_sql = 'SELECT * FROM cs WHERE MATCH(cs_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            cs_list_params=[cs_title + '*', page_num];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(cs_list_sql, cs_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "문의게시판 목록 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "문의게시판 목록 가져오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 문의게시판 내용
async function cs_look(cs_num, admin_check){
    try{

        let cs_look_num = cs_num // 게시물 번호

        // 쿼리문 조건
        let cs_look_sql;
        let cs_look_params;

        if(admin_check==0){
            // 회원관점 문의게시판 내용
            cs_look_sql = 'SELECT * FROM cs JOIN cs_file_dir ON (cs.cs_id = cs_file_dir.cs_id) WHERE cs.cs_id=?;';
            cs_look_params = cs_look_num;
        }
        

        await new Promise((res, rej)=>{
            getConnection(conn => {
                conn.query(cs_look_sql, cs_look_params, function (err, rows) {
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "문의게시판 내용 불러오기 실패";
                        return rej(error_request);
                    }
                    
                    // 회원 관점에서 비밀글 설정되어있으면 못보게 처리
                    if(rows[0].cs_secret==1 && admin_check==0){
                        conn.release();
                        error_request.message="비밀글은 작성자 본인만 볼 수 있습니다.";
                        return rej(error_request)
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        success_request.message="문의게시판 내용 불러오기 성공";
        return success_request;

    }catch(err){
        return err;
    }

}


// 문의게시판 업로드
async function cs_write(get_email, cs_title, cs_contents, cs_secret, cs_file) {
    try {
        console.log();
        console.log("받은 이메일:", get_email, " 받은 제목:", cs_title, " 받은 내용:", cs_contents, " 받은 비밀글 체크:", cs_secret);
        console.log("첨부파일: ", cs_file)
        // 쿼리문 조건
        let cs_write_sql;
        let cs_write_params;

        let cs_id;
        console.log(1)

        //conn.beginTransaction();
        console.log(2)
        // 회원이 입력한 정보 cs 테이블에 저장
        await new Promise((res, rej) => {
            getConnection(conn => {
                cs_write_sql = 'INSERT INTO cs (cs_title, cs_contents, cs_date, member_email, cs_secret) VALUES (?,?,now(),?,?);';
                cs_write_params = [cs_title, cs_contents, get_email, cs_secret];
                conn.query(cs_write_sql, cs_write_params, function (err, rows) {
                    console.log(rows)
                    console.log(3)
                    if (err || rows == '') {
                        conn.release();
                        error_request.message = "cs 테이블 저장 실패";
                        return rej(err)
                    }
                    conn.release();
                    res();
                })
            })
        })

        // cs_id 번호 가져오기
        await new Promise((res, rej) => {
            getConnection(conn => {
                cs_write_sql = ' SELECT cs_id FROM cs WHERE member_email=? AND cs_date=now();';
                cs_write_params = [get_email];
                conn.query(cs_write_sql, cs_write_params, function (err, rows) {
                    console.log(4)
                    if (err || rows == '') {
                        conn.release();
                        error_request.message = "cs_id 번호 가져오기 실패";
                        return rej(error_request);
                    }
                    cs_id = rows[0].cs_id;
                    conn.release();
                    res();
                })
            })
        })

        // 첨부파일 cs_file_dir 테이블에 저장(업데이트)
        await new Promise((res, rej) => {
            getConnection(conn => {
                
                if(cs_file == undefined){
                    cs_file_originalname=null;
                    cs_file_path=null;
                }else{
                    cs_file_originalname=cs_file.originalname;
                    cs_file_path=cs_file.path;
                }
                cs_write_sql = 'INSERT INTO cs_file_dir (cs_id, cs_file_name, cs_file_path) VALUES (?,?,?);';
                cs_write_params = [cs_id, cs_file_originalname, cs_file_path];
                conn.query(cs_write_sql, cs_write_params, function (err, rows) {
                    console.log(5)
                    console.log(rows)
                    if (err || rows == '') {
                        error_request.message = "cs_file_dir 테이블 저장 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    res();
                })
            })
        })

        console.log(6)
        success_request.data = {
            "cs_title": cs_title,
            "cs_contents": cs_contents,
            "member_email": get_email,
            "cs_secret": cs_secret,
            "cs_file_name": cs_file_originalname,
            "cs_file_path": cs_file_path
        }
        success_request.message = "문의게시판 업로드 성공"
        return success_request;
    } catch (err) {
        return err;
    }
}


// 문의게시판 수정 페이지
async function cs_update_page(cs_num){
    try{

        let cs_update_num = cs_num // 게시물 번호

        // 쿼리문 조건
        let cs_update_sql;
        let cs_update_params;

        // 회원관점 문의게시판 내용
        cs_update_sql = 'SELECT member_name, cs_secret, cs_title, cs_contents, cs_file_name, cs_file_path FROM member JOIN cs ON (member.member_email = cs.member_email) JOIN cs_file_dir ON (cs.cs_id = cs_file_dir.cs_id) WHERE cs.cs_id=?;';
        cs_update_params = cs_update_num;

        await new Promise((res, rej)=>{
            getConnection(conn => {
                conn.query(cs_update_sql, cs_update_params, function (err, rows) {
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "문의게시판 정보 불러오기 실패";
                        return rej(error_request);
                    }
                    
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        success_request.message="문의게시판 내용 불러오기 성공";
        return success_request;

    }catch(err){
        return err;
    }

}


// 문의게시판 내용수정
async function cs_update(get_email, cs_title, cs_contents, cs_secret, cs_file, cs_num){
    try {
        console.log();
        console.log("받은 이메일:", get_email, " 받은 제목:", cs_title, " 받은 내용:", cs_contents, " 받은 비밀글 체크:", cs_secret);
        console.log("첨부파일: ", cs_file);
        console.log("게시물 번호: ", cs_num);
        // 쿼리문 조건
        let cs_write_sql;
        let cs_write_params;

        let cs_file_originalname, cs_file_path; // 파일 이름, 파일 경로
        console.log(1)

        //conn.beginTransaction();
        console.log(2)
        // 회원이 입력한 정보 cs 테이블에 업데이트
        await new Promise((res, rej) => {
            getConnection(conn => {
                cs_write_sql = 'UPDATE cs SET cs_title=?, cs_contents=?, cs_date=?, member_email=?, cs_secret=? WHERE cs_id=?;';
                cs_write_params = [cs_title, cs_contents, now_time, get_email, cs_secret, cs_num];
                conn.query(cs_write_sql, cs_write_params, function (err, rows) {
                    console.log(3)
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "cs 테이블 저장 실패";
                        return rej(error_request)
                    }
                    conn.release();
                    res();
                })
            })
        })


        // 첨부파일 cs_file_dir 테이블에 저장(업데이트)
        await new Promise((res, rej) => {
            getConnection(conn => {
                
                if(cs_file == undefined){
                    cs_file_originalname=null;
                    cs_file_path=null;
                }else{
                    cs_file_originalname=cs_file.originalname;
                    cs_file_path=cs_file.path;
                }
                cs_write_sql = 'UPDATE cs_file_dir SET cs_id=?, cs_file_name=?, cs_file_path=? WHERE cs_id;';
                cs_write_params = [cs_num, cs_file_originalname, cs_file_path, cs_num];
                conn.query(cs_write_sql, cs_write_params, function (err, rows) {
                    console.log(5)
                    console.log(rows)
                    if (err || rows == '') {
                        error_request.message = "cs_file_dir 테이블 저장 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    res();
                })
            })
        })

        console.log(6)
        success_request.data = {
            "cs_title": cs_title,
            "cs_contents": cs_contents,
            "member_email": get_email,
            "cs_secret": cs_secret,
            "cs_file_name": cs_file_originalname,
            "cs_file_path": cs_file_path
        }
        success_request.message = "문의게시판 수정 성공"
        return success_request;
    } catch (err) {
        return err;
    }
}


// 공고정보게시판 목록
async function anno_list(search_title, page) {

    try {

        let anno_title = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        // 쿼리문 조건
        let anno_list_sql;
        let anno_list_params;

        if (anno_title == undefined) {
            // 공고정보게시판 목록  ( 검색안했을 때 )
            anno_list_sql = 'SELECT anno_id, anno_title, anno_date FROM anno ORDERS LIMIT 10 OFFSET ?;';
            anno_list_params = [page_num];
        }
        else if(anno_title != undefined){
            // 공고정보게시판 목록  ( 검색했을 때 )
            anno_list_sql = 'SELECT anno_id, anno_title, anno_date FROM anno WHERE MATCH(anno_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            anno_list_params = [anno_title+'*', page_num ];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(anno_list_sql, anno_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "관심사업 목록 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "관심사업 목록 가져오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 공고정보게시판 내용
async function anno_look(anno_num){
    try {
        
        let anno_look_num = anno_num // 게시물 번호

        // 쿼리문 조건
        let anno_look_sql;
        let anno_look_params;

        anno_look_sql='SELECT anno_ref, anno_link, anno_contents FROM anno WHERE anno_id=?;';
        anno_look_params=anno_look_num;

        await new Promise((res, rej)=>{
            getConnection(conn => {
                conn.query(anno_look_sql, anno_look_params, function (err, rows) {
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "공고정보게시판 내용 불러오기 실패";
                        rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        success_request.message="공고정보게시판 내용 불러오기 성공";
        return success_request;
    } catch (err) {
    return(err);
    }
}


// 관심사업 목록
async function inter_anno_list(search_title, page) {

    try {
        let member_email = get_email; // 회원 이메일
        let inter_anno_title = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        // 쿼리문 조건
        let inter_anno_list_sql;
        let inter_anno_list_params;

        if (member_email != undefined && inter_anno_title == undefined && admin_check == undefined)  {
            // 회원 관심사업 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            inter_anno_list_sql = 'SELECT anno.anno_id, anno.anno_title, anno.anno_date FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? AND anno_delete=? LIMIT 10 OFFSET ?;';
            inter_anno_list_params = [member_email, 0, page_num];

        } else if (member_email != undefined && inter_anno_title != undefined && admin_check == undefined) {
            // 회원 관심사업 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            inter_anno_list_sql = 'SELECT anno.anno_id, anno.anno_title, anno.anno_date FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? AND anno_delete=? AND MATCH(anno_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            inter_anno_list_params = [mem_email, 0, anno_title + '*', page_num];
        } else if (member_email != undefined && inter_anno_title == undefined && admin_check == 1)  {
            // 관리자의 회원 관심사업 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            inter_anno_list_sql = 'SELECT * FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? LIMIT 10 OFFSET ?;';
            inter_anno_list_params = [member_email, 0, page_num];

        } else if (member_email != undefined && inter_anno_title != undefined && admin_check == 1) {
            // 관리자의 회원 관심사업 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            inter_anno_list_sql = 'SELECT * FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? AND MATCHED(anno_contents) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            inter_anno_list_params = [mem_email, 0, anno_title + '*', page_num];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(inter_anno_list_sql, inter_anno_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        conn.release();
                        error_request.message = "관심사업 목록 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "관심사업 목록 가져오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 공지사항 목록
async function notice_list(search_title, page) {

    try {

        let notice_title = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        let notice_list_sql;
        let notice_list_params;

        if (notice_title == undefined)  {
            // 공지사항 목록 (검색 안한경우)
            notice_list_sql = 'SELECT * FROM notice ORDERS LIMIT 10 OFFSET ?;';
            notice_list_params = [page_num];

        } 
        else if (notice_title != undefined) {
            // 공지사항 목록 (검색 한 경우)
            notice_list_sql = 'SELECT * FROM notice WHERE MATCH(notice_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            notice_list_params = [notice_title + '*', page_num];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(notice_list_sql, notice_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "공지사항 목록 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "공지사항 목록 가져오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 공지사항 내용
async function notice_look(notice_num){
    try {
        
        let notice_look_num = notice_num // 게시물 번호

        // 쿼리문 조건
        let notice_look_sql;
        let notice_look_params;

        notice_look_sql='SELECT * FROM notice JOIN notice_file_dir ON (notice.notice_id = notice_file_dir.notice_id) WHERE notice.notice_id=?;';
        notice_look_params=notice_look_num;

        await new Promise((res, rej)=>{
            getConnection(conn => {
                conn.query(notice_look_sql, notice_look_params, function (err, rows) {
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "공지사항 내용 불러오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        success_request.message="공지사항 내용 불러오기 성공";
        return success_request;
    } catch (err) {
    return(err);
    }
}


// 회원 목록
async function member_list(search_title, page) {

    try {

        let member_name = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        // 쿼리문 조건
        let member_list_sql;
        let member_list_params;

        if (member_name == undefined) {
            // 공고정보게시판 목록  ( 검색안했을 때 )
            member_list_sql='SELECT * FROM member JOIN member_log ON (member.member_email=member_log.member_email) LIMIT 10 OFFSET ?';
            member_list_params = [page_num];
        }
        else if(member_name != undefined){
            // 공고정보게시판 목록  ( 검색했을 때 )
            member_list_sql = 'SELECT * FROM member JOIN member_log ON (member.member_email=member_log.member_email) WHERE MATCH(member_name) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?';
            member_list_params= [member_name + '*', page_num]
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(member_list_sql, member_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "회원 목록 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "회원 목록 가져오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 회원 로그 목록
async function member_log_list(get_email, page){
    try {

        let member_email = get_email; // 회원 이메일
        let page_num = (page-1)*10; // 페이지 번호

        // 응답 json 처리에 쓸 변수
        let member_log; // 회원가입 로그 정보
        let member_login_log; //  로그인 로그 정보

        // 쿼리문 조건
        let member_log_list_sql;
        let member_log_list_params;

        // member_log 테이블에서 선택한 회원의 가입날짜 가져오기
        await new Promise((res,rej)=>{
            getConnection(conn => {
                member_log_list_sql = 'SELECT member_log_join FROM member_log WHERE member_email=? LIMIT 10 OFFSET ?;';
                member_log_list_params = [member_email, page_num]
                conn.query(member_log_list_sql, member_log_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "member_log 데이터 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    member_log = rows;
                    res(rows);
                })
            })
        })

        // member_login_log 테이블에서 선택한 회원의 로그인 로그 가져오기
        await new Promise((res,rej)=>{
            getConnection(conn => {
                member_log_list_sql = 'SELECT member_login FROM member_login_log WHERE member_email=? LIMIT 10 OFFSET ?;';
                member_log_list_params = [member_email, page_num]
                conn.query(member_log_list_sql, member_log_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "member_login_log 데이터 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    member_login_log = rows;
                    res(rows);
                })
            })
        })


        //사용내역 응답
        let member_detail_log=[member_log, member_login_log];
        success_request.data=member_detail_log
        success_request.message = "회원 로그 목록 가져오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 관리자 로그 목록
async function admin_log_list(search_email, page){
    try {

        let admin_email = search_email; // 관리자 이메일
        let page_num = (page-1)*10; // 페이지 번호

        // 쿼리문 조건
        let admin_log_list_sql;
        let admin_log_list_params;

        if (admin_email == undefined)  {
            // 관리자 로그 조회
            admin_log_list_sql = 'SELECT * FROM admin_log ORDERES LIMIT 10 OFFSET ?;';
            admin_log_list_params = [page_num];
        } 
        else if (admin_email != undefined) {
            // 관리자 로그 조회(검색)
            admin_log_list_sql = 'SELECT * FROM admin_log WHERE MATCH(admin_email) AGAINST(?);';
            admin_log_list_params = [admin_email + '*', page_num];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(admin_log_list_sql, admin_log_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "관리자 로그 정보 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "관리자 로그 정보 가져오기 성공";
        return success_request;
        
    } catch (err) {
        return err;
    }
}




module.exports={
    idea_list:idea_list,

    cs_list:cs_list, cs_look:cs_look, cs_write:cs_write, cs_update_page:cs_update_page, cs_update:cs_update, 

    anno_list:anno_list, anno_look:anno_look,

    inter_anno_list:inter_anno_list,

    notice_list:notice_list, notice_look:notice_look,
    
    member_list:member_list,

    member_log_list:member_log_list,

    admin_log_list:admin_log_list
};

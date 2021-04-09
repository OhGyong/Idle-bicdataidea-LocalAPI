var getConnection = require('./db.js');
var { success_request, error_request } = require('./request.js');

//아이디어 목록 불러오기
async function idea_list(get_email, search_title) {

    try {
        var member_email = get_email; // 회원 이메일
        var idea_title = search_title; // 검색 제목

        // 쿼리문 조건
        let idea_list_sql;
        let idea_list_params;

        if (member_email != undefined && idea_title == undefined) {
            // 회원 아이디어 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            idea_list_sql = 'SELECT idea_title, idea_contents, idea_date FROM idea WHERE member_email=? AND idea_delete=?;';
            idea_list_params = [member_email, 0];

        } else if (member_email != undefined && idea_title != undefined) {
            // 회원 아이디어 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            idea_list_sql = 'SELECT idea_title, idea_contents, idea_date FROM idea WHERE member_email=? AND idea_delete=? AND MATCH(idea_title) AGAINST(? IN boolean mode);';
            idea_list_params = [member_email, 0, idea_title + '*'];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(idea_list_sql, idea_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
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


// 문의사항 목록
async function cs_list(get_email, search_title, admin_check) {

    try {
        let member_email = get_email; // 회원 이메일
        let cs_title = search_title; // 검색 제목

        // 쿼리문 조건
        let cs_list_sql;
        let cs_list_params;

        if (member_email != undefined && cs_title == undefined && admin_check == 1)  {
            // 관리자의 회원 문의사항 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            cs_list_sql = 'SELECT * FROM cs WHERE member_email=?;';
            cs_list_params = [member_email];

        } 
        else if (member_email != undefined && cs_title != undefined && admin_check == 1) {
            // 관리자의 회원 문의사항 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            cs_list_sql = 'SELECT * FROM cs WHERE member_email=? AND MATCH(cs_title) AGAINST(? IN boolean mode);';
            cs_list_params = [member_email, cs_title + '*'];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(cs_list_sql, cs_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        conn.release();
                        error_request.message = "문의사항 목록 가져오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "문의사항 목록 가져오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 공고정보게시판 목록
async function anno_list(search_title) {

    try {

        let anno_title = search_title; // 검색 제목

        // 쿼리문 조건
        let anno_list_sql;
        let anno_list_params;

        if (anno_title == undefined) {
            // 공고정보게시판 목록  ( 검색안했을 때 )
            anno_list_sql = 'SELECT anno_id, anno_title, anno_date FROM anno;';
            anno_list_params = [];
        }
        else if(anno_title != undefined){
            // 공고정보게시판 목록  ( 검색했을 때 )
            anno_list_sql = 'SELECT anno_id, anno_title, anno_date FROM anno WHERE MATCH(anno_title) AGAINST(? IN boolean mode);';
            anno_list_params = [anno_title];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(anno_list_sql, anno_list_params, function (err, rows) {
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


// 관심사업 목록
async function inter_anno_list(search_title) {

    try {
        let member_email = get_email; // 회원 이메일
        let inter_anno_title = search_title; // 검색 제목

        // 쿼리문 조건
        let inter_anno_list_sql;
        let inter_anno_list_params;

        if (member_email != undefined && inter_anno_title == undefined && admin_check == undefined)  {
            // 회원 관심사업 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            inter_anno_list_sql = 'SELECT anno.anno_id, anno.anno_title, anno.anno_date FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? AND anno_delete=?;';
            inter_anno_list_params = [member_email, 0];

        } else if (member_email != undefined && inter_anno_title != undefined && admin_check == undefined) {
            // 회원 관심사업 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            inter_anno_list_sql = 'SELECT anno.anno_id, anno.anno_title, anno.anno_date FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? AND anno_delete=? AND MATCH(anno_title) AGAINST(? IN boolean mode);';
            inter_anno_list_params = [mem_email, 0, anno_title + '*'];
        } else if (member_email != undefined && inter_anno_title == undefined && admin_check == 1)  {
            // 관리자의 회원 관심사업 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            inter_anno_list_sql = 'SELECT * FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=?;';
            inter_anno_list_params = [member_email, 0];

        } else if (member_email != undefined && inter_anno_title != undefined && admin_check == 1) {
            // 관리자의 회원 관심사업 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            inter_anno_list_sql = 'SELECT * FROM anno JOIN inter_anno ON (anno.anno_id = inter_anno.anno_id) WHERE member_email=? AND MATCHED(anno_contents) AGAINST(? IN boolean mode);';
            inter_anno_list_params = [mem_email, 0, anno_title + '*'];
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
async function notice_list(search_title) {

    try {

        let notice_title = search_title;

        let notice_list_sql;
        let notice_list_params;

        if (notice_title == undefined)  {
            // 관리자의 회원 문의사항 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
            notice_list_sql = 'SELECT * FROM notice;';
            notice_list_params = [];

        } 
        else if (notice_title != undefined) {
            // 관리자의 회원 문의사항 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
            notice_list_sql = 'SELECT * FROM notice WHERE MATCH(notice_title) AGAINST(? IN boolean mode);';
            notice_list_params = [notice_title + '*'];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(notice_list_sql, notice_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
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


// 회원 목록
async function member_list(search_title) {

    try {

        let member_name = search_title; // 검색 제목

        // 쿼리문 조건
        let member_list_sql;
        let member_list_params;

        if (member_name == undefined) {
            // 공고정보게시판 목록  ( 검색안했을 때 )
            member_list_sql='SELECT * FROM member JOIN member_log ON (member.member_email=member_log.member_email)';
            member_list_params = [];
        }
        else if(member_name != undefined){
            // 공고정보게시판 목록  ( 검색했을 때 )
            member_list_sql = 'SELECT * FROM member JOIN member_log ON (member.member_email=member_log.member_email) WHERE MATCH(member_name) AGAINST(? IN boolean mode)';
            member_list_params= [member_name + '*']
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




module.exports={idea_list:idea_list, cs_list:cs_list, anno_list:anno_list, inter_anno_list:inter_anno_list, notice_list:notice_list, member_list:member_list};

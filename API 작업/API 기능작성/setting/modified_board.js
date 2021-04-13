var getConnection = require('./db.js');
var { success_request, error_request } = require('./request.js');

// 선택한 아이디어 수정 내용 목록
async function modified_idea(serarch_id, search_title, page){
    try {
        var idea_id = serarch_id; // 아이디어 번호
        var idea_title = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        // 쿼리문 조건
        let idea_list_sql;
        let idea_list_params;

        if (idea_id != undefined && idea_title == undefined) {
            // 회원 아이디어 목록
            idea_list_sql = 'SELECT * FROM idea_log WHERE idea_id=? LIMIT 10 OFFSET ?;';
            idea_list_params = [idea_id, page_num];

        } else if (idea_id != undefined && idea_title != undefined) {
            // 회원 아이디어 목록 검색 조회 
            idea_list_sql = 'SELECT * FROM idea_log WHERE idea_id=? AND MATCH(idea_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            idea_list_params = [idea_id, idea_title + '*', page_num];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(idea_list_sql, idea_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        conn.release();
                        error_request.message = "수정된 회원 아이디어 목록 불러오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "수정된 회원 아이디어 목록 불러오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}


// 선택한 회원 문의사항 수정 내용 목록
async function modified_cs(serarch_id, search_title, page){
    try {
        var cs_id = serarch_id; // 문의사항 번호
        var cs_title = search_title; // 검색 제목
        let page_num = (page-1)*10; // 페이지 번호

        console.log(page_num)

        // 쿼리문 조건
        let cs_list_sql;
        let cs_list_params;

        if (cs_id != undefined && cs_title == undefined) {
            // 선택한 문의사항 목록
            cs_list_sql = 'SELECT * FROM cs_log WHERE cs_id=? LIMIT 10 OFFSET ?;';
            cs_list_params = [cs_id, page_num];

        } else if (cs_id != undefined && cs_title != undefined) {
            // 선택한 문의사항 검색 조회
            cs_list_sql = 'SELECT * FROM cs_log WHERE cs_id=? AND MATCH(cs_before_title) AGAINST(? IN boolean mode) LIMIT 10 OFFSET ?;';
            cs_list_params = [cs_id, cs_title + '*', page_num];
        }

        // db 조회 시작
        await new Promise((res, rej) => {
            getConnection(conn => {
                conn.query(cs_list_sql, cs_list_params, function (err, rows) {
                    // 실패한 경우
                    if (err || rows == '') {
                        console.log(err)
                        conn.release();
                        error_request.message = "수정된 회원 문의사항 목록 불러오기 실패";
                        return rej(error_request);
                    }
                    conn.release();
                    success_request.data = rows;
                    res(rows);
                })
            })
        })

        //사용내역 응답
        success_request.message = "수정된 회원 문의사항 목록 불러오기 성공";
        return success_request;
    } catch (err) {
        return err;
    }
}

module.exports={modified_idea:modified_idea, modified_cs:modified_cs};
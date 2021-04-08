var getConnection = require('./db.js');
var { success_request, error_request } = require('./request.js');

//아이디어 목록 불러오기
function idea_list(session_email, search_title){
    getConnection(async (conn) => {
        var member_email=session_email; // 회원 세션 이메일
        var idea_title=search_title; // 검색 제목

        try {    

            // 쿼리문 조건
            let save_point_sql;
            let save_point_param;
            
            if(member_email!=undefined || idea_title==undefined){
                // 회원 아이디어 목록, ( 세션 이메일 값은 있지만 검색 값은 없는 경우)
                save_point_sql = 'SELECT idea_title, idea_contents, idea_date FROM idea WHERE member_email=? AND idea_delete=?;';
                save_point_param = [member_email, 0];

            }else if(member_email, idea_title != undefined){ 
                // 회원 아이디어 목록 검색 조회, ( 세션 이메일 값과 검색 값이 둘 다 존재)
                save_point_sql = 'SELECT idea_title, idea_contents, idea_date FROM idea WHERE member_email=? AND idea_delete=? AND MATCH(idea_title) AGAINST(? IN boolean mode);';
                save_point_param = [member_email, 0, idea_title + '*'];
            }

            // db 조회 시작
            await new Promise((res, rej)=>{
                conn.query(save_point_sql, save_point_param, function (err, rows) {
                    // idea 게시물을 올린적이 없어서 indea 테이블에 회원이 등록이 안된 경우
                    if (err || rows == '') {
                        conn.release();
                        error_request.message = "등록된 아이디어가 없습니다.";
                        rej(error_request);
                    }
                    result = rows;
                    res(rows);
                })
            })

            conn.release();
            //사용내역 응답
            success_request.data=result;
            success_request.message="회원 아이디어 목록 불러오기 성공";
            return success_request;

        } catch (err) {
            return err;
        }
    })
}

module.exports={idea_list:idea_list};

var express = require('express');
const { mountpath } = require('../app.js');
var router = express.Router();

// db 연결
var getConnection = require('../setting/db.js');

// 응답 설정
var { success_request, error_request } = require('../setting/request.js');

// 시간 설정
var { now_time, tomorrow_time } = require('../setting/time.js');

/**
 *      본문 시작
 */


/**
 * 관리자의 포인트 부여 및 회수, http:localhost:3000/points/admins/manage/:member_email/:idea-id
 * 아이디어 게시판 목록에서 게시물에 대하여 점수 부여 및 회수
 * 1. idea_id, member_eamil, admin_email 값 받아온다. + 관리자가 입력한 idea_point 까지
 * 2. idea 테이블에서 해당 게시물의 add_point를 가져와서 idea_point와 더한다. 
 * 3. idea 테이블에 관리자 이메일/얻은 포인트/포인트 변동 일자 값 부여
 * 4. member 테이블에서 해당 회원의 member_point, save_point 값을 가져와서 idea_point와 더한다.
 * 5. member 테이블에서 포인트 부분 업데이트
 */ 
router.put('/admin/manage/:member_email/:idea_id/:admin_email', (req, res)=>{
    let member_email=req.params.member_email; 
    let idea_id = req.params.idea_id;
    let admin_email = req.params.admin_email; // 세션 값 (관리자 이메일)
    let idea_point = req.body.idea_point; // 관리자가 부여할 포인트
    

    getConnection(async(conn)=>{
        try{

            let point_mange_sql;
            let point_mange_params;

            // 기존 idea_table에서 add_point 가져오기
            await new Promise((res, rej)=>{
                point_mange_sql= 'SELECT add_point FROM idea WHERE idea_id=? AND member_email=?;';
                point_mange_params=[idea_id, member_email];
                conn.query(point_mange_sql, point_mange_params, function(err, rows){
                    if(err || rows==''){
                        console.log(err)
                        conn.release()
                        error_request.message="add_point 가져오기 실패";
                        return rej(error_request);
                    }
                    idea_point=idea_point + rows[0].add_point;
                    res(rows);
                })
            })


            // idea 테이블 업데이트
            await new Promise((res, rej)=>{
                point_mange_sql='UPDATE idea SET admin_email=?, add_point=?, date_point=? WHERE idea_id=? AND member_email=?;';
                point_mange_params=[admin_email, idea_point, now_time, idea_id, member_email];
                conn.query(point_mange_sql, point_mange_params, function(err, rows){
                    if(err || rows ==''){
                        console.log(err);
                        conn.release();
                        error_request.member_email="idea 테이블 포인트 업데이트 실패";
                        return rej(error_request);
                    }
                    res(rows);
                })
            })

            // member 테이블 member_point와 save_point 가져와서 idea_point 더하기
            let member_point, save_point;
            await new Promise((res, rej)=>{
                point_mange_sql='SELECT member_point, save_point FROM member WHERE member_email=?;';
                point_mange_params=member_email;
                conn.query(point_mange_sql, point_mange_params, function(err, rows){
                    if(err || rows==''){
                        conn.release();
                        error_request.message="save_point, idea_point 가져오기 실패";
                        rej(error_request);
                    }
                    member_point = rows[0].member_point + idea_point;
                    save_point = rows[0].save_point + idea_point;
                    res(rows);
                })
            })


            // member 테이블 업데이트
            await new Promise((res, rej)=>{
                point_mange_sql='UPDATE member SET member_point=?, save_point=? WHERE member_email=?;';
                point_mange_params=[member_point, save_point, idea_id, member_email];
                conn.query(point_mange_sql,point_mange_params, function(err, rows){
                    console.log(err)
                    if(err || rows==''){
                        conn.release();
                        error_request.message="member 테이블 업데이트 실패";
                        rej(error_request);
                    }
                    res(rows);
                })
            })

            conn.release();
            success_request.data={
                "현재 포인트":member_point,
                "누적 포인트":save_point
            }
            success_request.message="회원 포인트 변경 성공";
            res.send(success_request);
        }catch(err){
            res.send(err)
        }
    })

})

module.exports=router;
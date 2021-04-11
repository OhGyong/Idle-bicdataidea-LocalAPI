/**
 * 설정 세팅
 */
var cron = require('node-cron');
var getConnection = require('../setting/db.js');

/**
 * 1. ROWNUM를 누적 포인트 기준으로 내림차순 정렬
 * 2. ROWNUM 값 랭킹으로 사용해서 member_rank 업데이트
 */
cron.schedule('* * * * */8 *', function(){
    getConnection(async (conn) => {
        try {
    
            let save_point_ROWNUM;
            
            // 회원의 누적 포인트 가져오기
            let member_rank_sql;
            await new Promise((res, rej)=>{
                member_rank_sql='SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, T.member_email, save_point FROM member T,(SELECT @ROWNUM :=0) TMP ORDER BY save_point DESC;';
                conn.query(member_rank_sql, function(err, rows){
                    if(err || rows==''){
                        console.log(err);
                        conn.release();
                        return rej(err)
                    }
                    save_point_ROWNUM=rows;
                    res(rows);
                })
            })
    
            console.log("?")
            
            
            for (k in save_point_ROWNUM) {
                await new Promise((res, rej) => {
                    console.log(k)
                    member_rank_sql = 'UPDATE member SET member_rank=? WHERE member_email=?;';
                    let member_rank_params = [save_point_ROWNUM[k].ROWNUM, save_point_ROWNUM[k].member_email];
                    conn.query(member_rank_sql, member_rank_params, function (err, rows) {
                        if (err || rows == '') {
                            console.log(err);
                            conn.release();
                            return rej(err);
                        }
                        res(rows);
                    })
                })
            }
            conn.release();
            console.log("회원 랭킹 업데이트")
        } catch (err) {
            console.log(err)
        }
    })
})

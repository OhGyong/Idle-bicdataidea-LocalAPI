const jwt = require('jsonwebtoken');
const getConnection = require('./db');
const { error_request } = require('./request');

// 각 토큰 검증
function verifyToken(token, kind) {
    try {
        if (kind == "access") {
            return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        } else if (kind == "refresh") {
            return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
        }
    } catch (err) {
        return null;
    }
}

// 검증된 토큰 처리
var jwt_check = async function (req, res, next) {
    let accessToken, refreshToken // 재발급 될 토큰
    let accessPayload, refreshPayload

    accessPayload = verifyToken(req.headers['access_token'], "access");
    refreshPayload = verifyToken(req.headers['refresh_token'], "refresh");

    let memberEmail, memberName

    if (accessPayload === null) {
        // 1. accessToken과 refreshToken이 둘 다 만료된 경우 -> 로그아웃
        if (refreshPayload === null) {
            throw Error("사용 권한이 없습니다. 로그아웃 되었습니다.");
        }
        // 2. accessToken은 만료되었지만 refreshToken이 유효한 경우 -> accessToken 재발급
        else {
            memberEmail = refreshPayload.token_email;
            memberName = refreshPayload.token_name;
            jwt.sign(
                {
                    token_email: memberEmail,
                    token_name: memberName
                }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '15m' }, (err, token) => {
                    if (err) {
                        error_request.data = err;
                        error_request.message = "AccessToken 생성 실패";
                        throw Error(error_request)
                    }
                    console.log("accessToken 재발급");
                    accessToken = token;
                    console.log("재발급된 accessToken " + accessToken)
                }
            )
            next();
        }
    }
    // 3. accessToken은 유효하지만 refreshToken이 만료된 경우 -> refreshToken 재발급
    else {
        memberEmail = accessPayload.token_email;
        memberName = accessPayload.token_name;
        if (refreshPayload === null) {
            jwt.sign(
                {
                    token_email: memberEmail,
                    token_name: memberName
                }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '14d' }, (err, token) => {
                    if (err) {
                        error_request.data = err;
                        error_request.message = "RefreshToken 생성 실패";
                        throw Error(error_request)
                    }
                    console.log("refreshToken 재발급")
                    refreshToken = token
                }
            )

            // refresh_token 테이블 삽입
            getConnection(async (conn)=>{
                await new Promise((res, rej) => {
                    var memberRefreshTokenSQL = 'INSERT INTO refresh_token (token_owner, token) VALUES(?,?);';
                    var memberRefreshTokenPARAMS = [memberName, memberRefreshToken]
                    conn.query(memberRefreshTokenSQL, memberRefreshTokenPARAMS, (err, row) => {
                        if (err || row == '') {
                            conn.release();
                            error_request.data = err;
                            error_request.message = "refresh_token 삽입 오류";
                            rej(error_request);
                        }
                        res(row);
                    });
                })
            })
            next()
        }
        // 4. accessToken과 refreshToken 둘 다 유효한 경우 -> 바로 pass
        else {
            next({memberEmail,memberName})
        }
    }
}

module.exports = jwt_check
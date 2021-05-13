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
    let accessToken = req.headers['access_token'];
    let refreshToken = req.headers['refresh_token'];
    let accessPayload, refreshPayload; // 검증 결과 data

    accessPayload = verifyToken(req.headers['access_token'], "access");
    refreshPayload = verifyToken(req.headers['refresh_token'], "refresh");

    // 로그인을 안한 경우
    if (accessToken == "NOTLOGIN" && refreshToken == "NOTLOGIN") {
        next();
    }
    else if (accessPayload === null) {
        // 1. accessToken과 refreshToken이 둘 다 만료된 경우 -> 로그아웃
        if (refreshPayload === null) {
            console.log("1번째 case")
            error_request.message = "사용 권한이 없습니다. 로그아웃 되었습니다.";
            res.send(error_request);
        }
        // 2. accessToken은 만료되었지만 refreshToken이 유효한 경우 -> accessToken 재발급
        else {
            console.log("2번째 case")
            req.memberEmail = refreshPayload.token_email;
            req.memberName = refreshPayload.token_name;
            jwt.sign(
                {
                    token_email: refreshPayload.token_email,
                    token_name: refreshPayload.token_name
                }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '15m' }, (err, token) => {
                    if (err) {
                        error_request.data = err;
                        error_request.message = "AccessToken 생성 실패";
                        res.send(error_request)
                    }
                    req.accessToken = token;
                    console.log("재발급된 accessToken " + token)
                    next();
                }
            )
        }
    }
    // 3. accessToken은 유효하지만 refreshToken이 만료된 경우 -> refreshToken 재발급
    else {
        console.log("3번째 case");
        req.memberEmail = accessPayload.token_email;
        req.memberName = accessPayload.token_name;
        if (refreshPayload === null) {
            jwt.sign(
                {
                    token_email: accessPayload.token_email,
                    token_name: accessPayload.token_name
                }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: '14d' }, (err, token) => {
                    if (err) {
                        error_request.data = err;
                        error_request.message = "RefreshToken 생성 실패";
                        res.send(error_request);
                    }
                    req.refreshToken = token;
                    console.log("재발급된 refreshToken " + token)
                }
            )
            getConnection(async (conn) => {
                try {
                    // 기존 refresh_token 테이블의 token_invalid 값 1로 변경
                    await new Promise((res, rej) => {
                        var memberRefreshTokenSQL = 'UPDATE refresh_token SET token_invalid=? WHERE token=?'
                        var memberRefreshTokenPARAMS = [1, refreshToken]
                        conn.query(memberRefreshTokenSQL, memberRefreshTokenPARAMS, (err, rpw) => {
                            if (err || row == '') {
                                conn.release();
                                error_request.data = err;
                                error_request.message = "refresh_token의 token_invalid 업데이트 오류";
                                rej(error_request);
                            }
                            res();
                        })
                    })

                    // 재발급 한 refresh_token 테이블 삽입
                    await new Promise((res, rej) => {
                        var memberRefreshTokenSQL = 'INSERT INTO refresh_token (token_owner, token) VALUES(?,?);';
                        var memberRefreshTokenPARAMS = [memberName, refreshToken]
                        conn.query(memberRefreshTokenSQL, memberRefreshTokenPARAMS, (err, row) => {
                            if (err || row == '') {
                                conn.release();
                                error_request.data = err;
                                error_request.message = "refresh_token 삽입 오류";
                                rej(error_request);
                            }
                            conn.release();
                            res();
                        });
                    })
                    next()
                } catch (err) {
                    res.send(err);
                }
            })
        }
        // 4. accessToken과 refreshToken 둘 다 유효한 경우 -> 바로 pass
        else {
            console.log("4번째 case")
            console.log(accessPayload);
            console.log(refreshPayload);
            next()
        }
    }
}

module.exports = jwt_check
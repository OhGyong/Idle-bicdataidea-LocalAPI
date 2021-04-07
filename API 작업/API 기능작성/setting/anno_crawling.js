const axios = require("axios");
const cheerio = require("cheerio");

console.log(1) // 비동기 처리 확인
let ulList = []; // 크롤링 한 데이터를 보관하는 배열

// 크롤링 시작
async function anno_crawling() {

    const getHtml = () => {
        try {
            //console.log(2)
            return axios.get("https://library.hallym.ac.kr/bbs/list/4"); // 학교 도서관 페이지
        } catch (error) {
            console.error(error);
        }
    };

    await new Promise((res, rej) => {
        getHtml().then(html => {
            const $ = cheerio.load(html.data);
            const $bodyList = $("#divList > table > tbody > tr"); // 데이터를 뽑아올 위치
            $bodyList.each(function (i, elem) {
                //console.log(3)
                ulList[i] = {
                    num: $(elem).find('td.num').text().trim(),
                    title: $(elem).find('td.title').text().trim(),
                    date: $(elem).find('td.insert_date').text(),
                    url: $(elem).find('td.title a').attr("href")
                }
            });
            //console.log(4)
            const data = ulList.filter(n => n.num);
            res(data);
        }).catch((err) => {
            rej(err)
        })
    })

    // 크롤링한 데이터 수정 (공지 게시물은 제거), splice 하면 return 되서 for문 종료되기 때문에 null 값이 몇 개인지만 찾는다.
    var catch_null = 0;
    for (k in ulList) {
        if (ulList[k].num == '') {
            catch_null = k;
        }
    }
    catch_null++; // index 값 때문에 1 추가
    ulList.splice(0, catch_null);

    for (g in ulList.length){
        console.log(ulList[g].url);
    }

    await new Promise((res, rej) => {
        console.log(33)
        var a= 10;
        for(k in a){
            console.log("22")
        }

    })
    
    //return ulList;

}




module.exports = anno_crawling();
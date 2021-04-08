const axios = require("axios");
const cheerio = require("cheerio");

let anno_data = []; // 크롤링 한 데이터를 보관하는 배열

// 크롤링 시작

async function anno_crawling() {

    console.log("1차 시작")

    await new Promise((res, rej) => {
        let getHtml = () => {
            try {
                return axios.get("https://library.hallym.ac.kr/bbs/list/4"); // 학교 도서관 페이지
            } catch (error) {
                console.error(error);
            }
        };

        getHtml().then(html => {
            const $ = cheerio.load(html.data);
            const $bodyList = $("#divList > table > tbody > tr"); // 데이터를 뽑아올 위치
            $bodyList.each(function (i, elem) {
                anno_data[i] = {
                    num: $(elem).find('td.num').text().trim()-710,
                    title: $(elem).find('td.title').text().trim(),
                    date: $(elem).find('td.insert_date').text(),
                    url: $(elem).find('td.title a').attr("href")
                }
            });
            anno_data = anno_data.filter(function(n){
                if(n.num>0){
                    return n;
                }
            });
            res(anno_data);
        }).catch((err) => {
            rej(err)
        })
    })
    
    console.log("2차 시작")
    
    // 위에서 얻은 데이터 중 url 정보를 사용
    for (var k=0; k<anno_data.length; k++){

        let getHtml = () => {
            try {
                return(axios.get("https://library.hallym.ac.kr/"+anno_data[k].url)); // 학교 도서관 페이지
            } catch (err) {
                console.log(err);
            }
        };

        await new Promise((res, rej)=>{
            getHtml().then(html => {
                const $ = cheerio.load(html.data);
                const $bodyList = $("#divContent > div.divboardDetail > div.divQuestion"); // 데이터 경로
                $bodyList.each(function (i, elem) {
                    anno_data[k].contents=$(elem).find('div.questionBody').html().trim(); // 내용 그대로 출력하는거면 trim 빼야할듯?
                });
                res(anno_data);
            }).catch((err) => {
                rej(err)
            })
        })
    }
    return anno_data;
}
module.exports = anno_crawling();

const axios = require("axios");
const cheerio = require("cheerio");

console.log(1) // 비동기 처리 확인
let anno_data = []; // 크롤링 한 데이터를 보관하는 배열

// 크롤링 시작
async function anno_crawling() {

    console.log("1차 시작")

    await new Promise((res, rej) => {
        let getHtml = () => {
            try {
                //console.log(2)
                return axios.get("https://library.hallym.ac.kr/bbs/list/4"); // 학교 도서관 페이지
            } catch (error) {
                console.error(error);
            }
        };

        getHtml().then(html => {
            const $ = cheerio.load(html.data);
            const $bodyList = $("#divList > table > tbody > tr"); // 데이터를 뽑아올 위치
            $bodyList.each(function (i, elem) {
                //console.log(3)
                anno_data[i] = {
                    num: $(elem).find('td.num').text().trim(),
                    title: $(elem).find('td.title').text().trim(),
                    date: $(elem).find('td.insert_date').text(),
                    url: $(elem).find('td.title a').attr("href")
                }
            });
            //console.log(4)
            anno_data = anno_data.filter(function(n){
                if(n.num!=''){
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
    await new Promise((res, rej) => {

        for (var k=0; k<anno_data.length; k++){
            console.log(anno_data[k].url)

            let getHtml = () => {
                try {
                    console.log(2)
                    return axios.get(anno_data[k].url); // 학교 도서관 페이지
                } catch (error) {
                    console.error(error);
                }
            };

            getHtml().then(html => {
                const $ = cheerio.load(html.data);
                const $bodyList = $("#divContent > div.divboardDetail > div.divQuestion > div.questionBody"); // 데이터를 뽑아올 위치
                $bodyList.each(function (i, elem) {
                    console.log(3)
                    anno_data[k].contents=$(elem).find('p').text().trim();
                });
                console.log(4)
                res(anno_data);
            }).catch((err) => {
                rej(err)
            })
        }

    })

    console.log(anno_data)
    //return anno_data;
}




module.exports = anno_crawling();
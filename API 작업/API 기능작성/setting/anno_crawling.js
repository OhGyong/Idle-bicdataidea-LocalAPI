const axios = require("axios");
const cheerio = require("cheerio");

console.log(1) // 비동기 처리 확인
let anno_data = []; // 크롤링 한 데이터를 보관하는 배열

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

    for (g in anno_data.length){
        console.log(anno_data[g].url);
    }

    await new Promise((res, rej) => {
        console.log(33)
        var a= 10;
        for(k in a){
            console.log("22")
        }

    })
    //return anno_data;
}




module.exports = anno_crawling();
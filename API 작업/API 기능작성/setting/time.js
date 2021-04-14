var moment = require('moment');

require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

//현재시간
function now_time(){
    var now_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //moment
    return now_date
}

//내일시간
let tomorrow_time = new Date(new Date().setDate(new Date().getDate() + 1));
tomorrow_time = moment(tomorrow_time).format('YYYY-MM-DD HH:mm:ss'); //moment

//db에서 내보낼때 시간처리
var korea_time = function(db_time){
    var time_change=moment(db_time.format('YYYY-MM-DD HH:mm:ss'))
    return time_change
}

module.exports={'now_time':now_time, 'tomorrow_time':tomorrow_time};
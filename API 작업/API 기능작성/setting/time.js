var moment = require('moment');

require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

//현재시간
function now_time(){
    var now_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); //moment
    return now_date
}

//내일시간
function tomorrow_time(){
    let tomorrow_date = new Date(new Date().setDate(new Date().getDate() + 1));
    tomorrow_date = moment(tomorrow_date).format('YYYY-MM-DD HH:mm:ss'); //moment
    return tomorrow_date;
}

module.exports={'now_time':now_time, 'tomorrow_time':tomorrow_time};
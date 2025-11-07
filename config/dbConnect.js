const mongoose = require('mongoose'); //몽구스 모듈 가져오기
require('dotenv').config(); //dotenv 모듈가져와서 그 안의 config() 함수 실행


//디비 연결시, async await 사용하여 비동기 처리 꼭!
const dbConnect = async() => {
    try{
        const connect = await mongoose.connect(process.env.DB_CONNECT);
        console.log("DB Connected");
    }catch(err){
        console.log(err);
    }
}

module.exports = dbConnect;
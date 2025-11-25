const express = require('express');
const dbConnect = require('../../../config/dbConnect');
const app = express();

dbConnect(); // DB접속

/* backend 서버 공부하다가 프로젝트 발표 이후에 더 건들여볼 예정
app.listen(5050, function(){
    console.log('listening on 8080')
});

//바디파서 미들웨어 등록
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//라우터 파일
//app.use("/contacts", require("./routes/contactRoutes"));

app.get('/login', function(요청, 응답){
    응답.send('펫용품 쇼핑할 수 있는 사이트다.');
});

app.get('/beauty', function(요청, 응답){
    응답.send('뷰티용품 쇼핑할 수 있는 사이트다.');
});

// 메인 화면
app.get('/', function(요청, 응답){
    응답.sendFile(__dirname + '/index.html');
});*/
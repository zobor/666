const code1 = '0.000333';
const code2 = '1.600036';
const request = require('request');

function getNow(code) {
  const url =
    `https://push2.eastmoney.com/api/qt/stock/details/get?secid=${code}&ut=f057cbcbce2a86e2866ab8877db1d059&forcect=1&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55&pos=-14&iscca=1&invt=2&cb=abc&wbp2u=|0|0|0|wap&_=1656395579892`;
    return new Promise((resolve) => {
        request.get(url, (err, res, body) => {
            if (body) {
                body = body.replace(/^abc\(/, '').replace(/\);$/, '');
                const data = JSON.parse(body);
                resolve(data.data.details.pop().split(',')[1]);
            }
        });
    });
}

setInterval(async() => {
  const rs = [await getNow(code1), await getNow(code2)];
  console.clear();
  console.log.apply(console, rs);
}, 2000);
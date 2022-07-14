const code1 = '0.000333'; // 美的
const code2 = '1.600036'; // 招商
const code3 = '1.600089'; // 特变
const code4 = '0.002008'; // 大族
const request = require('request');

const float2Fix = (num, bit = 2) => {
  const rate = parseInt(num * 10 ** (bit + 2).toString(), 10) / 10 ** bit;
  return `${rate}`;
};

const numVsNum = (start, end) => {
  return float2Fix((end - start) / start);
};

function getNow(code, sell = 0) {
  const url =
    `https://push2.eastmoney.com/api/qt/stock/details/get?secid=${code}&ut=f057cbcbce2a86e2866ab8877db1d059&forcect=1&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55&pos=-14&iscca=1&invt=2&cb=abc&wbp2u=|0|0|0|wap&_=1656395579892`;
    return new Promise((resolve) => {
        request.get(url, (err, res, body) => {
            if (body) {
                body = body.replace(/^abc\(/, '').replace(/\);$/, '');
                const data = JSON.parse(body);
                const now = data.data.details.pop().split(',')[1];
                const pre = data.data.prePrice;
                resolve([
                  now,
                  //pre,
                  numVsNum(pre, now),
                  numVsNum(sell, now),
                ].join('\t'));
            }
        });
    });
}

if (1) {
  setInterval(async() => {
    const rs = [
      await getNow(code1, 59.7),
      await getNow(code2, 41.6),
      //await getNow(code3, 26.15)
      //await getNow(code4, 31.28),
    ];
    console.clear();
    console.log(rs.join('\n'));
  }, 2000);
}

(async() => {
  return;
  const rs = [await getNow(code1), await getNow(code2), await getNow(code3)];
  console.log(rs.join('\n'))
})()

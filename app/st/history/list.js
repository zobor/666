const r = require('request');
const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');

function getData(code) {
    return new Promise((resolve) => {
        const type = code.indexOf('sz') > -1 ? '0' : '1';
        const url = `https://push2.eastmoney.com/api/qt/stock/trends2/get?fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11%2Cf12%2Cf13&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58&ut=fa5fd1943c7b386f172d6893dbfba10b&ndays=2&iscr=0&iscca=0&secid=${type}.${code.replace(/^[a-z]{2}/,'')}&_=${Date.now()}`;
        r.get(
            url,
            (err, response, body) => {
                const data = JSON.parse(body.replace(/^callback\(/, '').replace(/\);$/,''));
                const list = data.data.trends.map((item) => {
                    const arr = item.split(',');
                    return {
                        time: arr[0],
                        open: +arr[1],
                        close: +arr[2],
                        max: +arr[3],
                        min: +arr[4],
                    };
                });
                resolve(list);
            }
        );
    });
}

const code = 'sz000333';
getData(code).then((list) => {
    const filename = `${dayjs().format('YYYY-MM-DD')}_${code}`;
    const filepath = path.resolve(__dirname ,`./list/${filename}`);
    fs.writeFileSync(filepath, JSON.stringify(list));
});
const r = require('request');
const fs = require('fs');
const path = require('path');
const list = require('./111');

function getData(c) {
    return new Promise((resolve) => {
        r.get(
            `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=0.${c}&klt=101&fqt=1&lmt=66&end=20500000&iscca=1&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61%2Cf62%2Cf63%2Cf64&ut=f057cbcbce2a86e2866ab8877db1d059&forcect=1`,
            (err, response, body) => {
                const data = JSON.parse(body);
                const list = data.data.klines.map((item) => {
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

const float2Fix = (num, bit = 2) => {
    const rate = parseInt(num * 10 ** (bit + 2).toString(), 10) / 10 ** bit;
    return `${rate}%`;
};

const shake = (x, y) => {
    return (y - x) / x;
};

const repeat = (arr) => {
    const hash = {};
    arr.forEach((item) => {
        hash[item] = 0;
    });

    return Object.keys(hash);
};

// getData('000333').then((list) => {
//     console.log(list);
//     const filepath = path.resolve(__dirname ,'./111.json');
//     fs.writeFileSync(filepath, JSON.stringify(list));
// });

buileTable(list);

function shakeOfOpenClose(ls) {
  const month = {};

  ls.map((item) => {
      const shakeRate = shake(item.open, item.close);
      let shakeRate2 = +float2Fix(shakeRate, 1).replace('%', '');
      shakeRate2 = Math.round(shakeRate2);
      const MM = item.time.split('-')[1];
      month[MM] = month[MM] || {};
      month[MM][shakeRate2] = month[MM][shakeRate2] || 0;
      month[MM][shakeRate2] = month[MM][shakeRate2] + 1;
  });

  return month;
}

function shakeOfMonth(ls) {
  const month = {};

  ls.map((item) => {
      const shakeRate = shake(item.min, item.max);
      let shakeRate2 = +float2Fix(shakeRate, 1).replace('%', '');
      shakeRate2 = Math.round(shakeRate2);
      const MM = item.time.split('-')[1];
      month[MM] = month[MM] || {};
      month[MM][shakeRate2] = month[MM][shakeRate2] || 0;
      month[MM][shakeRate2] = month[MM][shakeRate2] + 1;
  });

  return month;
}

function buileTable(ls) {
    // const month = shakeOfMonth(ls);
    const month = shakeOfOpenClose(ls);

    const rateKeys = [];
    Object.keys(month).map((m) => {
        Object.keys(month[m]).forEach((v) => rateKeys.push(v));
    });
    const keys = repeat(rateKeys);

    const table = [];
    table.push(`<style>
  table {border-collapse: collapse;}
  table td {border: solid 1px #efefef; width: 30px; text-align: center;}
  </style>`);
    table.push('<table>');
    table.push('<thead>');
    table.push('<tr>');
    table.push('<td>-</td>');
    // table.push('<td>--</td>');
    keys.map((key) => {
        table.push(`<td>${key}</td>`);
    });
    table.push('</tr>');
    table.push('<tbody>');
    Object.keys(month).map((m) => {
        table.push('<tr>');
        table.push(`<td>${m}</td>`);
        let total = 0;
        keys.map((v) => {
            table.push(`<td>${month[m][v] || 0}</td>`);
        });
        table.push('</tr>');
    });
    table.push('<tbody>');

    fs.writeFileSync(path.resolve(__dirname, './111.html'), table.join(''));
}

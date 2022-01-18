const request = require('request');
const fs = require('fs');
let index = 0;
let data = readData();

function readData() {
  const txt = fs.readFileSync('./data.json', 'utf-8');
  return JSON.parse(txt);
}

function writeData(data) {
  fs.writeFileSync('./data.json', JSON.stringify(data));
}

function jsonp(url) {
  return new Promise((resolve) => {
    request({
      url,
      method: 'get',
    }, (err, res, body) => {
      try {
        resolve(JSON.parse(body));
      } catch(err){}
    });
  })
}

async function loadData(code) {
    const c = code.replace(/\D+/, '');
    const type = code.indexOf('sz') > -1 ? '0' : '1';
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${type}.${c}&ut=f057cbcbce2a86e2866ab8877db1d059&forcect=1&fields=f13,f19,f20,f23,f24,f25,f26,f27,f28,f29,f30,f43,f44,f45,f46,f47,f48,f49,f50,f57,f58,f59,f60,f85,f107,f111,f113,f114,f115,f116,f117,f127,f130,f131,f132,f133,f135,f136,f137,f138,f139,f140,f141,f142,f143,f144,f145,f146,f147,f148,f149,f152,f161,f162,f164,f165,f167,f168,f169,f170,f171,f174,f175,f177,f178,f181,f182,f198,f199,f251,f252,f253,f254,f255,f256,f257,f260,f261,f288,f292,f293,f294,f295,f530,f531&invt=2&_=${Date.now()}`;
    const rs = await jsonp(url);

    // https://wap.eastmoney.com/quote/stock/0.000333.html
    const { data } = rs || {};

    const json = {s: {}, b: {}};
    json.s[data.f31] = data.f32;
    json.s[data.f33] = data.f34;
    json.s[data.f35] = data.f36;
    json.s[data.f37] = data.f38;
    json.s[data.f39] = data.f40;

    json.b[data.f11] = data.f12;
    json.b[data.f13] = data.f14;
    json.b[data.f15] = data.f16;
    json.b[data.f17] = data.f18;
    json.b[data.f19] = data.f20;
    json.now = data.f43;

    return json;

}

setInterval(async() => {
  const json = await loadData('sz000333');
  if (json.s && json.b && Object.keys(json.s).length && Object.keys(json.b).length) {
    data.s = {...data.s, ...json.s};
    data.b = {...data.b, ...json.b};
    data.now = json.now;
    writeData(data);
  }
  index += 1;
  console.log(index);
}, 2000);

// loadData('sz000333').then(rs => {
//   console.log(rs);
// })
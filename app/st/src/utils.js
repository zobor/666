const cache = {};

export const removeOneFromArray = (v, array) => array.filter((item) => item !== v);
export const promiseFormation = (promiseList, max = 1, options) => {
  let running = [];
  let tasks = promiseList.slice(0);
  let isSuccess = true;
  const result = [];
  const next = (resolve, reject) => {
    const isTaskFinish = tasks.length === 0 && running.length === 0;
    const isBreakOff = options && options.stop;
    if (isTaskFinish || isBreakOff) {
      if (isBreakOff || !isSuccess) {
        reject(result);
      } else {
        resolve(result);
      }
    } else {
      const availableNumber = max - running.length;
      if (availableNumber > 0) {
        tasks.slice(0, availableNumber).forEach((task) => {
          const index = promiseList.indexOf(task);
          tasks = removeOneFromArray(task, tasks);
          running.push(task);
          task()
            .then((res) => {
              if (typeof result[index] === 'undefined') {
                result[index] = res;
              }
              running = removeOneFromArray(task, running);
              next(resolve, reject);
            })
            .catch((err) => {
              isSuccess = false;
              running = removeOneFromArray(task, running);
              if (typeof result[index] === 'undefined') {
                result[index] = err;
              }
              next(resolve, reject);
            });
        });
      }
    }
  };
  return new Promise((resolve, reject) => {
    if (options && !options.addOne) {
      options.addOne = (fn) => {
        promiseList.push(fn);
        tasks.push(fn);
        next(resolve, reject);
      };
    }
    if (options && !options.stopOne) {
      options.stopOne = (taskId) => {
        const runningIndex = running.map((item) => item.id).indexOf(taskId);
        if (runningIndex === -1) {
          const taskIdx = tasks.map((item) => item.id).indexOf(taskId);
          if (taskIdx > -1) {
            const tsk = tasks[taskIdx];
            tasks = removeOneFromArray(tsk, tasks);
            const rIndex = promiseList.map((item) => item.id).indexOf(taskId);
            result[rIndex] = new Error('cancel');
          }
          return;
        }
        const taskIndex = promiseList.map((item) => item.id).indexOf(taskId);
        const task = running[runningIndex];
        running = removeOneFromArray(task, running);
        result[taskIndex] = new Error('cancel');
        next(resolve, reject);
      };
    }
    next(resolve, reject);
  });
};

// base utils
export const isObject = (v) =>
  Object.prototype.toString.call(v) === '[object Object]';

export const isPlainObject = (v) => isObject(v) && Object.keys(v).length === 0;

export const isEmpty = (v) => isPlainObject(v) || !v;

export const rand = (min, max) => {
  return parseInt(Math.random() * (max - min + 1) + min, 10);
};

export const formatDate = (dateTimeStamp, format = 'YYYY-MM-DD') => {
  const date = new Date();
  date.setTime(dateTimeStamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const isInDealTime = (time) => {
  return true;
  const today = formatDate(Date.now()).replace(/-/g, '/');
  const now = time || Date.now();

  const p1 = +new Date(`${today} 09:15:00`);
  const p2 = +new Date(`${today} 11:31:00`);
  const p3 = +new Date(`${today} 13:00:00`);
  const p4 = +new Date(`${today} 15:01:00`);

  return (now >= p1 && now <= p2) || (now >= p3 && now <= p4);
};

export const httpGet = async (url) => {
  return await (await fetch(url)).text();
};

export const moneyFormat = (val) => {
  if (!val) {
    return 0;
  }
  const v = Number(val);
  if (Math.abs(v) < 10000) return val;
  if (v >= 10000 * 10000 * 10000) {
    return `${parseFloat(v / 1000000000000, 10).toFixed(1)}万亿`;
  }
  return v >= 100000000 || v <= -100000000
    ? `${parseFloat(v / 100000000, 10).toFixed(1)}亿`
    : `${parseFloat(v / 10000, 10).toFixed(0)}万`;
};
export const float2Fix = (num, bit = 2) => {
  const rate = parseInt(num * 10 ** (bit + 2).toString(), 10) / 10 ** bit;
  return `${rate}%`;
};

export const numVsNum = (start, end) => {
  return float2Fix((end - start) / start);
};

export const getUrlParam = (name) => {
  const name2 = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${name2}=([^&#]*)`);
  const results = regex.exec(window.location.search);

  return results == null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

export const trigger = (obj, type) => {
  //检测对象是否有type类型的事件
  if (obj[type]) {
    obj[type]();
  } else {
    try {
      const evt = document.createEvent('Event');
      evt.initEvent(type, true, true);
      evt.synthetic = true;
      obj.dispatchEvent(evt, true);
    } catch (e) {
      console.log(e);
    }
  }
};

export const classnames = (cls) => {
  const list = Object.keys(cls)
    .filter((key) => cls[key])
    .map((key) => key);

  return list.join(' ');
};

// macd start
const calcEMA = function (n, data, field) {
  // console.log(n, data);
  var i, l, ema, a;
  a = 2 / (n + 1);
  if (field) {
    //二维数组
    ema = [data[0][field]];
    for (i = 1, l = data.length; i < l; i++) {
      ema.push(a * data[i][field] + (1 - a) * ema[i - 1]);
    }
  } else {
    //普通一维数组
    ema = [data[0]];
    for (i = 1, l = data.length; i < l; i++) {
      ema.push(a * data[i] + (1 - a) * ema[i - 1]);
    }
  }
  // console.log(ema);
  return ema;
};

/*
 * 计算DIF快线，用于MACD
 * @param {number} short 快速EMA时间窗口
 * @param {number} long 慢速EMA时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
const calcDIF = function (short, long, data, field) {
  var i, l, dif, emaShort, emaLong;
  dif = [];
  emaShort = calcEMA(short, data, field);
  emaLong = calcEMA(long, data, field);
  for (i = 0, l = data.length; i < l; i++) {
    dif.push(emaShort[i] - emaLong[i]);
  }
  return dif;
};

/*
 * 计算DEA慢线，用于MACD
 * @param {number} mid 对dif的时间窗口
 * @param {array} dif 输入数据
 */
const calcDEA = function (mid, dif) {
  return calcEMA(mid, dif);
};

/*
 * 计算MACD
 * @param {number} short 快速EMA时间窗口
 * @param {number} long 慢速EMA时间窗口
 * @param {number} mid dea时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
const calcMACD = function (short, long, mid, data, field) {
  var i, l, dif, dea, macd, result;
  result = {};
  macd = [];
  dif = calcDIF(short, long, data, field);
  dea = calcDEA(mid, dif);
  for (i = 0, l = data.length; i < l; i++) {
    macd.push((dif[i] - dea[i]) * 2);
  }
  result.dif = dif;
  result.dea = dea;
  result.macd = macd;
  return result;
};

export const getMACD = (list) => {
  const macd = calcMACD(12, 26, 9, list);

  return {
    macd: macd.macd.reverse(),
    dif: macd.dif.reverse(),
    dea: macd.dea.reverse(),
  };
};

// macd end

// sync scripts
export const loadScript = (src, timeout = 6000) =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState == 'loaded' || this.readyState == 'complete') {
          resolve();
        }
      };
    } else {
      script.onload = () => {
        resolve();
      };
    }
    script.src = src;
    document.head.appendChild(script);

    setTimeout(() => {
      resolve({});
      script.remove();
    }, timeout);
  });

export const jsonp = (
  url,
  cb = 'jQuery1123006039486562982099_1613808847558'
) => {
  return new Promise((resolve) => {
    window[cb] = (data) => {
      resolve(data);
      window[cb] = null;
      delete window[cb];
    };
    loadScript(url);
  });
};

// 北向资金
cache.gethk2china = cache.gethk2china || {};
export const gethk2china = async () => {
  if (!isInDealTime() && !isEmpty(cache.gethk2china)) {
    return cache.gethk2china;
  }
  const cb = `jQuery${rand(100000, 90000)}_${Date.now()}`;
  const url = `//push2.eastmoney.com/api/qt/kamt/get?cb=${cb}&fields1=f1%2Cf2%2Cf3%2Cf4&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf63&ut=b2884a393a59ad64002292a3e90d46a5&_=${Date.now()}`;
  const rs = await jsonp(url, cb);
  const data = {
    hk2sh: rs.data.hk2sh.netBuyAmt,
    hk2sz: rs.data.hk2sz.netBuyAmt,
    sh2hk: rs.data.sh2hk.netBuyAmt,
    sz2hk: rs.data.sz2hk.netBuyAmt,
    cn2hk: rs.data.sh2hk.netBuyAmt + rs.data.sz2hk.netBuyAmt,
    hk2cn: rs.data.hk2sh.netBuyAmt + rs.data.hk2sz.netBuyAmt,
  };
  for (let i in data) {
    data[i] = moneyFormat(data[i] * 10000);
  }
  cache.gethk2china = data;
  return data;
};

export const getMinutesKline = async (code) => {
  const cb = `jQuery${rand(100000, 90000)}_${Date.now()}`;
  const type = code.indexOf('sz') > -1 ? '0' : '1';
  const url = `//push2.eastmoney.com/api/qt/stock/trends2/get?cb=${cb}&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11%2Cf12%2Cf13&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58&ut=fa5fd1943c7b386f172d6893dbfba10b&ndays=1&iscr=0&iscca=0&secid=${type}.${code.replace(/^[a-z]{2}/,'')}&_=${Date.now()}`;
  const rs = await jsonp(url, cb);
  const { trends } = rs.data;
  const list = trends.map((item, idx) => {
		const arr = item.split(',');
		const d = {
			time: arr[0].replace(/\d{4}-\d{2}-\d{2}\s/, ''),
			close: Number(arr[2]),
			volunm: Number(arr[5]),
			mo: Number(arr[6]),
		};
		d.moFormat = moneyFormat(d.mo);
		return d;
	}).reverse();
  list.map((item, idx) => {
		const pre = list[idx + 1];
		if (pre) {
			item.rise = Number((item.close - pre.close).toFixed(2));
		} else {
      item.rise = 0;
    }
	});
  const nums = list.map(item => item.close);
	const small = Math.min.apply(null, nums);
	const big = Math.max.apply(null, nums);
  return {
    list,
    smallest: small,
    bigest: big,
  };
};

// 北向资金 个股
export const gethk2st = async (code) => {
  const cb = `jQuery${rand(100000, 90000)}_${Date.now()}`;
  const c = code.replace(/\D+/, '');
  const type = code.indexOf('sz') > -1 ? 'SGT' : 'HGT';
  const url = `//dcfm.eastmoney.com/em_mutisvcexpandinterface/api/js/get?callback=${cb}&st=DetailDate&sr=-1&ps=100&p=1&type=HSGTCJB&sty=${type}&token=70f12f2f4f091e459a279469fe49eca5&cmd=${c}&js=%7B%22data%22%3A(x)%2C%22pages%22%3A(tp)%7D`;
  const rs = await jsonp(url, cb);

  const data = rs.data.map((item) => {
    item.DetailDate = item.DetailDate.replace('T00:00:00', '');
    if (type === 'SGT') {
      item.hk2cnCJE = item.SGTMCJE;
      item.hk2cnJME = item.SGTJME;
    } else {
      item.hk2cnCJE = item.HGTMCJE;
      item.hk2cnJME = item.HGTJME;
    }

    return item;
  });

  data.map((item, idx) => {
    item.inTotalMoney =
      data.slice(0, idx).reduce((aac, cur) => cur.hk2cnJME + aac, 0) +
      item.hk2cnJME;
  });

  return data;
};

// 热门概念
export const getConceptMoney = async () => {
  const cb = `jQuery${rand(100000, 90000)}_${Date.now()}`;
  const url = `//push2.eastmoney.com/api/qt/clist/get?cb=${cb}&fid=f62&po=1&pz=10&pn=1&np=1&fltt=2&invt=2&fs=m%3A90+t%3A3&stat=1&fields=f12%2Cf14%2Cf2%2Cf3%2Cf62%2Cf184%2Cf66%2Cf69%2Cf72%2Cf75%2Cf78%2Cf81%2Cf84%2Cf87%2Cf204%2Cf205%2Cf124&ut=b2884a393a59ad64002292a3e90d46a5`;
  const rs = await jsonp(url, cb);
  const data = rs.data.diff.map((item) => ({
    name: item.f14,
    stName: item.f204,
    inMoney: moneyFormat(item.f62),
    upFloat: item.f3,
    stCode: item.f205,
  }));

  return data;
};

// 主力历史
export const getStockZhuliHistory = async (code) => {
  const cb = `jQuery${rand(100000, 90000)}_${Date.now()}`;
  const c = code.replace(/\D+/, '');
  const type = code.indexOf('sz') > -1 ? '0' : '1';
  const url = `//push2his.eastmoney.com/api/qt/stock/fflow/daykline/get?cb=${cb}&lmt=0&klt=101&fields1=f1%2Cf2%2Cf3%2Cf7&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58%2Cf59%2Cf60%2Cf61%2Cf62%2Cf63%2Cf64%2Cf65&ut=b2884a393a59ad64002292a3e90d46a5&secid=${type}.${c}&_=${Date.now()}`;
  const rs = await jsonp(url, cb);
  const data = rs.data.klines
    .map((item) => {
      const arr = item.split(',');
      // if (arr[0] === '2021-02-22') {
      //   console.log(arr);
      // }
      return {
        time: arr[0],
        inMoney: Number(arr[1]),
        upFloat: arr[12],
        now: arr[11],
      };
    })
    .reverse();

  // data.map((item, idx) => {
  //   item.inTotalMoney = data.slice(0, idx).reduce((aac, cur) => cur.inMoney + aac, 0) + item.inMoney;
  //   console.log(item.inTotalMoney, item.inMoney)
  // });

  return data;
};

// 主力资金流向个股
export const getZhuLiMoneyFlow = async () => {
  const cb = `jQuery${rand(100000, 90000)}_${Date.now()}`;
  const url = `//push2.eastmoney.com/api/qt/clist/get?cb=${cb}&fid=f62&po=1&pz=50&pn=1&np=1&fltt=2&invt=2&ut=b2884a393a59ad64002292a3e90d46a5&fs=m%3A0%2Bt%3A6%2Bf%3A!2%2Cm%3A0%2Bt%3A13%2Bf%3A!2%2Cm%3A0%2Bt%3A80%2Bf%3A!2%2Cm%3A1%2Bt%3A2%2Bf%3A!2%2Cm%3A1%2Bt%3A23%2Bf%3A!2%2Cm%3A0%2Bt%3A7%2Bf%3A!2%2Cm%3A1%2Bt%3A3%2Bf%3A!2&fields=f12%2Cf14%2Cf2%2Cf3%2Cf62%2Cf184%2Cf66%2Cf69%2Cf72%2Cf75%2Cf78%2Cf81%2Cf84%2Cf87%2Cf204%2Cf205%2Cf124`;
  const rs = await jsonp(url, cb);
  const data = rs.data.diff.map((item) => ({
    name: item.f14,
    inMoney: moneyFormat(item.f62),
    upFloat: item.f3,
    zhanbi: item.f184,
  }));

  return data;
};

// 主力实时资金流入
export const getZhuliRealIn = async(code) => {
  const cb = `jQuery${rand(100000, 90000)}_${Date.now()}`;
  const c = code.replace(/\D+/, '');
  const type = code.indexOf('sz') > -1 ? '0' : '1';
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${type}.${c}&ut=f057cbcbce2a86e2866ab8877db1d059&forcect=1&fields=f13,f19,f20,f23,f24,f25,f26,f27,f28,f29,f30,f43,f44,f45,f46,f47,f48,f49,f50,f57,f58,f59,f60,f85,f107,f111,f113,f114,f115,f116,f117,f127,f130,f131,f132,f133,f135,f136,f137,f138,f139,f140,f141,f142,f143,f144,f145,f146,f147,f148,f149,f152,f161,f162,f164,f165,f167,f168,f169,f170,f171,f174,f175,f177,f178,f181,f182,f198,f199,f260,f261,f288,f292,f293,f294,f295,f530,f531&invt=2&cb=${cb}&_=${Date.now()}`;
  const rs = await jsonp(url, cb);

    // https://wap.eastmoney.com/quote/stock/0.000333.html
  return {
    '主力净流入': rs.data.f137,
    '主力买入': rs.data.f135,
    '主力卖出': rs.data.f136,
    type: rs.data.f127,
  };
};

// 涨跌家数
cache.loadUpDownCount = cache.loadUpDownCount || {};
export const loadUpDownCount = async () => {
  if (!isInDealTime() && !isEmpty(cache.loadUpDownCount)) {
    return cache.loadUpDownCount;
  }
  // const url3 = `https://w.sinajs.cn/rn=${Date.now()}&list=sz399006_zdp`;
  await loadScript(`https://w.sinajs.cn/rn=${Date.now()}&list=sh000001_zdp`);
  await loadScript(`https://w.sinajs.cn/rn=${Date.now()}&list=sz399001_zdp`);
  // await loadScript(url3);

  let sh = [];
  let sz1 = [];
  // let sz2 = [];
  let sum = [];
  if (
    window.hq_str_sh000001_zdp &&
    window.hq_str_sz399001_zdp
    // && window.hq_str_sz399006_zdp
  ) {
    sh = window.hq_str_sh000001_zdp.split(',');
    sz1 = window.hq_str_sz399001_zdp.split(',');
    // sz2 = window.hq_str_sz399006_zdp.split(',');

    // sum = [
    //   Number(sh[0]) + Number(sz1[0]) + Number(sz2[0]),
    //   Number(sh[1]) + Number(sz1[1]) + Number(sz2[1]),
    //   Number(sh[2]) + Number(sz1[2]) + Number(sz2[2]),
    // ];

    sum = [
      Number(sh[0]) + Number(sz1[0]),
      Number(sh[1]) + Number(sz1[1]),
      Number(sh[2]) + Number(sz1[2]),
    ];
  }

  const rs = {
    upCount: sum[0],
    downCount: sum[1],
    noChangeCount: sum[2],
    upDownCountRate: (sum[0] / (sum[0] + sum[1])).toFixed(3),
    downUpCountRate: (sum[1] / (sum[0] + sum[1])).toFixed(3),
  };

  cache.loadUpDownCount = rs;

  return rs;
};

// 指数
cache.loadIndex = cache.loadIndex || {};
export const loadIndex = async () => {
  if (!isInDealTime() && !isEmpty(cache.loadIndex)) {
    return cache.loadIndex;
  }
  await loadScript(
    `https://hq.sinajs.cn/rn=${Date.now()}&list=s_sh000001,s_sz399001,s_sz399006,s_sh000300`
  );
  const m = [window.hq_str_s_sh000001, window.hq_str_s_sz399001, window.hq_str_s_sz399006, window.hq_str_s_sh000300];
  const res = {
    sh: {},
    sz: {},
    sz2: {},
    hs300: {},
  };
  m.map((item, idx) => {
    if (!item) {
      return;
    }
    const data = res[['sh','sz','sz2', 'hs300'][idx]]
    const arr = item.replace(/"/g, '').split(',');
    data.now = arr[1];
    data.floatValue = arr[2];
    data.rate = arr[3];
    data.dealMoney = arr[5];
    data.moneyFormat = moneyFormat(Number(data.dealMoney * 10000));
  });
  res.total = res.sz.dealMoney * 10000 + res.sh.dealMoney * 10000;
  res.totalString = moneyFormat(
    res.sz.dealMoney * 10000 + res.sh.dealMoney * 10000
  );

  res.sz_moneyFormat = res.sz.moneyFormat;
  res.sh_moneyFormat = res.sh.moneyFormat;
  res.sz_rate = res.sz.rate + '%';
  res.sz2_rate = res.sz2.rate + '%';
  res.sh_rate = res.sh.rate + '%';
  res.sh_index = Number(res.sh.now).toFixed(2);
  res.hs300_rate = res.hs300.rate + '%';

  cache.loadIndex = res;
  return res;
};

// A50
export const getA50 = async () => {
  await loadScript(
    `https://w.sinajs.cn/etag.php?_=${Date.now()}&list=hf_CHA50CFD`
  );
  const str = window.hq_str_hf_CHA50CFD;
  if (!str) return '';
  const a = str.split(',');
  const now = Number(a[0]);
  const prev = Number(a[7]);
  const rs = float2Fix((now - prev) / prev);
  return rs;
};

// 行情
cache.loadCode = cache.loadCode || {};
export const loadCode = async (code) => {
  if (!isInDealTime() && !isEmpty(cache.loadCode[code])) {
    return cache.loadCode[code];
  }
  await loadScript(`https://hq.sinajs.cn/?rn=${Date.now()}&list=${code}`);
  const str = window[`hq_str_${code}`];
  if (!str) {
    return;
  }
  const arr = str.split(',');
  const data = {
    name: arr[0],
    todayOpen: Number(arr[1]),
    yestoday: Number(arr[2]),
    now: Number(arr[3]),
    max: Number(arr[4]),
    min: Number(arr[5]),
    b1: arr[6],
    s1: arr[7],
    deal_column: Number(arr[8]),
    deal_total: Number(arr[9]),
  };
  data.float = float2Fix((data.max - data.min) / data.min);
  data.now_open = float2Fix((data.now - data.todayOpen) / data.todayOpen);
  data.up_down = float2Fix((data.now - data.yestoday) / data.yestoday);
  data.todayOpen_yestoday = float2Fix(
    (data.todayOpen - data.yestoday) / data.yestoday
  );
  (() => {
    const top1 = data.max;
    const top2 = Math.max.apply(null, [data.todayOpen, data.now]);
    const top3 = Math.min.apply(null, [data.todayOpen, data.now]);
    const top4 = data.min;
    const lineLength = top1 - top4;
    const topLine = top1 - top2;
    const boxLine = top2 - top3;
    const bottomLine = top3 - top4;
    data.top_line = float2Fix(topLine / lineLength);
    data.center_line = float2Fix(boxLine / lineLength);
    data.bottom_line = float2Fix(bottomLine / lineLength);
  })();

  cache.loadCode[code] = data;

  return data;
};

// 大单列表
cache.loadBigDeal = cache.loadBigDeal || {};
export const loadBigDeal = async (code, amount = 500) => {
  if (!isInDealTime() && !isEmpty(cache.loadBigDeal[code])) {
    return cache.loadBigDeal[code];
  }
  const amountMap = {
    100: 10,
    200: 11,
    500: 12,
    1000: 13,
  };
  await loadScript(
    `//stock.finance.qq.com/sstock/list/view/dadan.php?t=js&c=${code}&max=200&p=1&opt=${amountMap[amount]}&o=0`
  );
  const data = window[`v_dadan_data_${code}`];

  const stat = {
    code,
    name,
    dealString: 0,
    B: 0,
    S: 0,
    M: 0,
    length: 0,
    in: 0,
    startTime: 0,
    endTime: 0,
    superList: [],
  };
  const list = data[1].split('^').map((item) => {
    const [a, time, price, shou, b, BS] = item.split('~');
    const mo = Number(price) * Number(shou) * 100;
    const t = time.replace(/:\d{2}$/,'');
    const sList = {
      time: t,
      price,
      shou,
      BS,
      deal: moneyFormat(mo),
      mo,
    };

    stat[BS] += mo;
    stat.length += 1;
    stat.in = BS === 'B' ? stat.in + mo : stat.in - mo;

    return sList;
  });

  const dataMap = {};
  list.forEach(item => {
    const key = `${item.BS}/${item.time}`;

    if (!dataMap[key]) {
      dataMap[key] = {
        time: item.time,
        BS: item.BS,
        price: item.price,
        mo: item.mo,
        shou: item.shou,
        deal: moneyFormat(item.mo),
      };
    } else {
      dataMap[key].mo = parseInt(item.mo + dataMap[key].mo, 10);
      dataMap[key].deal = moneyFormat(dataMap[key].mo);
    }
  });

  const bigList = Object.keys(dataMap).map(key => dataMap[key]);

  cache.loadBigDeal[code] = { list: bigList };

  return {
    list: bigList,
  };
};

export const getClose = async(code) => {
  const json = await (
    await fetch(
      `https://www.laohu8.com/proxy/stock/astock/stock_info/candle_stick/day/${code.replace(
        /\D+/g,
        ''
      )}`
    )
  ).json();
  const { items } = json;

  return items.reverse();
};

// 历史行情
cache.getHistory = cache.getHistory || {};
export const getHistory = async (code) => {
  if (!isInDealTime() && !isEmpty(cache.getHistory[code])) {
    return cache.getHistory[code];
  }

  const items = await getClose(code);

  // close high low open
  const list = items.length ? items : [];
  if (list.length < 30) {
    return {};
  }
  list.map((item) => {
    item.timeString = formatDate(item.time);
  });
  const today = formatDate(Date.now());
  const list2 = list.slice(0, 65);
  const list3 = list2.filter((item) => item.timeString !== today);
  const maxTop = Math.max.apply(
    null,
    list3.map((item) => item.high)
  );
  const min30 = Math.min.apply(
    null,
    list3.map((item) => item.low)
  );
  const ma5 = list2.slice(1, 6).reduce((aac, cur) => cur.close + aac, 0) / 5;
  const ma6 = list2.slice(1, 7).reduce((aac, cur) => cur.close + aac, 0) / 6;
  const ma7 = list2.slice(1, 8).reduce((aac, cur) => cur.close + aac, 0) / 7;
  const ma8 = list2.slice(1, 9).reduce((aac, cur) => cur.close + aac, 0) / 8;
  const ma9 = list2.slice(1, 10).reduce((aac, cur) => cur.close + aac, 0) / 9;
  const ma10 = list2.slice(1, 11).reduce((aac, cur) => cur.close + aac, 0) / 10;

  const ma11 = list2.slice(1, 12).reduce((aac, cur) => cur.close + aac, 0) / 11;
  const ma12 = list2.slice(1, 13).reduce((aac, cur) => cur.close + aac, 0) / 12;
  const ma13 = list2.slice(1, 14).reduce((aac, cur) => cur.close + aac, 0) / 13;
  const ma14 = list2.slice(1, 15).reduce((aac, cur) => cur.close + aac, 0) / 14;
  const ma15 = list2.slice(1, 16).reduce((aac, cur) => cur.close + aac, 0) / 15;

  const ma20 = list2.slice(1, 21).reduce((aac, cur) => cur.close + aac, 0) / 20;
  const ma25 = list2.slice(1, 26).reduce((aac, cur) => cur.close + aac, 0) / 25;

  const ma30 = list2.slice(1, 31).reduce((aac, cur) => cur.close + aac, 0) / 30;
  const ma60 = list2.slice(1, 61).reduce((aac, cur) => cur.close + aac, 0) / 60;

  // cdma
  const { macd = [] } = getMACD(list.reverse().map((item) => item.close));

  const rs = {
    maxTop,
    min30,
    ma5: Number(ma5.toFixed(2)),
    ma6: Number(ma6.toFixed(2)),
    ma7: Number(ma7.toFixed(2)),
    ma8: Number(ma8.toFixed(2)),
    ma9: Number(ma9.toFixed(2)),
    ma10: Number(ma10.toFixed(2)),

    ma11: Number(ma11.toFixed(2)),
    ma12: Number(ma12.toFixed(2)),
    ma13: Number(ma13.toFixed(2)),
    ma14: Number(ma14.toFixed(2)),
    ma15: Number(ma15.toFixed(2)),
    ma20: Number(ma20.toFixed(2)),
    ma25: Number(ma25.toFixed(2)),
    ma30: Number(ma30.toFixed(2)),
    ma60: Number(ma60.toFixed(2)),
    macd: Number(macd[0]).toFixed(1),
    macdCross: macd[0] > 0 && macd[1] <= 0 && macd[2] < 0 && macd[3] < 0,
    prev5Rate: float2Fix((list3[0].close - list3[4].close) / list3[0].close),
    prev10Rate: float2Fix((list3[0].close - list3[9].close) / list3[0].close),
    prev30Rate: float2Fix((list3[0].close - list3[29].close) / list3[0].close),
  };
  cache.getHistory[code] = rs;

  return rs;
};

// 大单流入
cache.getFlowMoney = cache.getFlowMoney || {};
export const getFlowMoney = async (code) => {
  if (!isInDealTime() && !isEmpty(cache.getFlowMoney[code])) {
    return cache.getFlowMoney[code];
  }
  const url = `https://vip.stock.finance.sina.com.cn/quotes_service/api/jsonp.php/var%20moneyFlowData=/MoneyFlow.ssi_ssfx_flzjtj?daima=${code}&gettime=1&t=${Date.now()}`;

  await loadScript(url);

  const json = window.moneyFlowData || {};

  const data = {
    超大单买: json.r0_in,
    超大单卖: json.r0_out,
    大单买: json.r1_in,
    大单卖: json.r1_out,
    小单买: json.r2_in,
    小单卖: json.r2_out,
    散单买: json.r3_in,
    散单卖: json.r3_out,
  };

  for (let i in data) {
    data[i] = Number(data[i]);
  }

  const rs = {
    superDeal: moneyFormat(data.超大单买 - data.超大单卖),
    bigDeal: moneyFormat(data.大单买 - data.大单卖),
    smallDeal: moneyFormat(data.小单买 - data.小单卖),
    tinyDeal: moneyFormat(data.散单买 - data.散单卖),
  };

  cache.getFlowMoney[code] = rs;

  return rs;
};

// calc
export const calcMyProfit = (current, buy, sum) => {
  const data = Object.assign({}, current);
  data.max_profit = parseInt((data.max - buy) * sum);
  data.min_profit = parseInt((data.min - buy) * sum);
  data.dealTotal = moneyFormat(data.deal_total);
  data.profit_rate = float2Fix((data.now - buy) / buy);
  data.todayProfix = parseInt((data.now - data.yestoday) * sum);

  return data;
};

export const calcCurrentAndHistory = (current, history) => {
  const data = {};
  data.max1 = history.maxTop;
  data.max1_rate = float2Fix((current.now - history.maxTop) / history.maxTop);
  data.ma5 = history.ma5;
  data.ma30 = history.ma30;
  data.ma60 = history.ma60;
  data.min30 = history.min30;
  data.ma5_rate = float2Fix((current.now - history.ma5) / history.ma5);
  data.ma30_rate = float2Fix((current.now - history.ma30) / history.ma30);
  data.ma60_rate = float2Fix((current.now - history.ma60) / history.ma60);
  data.min30_rate = float2Fix((current.now - history.min30) / history.min30);

  return data;
};

export const message = ({title = 'notify', body = 'hi'}) => {
  try {
    if (window.Notification && Notification.requestPermission) {
      Notification.requestPermission( function(status) {
        new Notification(title, {body});
      });
    }
  } catch(err){
    
  }
}
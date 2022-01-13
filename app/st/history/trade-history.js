const data = `
#2022-01-13
74.16 74.53 800

#2022-01-12
74.01 74.19 800
74.21 74.78 1300


#2022-01-11
77.01 77.60 800
76.90 77.30 800
77.83 78.52 500


#2022-01-07
77.87 77.98 2000


#2022-01-05
77.2 78.00 900
`;

const float2Fix = (num, bit = 2) => {
    const rate = parseInt(num * 10 ** (bit + 2).toString(), 10) / 10 ** bit;
    return `${rate}%`;
};

const parseData = (str) => {
  let m;
  const regx = /#[^#]+/g;
  const list = [];
  while ((m = regx.exec(str)) !== null) {
    m[0].split(/\n/).filter(item => !!item).map(item => {
      if (item.includes('#')) {
        list.unshift({
          time: item.replace(/#\s*/, ''),
          list: [],
        });
      } else {
        const arr = item.split(/\s+/);
        list[0].list.push({
          b: +arr[0],
          s: +arr[1],
          t: +arr[2],
        });
      }
    });
  }
  return list;
};

const getFee = (total) => {
  const per = 53 / 42500;

  return parseInt(per * total);
}


const calc = (list) => {
  const content = [];
  const days = {};
  list.map(item => {
    item.list.map(data => {
      const obj = {};
      const a = parseInt((data.s - data.b) * data.t);
      const time = item.time.replace(/\d{4}-/, '');
      obj.time = time;
      obj.flo = +float2Fix((data.s - data.b)/data.b, 2).replace(/%/, '');
      obj.s = data.t / 100;
      obj.fee = getFee(data.b * data.t);
      obj.p1 = a;
      obj.p2 = a - obj.fee;
      content.unshift(obj);

      if (!days[time]) days[time] = 0;
      days[time] += obj.p2;
    });
  });

  return {content, days};
};


const showData = calc(parseData(data));
console.table(showData.content);

console.table(Object.keys(showData.days).map(day => ({time: day, pro: showData.days[day]})));

const total = showData.content.reduce((aac, current) => current.p2 + aac,0);

console.log('total', total);
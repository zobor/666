let today;
let trades = [];
let myChart;
myChart = echarts.init(document.getElementById('app'));
const colors = [
  'rgb(0, 0, 0)',
  'rgb(118, 215, 196)',
  'rgb(171, 178, 185)',
  'rgb(246, 221, 204)',
  '#efefef'
]

const calcDays = (x, y) => {
  const a = new Date(x.replace(/-/, '/'));
  const b = new Date(y.replace(/-/, '/'));
  const oneDay = 1000 * 3600 * 24;
  const days = (b.valueOf() - a.valueOf())/ oneDay;

  return days;
}
const render = async () => {
  const data = await (await fetch(`./trend.json?t=${Date.now()}`)).json();
  let xData = data.map((item) => item.time.replace(/\d{4}-\d{2}-\d{2}\s/, ''));
  let yData = data.map((item) => item.close);
  data.forEach((item, idx) => {
    // { "yAxis": 74.15, "value": "B", "xAxis": "09:48" },
    if (idx >= 1) {
      const prev = data[idx -1];
      const day = calcDays(prev.time, item.time);
      const dir = item.close > prev.close ? 'up' : 'down';
      trades.push({
        yAxis: item.close,
        value: day,
        xAxis: item.time,
        dir,
        itemStyle: {
          color: dir === 'up' ? 'red' : 'green',
        },
        label: {
          show: true,
          color: '#fff',
          fontSize: 14
        },
      });
    }
  });

  const zoom = 0;
  const option = {
    title: {
      text: today,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (datas) {
          const [data] = datas;
        return `${data.axisValue} / (${data.data})`;
      },
    },
    xAxis: {
      data: xData,
    },
    yAxis: {
      min: +(Math.min.apply(null, yData) - yData[0] * zoom).toFixed(2),
      max: +(Math.max.apply(null, yData) + yData[0] * zoom).toFixed(2),
    },
    series: [
      {
        name: 'Now',
        type: 'line',
        // smooth: true,
        data: yData,
        itemStyle: {
          normal: {
            color: colors[0],
            borderColor: colors[0],
            borderWidth: 2,
          },
        },
        markPoint: {
          data: [
              ...trades
          ],
        },
      },
    ],
  };

  myChart.setOption(option);
};

window.onload = async() => {
    await render();
}
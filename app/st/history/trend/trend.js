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
  const yData2 = data.map((item) => item.hs);
  const yData3 = data.map((item) => item.vol);
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

  const option = {
    title: {
      text: today,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (datas) {
          const [data] = datas;
        return `${data.axisValue} / (${data.data})`;
      },
    },
    xAxis: [
      {
        type: 'category',
        data: xData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        axisPointer: {
          z: 100
        }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: xData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      {
        type: 'category',
        gridIndex: 2,
        data: xData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      }
    ],
    // xAxis: {
    //   data: xData,
    // },
    // yAxis: {
    //   min: +(Math.min.apply(null, yData) - yData[0] * zoom).toFixed(2),
    //   max: +(Math.max.apply(null, yData) + yData[0] * zoom).toFixed(2),
    // },
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      },
      {
        scale: true,
        gridIndex: 2,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
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
      {
        name: 'HuanShou',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          normal: {
            color: colors[1],
            borderColor: colors[1],
            borderWidth: 2,
          },
        },
        data: yData2
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 2,
        yAxisIndex: 2,
        itemStyle: {
          normal: {
            color: colors[2],
            borderColor: colors[2],
            borderWidth: 2,
          },
        },
        data: yData3
      }
    ],
    grid: [
      {
        left: '10%',
        right: '8%',
        height: '40%'
      },
      {
        left: '10%',
        right: '8%',
        top: '63%',
        height: '16%'
      },
      {
        left: '10%',
        right: '8%',
        top: '83%',
        height: '16%'
      }
    ],
  };

  myChart.setOption(option);
};

window.onload = async() => {
    await render();
}
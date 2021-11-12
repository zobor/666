import { moneyFormat, getUrlParam, getMinutesKline, getHistory, numVsNum, message } from '../src/utils.js';

const code = getUrlParam('c') || 'sz000333';
const f = getUrlParam('f') ? getUrlParam('f') : 1000;
const myChart = echarts.init(document.getElementById('app'));

(() => {
  const $filter = document.querySelector('#filter');
  const html = Array(9).fill(0).map((_, idx) => `<option value="${(idx+1)*1000}">${idx+1}千万</option>`).join('');
  $filter.innerHTML = html;
  $filter.addEventListener('change', e => {
    const v = Number(e.target.selectedOptions[0].value);
    update(v);
  });
  const $select = $filter.querySelector(`option[value="${f}"]`);
  $select && ($select.selected = true);
})();

const getOptions = (xData, yData, yData2) => {
  const option = {
    title: {
      text: code,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(datas) {
        const [data, data2] = datas;
        const time = data.name;
        const value = Number(data.data);
  
        return [
          `${time}`,
          value,
          `${moneyFormat(data2.value)}`
        ].join('<br>');
      }
    },
    legend: {
      data:['price', 'deal']
    },
    xAxis: {
      data: xData,
    },
    yAxis: [
      {
        type: 'value',
        name: 'price',
        min: Number((Math.min.apply(null, yData) - yData[0] * 0).toFixed(1)),
        max: Number((Math.max.apply(null, yData) + yData[0] * 0.01).toFixed(1)),
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
              color: 'blue'
          }
        },
      },
      {
        type: 'value',
        name: 'deal',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
              color: 'red',
          }
        },
        axisLabel: {
          formatter: '{value}'
        },
      },
    ],
    series: []
  };
  if (yData && yData.length) {
    option.series.push({
      name: 'price',
      type: 'line',
      smooth: true,
      data: yData,
      markPoint: {
          data: []
      },
    });
  }
  if (yData2 && yData2.length) {
    option.series.push({
      name: 'deal',
      type: 'bar',
      // showBackground: true,
      data: yData2,
      color: 'rgba(180, 180, 180, 0.3)',
      yAxisIndex: 1,
      // backgroundStyle: {
      //     color: 'rgba(180, 180, 180, 0.1)'
      // }
    });
    option.legend.data.push('Mo');
  }
  return option;
}

const render = (option) => {
  myChart.setOption(option);
}

const update = (filter = 1000) => {
  console.log('filter', filter);
  const list = window.Data.slice(0).filter(item => item.mo >= filter * 10000);
  const yData = list.map(item => item.close);
  const yData2 = list.map((item) => ({
    value: item.mo,
    itemStyle: {
      color: item.rise >=0 ? '#F5B7B1': '#ABEBC6',
    },
  }));
  const xData = list.map(item => item.time);
  const options = getOptions(xData, yData, yData2);
  render(options);
  console.log(options);
}

(async() => {
  const rs = await getMinutesKline(code);
  const filterMo = 1500 * 10000;
  rs.list = rs.list.reverse().filter(item => item.mo >= filterMo);
  window.Data = rs.list;

  update(f);
})();
let today;
let trades = [];
let myChart;
const render = async () => {
  const data = await (await fetch(`./list/${today}_sz000333`)).json();
  let xData = data.map((item) => item.time.replace(/\d{4}-\d{2}-\d{2}\s/, ''));
  let yData = data.map((item) => item.close);

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
        return data.data;
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
        smooth: true,
        data: yData,
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

const loadConfig = async() => {
    const data = await (await fetch('./view.json')).json();
    document.querySelector('#app').innerHTML = '<div class="list">' + Object.keys(data).map(day => {
        return `<h2>${day}</h2>`;
    }).join('') + '</div>';

    document.querySelector('.list').addEventListener('click', async(e) => {
        const { target } = e;
        if (target.tagName.toLowerCase() === 'h2') {
            myChart = echarts.init(document.getElementById('app'));
            today = target.innerText.trim();
            trades = data[today];
            await render();
        }
    })
}

window.onload = async() => {
    await loadConfig();
}
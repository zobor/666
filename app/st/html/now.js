window.onerror = e => {
  alert(e.message)
};
import { classnames, getUrlParam, getMinutesKline, getHistory, numVsNum, message, gethk2china, loadIndex, getA50, formatDate } from '../src/utils.js';
let getData = getMinutesKline;
const code = getUrlParam('c');
const pageSize = getUrlParam('ps') ? Number(getUrlParam('ps')) : 30;
const isDemo = getUrlParam('demo') === '1';
const cache = {
  index: 1,
  notify: {}
};
window.STcache = cache;
window.STnotify = {};
console.log('code', code);

const buildTable = (list, smallest, biggest, superDeals) => {
	const nums = list.map(item => item.close);
	const min = Math.min.apply(null, nums);
	const max = Math.max.apply(null, nums);
  const html = [`<table class="${classnames({
    'trend-up': list[0].close > list[list.length-1].close,
    'trend-down': list[0].close < list[list.length-1].close,
  })}">`];

	html.push(`<thead><tr></tr></thead>`)
  const filterKeys =['mo', 'volunm'];
	Object.keys(list[0]).forEach(item => {
		if (filterKeys.includes(item)) return;
		if (item === 'moFormat') {
      html.push(`<td>mo</td>`)
    } else {
      html.push(`<td>${item}</td>`)
    }
	});
	html.push(`</tr></thead><tbody>`)
	list.forEach(item => {
    const isBig = item.mo >= 1500 * 10000;
    const isUp = item.rise >= 0;
    const isDown = item.rise < 0;
    const rankIndex = superDeals.indexOf(item.mo);
    const rkValue = rankIndex !== -1 ? window.rankIndexMap[rankIndex + 1] : '';

		html.push(`<tr class="${classnames({
      'super-deal': superDeals.includes(item.mo),
      'big-deal': isBig,
      'rise-up': isUp,
      'rise-down': isDown,
      'max-all': item.close === biggest,
      'min-all': item.close === smallest,
      'current-max': item.close === max,
      'current-min': item.close === min,
    })}">`);
		Object.keys(item).map(key => {
			if (filterKeys.includes(key)) return;
			if (key === 'moFormat') {
				html.push(`<td>${item.moFormat}<span class="top-rank">${rkValue||''}</span></td>`);
			} else if (key === 'rise') {
        html.push(`<td>${item[key]}</td>`);
      } else {
				html.push(`<td>${item[key]}</td>`);
			}
		});
		html.push('</tr>');
	});
	html.push('</tbody></table>');

	return html.join('');
}

const update = async() => {
  // 爬取分时数据
  const rs = await getData(code);
  if (!cache.data) {
    cache.data = JSON.parse(JSON.stringify(rs));
  }
  const { list } = rs;
  let ls = JSON.parse(JSON.stringify(list));
  if (isDemo) {
    ls = ls.reverse().slice(0, cache.index).reverse();
  }
  const closeList = ls.map(item => item.close);
  const smallest = Math.min.apply(null, closeList);
  const bigest = Math.max.apply(null, closeList);

  window.DATA = {
    now: list[0].close,
    smallest,
    bigest,
  };

  const tables = [];

  // 设置标题
  const [ current ] = ls;

  document.title = `${current.moFormat}/${current.close}`;
  // document.title = `${current.moFormat}/${current.rise}/${current.close}`;
  // document.title = `${current.rise}/${current.close}`;
  //document.title = `${current.close}`;

  // 金额排行
  let superDeals = [];
  if (ls.length >= pageSize) {
    const rankList = ls.slice(0).sort((a, b) => b.mo - a.mo).slice(0, pageSize);
    superDeals = rankList.map(item => item.mo);

    // 按照成交金额排行
    tables.push(buildTable(rankList, smallest, bigest, superDeals));

    // 按照时间纬度排行
    //tables.push(buildTable(rankList.sort((a, b) => b.time.replace(/\D/g, '') - a.time.replace(/\D/g,'')), smallest, bigest, superDeals));
  }

  // 波动排行
  // if (ls.length >= pageSize) {
  //   const rankRise = ls.slice(0).sort((a, b) => b.rise - a.rise).slice(0, pageSize);
  //   tables.push(buildTable(rankRise, smallest, bigest, superDeals));
  // }

  // 消息通知
  const isSuperDeal = superDeals.includes(current.mo) || current.mo > 1500 * 10000;
  if (ls.length >= pageSize && isSuperDeal && !window.STnotify[current.time]) {
    let title = `${current.time}/放量`;
    let body = '';
    const dir = current.rise > 0 ? '上涨😀' : '下跌🥵';
    title = `${title}/${dir}/${current.close}`;
    body = `成交量:${current.moFormat}, 涨跌:${current.rise}`;
    window.STnotify[current.time] = {title, body};
    message({title, body});
  }

  let curIndex = 0;
	while(curIndex < ls.length) {
		const ll = ls.slice(curIndex, curIndex + pageSize);
		tables.push(buildTable(ll, smallest, bigest, superDeals));
    curIndex += pageSize;
	};

  document.querySelector('#app').innerHTML = tables.join('');
};

const history = async() => {
  const rs = await getHistory(code);
  const { ma5, ma6, ma7, ma8, ma9, ma10, ma11, ma12, ma13, ma14, ma15, ma20, ma25, ma30, ma60} = rs;
  const { now, smallest, bigest } = window.DATA || {};

  const html = `<table class="ma">
    <tr>
      <td>当前</td>
      <td>最高</td>
      <td>最低</td>
      <td>ma5</td>
      <td>ma6</td>
      <td>ma7</td>
      <td>ma8</td>
      <td>ma9</td>
      <td>ma10</td>
    </tr>
    <tr>
      <td>${now}</td>
      <td>${bigest}</td>
      <td>${smallest}</td>
      <td class="${classnames({
        support: now >= ma5,
        pressure: now < ma5,
      })}">${ma5}</td>
      <td class="${classnames({
        support: now >= ma6,
        pressure: now < ma6,
      })}">${ma6}</td>
      <td class="${classnames({
        support: now >= ma7,
        pressure: now < ma7,
      })}">${ma7}</td>
      <td class="${classnames({
        support: now >= ma8,
        pressure: now < ma8,
      })}">${ma8}</td>
      <td class="${classnames({
        support: now >= ma9,
        pressure: now < ma9,
      })}">${ma9}</td>
      <td class="${classnames({
        support: now >= ma10,
        pressure: now < ma10,
      })}">${ma10}</td>
    </tr>
    <tr>
      <td>--</td>
      <td>${numVsNum(now, bigest)}</td>
      <td>${numVsNum(now, smallest)}</td>
      <td>${numVsNum(now, ma5)}</td>
      <td>${numVsNum(now, ma6)}</td>
      <td>${numVsNum(now, ma7)}</td>
      <td>${numVsNum(now, ma8)}</td>
      <td>${numVsNum(now, ma9)}</td>
      <td>${numVsNum(now, ma10)}</td>
    </tr>

    <tr>
      <td>ma11</td>
      <td>ma12</td>
      <td>ma13</td>
      <td>ma14</td>
      <td>ma15</td>
      <td>ma20</td>
      <td>ma25</td>
      <td>ma30</td>
      <td>ma60</td>
    </tr>
    <tr>
      <td class="${classnames({
        support: now >= ma11,
        pressure: now < ma11,
      })}">${ma11}</td>
      <td class="${classnames({
        support: now >= ma12,
        pressure: now < ma12,
      })}">${ma12}</td>
      <td class="${classnames({
        support: now >= ma13,
        pressure: now < ma13,
      })}">${ma13}</td>
      <td class="${classnames({
        support: now >= ma14,
        pressure: now < ma14,
      })}">${ma14}</td>
      <td class="${classnames({
        support: now >= ma15,
        pressure: now < ma15,
      })}">${ma15}</td>
      <td class="${classnames({
        support: now >= ma20,
        pressure: now < ma20,
      })}">${ma20}</td>
      <td class="${classnames({
        support: now >= ma25,
        pressure: now < ma25,
      })}">${ma25}</td>
      <td class="${classnames({
        support: now >= ma30,
        pressure: now < ma30,
      })}">${ma30}</td>
      <td class="${classnames({
        support: now >= ma60,
        pressure: now < ma60,
      })}">${ma60}</td>
    </tr>
    <tr>
      <td>${numVsNum(now, ma11)}</td>
      <td>${numVsNum(now, ma12)}</td>
      <td>${numVsNum(now, ma13)}</td>
      <td>${numVsNum(now, ma14)}</td>
      <td>${numVsNum(now, ma15)}</td>
      <td>${numVsNum(now, ma20)}</td>
      <td>${numVsNum(now, ma25)}</td>
      <td>${numVsNum(now, ma30)}</td>
      <td>${numVsNum(now, ma60)}</td>
    </tr>
  </table>`;

  document.querySelector('#ma').innerHTML  = html;
};

const toggleVisibility = () => {
  if (window.innerWidth < 800) {
    return;
  }
  document.body.classList.add('hide');
  document.body.addEventListener('keydown', e => {
    if (e.keyCode === 83) {
      document.body.classList.remove('hide');
    }
  })
  document.body.addEventListener('keyup', e => {
    document.body.classList.add('hide');
  });
  document.body.addEventListener('click', e=> {
    console.log(document.body.classList);
    document.body.classList.toggle('hide');
  });
}

const hq = async() => {
  const bx = await gethk2china();
  const { hk2cn } =bx;
  const index = await loadIndex();
  const { sh_rate, sz_rate, sz2_rate, hs300_rate } = index;
  const a50 = await getA50();

  const html = `<table>
    <tr>
      <td>SH</td>
      <td>SZ</td>
      <td>SZ2</td>
      <td>300</td>
      <td>BX</td>
      <td>A50</td>
    </tr>
    <tr>
      <td>${sh_rate}</td>
      <td>${sz_rate}</td>
      <td>${sz2_rate}</td>
      <td>${hs300_rate}</td>
      <td>${hk2cn}</td>
      <td>${a50}</td>
    </tr>
  </table>`;
  document.querySelector('#hq').innerHTML = html;
}

const timeCountDown = () => {
  const $time = document.querySelector('#time');
  setInterval(() => {
    const time = formatDate(Date.now(), '');
    $time.innerHTML = time;
  }, 1000);
}

const main = async() => {
  const run = async() => {
    await update();
    await history();
  };

  toggleVisibility();

  if (!isDemo) {
    // 定时器
    setInterval(run, 3000);
    setInterval(hq, 3000);
  } else {
    // demo 部分
    if (cache.data) {
      getData = () => new Promise((resolve) => {
        cache.index += 1;
        resolve(cache.data);
      });
    }

    setTimeout(() => {
      main();
    }, 1000);
  }
  await run();
  await hq();
  timeCountDown();
};

main();

import profitData from './profit-data';
import { favMap, stColors } from './config';
import { classnames, float2Fix, moneyFormat, loadCode, formatDate } from './utils';

const { useState, useEffect } = React;
const calcDays = (startTime, endTime) => {
  const date1 = new Date(startTime.replace(/-/g, '/'));
  const date2 = new Date(endTime.replace(/-/g, '/'));
  const oneDay = 3600 * 1000 * 24;
  return parseInt((date2 - date1) / oneDay) || 1;
}

const fupanURL = `./chart.html`;
const serviceRage = ( 11.26 + 53.28 ) / 41700;

export const Profit = () => {
  const [list, setList] = useState(profitData.map(item => {
    if (!item.S) {
      item.dateS = formatDate(Date.now());
    }
    return item;
  }));
  const [profit, setProfit] = useState(0);
  const [weekProfit, setWeekProfit] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);


  useEffect(() => {
    // 总收益
    const totalProfit = list.filter(item => (item.S || item.S0)).reduce((aac, current) => {
      const profitValue = ((current.S || current.S0) - current.B) * current.sum;
      return aac + profitValue;
    }, 0);
    setProfit(totalProfit);

    // 本周收益
    (() => {
      const date = new Date();
      const oneday = 3600 * 1000 * 24;
      date.setTime( +date - (date.getDay() - 1) * oneday);
      const firstDayOfThisWeek = formatDate(date);
      const firstDayTime = new Date(firstDayOfThisWeek.replace(/-/g, '/'));
      const thisWeekDeals = list.filter(item => {
        return +new Date(item.dateB.replace(/-/g, '/')) >= +firstDayTime;
      });

      const weekProfit = thisWeekDeals.reduce((aac, current) => {
        const profitValue = ((current.S || current.S0) - current.B) * current.sum;
        return aac + profitValue;
      }, 0);
      setWeekProfit(parseInt(weekProfit));
    })();

    (() => {
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const firstDayOfThisMonth = new Date(`${year}/${month}/01`);
      const thisWeekDeals = list.filter(item => {
        return +new Date(item.dateB.replace(/-/g, '/')) >= +firstDayOfThisMonth;
      });

      const curProfit = thisWeekDeals.reduce((aac, current) => {
        const profitValue = ((current.S || current.S0) - current.B) * current.sum;
        return aac + profitValue;
      }, 0);
      setMonthProfit(parseInt(curProfit));
    })();


  }, [list])

  useEffect(() => {
    const hash = {};
    const codes = profitData.filter(item => item.S === 0).map(item => ({code: item.code})).filter(item => {
      if (hash[item.code]) return false;
      hash[item.code] = {};
      return true;
    });
    codes.forEach(item => {
      loadCode(item.code).then(rs => {
        if (rs.now) {
          const newList = list.slice(0);
          newList.forEach(obj => {
            if (item.code === obj.code && obj.S === 0) {
              obj.S0 = rs.now;
            }
          });
          setList(newList);
        }
      });
    })
  }, []);

  // return '';

  return <div className="profit-page">
    <header>
      <h1><span>¥</span><i>{parseInt(profit)}</i></h1>
      <div className="time-profit">
        <p>本周收益:¥{weekProfit}</p>
        <p>本月收益:¥{monthProfit}</p>
        <p>交易次数:{list.length}</p>
      </div>
    </header>

    <div className="content">
      <div className="content-wrap">
        <table className="profit-table">
          <tr>
            <td>名称</td>
            <td>卖日期</td>
            <td>收益</td>
            <td>天数</td>
            <td>收益率</td>
            <td>金额</td>
            <td>佣金</td>
          </tr>
          {list.map(item => {
            const name = favMap[item.code];
            const sellDate = item.dateS.replace(/\d{4}-/, '');
            const sellPrice = item.S || item.S0;
            const profit = parseInt((sellPrice - item.B) * item.sum);
            const cls = profit > 0 ? 'red' : 'green';
            const days = calcDays(item.dateB, item.dateS);
            const floatRate = float2Fix(((item.S || item.S0) - item.B) / item.B);
            const kline = `${fupanURL}?t=${Date.now()}&c=${item.code}&b=${item.dateB}&s=${item.dateS}&bv=${item.B}&sv=${item.S}`;
            const $deal = parseInt(item.sum * item.B, 10);
            const serviceCharge = parseInt($deal * serviceRage, 10);
            const calcServiceTotal = () => {
              const val = Array.from(document.querySelectorAll('table tr td:last-child')).map(item => item.innerText).filter(str => /^\d+$/.test(str)).reduce((aac, cur) => (aac + Number(cur)), 0);
              alert(`总交易手续费: ${val}`);
            };
            const showDate = () => {
              alert(
                [
                  `买入价:${item.B}`,
                  `卖出价:${item.S}`,
                  `买入日期:${item.dateB}`,
                  `卖出日期:${item.dateS}`,
                  `买入数量:${item.sum}`,
                ].join('\n')
              );
            }
            return (<tr>
              <td onClick={() => window.open(kline)}>{name}</td>
              <td onClick={showDate}>{sellDate}</td>
              <td className={cls}>{moneyFormat(profit)}</td>
              <td>{days}</td>
              <td>{floatRate}</td>
              <td>{moneyFormat($deal)}</td>
              <td onClick={calcServiceTotal}>{serviceCharge}</td>
            </tr>)
          })}
        </table>
      </div>
    </div>
  </div>
};
import {
  loadCode,
  moneyFormat,
  classnames,
  promiseFormation,
  loadBigDeal,
} from './utils';
import {favList, favMap} from './config';

const { useEffect, useState, useRef, useCallback } = React;
const sum = (arr) => {
  return arr.reduce((aac, cur) => (aac + cur), 0);
}

export const Fav = ({data = {}}) => {
  const dom = useRef(null);
  const timer = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [list2, setList2] = useState([]);
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
  };
  const [state, setState] = useState(favList.map(item => ({code: item, data: {}})));

  useEffect(() => {
    document.body.addEventListener('onClickFav', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickFav', onDoubleClick);
    };
  }, []);

  const update = useCallback(() => {
    if (!isOpen) return;
    const tasks = favList.map(code => () => new Promise(resolve => {
      loadCode(code).then(rs => {
        const [s] = state.filter(item => item.code === code);
        s.data = rs;
        setState(state);
        resolve(true);
      });
    }));
    promiseFormation(tasks);
  }, [isOpen]);

  const goCodeDetail = (code, sum, buy) => {
    const url = `${location.pathname}?c=${code}&s=${sum}&b=${buy}&i=3000`;
    location.href = url;
  }

  useEffect(() => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    if (isOpen) {
      timer.current = setInterval(update, 5000);
      update();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const l2 = [];
      const tasks = favList.map(code => () => new Promise((resolve) => {
        loadBigDeal(code).then(rs => {
          if (rs && rs.list) {
            console.log(rs.name, rs)
            const bList = rs.list.filter(item => item.BS === 'B');
            const sList = rs.list.filter(item => item.BS === 'S');
            const s = {
              code,
              name: favMap[code],
              b_500: sum(bList.filter(item => item.mo < 1000*10000).map(item => item.mo)),
              b_1000: sum(bList.filter(item => item.mo >= 1000*10000).map(item => item.mo)),
              s_500: sum(sList.filter(item => item.mo < 1000*10000).map(item => item.mo)),
              s_1000: sum(sList.filter(item => item.mo >= 1000*10000).map(item => item.mo)),
            };
            s.sell = s.s_1000 + s.s_500;
            s.buy = s.b_1000 + s.b_500;
            s.pure = s.buy - s.sell;
            s.pure_1000 = s.b_1000 - s.s_1000;
            s.pure_500 = s.b_500 - s.s_500;
            console.log(s);
            l2.push(s);
          }
          resolve(true);
        });
      }));

      promiseFormation(tasks).then(() => {
        setList2(l2);
      });
    } else {
      setList2([]);
    }
  }, [isOpen]);

  return (
    <div className={classnames({
      'panel st-money': true,
      open: isOpen,
    })} onDoubleClick={onDoubleClick} ref={dom}>
      <h2>自选股</h2>
      <table className="table-fav-stocks">
        <thead>
          <tr>
             <td>名称</td>
             <td>成交</td>
             <td>今日</td>
             <td>今开</td>
             <td>现价</td>
             <td>振幅</td>
          </tr>
        </thead>
        {
          state.map(item => (
            <tr>
              <td className="clickable" onClick={goCodeDetail.bind(null, item.code,100, item.data.todayOpen)}>{item.data.name}</td>
              <td>{moneyFormat(item.data.deal_total) || '...'}</td>
              <td className={classnames({
                red: item.data.up_down && `${item.data.up_down}`.indexOf('-') === -1,
                green: item.data.up_down && `${item.data.up_down}`.indexOf('-') > -1,
              })}>{item.data.up_down}</td>
              <td className={classnames({
                red: item.data.todayOpen_yestoday && `${item.data.todayOpen_yestoday}`.indexOf('-') === -1,
                green: item.data.todayOpen_yestoday && `${item.data.todayOpen_yestoday}`.indexOf('-') > -1,
              })}>{item.data.todayOpen_yestoday}</td>
              <td>{item.data.now}</td>
              <td>{item.data.float}</td>
            </tr>
          ))
        }
      </table>

      <h2>主力排行</h2>
      <table className="table-fav-bigs">
        <thead>
          <tr>
            <th>名称</th>
            <th>总流向</th>
            <th>1000+</th>
            <th>500+</th>
            <th>买入</th>
            <th>卖出</th>
          </tr>
        </thead>
        <tbody>
          {list2.sort((a, b) => (b.pure - a.pure)).map(item => (
            <tr>
              <td>{item.name}</td>
              <td>{moneyFormat(item.pure)}</td>
              <td>{moneyFormat(item.pure_1000)}</td>
              <td>{moneyFormat(item.pure_500)}</td>
              <td>{moneyFormat(item.buy)}</td>
              <td>{moneyFormat(item.sell)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
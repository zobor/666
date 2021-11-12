import { getStockZhuliHistory, moneyFormat as moneyFormat2, classnames, promiseFormation, gethk2st } from './utils';
import { favList, favMap } from './config';

const { useEffect, useState, useRef } = React;
const moneyFormat = (val = '') => {
  const v = moneyFormat2(val) || '';
  return v.indexOf('万') ? v.replace(/\.\d+万/, '万') : v;
};

// 自选股主力资金
export const FavZhuLiDaDan = ({data = {}}) => {
  const {code} = data;
  const dom = useRef(null);
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
  };
  const [list, setList] = useState([]);
  const [list2, setList2] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.addEventListener('onClickFavDaDan', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickFavDaDan', onDoubleClick);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setList([]);

      const newList = [];
      const tasks = favList.map(code => () => new Promise(resolve => {
        getStockZhuliHistory(code).then(rs => {
          const rsList = rs.slice(0,5);
          newList.push({
            name: favMap[code],
            list: rsList
          });
          setList(newList);
          resolve(true);
        });
      }))
      promiseFormation(tasks);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setList2([]);

      const newList = [];
      const tasks = favList.map(code => () => new Promise(resolve => {
        gethk2st(code).then(rs => {
          const rsList = rs.slice(0,5);
          newList.push(rsList);
          setList2(newList);
          resolve(true);
        });
      }))
      promiseFormation(tasks);
    }
  }, [isOpen]);

  return (
    <div className={classnames({
      'panel st-money css-scroll': true,
      'open': isOpen,
    })} onDoubleClick={onDoubleClick} ref={dom}>
      <h2>自选股主力资金流入</h2>
      <table>
        {list.length ? <thead>
          <tr>
            <td>名称</td>
            {list[0].list.map(item => <td>{item.time.replace(/\d{4}-/, '')}</td>)}
          </tr>
        </thead> : null}
        {
          list.map((item, idx) => (
            <tr>
              <td>{item.name}</td>
              {item.list.map(it => <td className={classnames({
                    red: `${it.inMoney}`.indexOf('-') === -1,
                    green: `${it.inMoney}`.indexOf('-') > -1,
                  })}>{moneyFormat(it.inMoney)}</td>)}
            </tr>
          ))
        }
      </table>

      <h2>自选股北向资金流入</h2>
      <table>
        <thead>
          <tr>
            <td>名称</td>
            {
              list2.length && list2[0].map(item => (
                <td>{item.DetailDate.replace(/\d{4}-/, '')}</td>
              ))
            }
          </tr>
        </thead>
        {
          list2.map((item, idx) => (
            <tr>
              <td>{item[0].Name}</td>
              {
                item.map(it => (
                  <td  className={classnames({
                    red: `${it.hk2cnJME}`.indexOf('-') === -1,
                    green: `${it.hk2cnJME}`.indexOf('-') > -1,
                  })}>{moneyFormat(it.hk2cnJME)}</td>
                ))
              }
            </tr>
          ))
        }
      </table>
    </div>
  );
};
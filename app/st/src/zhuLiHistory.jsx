import { getStockZhuliHistory, moneyFormat as moneyFormat2, classnames } from './utils';

const { useEffect, useState, useRef } = React;
const moneyFormat = (val = '') => {
  const v = moneyFormat2(val) || '';
  return v.indexOf('万') ? v.replace(/\.\d+万/, '万') : v;
};

export const ZhuLiHistory = ({data = {}}) => {
  const {code} = data;
  const dom = useRef(null);
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
  };
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.addEventListener('onClickZhuLiHistory', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickZhuLiHistory', onDoubleClick);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      getStockZhuliHistory(code).then(rs => {
        if (rs && rs.length) {
          setList(rs);
        } else {
          setList([]);
        }
      });
    }
  }, [isOpen]);

  return (
    <div className={classnames({
      'panel st-money css-scroll': true,
      'open': isOpen,
    })} onDoubleClick={onDoubleClick} ref={dom}>
      <h2>个股主力历史资金</h2>
      <table className="table-fav-stocks">
        <thead>
          <tr>
            <td>时间</td>
            <td>价格</td>
            <td>涨跌</td>
            <td>净流入</td>
          </tr>
        </thead>
        {
          list.map(item => (
            <tr>
              <td>{item.time}</td>
              <td>{item.now}</td>
              <td  className={classnames({
                red: `${item.upFloat}`.indexOf('-') === -1,
                green: `${item.upFloat}`.indexOf('-') > -1,
              })}>{item.upFloat}%</td>
              <td  className={classnames({
                red: `${item.inMoney}`.indexOf('-') === -1,
                green: `${item.inMoney}`.indexOf('-') > -1,
              })}>{moneyFormat(item.inMoney)}</td>
            </tr>
          ))
        }
      </table>
    </div>
  );
};
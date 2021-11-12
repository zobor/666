import { getConceptMoney, classnames, getZhuLiMoneyFlow } from './utils';
import { favStockNameList } from './config';

const { useEffect, useState, useRef } = React;

export const Hots = ({data = {}}) => {
  const {code} = data;
  const dom = useRef(null);
  const [list, setList] = useState([]);
  const [list2, setList2] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    document.body.addEventListener('onClickHots', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickHots', onDoubleClick);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      getConceptMoney().then(rs => {
        if (rs && rs.length) {
          setList(rs);
        } else {
          setList([]);
        }
      });
    } else {
      setList([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getZhuLiMoneyFlow(data).then(rs => {
        if (rs && rs.length) {
          setList2(rs);
        } else {
          setList2([]);
        }
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
      <h2>热门板块</h2>
      <table className="table-fav-stocks">
        <thead>
          <tr>
            <td>板块</td>
            <td>涨跌</td>
            <td>资金</td>
            <td>个股</td>
            <td>code</td>
          </tr>
        </thead>
        {
          list.map(item => (
            <tr>
              <td>{item.name}</td>
              <td>{item.upFloat}%</td>
              <td>{item.inMoney}</td>
              <td className={classnames({
                active: favStockNameList.includes(item.stName)
              })}>{item.stName}</td>
              <td>{item.stCode}</td>
            </tr>
          ))
        }
      </table>

      <h2>热门个股</h2>
      <table className="table-fav-stocks">
        <thead>
          <tr>
            <td>名称</td>
            <td>涨跌</td>
            <td>净流入</td>
            <td>占比</td>
          </tr>
        </thead>
        {
          list2.map(item => (
            <tr>
              <td  className={classnames({
                active: favStockNameList.includes(item.name)
              })}>{item.name}</td>
              <td>{item.upFloat}%</td>
              <td>{item.inMoney}</td>
              <td>{item.zhanbi}%</td>
            </tr>
          ))
        }
      </table>
    </div>
  );
};
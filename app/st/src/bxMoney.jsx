import { gethk2st, moneyFormat as moneyFormat2, classnames, float2Fix } from './utils';

const { useEffect, useState, useRef } = React;
const moneyFormat = (val = '') => {
  const v = moneyFormat2(val) || '';
  return v.indexOf('万') ? v.replace(/\.\d+万/, '万') : v;
};

// 北向资金
export const BxMoney = ({data = {}}) => {
  const {code} = data;
  const dom = useRef(null);
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
  };
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.addEventListener('onClickMoney', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickMoney', onDoubleClick);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      gethk2st(data.code).then(rs => {
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
      <h2>个股北向资金流入</h2>
      <table>
        <thead>
          <tr>
            <td>日期</td>
            <td>排名</td>
            <td>涨跌</td>
            <td>净买入</td>
            <td>成交额</td>
            <td>I</td>
            <td>总计流入</td>
          </tr>
        </thead>
        {
          list.map((item, idx) => (
            <tr>
              <td>{item.DetailDate}</td>
              <td>{item.Rank}</td>
              <td className={classnames({
                red: `${item.ChangePercent}`.indexOf('-') === -1,
                green: `${item.ChangePercent}`.indexOf('-') > -1,
              })}>{float2Fix(item.ChangePercent / 100)}</td>
              <td className={classnames({
                red: `${item.hk2cnJME}`.indexOf('-') === -1,
                green: `${item.hk2cnJME}`.indexOf('-') > -1,
              })}>{moneyFormat(item.hk2cnJME)}</td>
              <td>{moneyFormat(item.hk2cnCJE)}</td>
              <td>{idx + 1}</td>
              <td style={{textAlign: 'right'}}  className={classnames({
                red: `${item.inTotalMoney}`.indexOf('-') === -1,
                green: `${item.inTotalMoney}`.indexOf('-') > -1,
              })}>{moneyFormat(item.inTotalMoney)}</td>
            </tr>
          ))
        }
      </table>
    </div>
  );
};
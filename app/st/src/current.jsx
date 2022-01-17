import {
  classnames,
  formatDate,
} from './utils';

const kvMap1 = {
  now: { label: '当前', bold: true },
  up_down: { label: '涨跌', rgb: true },
  buy: { label: '买入' },
  buySum: { label: '数量' },
  profit_rate: { label: '收益率', rgb: true },
  money_in: { label: '主力资金', rgb: true },
  dealTotal: { label: '成交', bold: true },
  float: { label: '振幅' },
  // todayOpen_yestoday: { label: '今开', rgb: true },
  // now_open: { label: '当前今开', rgb: true },
  
  // macd: { label: 'MACD', rgb: true },
  // ma5: { label: 'MA5', vs: 'now' },
  // ma10: { label: 'MA10', vs: 'now' },
  // ma15: { label: 'MA15', vs: 'now' },
  // ma30: { label: 'MA30', vs: 'now' },
  // ma60: { label: 'MA60', vs: 'now' },

  // superDeal: { label: '超大流入', rgb: true },
  // bigDeal: { label: '大单流入', rgb: true },
  // smallDeal: { label: '小单流入', rgb: true },
  // tinyDeal: { label: '散户流入', rgb: true },
};

const kvMap2 = {
  yestoday: { label: '昨收' },
  todayOpen: { label: '今开' },
  max: { label: '最高' },
  max_profit: { label: '最大收益' },
  min: { label: '最低' },
  min_profit: { label: '最小收益' },
  // lastYearToday: { label: '年初至今', bold: true },
  prev5Rate: { label: '5日涨幅', bold: true },
  prev10Rate: { label: '10日涨幅' },
  prev30Rate: { label: '30日涨幅' },
  ma5: { label: 'MA5', vs: 'now' },
  ma10: { label: 'MA10', vs: 'now' },
  ma15: { label: 'MA15', vs: 'now' },
  ma30: { label: 'MA30', vs: 'now' },
  ma60: { label: 'MA60', vs: 'now' },
  // max1: { label: '历史最高' },
  // max1_rate: { label: '历史最高' },
  // min30: { label: '30最低' },
  // min30_rate: { label: '30最低' },
};

const kvMap3 = {
  sh_rate: { label: '沪指', rgb: true },
  // sz_rate: { label: '深指', rgb: true},
  // sz2_rate: { label: '创板板', rgb: true},
  A50: { label: 'A50', rgb: true },
  hk2cn: { label: '北上资金', rgb: true },
  totalString: { label: '两市成交', bold: true },
  upCount: { label: '上涨家数' },
  downCount: { label: '下跌家数' },
  // sh_moneyFormat: { label: '上海成交' },
  // sz_moneyFormat: { label: '深圳成交' },
  // sh_index: { label: '上证指数' },
  // noChangeCount: { label: '持平家数' },
  // upDownCountRate: { label: '涨家0.809', bold: true },
  // downUpCountRate: { label: '跌家0.191', bold: true },
}

export const kvMap4 = {
  // cn2hk: { label: '南向资金', bold: true },
  // hk2sh: { label: '北向入沪' },
  // hk2sz: { label: '北向入深' },
  todayProfix: { label: '今日浮盈', rgb: true },
  // top_line: { label: '上影' },
  // center_line: { label: '实体' },
  // bottom_line: { label: '下影' },
};

const kvList = [kvMap1,kvMap2,kvMap3,kvMap4];

const { useState, useEffect, useRef } = React;
const getNow = () => formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss');

export const Current = ({ data = {}, toggleShowCurrent, context }) => {
  const [time, setTime] = useState(getNow());
  const dom = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  data.buy = context.buy;
  data.buySum = context.sum;
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
    toggleShowCurrent(!isOpen);
  };
  useEffect(() => {
    setInterval(() => {
      setTime(getNow());
    }, 1000);

    document.body.addEventListener('onClickInfo', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickInfo', onDoubleClick);
    };
  }, []);
  const klineCurrnetLineStyle = {
    [data.yestoday > data.now ? 'borderRight' : 'borderLeft']: 'dotted 5px yellow'
  };
  return (
    <div className={classnames({
      'panel st-current': true,
      open: isOpen
    })} onDoubleClick={onDoubleClick} ref={dom}>
      <div className="time">{time}</div>
      <div className="kline-pic">
        <span style={{width: data.top_line}}>{data.top_line}</span>
        <span style={Object.assign({width: data.center_line}, klineCurrnetLineStyle)}>{data.center_line}</span>
        <span style={{width: data.bottom_line}}>{data.bottom_line}</span>
      </div>
      {
        kvList.map(kvMap => {
          if (!Object.keys(kvMap).length) {
            return null;
          }
          return (
            <div className="st-current-group">{
              Object.keys(kvMap).map((key) => (
                <p key={key}>
                  <label>{kvMap[key].label}</label>
                  <span className={classnames({
                    bold: kvMap[key].bold,
                    green: (kvMap[key].rgb === true && `${data[key]}`.indexOf('-') === 0) || (kvMap[key].vs && data[key] > data[kvMap[key].vs]),
                    red: (kvMap[key].rgb === true && `${data[key]}`.indexOf('-') === -1) || (kvMap[key].vs && data[key] <= data[kvMap[key].vs]),
                  })}>{data[key]}</span>
                </p>
              ))
            }</div>
          );
        })
      }
    </div>
  );
};

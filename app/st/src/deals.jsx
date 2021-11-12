import { loadBigDeal, classnames, float2Fix } from './utils';

const { useEffect, useState, useRef } = React;

const cls = {
  B: 'red',
  S: 'green',
  M: 'white',
};

const getHourFromTimeString = (str) => {
  return Number(str.replace(/:\d+:\d+/, ''))
}

const isBig = (str) => {
  if (str.includes('亿')) {
    return true;
  }
  str = Number(str.replace('万', '')) * 10000;
  if (str > 1000 *10000) {
    return true;
  }
  return false;
};

export const Deals = ({data = {}}) => {
  const [list, setList] = useState([]);
  const [latestHour, setLatestHour] = useState(0);
  const {code} = data;
  const dom = useRef(null);
  const timer = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
  };

  const request = () => {
    loadBigDeal(code).then(rs => {
      if (rs && rs.list) {
        setList(rs.list);
        const b = rs.list.filter(item => item.BS === 'B');
        const s = rs.list.filter(item => item.BS === 'S');
        if (b.length && s.length) {
          const max = Math.max.apply(null, [getHourFromTimeString(b[0].time), getHourFromTimeString(s[0].time)]);
          setLatestHour(max);
        }
      } else {
        setList([]);
      }
    });
  };

  useEffect(() => {
    if (timer.current) {
      clearInterval(timer.current);
    }
    if (isOpen) {
      timer.current = setInterval(() => {
        request();
      }, 3000);
      request();
    } else {
      setList([]);
    }

    document.body.addEventListener('onClickDeal', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickDeal', onDoubleClick);
    };
  }, [isOpen]);

  return (
    <div className={classnames({
      'panel st-deal css-scroll': true,
      open: isOpen,
    })} onDoubleClick={onDoubleClick} ref={dom}>
      <div className="st-deal-scroll">
        <ul>
          <li className="count">{list.filter(item => item.BS === 'B').length}({float2Fix(list.filter(item => item.BS === 'B').length/list.length)})</li>
            {list.filter(item => item.BS === 'B').map((item) => (
              <li className={classnames({
                [cls[item.BS]]: true,
                latest: getHourFromTimeString(item.time) === latestHour,
                big: isBig(item.deal),
              })}>
                {item.time} {item.price} {item.shou}手 {item.deal}
              </li>
            ))}
        </ul>
        <ul>
          <li className="count">{list.filter(item => item.BS === 'S').length}({float2Fix(list.filter(item => item.BS === 'S').length/list.length)})</li>
            {list.filter(item => item.BS === 'S').map((item) => (
              <li className={classnames({
                [cls[item.BS]]: true,
                latest: getHourFromTimeString(item.time) === latestHour,
                big: isBig(item.deal),
              })}>
                {item.time} {item.price} {item.shou}手 {item.deal}
              </li>
            ))}
        </ul>
        {/* <ul>
          <li className="count">{list.filter(item => item.BS === 'M').length}({float2Fix(list.filter(item => item.BS === 'M').length/list.length)})</li>
            {list.filter(item => item.BS === 'M').map((item) => (
              <li className={cls[item.BS]}>
                {item.time} {item.deal} {item.price}
              </li>
            ))}
        </ul> */}
      </div>
    </div>
  );
};
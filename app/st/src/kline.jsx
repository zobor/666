import { classnames } from './utils';

const { useEffect, useState, useRef } = React;

// 日K
export const Kline = ({data = {}}) => {
  const {code} = data;
  const [url, setUrl] = useState('');
  const onDoubleClick = () => {
    setIsOpen(!isOpen);
  };
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.addEventListener('onClickKline', onDoubleClick);

    return () => {
      document.body.removeEventListener('onClickKline', onDoubleClick);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const path = `./chart.html?c=${code}&showmax=1&showmin=1`;
      setTimeout(() => {
        setUrl(`${path}`);
      }, 100);
    }
  }, [code, isOpen]);

  return (
    <div
      style={{ fontSize: 22 }}
      className={classnames({
        'panel st-money css-scroll': true,
        open: isOpen,
      })}
      onDoubleClick={onDoubleClick}
    >
      <div className="kline-list">
        <p>
          <a href={url} target="_blank;">
            全部
          </a>
        </p>
        <p>
          <a href={`${url}&pagesize=7`} target="_blank;">
            一周
          </a>
        </p>
        <p>
          <a href={`${url}&pagesize=22`} target="_blank;">
            一个月
          </a>
        </p>
        <p>
          <a href={`./now.html?c=${code}`} target="_blank;">
            分时表
          </a>
        </p>
        <p>
          <a href={`./time.html?c=${code}&f=1000`} target="_blank;">
            大单K线
          </a>
        </p>
        <p>
          <a href={`./max.html?c=${code}`} target="_blank;">
            振幅图
          </a>
        </p>
        <p>
          <a href={`./zhuli.html`} target="_blank;">
            主力
          </a>
        </p>
        <p>
          <a href={`./macd2.html?c=${code}`} target="_blank;">
            MACD
          </a>
        </p>
        <p>
          <a href={`../tools/calc.html`} target="_blank;">
            计算器
          </a>
        </p>
        <p>
          <a href={`../history/view/view.html`} target="_blank;">
            交易
          </a>
        </p>
      </div>
    </div>
  );
};
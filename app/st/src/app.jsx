import { CoundDown } from './countDown';
import { Current } from './current';
import { STForm } from './form';
import { ButtomGroups } from './buttomGroups';
import { Deals } from './deals';
import { BxMoney } from './bxMoney';
import { Hots } from './hots';
import { Fav } from './fav';
import { Kline } from './kline';

import {
  loadCode,
  calcMyProfit,
  getHistory,
  calcCurrentAndHistory,
  loadIndex,
  getA50,
  getFlowMoney,
  loadUpDownCount,
  gethk2china,
  getZhuliRealIn,
  moneyFormat,
} from './utils';

const { useEffect, useState, Fragment, useCallback,useRef } = React;

export const App = ({ context }) => {
  const useDataPage =
    context.code && context.buy && context.sum && context.interval;
  const timer = useRef(null);
  const [current, setCurrent] = useState({});
  const [countDownData, setCountDownData] = useState({});
  const [isShowCurrent, setIsShowCurrent] = useState(false);
  const [isShowHistory, setIsShowHistory] = useState(false);

  const toggleShowCurrent = useCallback((isOpen) => {
    setIsShowCurrent(isOpen);
  }, [isShowCurrent]);
  const toggleHistory = () => {
    setIsShowHistory(!isShowHistory);
  };

  const request = useCallback(() => {
    // 加载行情
    loadCode(context.code).then((currentRS) => {
      setCountDownData({
        buy: context.buy,
        sum: context.sum,
        now: currentRS.now,
        up_down: currentRS.up_down,
      });
      const cur = calcMyProfit(currentRS, context.buy, context.sum);
      setCurrent((preState) => Object.assign({}, preState, cur));

      if (isShowCurrent) {
        // 加载历史走势
        getHistory(context.code.replace(/\D+/g, '')).then((rs) => {
          const rsExt = calcCurrentAndHistory(currentRS, rs);
          setCurrent((preState) => Object.assign({}, preState, rs, rsExt));
        });
      }
    });


    if (!isShowCurrent) return;

    // 北向资金实时
    gethk2china().then(rs => {
      setCurrent((preState) =>
        Object.assign({}, preState, rs)
      );
    });

    // 大单流入
    // getFlowMoney(context.code).then(rs => {
    //   setCurrent((preState) =>
    //     Object.assign({}, preState, rs)
    //   );
    // });
    getZhuliRealIn(context.code).then(rs => {
      setCurrent((preState) => Object.assign({}, preState, {
        money_in: moneyFormat(rs['主力净流入']),
      }));
    });


    // 涨跌家数
    loadUpDownCount().then(rs => {
      setCurrent((preState) =>
        Object.assign({}, preState, rs)
      );
    });

    // 加载指数
    loadIndex().then((rs) => {
      setCurrent((preState) => Object.assign({}, preState, rs));
    });

    // 加载A50指数
    getA50().then((rs) => {
      setCurrent((preState) =>
        Object.assign({}, preState, {
          A50: rs,
        })
      );
    });

  }, [isShowCurrent]);

  useEffect(() => {
    if (!useDataPage) return;
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = setInterval(() => {
      request();
    }, context.interval);
    request();
  }, [useDataPage, isShowCurrent]);

  return (
    <Fragment>
      {!useDataPage ? <STForm /> : null}
      {useDataPage ? (
        <Fragment>
          <CoundDown data={countDownData} />
          <Current data={current} toggleShowCurrent={toggleShowCurrent} />
          <Deals data={{ code: context.code }} />
          <BxMoney data={{ code: context.code }} />
          <Hots data={{ code: context.code }} />
          <Fav />
          <Kline data={{ code: context.code }} />
          <ButtomGroups />
        </Fragment>
      ) : null}
    </Fragment>
  );
};


(() => {
  const toggleDarkModel = (isDark) => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };
  const checkDarkModel = () => {
    const d = new Date();
    const h = d.getHours();

    if (h >= 19 || h <= 5) {
      toggleDarkModel(true);
    } else {
      toggleDarkModel(false);
    }
  };
  checkDarkModel();
  setInterval(checkDarkModel, 10 * 1000);
})()
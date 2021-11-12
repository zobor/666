
const list = [
  { code: 'sz000333', buy: 87.05, sum: 500 },
  { code: 'sz002714', buy: 90.15, sum: 100 },
  { code: 'sh601318', buy: 85.5, sum: 500 },
  { code: 'sz300750', buy: 403.07, sum: 100 },
  { code: 'sh600519', buy: 2346, sum: 100 },
  { code: 'sh601012', buy: 112.26, sum: 1500 },
  { code: 'sh600031', buy: 42.94, sum: 1000 },
  // { code: 'sh605298', buy: 15.99, sum: 1000 },
];

const kvMap = {
  sz000333: '美的集团',
  sh601318: '中国平安',
  sz300750: '宁德时代',
  sh600519: '贵州茅台',
  sh601012: '隆基股份',
  sh600031: '三一重工',
  sh605298: '必得科技',
  sz002714: '牧原股份',
};

export const STHistory = () => {
  const interval = 3000;
  const path = location.pathname;
	return <div className="st-history">
    <ul>
      {list.map((item, idx) => <li><span>{idx + 1} </span><a href={`${path}?c=${item.code}&b=${item.buy}&s=${item.sum}&i=${interval}`}>{kvMap[item.code]} {item.buy}&{item.sum}</a></li>)}
    </ul>
    <div><a href={`${document.URL}?page=profit`} target="_blank">统计收益</a></div>
  </div>
};


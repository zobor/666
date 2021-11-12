export const favList = [
  'sz000333',
  'sz002714',
  'sh600519',
  'sz300750',
  'sh600036',
  'sh601012',
  'sh601318',
  'sh600031',
  'sz002415',
  'sz000858',
  'sh600660',
  'sz002008',
  'sz002352',
  'sz300760',
  'sz000651',
];

export const favMap = {
  sz000333: '美的集团',
  sh600519: '贵州茅台',
  sz300750: '宁德时代',
  sh600036: '招商银行',
  sh601012: '隆基股份',
  sh601318: '中国平安',
  sh600031: '三一重工',
  sz002415: '海康威视',
  sz000858: '五粮液',
  sh600660: '福耀玻璃',
  sz002008: '大族激光',
  sz002352: '顺丰控股',
  sz002714: '牧原股份',
  sz300760: '迈瑞医疗',
  sz000651: '格力电器',
  sh605298: '必得科技',
};

const colors = ['#C0392B', '#CB4335', '#884EA0', '#7D3C98', '#2471A3', '#2874A6', '#17A589', '#0E6655' ,'#1E8449' ,'#1D8348', '#B7950B', '#A04000', '#515A5A', '#283747', '#1C2833'];

export const stColors = {};
favList.map((key, idx) => stColors[key] = colors[idx]);

export const favStockNameList = Object.keys(favMap).map(key => favMap[key]);

export default favList;

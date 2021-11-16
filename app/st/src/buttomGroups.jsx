import { trigger } from './utils';

export const ButtomGroups = () => {
  const onClick = (type) => {
  	if (type === 'home') {
  		location.href = './';
  	}
    trigger(document.body, type);
  };
  return <div className="st-btns">
  	<div onClick={onClick.bind(null, 'home')}>首页</div>
    <div className="flex-line" />
    <div onClick={onClick.bind(null, 'onClickInfo')}>♬个股详情</div>
    <div onClick={onClick.bind(null, 'onClickDeal')}>♬个股大单</div>
    <div onClick={onClick.bind(null, 'onClickKline')}>♬K线图</div>
    <div className="flex-line" />
    <div onClick={onClick.bind(null, 'onClickFav')}>♥自选列表</div>
    <div onClick={onClick.bind(null, 'onClickHots')}>☀热门</div>
  </div>
};
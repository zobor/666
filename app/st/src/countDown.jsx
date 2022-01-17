import { getFee } from './utils';
const { useEffect, useRef } = React;

export const CoundDown = ({data}) => {
	const dom = useRef(null);
	const app = useRef(null);
	useEffect(() => {
		const $app = new CountUp(dom.current, 0, {
			startVal: 0,
			duration: 0.8,
		});
		app.current = $app;
	}, []);

	useEffect(() => {
		if (!data.now) {
			return;
		}
		const per = 53 / 42500;
		const cost = data.buy * data.sum;
		// const fee = parseInt(cost * per);
    const feeData = getFee(data.buy * data.sum, data.now * data.sum);
    const { total: fee } = feeData;
		const profit = parseInt((data.now - data.buy) * data.sum) - fee;
		app.current.update(profit);
		document.title = profit.toFixed(0) + '[' + data.now + '][' + data.up_down + ']';
	}, [data]);

	return <div className="countdown" ref={dom}></div>
}
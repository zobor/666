
const { useEffect, useRef } = React;

export const CoundDown = ({data}) => {
	if (location.hostname === 'localhost') {
		// return '';
	}
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
		const profit = parseInt((data.now - data.buy) * data.sum);
		app.current.update(profit);
		document.title = profit.toFixed(0) + '[' + data.now + '][' + data.up_down + ']';
	}, [data]);

	return <div className="countdown" ref={dom}></div>
}
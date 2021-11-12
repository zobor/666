import { favMap } from './config';

const { useRef, useEffect } =React;

export const STForm = () => {
  const $code = useRef(null);
  const $total = useRef(null);
  const $buy = useRef(null);
  const $interval = useRef(null);
  const onCodeSelectChange = (e) => {
    $code.current.value = e.target.value;
  };
  const onClick = () => {
    const arr = [...document.querySelectorAll(".st-form input")].map(
      (item) => `${item.name}=${item.value.trim()}`
    );
    if (arr[0] === "c=") {
      alert("请输入code");
      return;
    }
    if (arr[1] === "b=") {
      alert("请输入Buy");
      return;
    }
    if (arr[2] === "s=") {
      alert("请输入Total");
      return;
    }
    const url = `${location.origin}${location.pathname}`;
    window.location.href = `${url}?${arr.join("&")}`;
  };

  useEffect(() => {
    $code.current.value = Object.keys(favMap)[0];
    $total.current.value = 2000;
    $interval.current.value = 2000;
  }, [])

  return (
    <div className="st-form">
      <p>
        <label>Code:</label>
        <input type="text" name="c" ref={$code} />
        <select onChange={onCodeSelectChange}>
          {Object.keys(favMap).map(key => (
            <option value={key}>{favMap[key]}</option>
          ))}
        </select>
      </p>
      <p>
        <label>Buy:</label>
        <input type="text" name="b" ref={$buy} />
      </p>
      <p>
        <label>Total:</label>
        <input type="text" name="s" ref={$total} />
      </p>
      <p>
        <label>Interval:</label>
        <input type="text" name="i" ref={$interval} />
      </p>
      <p>
        <span class="button" onClick={onClick}>
          提交
        </span>
      </p>
    </div>
  );
};

const $hex = document.querySelector('#hex');
const $rgb = document.querySelector('#rgb');
const $box1 = document.querySelector('.box1');
const $box2 = document.querySelector('.box2');
const RE_NUM = /^[\dabcdef]{6}$/;
const RE_RGB = /^\d{1,3}(,\d{1,3}){2}$/;

$hex.addEventListener('input', ({target: { value }}) => {
    if (RE_NUM.test(value)) {
        const arr = value.split('');
        const x = `0x${arr[0]}${arr[1]}`;
        const y = `0x${arr[2]}${arr[4]}`;
        const z = `0x${arr[4]}${arr[5]}`;
        $rgb.value = `${Number(x)},${Number(y)},${Number(z)}`;
        $box1.style.backgroundColor = `#${value}`;
        $box2.style.backgroundColor = `rgb(${rgb.value})`;
    }
});

$rgb.addEventListener('input', ({target: { value }}) => {
    const v = value.replace('rgb(', '').replace(/\s+/g, '').replace(')','');
    if (RE_RGB.test(v)) {
        $box2.style.backgroundColor = `rgb(${v})`;
        $hex.value = v.split(',').map(v => Number(v).toString(16).padStart(2, '0')).join('');
        $box1.style.backgroundColor = `#${$hex.value}`;
    }
});
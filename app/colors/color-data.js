const $DATA = Array(400).fill(0).map((item, index) => {
  return '#' + (100 * index).toString(16).padStart(6, '0');
});

// console.log($DATA);

window.$DATA = $DATA;
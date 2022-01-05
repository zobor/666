import { App } from "./app";
import { Profit } from './profit';
import { getUrlParam } from "./utils";

export const params = {
  code: getUrlParam('c'),
  buy: getUrlParam('b'),
  sum: getUrlParam('s'),
  interval: getUrlParam('i'),
};

const page = getUrlParam('page');


const render = () => {
  ReactDOM.render(
    page === 'profit' ? <Profit /> : <App context={params} />,
    document.getElementById("app")
  );
};

(async () => {
  if (location.hostname !== 'zobor.github.io') {
    await window.styleInit();
  }
  render();
})();

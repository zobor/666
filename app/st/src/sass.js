import {
    httpGet
} from './utils';

const sass = new Sass();

const compile = (txt) => {
    return new Promise(resolve => {
        sass.compile(txt, function(result) {
            if (result && result.text) {
                const style = document.createElement('style');
                style.type = 'text/css';
                style.innerText = result.text;
                document.head.appendChild(style);
                resolve();
            }
        });
    });
}

window.styleInit = async () => {
    const txt = await httpGet('../src/index.scss');
    await compile(txt);
};
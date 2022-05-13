import {
    addImageFromURL,
    dataURLtoFile,
    downloadBlob,
    getClipboardData,
    unSelectAll
} from './fabric.api.js';

const $canvas = document.querySelector('#artboard');
const canvas = new fabric.Canvas('artboard');
canvas.setWidth(window.innerWidth) && canvas.setHeight(window.innerHeight);

document.addEventListener('paste', async(e) => {
    unSelectAll(canvas);
    const img_bash64 = await getClipboardData(e);
    img_bash64 && addImageFromURL({
        canvas,
        url: img_bash64,
    });
});

document.querySelector('.btns').addEventListener('click', (e) => {
    const { target } = e;
    if (target.className === 'btn') {
        unSelectAll(canvas);
        const { type } = target.dataset;
        switch (type) {
            case "download":
                const imageData = $canvas.toDataURL();
                const file = dataURLtoFile(imageData, `${Date.now()},png`);
                downloadBlob(file, file.name);
                break;
            default:
                break;
        }
    }
});
const isPlainObject = (v) => isObject(v) && Object.keys(v).length === 0;
const isObject = (v) => Object.prototype.toString.call(v) === '[object Object]';
const canvas = new fabric.Canvas('artboard');
canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight);

setTimeout(() => {
    insertImage('https://sta-op.douyucdn.cn/vod-cover/2022/03/12/675e57ddea48a0fb1280f8dc25b67afd.png/vdy1?x-oss-process=image%2Fformat%2Cwebp%2Fquality%2Cq_75')
}, 1000);

function insertImage(url) {
    addImageFromURL({
        canvas: canvas,
        url,
        selectable: true,
        isShape: true,
        position: {
            left:0,
            top: 0,
        },
        scale: 1.5,
    }).catch((err) => {
        console.error(err);
    });
}

function addImage({
    canvas,
    image,
    width,
    height,
    selectable = false,
    autocenter = true,
    position = {},
    scale = 1,
    autoFocus = true,
    removeCurrentSelected = true,
}) {
    // image.setAttribute('crossOrigin', 'Anonymous');
    image.crossOrigin = true;

    const rect = {
        width,
        height,
        top: 0,
        left: 0,
    };

    if (autocenter && selectable && isPlainObject(position)) {
        let w = width;
        let h = height;

        if (scale !== 0) {
            w *= scale;
            h *= scale;
        }
        rect.left = (canvas.width - w) / 2;
        rect.top = (canvas.height - h) / 2;
    }
    if (!isPlainObject(position)) {
        rect.left = position.left;
        rect.top = position.top;
    }

    if (removeCurrentSelected) {
        const selected = getSelected(canvas);

        // eslint-disable-next-line no-underscore-dangle
        if (selected && !selected._objects) {
            canvas.remove(selected);
            rect.left = selected.left;
            rect.top = selected.top;
        }
    }

    fabric.Image.fromURL(
        image.src,
        (img) => {
            img.set({ ...{ selectable }, ...rect });

            if (selectable) {
                if (scale !== 1) {
                    img.scaleToHeight(height * scale);
                    img.scaleToWidth(width * scale);
                }
                canvas.add(img);
                if (autoFocus) {
                    canvas.setActiveObject(img);
                }
            } else {
                // 禁止选中的是背景图片
                if (!selectable) {
                    img.scaleToHeight(canvas.height);
                    img.scaleToWidth(canvas.width);
                }
                canvas.backgroundImage = img;
            }
            canvas.renderAll();
        },
        { crossOrigin: 'Anonymous' }
    );
};

function addImageFromURL({
    canvas,
    url,
    selectable = false,
    scale = 1,
    position = {},
    isShape = false,
}) {
    const image = new Image();
    let zoom = scale;

    const selected = getSelected(canvas);

    if (selected) {
        const type = getSelectedType(selected);

        if (type === 'text') {
            return Promise.reject(new Error('文本不能替换为图片'));
        }
    }

    return new Promise((resolve, reject) => {
        // image.setAttribute('crossOrigin', 'Anonymous');
        image.crossOrigin = true;
        image.onload = () => {
            image.onload = () => {};
            const { width, height } = image;

            if (selected && selected.scaleX) {
                zoom = selected.scaleX;
            }

            addImage({ canvas, image, width, height, selectable, scale: zoom, position });
        };
        image.onerror = () => {
            image.onerror = () => {};
            reject(new Error('贴纸资源获取失败'));
        };

        // // shape 使用base64的svg作为图片的URL
        // if (isShape) {
        //     fetchText(url)
        //         .then((base64) => {
        //             image.src = `${imagePrefix},${encodeURIComponent(base64)}`;
        //         })
        //         .catch(() => {
        //             reject(new Error('贴纸资源获取失败'));
        //         });
        // } else {
        //     image.src = url;
        // }
        image.src = url;
    });
};

function getSelected(canvas) {
    if (!canvas) {
        return null;
    }

    return canvas.getActiveObject();
};

function getSelectedType (selected) {
    if (!selected) {
        return '';
    }
    if (selected.getElement && isFunction(selected.getElement) && isImage(selected.getElement())) {
        return 'image';
    }
    if (selected.text) {
        return 'text';
    }

    return '';
};

function isImage(v) {
  return Object.prototype.toString.call(v) === '[object HTMLImageElement]';
}
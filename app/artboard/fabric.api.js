import { cloneImg, deleteImg, rotateImg, zoomImg } from './assets.js';
import { isFileLike, isPlainObject } from './is.js';

export const { controlsUtils } = fabric;
export const originalScaleControl = fabric.Object.prototype.controls.br;

export const controlsPostionMap = {
  topLeft: {
    x: -0.5,
    y: -0.5,
  },
  topRight: {
    x: 0.5,
    y: -0.5,
  },
  bottomLeft: {
    x: -0.5,
    y: 0.5,
  },
  bottomRight: {
    x: 0.5,
    y: 0.5,
  },
};

// 删除
fabric.Object.prototype.controls.deleteControl = new fabric.Control({
  ...controlsPostionMap.topLeft,
  ...{
    offsetY: 0,
    objectCaching: false,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon(deleteImg),
    cornerSize: 20,
  },
});

// 复制
fabric.Object.prototype.controls.cloneControl = new fabric.Control({
  ...controlsPostionMap.bottomLeft,
  ...{
    offsetY: 0,
    offsetX: 0,
    objectCaching: false,
    cursorStyle: 'pointer',
    mouseUpHandler: cloneObject,
    render: renderIcon(cloneImg),
    cornerSize: 20,
  },
});

// 旋转
fabric.Object.prototype.controls.rotateControl = new fabric.Control({
  ...controlsPostionMap.topRight,
  ...{
    offsetY: 0,
    offsetX: 0,
    cursorStyle: 'pointer',
    objectCaching: false,
    actionHandler: controlsUtils.rotationWithSnapping,
    cursorStyleHandler: controlsUtils.rotationStyleHandler,
    render: renderIcon(rotateImg),
    cornerSize: 20,
    actionName: 'rotate',
  },
});

// 缩放
fabric.Object.prototype.controls.resizeControl = new fabric.Control({
  ...controlsPostionMap.bottomRight,
  ...{
    offsetY: 0,
    offsetX: 0,
    objectCaching: false,
    cursorStyle: 'pointer',
    actionHandler: originalScaleControl.actionHandler,
    cursorStyleHandler: originalScaleControl.cursorStyleHandler,
    render: renderIcon(zoomImg),
    cornerSize: 20,
    actionName: 'rotate',
  },
});

// 隐藏控制栏上中间的拖动控制点
'tl|ml|bl|mb|br|mr|tr|mt|mtr'.split('|').forEach((key) => {
  fabric.Object.prototype.setControlVisible(key, false);
});


export const canvasConfig = {
  artboardRect: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

export const getFileBase64 = (file) => {
    return new Promise((resolve) => {
        const isImage = isFileLike(file) && file.type.includes('image');
        if (isImage) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve(reader.result);
          };
        } else {
          // alert(`你剪切板里的数据格式为：${latestType}`);
        }
    });
};

export const getClipboardData = (e) => {
  return new Promise(async (resolve) => {
    let file;
    let file2;
    try {
      file2 = getFileFromClipboard(e);
      file = await getFileFromNavClipboard(e);
    } catch (err) {
      console.log('获取剪切板数据失败：', err);
      file = file2;
    }
    if (file) {
      getFileBase64(file).then((rs) => {
        resolve(rs);
      });
    } else {
      resolve(undefined);
    }
  });
};

export const getFileFromNavClipboard = async () => {
  let file;
  const item_list = await navigator.clipboard.read();
  const [clipboardItem] = item_list || [];
  if (clipboardItem && clipboardItem.types && clipboardItem.types.length) {
    const latestType = clipboardItem.types[clipboardItem.types.length - 1];
    file = await clipboardItem.getType(latestType);
  }

  return file;
};

export const getFileFromClipboard = (event) => {
    const { clipboardData } = event || window;
    const {items} = clipboardData;

    let file = null;
    if (items && items.length) {
        // 搜索剪切板items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                file = items[i].getAsFile();
                break;
            }
        }
    }

    return file;
};


export const addImage = ({
  canvas,
  imageTag,
  width,
  height,
  selectable = false,
  autocenter = true,
  position = {},
  scale = 1,
  autoFocus = true,
  removeCurrentSelected = true,
}) => {
  const image = imageTag;
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

export const addImageFromURL = ({
  canvas,
  url,
  selectable = true,
  scale = 1,
  position = {},
}) => {
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

      if (
        width > canvasConfig.artboardRect.width ||
        height > canvasConfig.artboardRect.height
      ) {
        zoom = Math.min(
          (canvasConfig.artboardRect.width / width) * 0.8,
          (canvasConfig.artboardRect.height / height) * 0.8,
        );
      }

      if (selected && selected.scaleX) {
        zoom = selected.scaleX;
      }

      addImage({
        canvas,
        imageTag: image,
        width,
        height,
        selectable,
        scale: zoom,
        position,
      });
    };
    image.onerror = () => {
      image.onerror = () => {};
      reject(new Error('贴纸资源获取失败'));
    };

    image.src = url;
  });
};

export const getSelected = (canvas) => {
  if (!canvas) {
    return null;
  }

  return canvas.getActiveObject();
};

export const getSelectedType = (selected) => {
  if (!selected) {
    return '';
  }
  if (
    selected.getElement &&
    isFunction(selected.getElement) &&
    isImage(selected.getElement())
  ) {
    return 'image';
  }
  if (selected.text) {
    return 'text';
  }

  return '';
};

export function deleteObject(eventData, target) {
  const tar = target.target;
  const { canvas } = tar;

  canvas.remove(tar);
  canvas.requestRenderAll();
}

export function renderIcon(iconObject) {
  return function (ctx, left, top, styleOverride, fabricObject) {
    const size = this.cornerSize;

    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(iconObject, -size / 2, -size / 2, size, size);
    ctx.restore();
  };
}

export function cloneObject(eventData, transform) {
  const { target } = transform;
  const { canvas } = target;

  target.clone((cloned) => {
    cloned.left += 50;
    cloned.top += 50;
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
  });
}

export const unSelectAll = (canvas) => {
  if (canvas && canvas.discardActiveObject) {
    canvas.discardActiveObject();
    canvas.renderAll();
  }
};

export const changeCanvasBackgroundImage = (canvas, image) => {
  image.crossOrigin = true;
  fabric.Image.fromURL(
    image.src,
    (img) => {
      img.scaleToHeight(canvas.height);
      img.scaleToWidth(canvas.width);
      canvas.backgroundImage = img;
      canvas.renderAll();
    },
    { crossOrigin: 'Anonymous' }
  );
};


export const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n) {
      n -= 1;
      u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export function downloadBlob(blob, filename = 'dd.png') {
  const dataURL = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fn = filename || `s_${+new Date()}.md`;
  a.href = dataURL;
  a.setAttribute('download', fn);
  a.innerHTML = 'downloading...';
  a.style.display = 'none';
  document.body.appendChild(a);
  setTimeout(() => {
    a.click();
    document.body.removeChild(a);
  }, 66);
}
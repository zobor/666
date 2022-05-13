export const isError = (v) => Object.prototype.toString.call(v) === '[object Error]';

export const isFunction = (v) => Object.prototype.toString.call(v) === '[object Function]';

export const isArray = (v) => Object.prototype.toString.call(v) === '[object Array]';

export const isFile = (v) => Object.prototype.toString.call(v) === '[object File]';

export const isBlob = (v) => Object.prototype.toString.call(v) === '[object Blob]';

export const isObject = (v) => Object.prototype.toString.call(v) === '[object Object]';

export const isPlainObject = (v) => isObject(v) && Object.keys(v).length === 0;

export const isImage = (v) => Object.prototype.toString.call(v) === '[object HTMLImageElement]';

export const isFileLike = (v) => isFile(v) || isBlob(v);
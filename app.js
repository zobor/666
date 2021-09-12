var serve = require('koa-static-server');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();

const Router = require('koa-router');
const router = new Router();
var proxy = require('koa-proxies');

app.use(async (ctx, next) => {
  console.log(ctx.url);
  ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
  ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');

  await next();
});

app.use(proxy('/api/upload', {
    target:  'http://fedci.dz11.com/',
    logs: true,
    changeOrigin: true,
    rewrite: () => '/api/multiupload'
}));

app.use(proxy('/api/uploadmp3', {
    target:  'http://wsd-ocr-srv-voicetranslate-go.live.unp.oyw/',
    logs: true,
    changeOrigin: true,
    rewrite: () => 'api/voice/issuedVoice'
}));

app.use(proxy('/api/getmp3text', {
    target:  'http://wsd-ocr-srv-voicetranslate-go.live.unp.oyw/',
    logs: true,
    changeOrigin: true,
    rewrite: (path) => path.replace('api/getmp3text', '/api/voice/get')
}));

app.use(proxy('/api/file', {
  target:  'http://127.0.0.1:8080/',
  logs: true,
  changeOrigin: true,
  rewrite: (path) => path.replace('api/file', '/')
}));


app.use(koaBody({ multipart: true, encoding: 'gzip' }));
app.use(router.routes());

router.post('/api/upload', async(ctx, next) => {
  uploadFileToCi(ctx.request.files.file);
  ctx.body = JSON.stringify({
    data: {
      success: 1,
    },
    msg: 'ok',
    error: 0,
  });
  ctx.status = 200;
});

app.use(
  serve({
    rootDir: '/Users/zobor/code/666',
    rootPath: '/',
    index: 'index.html',
  })
);

app.listen(3000);

console.log('server start at: http://127.0.0.1:3000');

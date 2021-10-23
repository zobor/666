var serve = require('koa-static-server');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const path = require('path');

const Router = require('koa-router');
const router = new Router();
var proxy = require('koa-proxies');

app.use(async (ctx, next) => {
  console.log(ctx.url);
  ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
  ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');

  await next();
});

app.use(serve({ rootDir: path.resolve('.'), rootPath: '/', index: 'index.html' }));

app.listen(3000);

console.log('http://localhost:3000');

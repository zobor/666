var serve = require('koa-static-server')
const Koa = require('koa');
const app = new Koa();
const path = require('path');

 // folder support
// GET /web/
// returns /web/index.html
// GET /web/file.txt
// returns /web/file.txt

app.use(async(ctx, next) => {
    console.log(ctx.url);
    ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
    ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');

    await next();
});

app.use(serve({ rootDir: path.resolve('.'), rootPath: '/', index: 'index.html' }));

app.listen(3000);
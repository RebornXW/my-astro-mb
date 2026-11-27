// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// LumenBox 的两个页面：访问 /game、/editor 时直接返回页面内容，URL 不变，不经过跳转页。
// 源文件仍然原样放在 public/ 下，复制更新后无需改任何代码。
const LUMENBOX_PAGES = {
  '/game': 'lumenbox_game.html',
  '/editor': 'lumenbox_editor.html',
};

function lumenboxPages() {
  let root = process.cwd();

  return {
    name: 'lumenbox-pages',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
      },
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'lumenbox-dev-routes',
                // 仅开发服务器：把 /game、/editor 直接映射到 public 下的页面
                configureServer(server) {
                  server.middlewares.use((req, res, next) => {
                    const pathname = (req.url || '').split('?')[0];

                    // /game/、/editor/ 统一回到不带斜杠的地址，保证 ./core/ 相对路径正确
                    if (pathname.length > 1 && pathname.endsWith('/')) {
                      const clean = pathname.replace(/\/+$/, '');
                      if (LUMENBOX_PAGES[clean]) {
                        res.statusCode = 301;
                        res.setHeader('Location', clean);
                        res.end();
                        return;
                      }
                    }

                    const file = LUMENBOX_PAGES[pathname];
                    if (!file) return next();

                    const full = path.join(root, 'public', file);
                    if (!fs.existsSync(full)) return next();

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache');
                    const stream = fs.createReadStream(full);
                    stream.on('error', () => {
                      res.statusCode = 500;
                      res.end();
                    });
                    stream.pipe(res);
                  });
                },
              },
            ],
          },
        });
      },
      // 构建时同时产出两种形式，兼容所有静态托管：
      // 1) dist/game.html        —— 支持 clean URL 的平台直接映射 /game
      // 2) dist/game/index.html  —— 普通静态服务器（含 GitHub Pages）走目录索引
      'astro:build:done': ({ dir }) => {
        const outDir = fileURLToPath(dir);
        for (const [route, file] of Object.entries(LUMENBOX_PAGES)) {
          const source = path.join(outDir, file);
          if (!fs.existsSync(source)) continue;

          const html = fs.readFileSync(source, 'utf8');
          const name = route.slice(1);

          fs.writeFileSync(path.join(outDir, `${name}.html`), html);

          // 目录形式下页面 URL 是 /game/，./core/ 会变成 /game/core/，必须改成根绝对路径
          const dirHtml = html.replaceAll('src="./core/', 'src="/core/');
          fs.mkdirSync(path.join(outDir, name), { recursive: true });
          fs.writeFileSync(path.join(outDir, name, 'index.html'), dirHtml);
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [lumenboxPages()],
  // 首页自动进入游戏
  redirects: {
    '/': '/game',
  },
});

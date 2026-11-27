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
      // 构建时额外产出 dist/game.html、dist/editor.html，供静态托管直接映射 /game、/editor
      'astro:build:done': ({ dir }) => {
        const outDir = fileURLToPath(dir);
        for (const [route, file] of Object.entries(LUMENBOX_PAGES)) {
          const source = path.join(outDir, file);
          const target = path.join(outDir, `${route.slice(1)}.html`);
          if (fs.existsSync(source)) fs.copyFileSync(source, target);
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

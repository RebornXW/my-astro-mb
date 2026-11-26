// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 短链接兼容：LumenBox 文件原样放在 public/ 根目录，./core/ 相对路径才正确。
  // 这里把原来的 /game、/editor 重定向到对应文件，首页写法和旧书签都不用改。
  redirects: {
    '/game': '/lumenbox_game.html',
    '/editor': '/lumenbox_editor.html',
  },
});

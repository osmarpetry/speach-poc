import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Speach — Speechify Clone',
    version: '1.0.0',
    permissions: ['tts', 'storage', 'tabs', 'activeTab'],
    host_permissions: ['<all_urls>'],
  },
});

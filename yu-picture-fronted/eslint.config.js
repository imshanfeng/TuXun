// Polyfill for Node.js < 20 where findLastIndex might be missing
if (!Array.prototype.findLastIndex) {
  Array.prototype.findLastIndex = function(predicate) {
    let l = this.length;
    while (l--) {
      if (predicate(this[l], l, this)) return l;
    }
    return -1;
  };
}

if (!globalThis.structuredClone) {
  globalThis.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}

import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormatting,
]

// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';

// https://astro.build/config
export default defineConfig({
  markdown: {
    // Unified is required for rehype-mermaid (Sätteri doesn't support rehype plugins).
    // Keep GFM + smartypants defaults via unified().
    processor: unified({
      rehypePlugins: [rehypeMermaid],
    }),
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'math'],
    },
  },
});

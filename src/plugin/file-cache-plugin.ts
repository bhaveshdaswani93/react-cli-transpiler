import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

const forage = localforage.createInstance({
  name: 'storeit'
})

export const fileCachePlugin = (inputCode: string) => {
  return {
    name: 'file-cache',
    setup: (build: esbuild.PluginBuild) => {
      build.onLoad({ filter: /^index\.js/ }, async (args: any) => {
        return {
          loader: 'jsx',
          contents: inputCode,
        };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const fromCache = await forage.getItem<esbuild.OnLoadResult>(args.path);

        if (fromCache) {
          return fromCache;
        }
      });

      build.onLoad({ filter: /\.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);
        const escaped = data
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");
        const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
        `;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await forage.setItem(args.path, result);

        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {

        const { data, request } = await axios.get(args.path);
        const resolveDir = new URL('./', request.responseURL).pathname;
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir
        };
        await forage.setItem(args.path, result)
        return result;
      })
    }
  }
}
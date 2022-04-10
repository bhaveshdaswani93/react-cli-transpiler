import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

const forage = localforage.createInstance({
  name: 'storeit'
})

export const unpkgPathPlugin = (input: string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResole', args);
        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' };
        } 

        // if (args.path.includes('./') || args.path.includes('../')) {
        //   return {
        //     namespace: 'a',
        //     path: new URL(args.path, args.importer + '/').href,
        //   };
        // }
        
        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            path: new URL(args.path, 'https://unpkg.com'+args.resolveDir+'/').href,
            namespace: 'a'
          }
        }

        return {
          path: `https://unpkg.com/${args.path}`,
          namespace: 'a'
        }
  
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);

        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: input,
          };
        }

        const fromCache = await forage.getItem<esbuild.OnLoadResult>(args.path);

        if (fromCache) {
          return fromCache;
        }

        const { data, request } = await axios.get(args.path);
        console.log(request);
        
        const resolveDir = new URL('./', request.responseURL).pathname;
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir
        };
        await forage.setItem(args.path, result)
        return result;
      });
    },
  };
};

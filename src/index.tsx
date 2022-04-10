import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom"
import * as esbuild from 'esbuild-wasm'
import { unpkgPathPlugin } from "./plugin/unpkg-path-plugin";
import { fileCachePlugin } from "./plugin/file-cache-plugin";

const App = () => {
  const [text, setText] = useState('');
  const [code, setCode] = useState('');
  const ref = useRef<any>();

  useEffect(() => {
    startService();
  }, [])

  const startService = async () => {
      ref.current = await esbuild.startService({
        worker: true,
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
      })
  }

  const changeTheText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }

  const changeTheCode = async () => {
    if (!ref.current) {
      return;
    }
    console.log(text);
    const result =  await ref.current.build({
     entryPoints: ['index.js'],
     bundle: true,
     write: false,
     plugins: [unpkgPathPlugin(), fileCachePlugin(text)],
     define: {
       'process.env.NODE_ENV': '"production"',
       global: 'window'
     }
    });

    console.log(result);
    
    
    setCode(result.outputFiles[0].text);
  }

  return <div>
    <textarea value={text} onChange={changeTheText}></textarea>
    <br />
    <button onClick={changeTheCode}>Submit</button>
    <pre>{code}</pre>
  </div>
}

ReactDOM.render(<App />, document.querySelector('#root'));

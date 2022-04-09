import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom"
import * as esbuild from 'esbuild-wasm'

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
        wasmURL: '/esbuild.wasm'
      })
  }

  const changeTheText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }

  const changeTheCode = async () => {
    if (!ref.current) {
      return;
    }

    const result =  await ref.current.transform(text, {
      target: 'es2015',
      loader: 'jsx'
    });
    
    setCode(result.code);
  }

  return <div>
    <textarea value={text} onChange={changeTheText}></textarea>
    <br />
    <button onClick={changeTheCode}>Submit</button>
    <pre>{code}</pre>
  </div>
}

ReactDOM.render(<App />, document.querySelector('#root'));

import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
  intialValue: string;
  onChange: (value: string | undefined) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({ intialValue, onChange }) => {
  return <MonacoEditor 
    onChange={onChange}
    value={intialValue}
    height='100vh'
    language="javascript"
    theme='vs-dark'
    options={{
      wordWrap: 'on',
      minimap: { enabled: false },
      showUnused: false,
      folding: false,
      lineNumbersMinChars: 3,
      fontSize: 16,
      scrollBeyondLastLine: false,
      automaticLayout: true
    }}
  />
}

export default CodeEditor;
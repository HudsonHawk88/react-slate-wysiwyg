# @inftechsol/react-slate-wysiwyg

## About component

It is a simle Wysiwyg component using Slate (slate-react) with some basic formatting.

## Compatibility

This component use [slate-react v0.95.0](https://docs.slatejs.org/ 'slate-react v0.95.0'), [react v18.2.0](https://www.npmjs.com/package/react 'React v18.2.0'), [react-dom v18.2.0](https://www.npmjs.com/package/react-dom 'React DOM v18.2.0'). You should use FontAwesome 6 for the button icons, and Boostrap 5.

## Installation

npm i @inftechsol/react-slate-wysiwyg

## Basic usage

```jsx
import React from 'react';
import { Wysiwyg, initialValue, Editor, setEditorValue } from '@inftechsol/react-slate-wysiwyg';

const App = () => {
    const initVal = initialValue || [ type: 'align-left', style: {{ fontSize: '17px', textALign: 'left' }} ];
    const [value, setValue] = useState(initVal);

    const onChange = (value) => {
        setValue(value);
    }
    const getDataFromServer = () => {
        fetch('https://example.com/api/getData', { method: 'GET' }).then((value) => {
            setEditorValue(value, Editor);
        })
    }

    return (
        <div>
            <div>
                <button onClick={getDataFromServer}>Get Data</button>
            </div>
            <div>
                <Wysiwyg onChange={onChange} value={value} />
            </div>
        </div>
    );
};

export default App;
```

## Properties

    - Wysiwyg properties:
        - value: CustomElement[] (required) - see initialValue or Slate documents,
        - onChange: function (required)
        - className: string (optional) // default: 'react-slate-wysiwyg',
        - id: (optional) string | number
        - colors: object (optional) - Formatting buttons font color // default:  { normal: { activeColor: '#0f0', color: '#000' }, reverse: { activeColor: 'black', color: '#0f0' } },
        - reserved: (optional) boolean - colors is reserved // default false,
        - placeholder: (optional) // default: 'Ide írjon szöveget...',
        - uploadType: (optional) 'link' || 'pc' // default 'link' - PC upload is not working yet,
        - customButtons: (optional) Array - add custom Text(format) - [{ format: string, text: string }] - [{ format: ${variable}, text: ${variable} }]

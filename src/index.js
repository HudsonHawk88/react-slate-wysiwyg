import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Wysiwyg, serialize } from './components/Wysiwyg';

const App = () => {

    const initialValue = [
        {
            type: 'paragraph',
            children: [{ text: '', style: { fontSize: '17px'} }]
        }
    ];

    const [ value, setValue ] = useState(initialValue);

    const onChange = (val) => {
        setValue(val)
    }

    useEffect(() => {
        const a = serialize(value)
        console.log(a);
    }, [value])

    return <Wysiwyg value={value} onChange={onChange} uploadType="pc" />;
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

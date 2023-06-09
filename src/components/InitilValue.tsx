import { CustomElement, Image } from './InterfacesAndTypes';

export const initialValue: CustomElement[] = [
    {
        type: 'align-left',
        children: [{ text: '', style: { fontSize: '17px' } }]
    }
];

export const defaultColors = {
    normal: {
        activeColor: '#0f0',
        color: '#000'
    },
    reverse: {
        activeColor: 'black',
        color: '#0f0'
    }
};

export const defaultStyle = { border: '1px black solid', padding: '10px' };

export const defaultImage: Image = {
    src: '',
    alt: '',
    width: '',
    height: ''
};

import React, { useState, useCallback, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from 'reactstrap';
import { createEditor, Transforms, Editor, Element as SlateElement, Text } from 'slate';
import { Slate, Editable, withReact, ReactEditor, useSlate, useFocused, useSelected, useSlateStatic } from 'slate-react';
import { withHistory } from 'slate-history';
import isUrl from 'is-url';
import imageExtensions from 'image-extensions';
import { css } from '@emotion/css';
/* import escapeHtml from 'escape-html'; */
import { Toolbar, ToolbarButton, Icon } from './Components';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/index.css';

// INTERFACES AND TYPES

export type CustomElement = { type: string; align?: string; style?: object, children?: CustomText[] | CustomElement[] };
export type CustomImage = { type: string, url: string, children?: EmptyText[] };
export type CustomText = { text: string; bold?: boolean | undefined, italic?: boolean | undefined, underline?: boolean | undefined, code?: boolean | undefined, style?: object | undefined, align?: string };

declare module 'slate' {
    interface CustomTypes {
        Editor: ReactEditor;
        Text: CustomText;
        Element: CustomElement;
    }
}

type onUploadType = (file: File) => void;

interface WysiwygProps {
    className?: string;
    id?: string | undefined;
    value: CustomElement[];
    onChange: VoidFunction;
    colors?: Object;
    placeholder?: string;
    uploadType?: 'pc' | 'link';
    onUpload?: onUploadType;
}

interface FormatButtonProps {
    format: string;
    icon: any;
    colors?: object;
}

type Format = string;

interface Image {
    src: string,
    alt?: string
}

interface AccessNode {
    keyName: keyof CustomElement; // 👈️ one of Employee's keys
}

export type EmptyText = {
    text: string
}

export type ImageElement = {
    type: string
    src: string | ArrayBuffer
    children?: EmptyText[] | CustomText[] | CustomElement[],
    style: object | undefined
}

// DEFAULT VALUES

const initialValue: CustomElement[] = [
    {
        type: 'paragraph',
        children: [{ text: '', style: { fontSize: '17px'} }]
    }
];
 

const defaultColors = {
    normal: {
        activeColor: '#0f0',
        color: 'black'
    },
    reverse: {
        activeColor: 'black',
        color: '#0f0'
    }
};


const defaultStyle = { border: '1px black solid' };

const defaultImage: Image = {
    src: '',
    alt: ''
}

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];
/* const HEADING_TYPES = ['heading-one', 'heading-2', 'heading-3', 'heading-4', 'heading-5']; */
/* const IMAGE_ALIGN_TYPES = [ 'left', 'center', 'right' ]; */
/* const IMAGE_TYPES = [ 'image', 'image-center' ];
const IMAGE_ALIGN_TYPES = [ 'image-left', 'image-right' ]; */


function getStilus(style: any) {

    let stilus: string = "";
  
    if (style){
      for (const [key] of Object.entries(style)) {
        if(style[key]){
            if (key === 'textAlign') {
                stilus = stilus.concat(`text-align: ${style[key]};`)
            } else if (key === 'fontSize') {
                stilus = stilus.concat(`font-size: ${style[key]};`)
            } else {
                stilus = stilus.concat(`${key}: ${style[key]};`)
            }

        } 
      }
    }
    return `"${stilus}"`;
  }

export const serialize = (nodes: any) => {
    let serialized = nodes.map((n: any) => {
        const children = n.children && n.children.map((nn: any) => {
            console.log(nn)
            if (Text.isText(nn)) {
               /*  let string = escapeHtml(nn.text); */
                let string = nn.text;
               /*  let sty = getStilus(nn.style); */
                if (nn.bold) {
                    string = `<strong>${string}</strong>`;
                }
                if (nn.code) {
                    string = `<code>${string}</code>`;
                }
                if (nn.italic) {
                    string = `<em>${string}</em>`;
                }
                if (nn.underline) {
                    string = `<u>${string}</u>`;
                }
        
                return string;
            } else {
                serialize(n.children);
            }
        });

        
        switch (n.type) {
            case 'quote':
                return `<blockquote><p>${children}</p></blockquote>`
            case 'paragraph': {
                const style = getStilus(n.style);
                if (style) {
                    return `<p style=${style}>${children}</p>`
                } else {
                    return `<p>${children}</p>`
                }
            }
              
            case 'left': {
                const style = getStilus(n.style);
                const align = n.align;
                if (style) {
                    return `<p style=${style} align='${align}'>${children}</p>`
                } else {
                    return `<p align='${align}'>${children}</p>`
                }
            }
            case 'center': {
                const style = getStilus(n.style);
                const align = n.align;
                console.log(children.style, style)
                if (style) {
                    return `<p style=${style} align='${align}'>${children}</p>`
                } else {
                    return `<p align='${align}'>${children}</p>`
                }
            }
            case 'right': {
                const style = getStilus(n.style);
                const align = n.align;
                if (style) {
                    return `<p style=${style} align='${align}'>${children}</p>`
                } else {
                    return `<p align='${align}'>${children}</p>`
                }
            }
            case 'block-quote':
                return (
                    `<blockquote style=${n.style}>${children}</blockquote>`
                );
            case 'bulleted-list': {
                let child = serialize(n.children).toString();
                if (child) {
                    child = child.replaceAll(',', '');
                }
                if (n.style) {
                    return (
                        `<ul style=${n.style}>${child}</ul>`
                    );
                } else {
                    return (
                        `<ul>${child}</ul>`
                    );
                }
            }
            case 'heading-1': {
                if (n.style) {
                    return (
                        `<h1 style=${n.style}>${children}</h1>`
                    );
                } else {
                    return (
                        `<h1>${children}</h1>`
                    );
                }
            }
            case 'heading-2': {
                if (n.style) {
                    return (
                        `<h2 style=${n.style}>${children}</h2>`
                    );
                } else {
                    return (
                        `<h2>${children}</h2>`
                    );
                }
            }
            case 'heading-3': {
                if (n.style) {
                    return (
                        `<h3 style=${n.style}>${children}</h3>`
                    );
                } else {
                    return (
                        `<h3>${children}</h3>`
                    );
                }
            }
            case 'heading-4': {
                if (n.style) {
                    return (
                        `<h4 style=${n.style}>${children}</h4>`
                    );
                } else {
                    return (
                        `<h4>${children}</h4>`
                    );
                }
            }
            case 'heading-5': {
                if (n.style) {
                    return (
                        `<h5 style=${n.style}>${children}</h5>`
                    );
                } else {
                    return (
                        `<h5>${children}</h5>`
                    );
                }
            }
            case 'list-item': {
                if (n.style) {
                    return (
                        `<li style=${n.style}>${children}</li>`
                    );
                } else {
                    return (
                        `<li>${children}</li>`
                    );
                }
            }
            case 'numbered-list': {
                let child = serialize(n.children).toString();
                if (child) {
                    child = child.replaceAll(',', '');
                }
                if (n.style) {
                    return (
                        `<ol style=${n.style}>${child}</ol>`
                    );
                } else {
                    return (
                        `<ol>${child}</ol>`
                    );
                }
            }
            case 'image': {
                const src = n.src;
                const alt = n.alt;
                return (
                    `<img src=${src} alt=${alt} style=${n.style} />`
                );
            }
            case 'image-center': {
                const src = n.src;
                const alt = n.alt;
                const style = getStilus(n.style)
                return (
                    `<img src=${src} alt=${alt} style=${style} />`
                );
            }
            case 'image-left': {
                const src = n.src;
                const alt = n.alt;
                const style = getStilus(n.style)
                return (
                    `<img src=${src} alt=${alt} style=${style} />`
                );
            }
            case 'image-right': {
                const src = n.src;
                const alt = n.alt;
                const style = getStilus(n.style);
                return (
                    `<img src=${src} alt=${alt} style=${style} />`
                );
            }
            case 'div': {
                let child = serialize(n.children).toString();
                if (child) {
                    child = child.replaceAll(',', '');
                }
                const style = getStilus(n.style);
                if (style) {
                    return (`<div style=${style}>${child}</div>`);
                } else {
                    return (`<div>${child}</div>`);
                }
              
            }
            case 'align-left': {
                const align = n.align;
                const style = getStilus(n.style)
                if (style) {
                    return (
                        `<p align=${align} style=${style}>${children}</p>`
                    );
                } else {
                    return (
                        `<p align=${align}>${children}</p>`
                    );
                }
            }
            case 'align-center': {
                const align = n.align;
                const style = getStilus(n.style)
                if (style) {
                    return (
                        `<p align=${align} style=${style}>${children}</p>`
                    );
                } else {
                    return (
                        `<p align=${align}>${children}</p>`
                    );
                }
            }
            case 'align-right': {
                const align = n.align;
                const style = getStilus(n.style)
                if (style) {
                    return (
                        `<p align=${align} style=${style}>${children}</p>`
                    );
                } else {
                    return (
                        `<p align=${align}>${children}</p>`
                    );
                }
            }
            default: {
               return children
            }
        }
    });

    let newSerializedValue = '';
    serialized.forEach((elem : string) => {
        newSerializedValue = newSerializedValue.concat(elem);
    });

    return newSerializedValue;
}




export const Wysiwyg = ({ className = 'react-slate-wysiwyg', id, value = initialValue, colors = defaultColors, placeholder = "Ide írjon szöveget...", uploadType = 'link', onChange, onUpload }: WysiwygProps) => {
    const addImage = (editor: Editor, image: Image) => {
        const text = { text: '', style: { display: 'none' } };
        let style = {};
        let divStyle = {};
        if (format === 'image-left' || format === 'image-right') {
            if (format === 'image-left') {
                style = {
                    float: 'left',
                    margin: '20px 20px 20px 0px',
                    clear: 'both'
                }
            }
            if (format === 'image-right') {
                style = {
                    float: 'right',
                    margin: '20px 0px 20px 20px',
                    clear: 'both'
                }
            }
            console.log(format);
            const img: ImageElement = { type: format, style: style, src: image.src, children: [text] }
            const d: CustomElement = { type: 'div', style: divStyle, children: [img] } 
            Transforms.insertNodes(editor, img);
            Transforms.wrapNodes(editor, d);
        } else {
            if (format === 'image-center') {
                style = {
                    display: 'block',
                    margin: '0 auto'
                }
            }
            const img: ImageElement = { type: format, style: style, src: image.src, children: [text] }
            
            
            Transforms.insertNodes(editor, img);
        }
    }

    const isImageUrl = (url: string) => {
        if (!url) return false
        if (!isUrl(url)) return false
        const ext = new URL(url).pathname.split('.').pop() || '';
        return imageExtensions.includes(ext)
      }
    
    const withImages = (editor: Editor ) => {
        const { insertData, isVoid } = editor

        editor.isVoid = element => {
          return element.type === 'image' || element.type === 'image-center' || element.type === 'image-right' || element.type === 'image-left' ? true : isVoid(element)
        }
      
        editor.insertData = data => {
            const text = data.getData('text/plain')
            const { files } = data;
            let fs = Array.from(files);
            let imageObj: any = {};
      
            if (files && files.length > 0) {
                fs.forEach((file) => {
                    if (file && onUpload) {
                        imageObj = onUpload(file);
                    }
                    /* const reader = new FileReader()
                    const [mime] = file.type.split('/')
            
                    if (mime === 'image') {
                    reader.addEventListener('load', () => {
                        const url = reader.result;
                        const alt = image.alt;
                        const img: any = {
                            src: url,
                            alt: alt
                        }
                        addImage(editor, img)
                    })
            
                    reader.readAsDataURL(file)
                    } */
                
                })
                addImage(editor, imageObj);
            } else if (isImageUrl(text)) {
                imageObj = {
                    src: text,
                    alt: image.alt
                }
                addImage(editor, imageObj)
          } else {
            insertData(data)
          }
        }
      
        return editor
      }
      const editor = useMemo(
        () => withImages(withHistory(withReact(createEditor()))),
        []
      )
/*     const [editor] = useState(() => withReact(createEditor())); */
    const [fontSize, setFontSize] = useState('17px');
    const [imageModal, setImageModal ] = useState(false);
    const [ image, setImage ] = useState(defaultImage);
    const [ format, setFormat ] = useState('')
    const i = [{ id: 0, src: 'https://igyteljesazelet.hu/sites/default/files/styles/widescreen/public/2021-01/cicatestbesz2.jpg?itok=q7vFnOSX', alt: 'cica2'},
    { id: 1, src: 'https://behir.hu/web/content/media/2021/06/cica-600x338.jpg', alt: 'cica1'}
    ]
    const [ images ] = useState(i);

    const toggleImageModal = (format?: any) => {
        setImageModal(!imageModal)
        setImage(images[0]);
        if (format) {
            setFormat(format)
        }
    }

    const isParentHeading = (props: any) => {
        const parent = props.children && props.children.props.parent && props.children.props.parent;
        if (parent) {
            if (parent.type === 'heading-1' || parent.type === 'heading-2' || parent.type === 'heading-3' ||
            parent.type === 'heading-4' || parent.type === 'heading-5') {
                return true
            } else {
                return false;
            }
        }
    }

    const deleteImage = (editor: Editor, element: any) => {
        const path = ReactEditor.findPath(editor, element);
        console.log(path, element)
        Transforms.removeNodes(editor, { at: path })
    }
        

    const Leaf = (props: any) => {
        let { attributes, children, leaf } = props;
        let style = leaf.style;
        let headingStyle = { textAlign: style && style.textALign ? style.textAlign : undefined };

        if (leaf.bold) {
            children = <strong>{children}</strong>;
        }

        if (leaf.code) {
            children = <code>{children}</code>;
        }

        if (leaf.italic) {
            children = <em>{children}</em>;
        }

        if (leaf.underline) {
            children = <u>{children}</u>;
        }

        return <span style={isParentHeading(props) ? headingStyle : leaf.style} {...attributes}>{children}</span>;
    };

    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [fontSize]);

    const renderElement = useCallback((props: any) => {
        let style = props.element.children.style || {};
        const { attributes, element, children } = props;
      /*   const { children } = element; */
        const selected = useSelected();
        const focused = useFocused();
        console.log(selected, focused);
        const editor = useSlateStatic();
        style['textAlign'] = { textAlign: props.element.align };
        if (props.element.type === 'heading-1' || props.element.type === 'heading-2' || 
        props.element.type === 'heading-3' || props.element.type === 'heading-4' || 
        props.element.type === 'heading-5') {
            delete style['fontSize'];
        }
        switch (element.type) {
            case 'block-quote':
                return (
                    <blockquote style={style} {...attributes}>
                        {children}
                    </blockquote>
                );
            case 'bulleted-list':
                return (
                    <ul style={style} {...attributes}>
                        {children}
                    </ul>
                );
            case 'heading-1':
                return (
                    <h1 style={style}>
                        {children}
                    </h1>
                );
            case 'heading-2':
                return (
                    <h2 style={style}>
                        {children}
                    </h2>
                );
            case 'heading-3':
                return (
                    <h3 style={style}>
                        {children}
                    </h3>
                );
            case 'heading-4':
                return (
                    <h4 style={style}>
                        {children}
                    </h4>
                );
            case 'heading-5':
                return (
                    <h5 style={style}>
                        {children}
                    </h5>
                );
            case 'list-item':
                return (
                    <li style={style} {...attributes}>
                        {children}
                    </li>
                );
            case 'numbered-list':
                return (
                    <ol style={style} {...attributes}>
                        {children}
                    </ol>
                );
            case 'div': {
                console.log(children)
                return (
                    <div>{children}</div>
                );
            }
            case 'image': {
                const src = element.src;
                const alt = element.alt;
                return (
                    <div {...attributes}>
                    {children}
                    <div
                      contentEditable={false}
                      className={css`
                        position: relative;
                      `}
                    >
                      <img
                        src={src}
                        alt={alt}
                        className={css`
                          display: block;
                          max-width: 100%;
                          max-height: 20em;
                          box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
                        `}
                      />
                      <button
                        /* active */
                        onClick={() => deleteImage(editor, element)}
                        className={css`
                            display: 'block';
                            position: absolute;
                            top: 0.5em;
                            left: 0.5em;
                            background-color: black;
                            color: white;
                            padding: 10px;
                        `}
                      >
                        <Icon className='fa-solid fa-trash' />
                      </button>
                    </div>
                  </div>
                );
            }
            case 'image-center': {
                const src = element.src;
                const alt = element.alt;
                const style = element.style;
                console.log(element, style);
                return (
                    <div {...attributes}>
                    {children}
                    <div
                      contentEditable={false}
                      className={css`
                        position: relative;
                      `}
                    >
                      <img
                        src={src}
                        alt={alt}
                        style={style}
                        className={css`
                            display: block;
                            max-width: 100%;
                            max-height: 20em;
                            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
                        `}
                      />
                      <button
                        /* active */
                            onClick={() => deleteImage(editor, element)}
                            className={css`
                            display: 'block';
                            position: absolute;
                            top: 0.5em;
                            left: 0.5em;
                            background-color: black;
                            color: white;
                            padding: 10px;
                        `}
                      >
                        <Icon className='fa-solid fa-trash' />
                      </button>
                    </div>
                  </div>
                );
            }
            case 'image-left': {
                const src = element.src;
                const alt = element.alt;
                const style = element.style;
                return (
                    <div style={{ display: 'block' }} {...attributes}>
                    {children}
                    <div
                      contentEditable={false}
                      className={css`
                        position: relative;
                      `}
                      style={{ display: 'block' }}
                    >
                      <img
                            src={src}
                            alt={alt}
                            style={style}
                            className={css`
                            max-width: 100%;
                            max-height: 20em;
                            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
                        `}
                      />
                      <button
                        /* active */
                        onClick={() => deleteImage(editor, element)}
                        className={css`
                            display: 'block';
                            position: absolute;
                            top: 2em;
                            left: 1em;
                            background-color: black;
                            color: white;
                            padding: 10px;
                        `}
                      >
                        <Icon className='fa-solid fa-trash' />
                      </button>
                    </div>
                  </div>
                );
            }
            case 'image-right': {
                const src = element.src;
                const alt = element.alt;
                const style = element.style;
                console.log(element)
                return (
                    <div>
                    {children}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={src}
                        alt={alt}
                        style={style}
                        className={css`
                          max-width: 100%;
                          max-height: 20em;
                          box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
                        `}
                      />
                      <button
                        onClick={() => deleteImage(editor, element)}
                        className={css`
                            display: 'block';
                            position: absolute;
                            top: 2em;
                            right: 1em;
                            background-color: black;
                            color: white;
                            padding: 10px;
                        `}
                      >
                        <Icon className='fa-solid fa-trash' />
                      </button>
                    </div>
                  </div>
                );
            }
            
            default: {
                const style = element.children.style;
                console.log(style)
                if (style) {
                    return (
                        <p align={element.align ? element.align : 'left'} style={style} {...attributes}>
                            {children}
                        </p>
                    );
                } else {
                    return (
                        <p align={element.align ? element.align : 'left'} {...attributes}>
                            {children}
                        </p>
                    );
                }
            }
        }
    }, []);


    const renderImageModal = () => {
        return (
           <Modal isOpen={imageModal} toggle={toggleImageModal} backdrop='static' size='xl'>
                <ModalHeader>Kép feltöltése</ModalHeader>
                <ModalBody>
                    {uploadType && uploadType === 'link' ?
                    (
                        <>
                            <div>
                                <Label>Kép linkje:</Label>
                                <Input type='text' value={image.src} onChange={(e) => {
                                    setImage({
                                        ...image,
                                        src: e.target.value
                                    })
                                }} />
                            </div>
                            <div>
                                <Label>Kép alt tagje:</Label>
                                <Input type='text' value={image.alt} onChange={(e) => {
                                    setImage({
                                        ...image,
                                        alt: e.target.value
                                    })
                                 }} 
                                 />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <Label>Kép feltöltése:</Label>
                                <Input type='file' />
                            </div>
                            <div>
                                {images && images.map((i) => {
                                    return (
                                        <div key={i.id}>
                                            <img src={i.src} alt={i.alt} />
                                        </div>
                                    );
                                })}
                            </div>
                          
                        </>
                    )}
                   
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => addImage(editor, image)}>OK</Button>
                    <Button type='button' onClick={toggleImageModal}>Mégsem</Button>
                </ModalFooter>
           </Modal>
        );
    }

    const setFont = (e: any, editor: Editor) => {
        const value = e.target.value;
        setFontSize(value);
        toggleFontsize(editor, value)
    }

    function isMarkActive(editor: any, format: any) {
        const [match] = Editor.nodes(editor, {
            match: (n: any) => n[format] === true,
            universal: true
        });
        return !!match;
    }

    const isFontSizeActive = (editor: Editor) => {
        const [match] = Editor.nodes(editor, {
            match: (n: any) => { 
                if (n['style']) {
                    setFontSize(n['style'].fontSize)
                } else {
                    setFontSize('17px')
                }
                return n['style']; 
            },
            universal: true
        });

        return !!match;
    };

    const isBlockActive = (editor: Editor, format: Format, blockType: any = 'type') => {
        const obj: AccessNode = { keyName: blockType };
        const { selection } = editor;
        if (!selection) return false;
        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[obj.keyName] === format
            })
        );

        return !!match;
    };

    const toggleMark = (editor: any, format: any) => {
        const isActive = isMarkActive(editor, format);

        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    };

    function toggleBlock(editor: Editor, format: any) {
        const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
        const isList = LIST_TYPES.includes(format);
      /*   const { selection } = editor;
        let selected;
        if (selection !== null && selection.anchor !== null) {
            selected = editor.children[selection.anchor.path[0]];
        } else {
            selected = {};
        }
        console.log(selected); */


        Transforms.unwrapNodes(editor, {
            match: (n) => { return !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format)},
            split: true
        });

        let newProperties: Partial<SlateElement> = {};

        if (TEXT_ALIGN_TYPES.includes(format)) {
            newProperties = {
                align: isActive ? undefined : format,
                type: `align-${format}`
            };
        } 
       /*  if (IMAGE_TYPES.includes(format)) {
            if (format === 'image-center') {
                newProperties = {
                    type: format,
                    style: {
                        margin: 'auto'
                    }
                }
            }
        }
        if (IMAGE_ALIGN_TYPES.includes(format)) {
            if (format === 'image-left') {
                newProperties = {
                    type: format,
                    style: {
                        float: 'left'
                    }
                }
            }
            if (format === 'image-right') {
                newProperties = {
                    type: format,
                    style: {
                        float: 'right'
                    }
                }
            }
        } */
/*         else if (HEADING_TYPES.includes(format)) {
            newProperties = {
                style: { textAlign: selected.align },
                type: format
            };
        }  */
        else {
            newProperties = {
                type: isActive ? 'paragraph' : isList ? 'list-item' : format,
                align: isActive ? undefined : format
            };
        }

        Transforms.setNodes<SlateElement>(editor, newProperties);

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    }

    const toggleFontsize = (editor: Editor, value: string) => {       
        const newParameters = {
            style: {
                fontSize: value
            }
        };
        Transforms.setNodes(editor, newParameters);
        Editor.addMark(editor, 'style', newParameters.style);
    }

    const BlockButton = (props: FormatButtonProps) => {
        const editor = useSlate();
        const { format, icon, colors } = props;
        const headingNumberIndex = format.indexOf('-');
        const headingNumber = icon === 'fa fa-header' && format.slice(headingNumberIndex + 1);
        return (
            <ToolbarButton
                active={isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type')}
                onMouseDown={(event: MouseEvent) => {
                    event.preventDefault();
                    toggleBlock(editor, format);
                }}
                colors={colors}
            >
                {icon === 'fa fa-header' ? <><Icon className={icon} />{headingNumber && headingNumber}</> : <Icon className={icon} />}
            </ToolbarButton>
        );
    };

    const MarkButton = (props: FormatButtonProps) => {
        const editor = useSlate();
        const { format, icon, colors } = props;
 
        return (
            <ToolbarButton
                active={isMarkActive(editor, format)}
                onMouseDown={(event: MouseEvent) => {
                    event.preventDefault();
                    toggleMark(editor, format);
                }}
                colors={colors}
            >
                <Icon className={icon} />
            </ToolbarButton>
        );
    };

    const ImageButton = (props: FormatButtonProps) => {
        const { icon, format } = props;
        return (
            <ToolbarButton
                onClick={() => toggleImageModal(format)}
            >
                <Icon className={icon} />
            </ToolbarButton>
        );
        
    }

    const FontsizeButton = (format: any) => {
        const editor = useSlate();
        
        return (
            <ToolbarButton
                onMouseUp={() => {}}
                name={format}
                active={isFontSizeActive(editor)}
            >
                <select value={fontSize} onChange={(e) => { setFont(e, editor)}}>
                    <option key="17px" value="17px">17 px</option>
                    <option key="18px" value="18px">18 px</option>
                    <option key="19px" value="19px">19 px</option>
                    <option key="20px" value="20px">20 px</option>
                    <option key="21px" value="21px">21 px</option>
                    <option key="22px" value="22px">22 px</option>
                    <option key="23px" value="23px">23 px</option>
                    <option key="24px" value="24px">24 px</option>
                    <option key="25px" value="25px">25 px</option>
                </select>
            </ToolbarButton>
        );
    }

    return (
        <>
            <Slate editor={editor} onChange={onChange} value={value}>
            
                    <Toolbar className="wysiwyg-editor-toolbar">
                        <MarkButton format="bold" icon="fa fa-bold" colors={colors} />
                        <MarkButton format="italic" icon="fa fa-italic" colors={colors} />
                        <MarkButton format="underline" icon="fa fa-underline" colors={colors} />
                        <MarkButton format="code" icon="fa fa-code" colors={colors} />
                        <BlockButton format="heading-1" icon="fa fa-header" colors={colors} />
                        <BlockButton format="heading-2" icon="fa fa-header" colors={colors} />
                        <BlockButton format="heading-3" icon="fa fa-header" colors={colors} />
                        <BlockButton format="heading-4" icon="fa fa-header" colors={colors} />
                        <BlockButton format="heading-5" icon="fa fa-header" colors={colors} />
                        <BlockButton format="block-quote" icon="fa-solid fa-indent" colors={colors} />
                        <BlockButton format="numbered-list" icon="fa-solid fa-list-ol" colors={colors} />
                        <BlockButton format="bulleted-list" icon="fa-solid fa-list-ul" colors={colors} />
                        <BlockButton format="left" icon="fa-solid fa-align-left" colors={colors} />
                        <BlockButton format="center" icon="fa-solid fa-align-center" colors={colors} />
                        <BlockButton format="right" icon="fa-solid fa-align-right" colors={colors} />
                        <BlockButton format="justify" icon="fa-solid fa-align-justify" colors={colors} />
                    </Toolbar>
                    <Toolbar className="wysiwyg-editor-toolbar">
                        <FontsizeButton format='fontSizeButton' icon={'fontSizeButton'} />
                        <ImageButton format="image" icon="fa-regular fa-image" />
                        <ImageButton format="image-center" icon="fa-regular fa-image" />
                        <ImageButton format="image-left" icon="fa-regular fa-image" />
                        <ImageButton format="image-right" icon="fa-regular fa-image" />
                      
                    </Toolbar>
                   
      
                <Editable
                    id={id}
                    style={defaultStyle}
                    className={className}
                    placeholder={placeholder}
                /*  onKeyDown={event => {
                        if (event.key === 'Enter') {
                        // Prevent the ampersand character from being inserted.
                        event.preventDefault()
                        // Execute the `insertText` method when the event occurs.
                        Editor.insertBreak(editor)
                        }
                    }} */
                renderLeaf={renderLeaf}
                renderElement={renderElement} />
            </Slate>
            {console.log(value)}
            <div>{imageModal ? renderImageModal() : ''} </div>
            
        </>
    );
};

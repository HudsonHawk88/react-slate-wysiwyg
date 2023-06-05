import React, { useState, useCallback, useMemo } from 'react';
import escapeHtml from 'escape-html';
import { jsx } from 'slate-hyperscript';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from 'reactstrap';
import { createEditor, Transforms, Editor, Element as SlateElement, Text, Range, Point, Descendant, BaseEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor, useSlate, useFocused, useSelected, useSlateStatic } from 'slate-react';
import { withHistory } from 'slate-history';
import isUrl from 'is-url';
import imageExtensions from 'image-extensions';
import { css } from '@emotion/css';
/* import escapeHtml from 'escape-html'; */
import { Toolbar, ToolbarButton, Icon } from './components';

/* import 'bootstrap/dist/css/bootstrap.min.css'; */
/* import '../styles/font-awesome.min.css';
import '../styles/index.css'; */

// INTERFACES AND TYPES

export type CustomElement = { type: string; className?: string; align?: string; style?: object; children?: CustomText[] | CustomElement[] | Descendant[] };
export type CustomImage = { type: string; url: string; children?: EmptyText[] };
export type LinkElement = { type: string; url: string; style?: object; linkText?: string; children: CustomText[] };
export type YoutubeElement = { type: string; youtubeUrl: string; height: string | number; width: string | number; children: CustomText[]; style: object };
export type ButtonElement = { type: string; CTAFunc?: string; CTAColor?: string; CTABgColor?: string; CTALeiras: string; style?: object; color?: string; bgColor?: string; children?: LinkElement[] };
export type CustomText = {
    text?: string;
    bold?: boolean | undefined;
    italic?: boolean | undefined;
    underline?: boolean | undefined;
    code?: boolean | undefined;
    style?: object | undefined;
    align?: string;
};

/* export interface CustomReactEditor extends ReactEditor {
    type: string;
    isElementReadOnly: Function;
    isSelectable: Function;
} */

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

type onUploadType = (file: File) => void;

interface WysiwygProps {
    className?: string;
    key?: string;
    id?: string | undefined;
    initialValue: CustomElement[];
    value: CustomElement[];
    onChange: Function;
    customButtons?: Array<[]>;
    colors?: Object;
    reserved?: Boolean;
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
    src: string;
    alt?: string;
    width?: string;
    height?: string;
}

interface AccessNode {
    keyName: keyof CustomElement; // 👈️ one of Employee's keys
}

export type EmptyText = {
    text: string;
};

export type ImageElement = {
    type: string;
    src: string | ArrayBuffer;
    children?: EmptyText[] | CustomText[] | CustomElement[];
    style: object | undefined;
};

// DEFAULT VALUES

export const initialValue: CustomElement[] = [
    {
        type: 'align-left',
        align: 'left',
        children: [{ text: '', style: { fontSize: '17px' } }]
    }
];

const defaultColors = {
    normal: {
        activeColor: '#0f0',
        color: '#000'
    },
    reverse: {
        activeColor: 'black',
        color: '#0f0'
    }
};

const defaultStyle = { border: '1px black solid' };

const defaultImage: Image = {
    src: '',
    alt: '',
    width: '',
    height: ''
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['align-left', 'align-center', 'align-right', 'align-justify'];
/* const HEADING_TYPES = ['heading-one', 'heading-2', 'heading-3', 'heading-4', 'heading-5']; */
/* const IMAGE_ALIGN_TYPES = [ 'left', 'center', 'right' ]; */
/* const IMAGE_TYPES = [ 'image', 'image-center' ];
const IMAGE_ALIGN_TYPES = [ 'image-left', 'image-right' ]; */

const getHtmlStyleKey = (styleKey: string) => {
    const key = styleKey || '';
    const length = key.length;
    let upperPosition: number = 0;
    let hasUpper = false;
    for (let i = 0; i < length; i++) {
        if (key.charAt(i) === key.charAt(i).toUpperCase()) {
            hasUpper = true;
            upperPosition = key.indexOf(key.charAt(i));
            break;
        }
    }

    let newKey = hasUpper ? key.toLowerCase().substring(0, upperPosition) + '-' + key.toLowerCase().substring(upperPosition, key.length) : key;

    return newKey;
};

const getStyleFromHtmlStyle = (style: string) => {
    const key: any = style || {};
    const newStyle = {};
    Object.keys(key).forEach((s) => {
        if (key[s] !== '' && isNaN(parseInt(s))) {
            Object.assign(newStyle, { [s]: key[s] });
        }
    });

    return newStyle;
};

function getStilus(style: any) {
    let stilus: string = '';

    if (style) {
        for (const [key] of Object.entries(style)) {
            if (style[key]) {
                stilus = stilus.concat(`${getHtmlStyleKey(key)}: ${style[key]};`);
            }
        }
    }
    return `${stilus}`;
}

const getNode = (node: any, ch?: any) => {
    const children = ch ? ch.join('') : serialize(node);

    switch (node.type) {
        case 'quote':
            return `<blockquote><p>${children}</p></blockquote>`;

        case 'paragraph': {
            const style = getStilus(node.style);
            if (style !== '') {
                return `<p style="${style}">${children}</p>`;
            } else {
                return `<p>${children}</p>`;
            }
        }

        case 'align-left': {
            const style = getStilus(node.style);
            if (style !== '') {
                return `<p style="${style}">${children}</p>`;
            } else {
                return `<p>${children}</p>`;
            }
        }
        case 'align-center': {
            const style = getStilus(node.style);
            if (style !== '') {
                return `<p style="${style}">${children}</p>`;
            } else {
                return `<p>${children}</p>`;
            }
        }
        case 'align-right': {
            const style = getStilus(node.style);
            if (style !== '') {
                return `<p style="${style}">${children}</p>`;
            } else {
                return `<p>${children}</p>`;
            }
        }
        case 'align-justify': {
            const style = getStilus(node.style);
            if (style !== '') {
                return `<p style="${style}">${children}</p>`;
            } else {
                return `<p>${children}</p>`;
            }
        }
        case 'block-quote':
            const style = getStilus(node.style);
            if (style) {
                return `<blockquote style="${style}">${children}</blockquote>`;
            } else {
                return `<blockquote>${children}</blockquote>`;
            }
        case 'bulleted-list': {
            const c: string = getNode(node.children);
            const style = getStilus(node.style);
            if (style) {
                return `<ul style="${style}">${c}</ul>`;
            } else {
                return `<ul>${c}</ul>`;
            }
        }
        case 'heading-1': {
            const style = getStilus(node.style);
            if (style) {
                return `<h1 style="${style}">${children}</h1>`;
            } else {
                return `<h1>${children}</h1>`;
            }
        }
        case 'heading-2': {
            const style = getStilus(node.style);
            if (style) {
                return `<h2 style="${style}">${children}</h2>`;
            } else {
                return `<h2>${children}</h2>`;
            }
        }
        case 'heading-3': {
            const style = getStilus(node.style);
            if (style) {
                return `<h3 style="${style}">${children}</h3>`;
            } else {
                return `<h3>${children}</h3>`;
            }
        }
        case 'heading-4': {
            const style = getStilus(node.style);
            if (style) {
                return `<h4 style="${style}">${children}</h4>`;
            } else {
                return `<h4>${children}</h4>`;
            }
        }
        case 'heading-5': {
            const style = getStilus(node.style);
            if (style) {
                return `<h5 style="${style}">${children}</h5>`;
            } else {
                return `<h5>${children}</h5>`;
            }
        }
        case 'list-item': {
            const style = getStilus(node.style);
            if (style) {
                return `<li style="${style}">${children}</li>`;
            } else {
                return `<li>${children}</li>`;
            }
        }
        case 'numbered-list': {
            const style = getStilus(node.style);
            const c: string = getNode(node.children);
            if (style) {
                return `<ol style="${style}">${c}</ol>`;
            } else {
                return `<ol>${c}</ol>`;
            }
        }
        case 'image': {
            const src = node.src;
            const alt = node.alt;
            const style = getStilus(node.style);
            return `<img src="${src}" alt="${alt}" style="${style}" />`;
        }
        case 'image-center': {
            const src = node.src;
            const alt = node.alt;
            const style = getStilus(node.style);
            return `<img src="${src}" alt="${alt}" style="${style}" />`;
        }
        case 'image-left': {
            const src = node.src;
            const alt = node.alt;
            const style = getStilus(node.style);
            return `<img src="${src}" alt="${alt}" style="${style}" />`;
        }
        case 'image-right': {
            const src = node.src;
            const alt = node.alt;
            const style = getStilus(node.style);
            return `<img src="${src}" alt="${alt}" style="${style}" />`;
        }
        case 'div': {
            let child: any = serialize(node.children).toString();
            if (child) {
                child = child.replaceAll(',', '');
            }
            const style = getStilus(node.style);
            if (style) {
                return `<div style="${style}">${child}</div>`;
            } else {
                return `<div>${child}</div>`;
            }
        }

        case 'table': {
            const style = `${getStilus(node.style)}` || '';
            const className = node.className || '';
            return `<table class="${className}" style="${style}"><tbody>${children}</tbody></table>`;
        }

        case 'table-left': {
            const style = `${getStilus(node.style)}` || '';
            const className = node.className || '';
            return `<table class="${className}" style="${style}"><tbody>${children}</tbody></table>`;
        }

        case 'table-center': {
            const style = `${getStilus(node.style)}` || '';
            const className = node.className || '';
            return `<table class="${className}" style="${style}"><tbody>${children}</tbody></table>`;
        }

        case 'table-right': {
            const style = `${getStilus(node.style)}` || '';
            const className = node.className || '';
            return `<table class="${className}" style="${style}"><tbody>${children}</tbody></table>`;
        }

        case 'table-row': {
            const style = `${getStilus(node.style)}` || '';
            const c: string = getNode(node.children);
            return `<tr style="${style}">${c}</tr>`;
        }

        case 'table-cell': {
            const style = `${getStilus(node.style)}` || '';
            return `<td style="${style}">${children}</td>`;
        }

        case 'link': {
            const style = `${getStilus(node.style)}` || '';
            Object.assign(style, { textDecoration: 'none' });
            const href = node.url;
            const text = node.linkText;
            return `<a style="${style}" href=${href} target="_blank">${text}</a>`;
        }

        case 'button': {
            const style: any = `${getStilus(node.style)}` || '';
            const func = node.CTAFunc;
            const text = node.CTALeiras;
            return `<button style="${style}"><a style="${`color: ${node.CTAColor}; text-decoration: none`}" href=${func} target="_blank">${text}</a></button>`;
        }

        case 'embeded': {
            const style = `${getStilus(node.style)}` || '';
            const width = node.width;
            const height = node.height;
            const src = node.youtubeUrl;
            return `<iframe style="${style}" width="${width}" height="${height}" src="${src}" allowFullScreen></iframe>`;
        }

        default: {
            return children;
        }
    }
};

export const serialize = (nodes: CustomElement[]) => {
    let result = nodes.map((node: any): string[] => {
        const children =
            node.children &&
            node.children.map((nn: any) => {
                if (Text.isText(nn)) {
                    let string = escapeHtml(nn.text);
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
                    const ch = getNode(nn, nn.children);
                    return ch;
                }
            });
        const ch = getNode(node, children);
        return ch;
    });
    let serialized = result.join('');
    return serialized;
};

export const getElementsFromHtml = (html: string) => {
    const el = new DOMParser().parseFromString(html, 'text/html').body;
    return el;
};

export const deserialize = (el: any, markAttributes: CustomText | object = {}): any => {
    const style: any = getStyleFromHtmlStyle(el.style);
    if (el.nodeType === Node.TEXT_NODE) {
        return jsx('text', markAttributes, el.textContent);
    } else if (el.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    const nodeAttributes = { ...markAttributes };

    // define attributes for text nodes
    switch (el.nodeName) {
        case 'STRONG':
            nodeAttributes.bold = true;
        case 'ITALIC': {
            nodeAttributes.italic = true;
        }
        case 'UNDERLINED': {
            nodeAttributes.underline = true;
        }
        case 'CODE': {
            nodeAttributes.code = true;
        }
    }

    const children = Array.from(el.childNodes)
        .map((node) => deserialize(node, nodeAttributes))
        .flat();

    if (children.length === 0) {
        children.push(jsx('text', nodeAttributes, ''));
    }

    switch (el.nodeName) {
        case 'BODY':
            return jsx('fragment', {}, children);
        case 'BR':
            return '\n';
        case 'BLOCKQUOTE':
            return jsx('element', { type: 'block-quote', style: style }, children);
        case 'H1':
            return jsx('element', { type: 'heading-1', style: style }, children);
        case 'H2':
            return jsx('element', { type: 'heading-2', style: style }, children);
        case 'H3':
            return jsx('element', { type: 'heading-3', style: style }, children);
        case 'H4':
            return jsx('element', { type: 'heading-4', style: style }, children);
        case 'H5':
            return jsx('element', { type: 'heading-5', style: style }, children);
        case 'P':
            return jsx('element', { type: `align-${style.textAlign ? style.textAlign : 'left'}`, style: style }, children);
        case 'A':
            return jsx('element', { type: 'link', url: el.href, style: style, linkText: el.innerText ? el.innerText : '' }, children);
        case 'BUTTON':
            const buttonChildren = el.children[0];
            const href = buttonChildren.href || '';
            const text = buttonChildren.innerText || '';
            const textColor = style.color || 'black';
            const bgColor = style.backgroundColor || 'white';
            return jsx('element', { type: 'button', CTAFunc: href, CTALeiras: text, CTAColor: textColor, CTABgColor: bgColor, style: style }, children);
        case 'IMG':
            return jsx('element', { type: `image`, style: style, src: el.src, alt: el.alt }, children);
        case 'IFRAME':
            return jsx('element', { type: 'embeded', style: style, youtubeUrl: el.src, height: el.height, width: el.width }, children);
        case 'TABLE':
            return jsx('element', { type: 'table', className: el.class, style: style }, children);
        case 'TR':
            return jsx('element', { type: 'table-row', style: style }, children);
        case 'TD':
            return jsx('element', { type: 'table-cell', style: style }, children);
        case 'UL':
            return jsx('element', { type: 'bulleted-list', style: style }, children);
        case 'OL':
            return jsx('element', { type: 'numbered-list', style: style }, children);
        case 'LI':
            return jsx('element', { type: 'list-item', style: style }, children);
        default:
            return children;
    }
};

export const Wysiwyg = ({
    className = 'react-slate-wysiwyg',
    id,
    value = initialValue,
    colors = defaultColors,
    reserved = false,
    placeholder = 'Ide írjon szöveget...',
    uploadType = 'link',
    customButtons = [],
    onChange,
    onUpload
}: WysiwygProps) => {
    const CustomButton = (props: any) => {
        const editor = useSlate();
        const { format, children, colors } = props;
        return (
            <ToolbarButton
                style={{ width: 'fit-content' }}
                reserved={reserved}
                className="custom_button"
                onMouseDown={(event: MouseEvent) => {
                    event.preventDefault();
                    addText(editor, format);
                }}
                colors={colors}
            >
                {children}
            </ToolbarButton>
        );
    };

    const renderCustomButtons = () => {
        return (
            customButtons.length > 0 &&
            customButtons.map((button: any) => {
                return (
                    <CustomButton colors={button.colors || colors} format={button.format}>
                        {button.text}
                    </CustomButton>
                );
            })
        );
    };

    const isFontSizeActive = (editor: Editor, setFontSize: Function) => {
        const [match] = Editor.nodes(editor, {
            match: (n: any) => {
                if (n['style']) {
                    setFontSize(n['style'].fontSize);
                } else {
                    setFontSize('17px');
                }
                return n['style'];
            },
            universal: true
        });

        return !!match;
    };

    const addText = (editor: Editor, text: string) => {
        const variable: CustomText = {
            text: text
        };
        Transforms.insertNodes(editor, variable);
    };

    const addImage = (editor: Editor, image: Image) => {
        const text = { text: '', style: { display: 'none' } };
        let style = {};
        /* let divStyle = {}; */
        if (format === 'image-left' || format === 'image-right') {
            if (format === 'image-left') {
                style = {
                    float: 'left',
                    margin: '20px 20px 20px 0px',
                    clear: 'both'
                };
            }
            if (format === 'image-right') {
                style = {
                    float: 'right',
                    margin: '20px 0px 20px 20px',
                    clear: 'both'
                };
            }
            const img: ImageElement = { type: format, style: style, src: image.src, children: [text] };
            /*   const d: CustomElement = { type: 'div', style: divStyle, children: [img] }; */
            Transforms.insertNodes(editor, img);
            /*   Transforms.wrapNodes(editor, d); */
        } else {
            if (format === 'image-center') {
                style = {
                    display: 'block',
                    margin: '0 auto'
                };
            }
            const img: ImageElement = { type: format, style: style, src: image.src, children: [text] };

            Transforms.insertNodes(editor, img);
        }
    };

    const addTablazat = (editor: Editor, tableClass: string, rowNumber: number, colNumber: number, textAlign: string) => {
        let tableStyle = {};
        const align = format.substring(format.lastIndexOf('-') + 1, format.length);
        if (align === 'center') {
            tableStyle = {
                textAlign: textAlign || 'left',
                margin: '0px auto'
            };
        } else if (align === 'right') {
            tableStyle = {
                marginLeft: 'auto',
                marginRight: '0px'
            };
        } else if (align === 'left') {
            tableStyle = {
                marginLeft: '0px',
                marginRight: 'auto'
            };
        }

        let rowStyle = { border: '1px solid black' };
        let colStyle = { border: '1px solid black', padding: '5px 10px' };
        let rows = [];
        for (let i = 0; i < rowNumber; i++) {
            let cols = [];
            for (let j = 0; j < colNumber; j++) {
                cols.push({ type: 'table-cell', style: colStyle, children: [{ text: `cell-${j}`, style: { fontSize: '17px' } }] });
            }
            rows.push({ type: 'table-row', style: rowStyle, children: cols });
        }

        const table = { type: format, style: tableStyle, className: tableClass, children: rows };

        Transforms.insertNodes(editor, table);
        toggleTableModal();
    };

    const withInlines = (editor: Editor) => {
        const { insertData, insertText, isInline, isElementReadOnly, isSelectable } = editor;

        editor.isInline = (element) => ['link', 'button', 'badge'].includes(element.type) || isInline(element);

        editor.isElementReadOnly = (element: any) => element.type === 'badge' || isElementReadOnly(element);

        editor.isSelectable = (element: any) => element.type !== 'badge' && isSelectable(element);

        editor.insertText = (text) => {
            if (text && isUrl(text)) {
                wrapLink(editor, text);
            } else {
                insertText(text);
            }
        };

        editor.insertData = (data) => {
            const text = data.getData('text/plain');

            if (text && isUrl(text)) {
                wrapLink(editor, text);
            } else {
                insertData(data);
            }
        };

        return editor;
    };

    const insertLink = (editor: Editor, url: string, text: string, color: string) => {
        if (editor.selection) {
            wrapLink(editor, url, text, color);
            toggleLinkModal();
        }
    };

    const insertButton = (editor: Editor, CTALeiras: string, CTAFunc: string, CTAColor: string, CTABgColor: string) => {
        if (editor.selection) {
            wrapButton(editor, CTALeiras, CTAFunc, CTAColor, CTABgColor);
            toggleCTAModal();
        }
    };

    const insertYoutube = (editor: Editor, youtubeUrl: string, youtubeWidth: string | number, youtubeHeight: string | number) => {
        const { selection } = editor;
        if (selection) {
            const [parent]: any = Editor.parent(editor, selection.focus?.path);
            const videoId = youtubeUrl.substring(youtubeUrl.indexOf('=', 1) + 1, youtubeUrl.indexOf('&', 1) === -1 ? youtubeUrl.length : youtubeUrl.indexOf('&', 1));
            let url = `https://www.youtube.com/embed/${videoId}`;
            let newStyle = {};
            if (parent.type === 'align-center') newStyle = { display: 'block', margin: '0 auto' };
            if (parent.type === 'align-right') newStyle = { display: 'block', marginLeft: 'auto', marginRight: '0px' };
            if (parent.type === 'align-left') newStyle = { display: 'block', marginLeft: '0px', marginRight: 'auto' };

            const youtube: YoutubeElement = {
                type: 'embeded',
                style: newStyle,
                youtubeUrl: url,
                width: youtubeWidth,
                height: youtubeHeight,
                children: [{ text: ' ' }]
            };

            Transforms.insertNodes(editor, youtube);
        }
    };

    const isLinkActive = (editor: Editor) => {
        const { selection } = editor;
        if (!selection) return false;
        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: (n) => {
                    return !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link';
                }
            })
        );

        return !!match;
    };

    const isButtonActive = (editor: Editor) => {
        const [button] = Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'button'
        });
        return !!button;
    };

    const unwrapLink = (editor: Editor) => {
        Transforms.unwrapNodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link'
        });
    };

    const unwrapButton = (editor: Editor) => {
        Transforms.unwrapNodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'button'
        });
    };

    const wrapLink = (editor: Editor, url: string, linkText?: string, linkColor?: string) => {
        if (isLinkActive(editor)) {
            unwrapLink(editor);
        }

        const { selection } = editor;
        const isCollapsed = selection && Range.isCollapsed(selection);
        const link: LinkElement = {
            type: 'link',
            url,
            style: {
                color: linkColor,
                textDecoration: 'none'
            },
            linkText: linkText,
            children: isCollapsed ? [{ text: linkText }] : []
        };

        if (isCollapsed) {
            Transforms.insertNodes(editor, link);
        } else {
            Transforms.wrapNodes(editor, link, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
        }
    };

    const wrapButton = (editor: Editor, CTALeiras: string, CTAFunc: string, CTAColor: string, CTABgColor: string) => {
        if (isButtonActive(editor)) {
            unwrapButton(editor);
        }

        const { selection } = editor;
        const isCollapsed = selection && Range.isCollapsed(selection);
        const link: LinkElement = {
            type: 'link',
            url: CTAFunc,
            style: {
                color: CTAColor
            },
            children: [{ text: CTALeiras }]
        };
        const button: ButtonElement = {
            type: 'button',
            style: {
                color: CTAColor,
                backgroundColor: CTABgColor
            },
            CTAFunc: CTAFunc,
            CTALeiras: CTALeiras,
            CTAColor: CTAColor,
            CTABgColor: CTABgColor,
            children: isCollapsed ? [link] : []
        };

        if (isCollapsed) {
            Transforms.insertNodes(editor, button);
        } else {
            Transforms.wrapNodes(editor, button, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
        }
    };

    // Put this at the start and end of an inline component to work around this Chromium bug:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
    const InlineChromiumBugfix = () => (
        <span
            contentEditable={false}
            className={css`
                font-size: 0;
            `}
        >
            {String.fromCodePoint(160) /* Non-breaking space */}
        </span>
    );

    const LinkComponent = (props: any) => {
        let newStyle: any = {};
        const { attributes, element } = props;
        Object.assign(newStyle, element.style);
        const selected = useSelected();
        Object.assign(newStyle, { textDecoration: 'none' });
        return (
            <a
                {...attributes}
                href={element.url}
                style={newStyle}
                className={
                    selected
                        ? css`
                              box-shadow: 0 0 0 3px #ddd;
                          `
                        : ''
                }
            >
                <InlineChromiumBugfix />
                {element.linkText}
                <InlineChromiumBugfix />
            </a>
        );
    };

    const EditableButtonComponent = (props: any) => {
        const { attributes, element } = props;
        const { CTALeiras, CTAFunc, CTAColor, CTABgColor } = element;

        return (
            /*
            Note that this is not a true button, but a span with button-like CSS.
            True buttons are display:inline-block, but Chrome and Safari
            have a bad bug with display:inline-block inside contenteditable:
            - https://bugs.webkit.org/show_bug.cgi?id=105898
            - https://bugs.chromium.org/p/chromium/issues/detail?id=1088403
            Worse, one cannot override the display property: https://github.com/w3c/csswg-drafts/issues/3226
            The only current workaround is to emulate the appearance of a display:inline button using CSS.
          */
            <button
                {...attributes}
                onClick={(ev) => {
                    ev.preventDefault();
                }}
                type="button"
                style={{ backgroundColor: CTABgColor, padding: '10px' }}
                // Margin is necessary to clearly show the cursor adjacent to the button
                className={css`
                    margin: 0 0.1em;
                `}
            >
                <InlineChromiumBugfix />
                <a href={CTAFunc} style={{ color: CTAColor, textDecoration: 'none', fontSize: fontSize }} target="_blank">
                    {CTALeiras}
                </a>
                <InlineChromiumBugfix />
            </button>
        );
    };

    const BadgeComponent = (props: any) => {
        const selected = useSelected();
        const { attributes, children } = props;

        return (
            <span
                {...attributes}
                contentEditable={false}
                className={css`
                    background-color: green;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 2px;
                    font-size: 0.9em;
                    ${selected && 'box-shadow: 0 0 0 3px #ddd;'}
                `}
                data-playwright-selected={selected}
            >
                <InlineChromiumBugfix />
                {children}
                <InlineChromiumBugfix />
            </span>
        );
    };

    /* const AddLinkButton = () => {
        const editor = useSlate()
        return (
          <Button
            active={isLinkActive(editor)}
            onMouseDown={event => {
              event.preventDefault()
              const url = window.prompt('Enter the URL of the link:')
              if (!url) return
              insertLink(editor, url)
            }}
          >
            link
          </Button>
        )
      } */

    const RemoveLinkButton = (props: FormatButtonProps) => {
        const editor = useSlate();
        const { format, icon } = props;

        return (
            <ToolbarButton
                active={isLinkActive(editor)}
                format={format}
                onClick={() => {
                    if (isLinkActive(editor)) {
                        unwrapLink(editor);
                    }
                }}
            >
                <Icon buttonIcons={[icon]} className={icon} />
            </ToolbarButton>
        );
    };

    const ToggleEditableButtonButton = (props: FormatButtonProps) => {
        const editor = useSlate();
        const { format, icon } = props;
        return (
            <ToolbarButton
                format={format}
                active={isButtonActive(editor)}
                onMouseDown={(event: any) => {
                    event.preventDefault();
                    if (isButtonActive(editor)) {
                        unwrapButton(editor);
                    } else {
                        toggleCTAModal();
                    }
                }}
            >
                <Icon buttonIcons={[icon]} className={icon} />
            </ToolbarButton>
        );
    };

    const addYoutube = (editor: Editor, youtubeUrl: string, youtubeWidth: string | number, youtubeHeight: string | number) => {
        insertYoutube(editor, youtubeUrl, youtubeWidth, youtubeHeight);
    };

    const addCTA = (editor: Editor, CTALeiras: string, CTAFunc: string, CTAColor: string, CTABgColor: string) => {
        insertButton(editor, CTALeiras, CTAFunc, CTAColor, CTABgColor);
    };

    const addEmoji = (editor: Editor) => {
        console.log('editor: ', editor);
    };

    const isImageUrl = (url: string) => {
        if (!url) return false;
        if (!isUrl(url)) return false;
        const ext = new URL(url).pathname.split('.').pop() || '';
        return imageExtensions.includes(ext);
    };

    const withTables = (editor: Editor) => {
        const { deleteBackward, deleteForward, insertBreak } = editor;

        editor.deleteBackward = (unit) => {
            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
                const [cell] = Editor.nodes(editor, {
                    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-cell'
                });

                if (cell) {
                    const [, cellPath] = cell;
                    const start = Editor.start(editor, cellPath);

                    if (Point.equals(selection.anchor, start)) {
                        return;
                    }
                }
            }

            deleteBackward(unit);
        };

        editor.deleteForward = (unit) => {
            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
                const [cell] = Editor.nodes(editor, {
                    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table-cell'
                });

                if (cell) {
                    const [, cellPath] = cell;
                    const end = Editor.end(editor, cellPath);

                    if (Point.equals(selection.anchor, end)) {
                        return;
                    }
                }
            }

            deleteForward(unit);
        };

        editor.insertBreak = () => {
            const { selection } = editor;

            if (selection) {
                const [table] = Editor.nodes(editor, {
                    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'table'
                });

                if (table) {
                    return;
                }
            }

            insertBreak();
        };

        return editor;
    };

    const withImages = (editor: Editor) => {
        const { insertData, isVoid } = editor;

        editor.isVoid = (element) => {
            return element.type === 'image' || element.type === 'image-center' || element.type === 'image-right' || element.type === 'image-left' ? true : isVoid(element);
        };

        editor.insertData = (data) => {
            const text = data.getData('text/plain');
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
                });
                addImage(editor, imageObj);
            } else if (isImageUrl(text)) {
                imageObj = {
                    src: text,
                    alt: image.alt
                };
                addImage(editor, imageObj);
            } else {
                insertData(data);
            }
        };

        return editor;
    };

    const defaultModalValues = {
        tableClass: 'wysiwyg-table',
        rowNumber: '',
        colNumber: '',
        textAlign: '',
        linkUrl: '',
        linkFontColor: '',
        linkDesc: '',
        youtubeUrl: '',
        youtubeWidth: '',
        youtubeHeight: '',
        CTALeiras: '',
        CTABgColor: '',
        CTAFontColor: '',
        CTAFunc: ''
    };

    const editor = useMemo(() => withInlines(withTables(withImages(withHistory(withReact(createEditor()))))), [value]);
    /*     const [editor] = useState(() => withReact(createEditor())); */
    const [fontSize, setFontSize] = useState('17px');
    const [imageModal, setImageModal] = useState(false);
    const [tableModal, setTableModal] = useState(false);
    const [linkModal, setLinkModal] = useState(false);
    const [youtubeModal, setYoutubeModal] = useState(false);
    const [CTAModal, setCTAModal] = useState(false);
    const [emojiModal, setEmojiModal] = useState(false);
    const [image, setImage] = useState(defaultImage);
    const [format, setFormat] = useState('');
    const [modalValues, setModalvalues] = useState(defaultModalValues);
    const i = [
        { id: 0, src: 'https://igyteljesazelet.hu/sites/default/files/styles/widescreen/public/2021-01/cicatestbesz2.jpg?itok=q7vFnOSX', alt: 'cica2' },
        { id: 1, src: 'https://behir.hu/web/content/media/2021/06/cica-600x338.jpg', alt: 'cica1' }
    ];
    const [images] = useState(i);

    /*  const useForceUpdate = () => {
        const [, setState] = useState<number>(0);

        const forceUpdate = useCallback(() => {
            setState((n) => n + 1);
        }, []);

        return forceUpdate;
    };

    const forceUpdate = useForceUpdate();
    useEffect(() => {
        editor.children = value;
        forceUpdate();
    }, [editor, value, forceUpdate]); */

    const toggleImageModal = (format?: any) => {
        setImageModal(!imageModal);
        setImage(images[0]);
        if (format) {
            setFormat(format);
        }
    };

    const toggleTableModal = (format?: any) => {
        setTableModal(!tableModal);
        if (format) {
            setFormat(format);
        }
    };

    const toggleLinkModal = () => {
        setModalvalues({ ...modalValues, linkDesc: '', linkFontColor: '', linkUrl: '' });
        setLinkModal(!linkModal);
    };

    const toggleYoutubeModal = () => {
        setModalvalues({ ...modalValues, youtubeHeight: '', youtubeWidth: '', youtubeUrl: '' });
        setYoutubeModal(!youtubeModal);
    };

    const toggleCTAModal = () => {
        setModalvalues({ ...modalValues, CTABgColor: '', CTAFontColor: '', CTAFunc: '', CTALeiras: '' });
        setCTAModal(!CTAModal);
    };

    const toggleEmojiModal = () => {
        setEmojiModal(!emojiModal);
    };

    const isParentHeading = (props: any) => {
        const parent = props.children && props.children.props.parent && props.children.props.parent;
        if (parent) {
            if (parent.type === 'heading-1' || parent.type === 'heading-2' || parent.type === 'heading-3' || parent.type === 'heading-4' || parent.type === 'heading-5') {
                return true;
            } else {
                return false;
            }
        }
    };

    const deleteImage = (editor: Editor, element: any) => {
        const path = ReactEditor.findPath(editor, element);
        Transforms.removeNodes(editor, { at: path });
    };

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

        return (
            <span style={isParentHeading(props) ? headingStyle : leaf.style} {...attributes}>
                {children}
            </span>
        );
    };

    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, [fontSize]);

    const renderElement = useCallback((props: any) => {
        let style = props.element.children.style || {};
        const { attributes, element, children } = props;
        const selected = useSelected();
        const focused = useFocused();
        const editor = useSlateStatic();
        style['textAlign'] = { textAlign: props.element.align };
        if (
            props.element.type === 'heading-1' ||
            props.element.type === 'heading-2' ||
            props.element.type === 'heading-3' ||
            props.element.type === 'heading-4' ||
            props.element.type === 'heading-5'
        ) {
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
                return <h1 style={style}>{children}</h1>;
            case 'heading-2':
                return <h2 style={style}>{children}</h2>;
            case 'heading-3':
                return <h3 style={style}>{children}</h3>;
            case 'heading-4':
                return <h4 style={style}>{children}</h4>;
            case 'heading-5':
                return <h5 style={style}>{children}</h5>;
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
                return <div>{children}</div>;
            }

            case 'align-left': {
                const style = element.style;
                return <p style={style}>{children}</p>;
            }

            case 'align-center': {
                const style = element.style;
                return <p style={style}>{children}</p>;
            }

            case 'align-right': {
                const style = element.style;
                return <p style={style}>{children}</p>;
            }

            case 'align-justify': {
                const style = element.style;
                return <p style={style}>{children}</p>;
            }

            case 'image': {
                const src = element.src;
                const alt = element.alt;
                const style = element.style;
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
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    deleteImage(editor, element);
                                }}
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
                                <Icon className="fa-solid fa-trash" buttonIcons={['fa-solid fa-trash']} />
                            </button>
                        </div>
                    </div>
                );
            }
            case 'image-center': {
                const src = element.src;
                const alt = element.alt;
                const style = element.style;
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
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    deleteImage(editor, element);
                                }}
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
                                <Icon buttonIcons={['fa-solid fa-trash']} className="fa-solid fa-trash" />
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
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    deleteImage(editor, element);
                                }}
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
                                <Icon buttonIcons={['fa-solid fa-trash']} className="fa-solid fa-trash" />
                            </button>
                        </div>
                    </div>
                );
            }
            case 'image-right': {
                const src = element.src;
                const alt = element.alt;
                const style = element.style;
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
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    deleteImage(editor, element);
                                }}
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
                                <Icon buttonIcons={['fa-solid fa-trash']} className="fa-solid fa-trash" />
                            </button>
                        </div>
                    </div>
                );
            }

            case 'table': {
                const style = element.style;
                const className = element.className;
                if (style) {
                    return (
                        <table className={className} style={style} {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                } else {
                    return (
                        <table {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                }
            }

            case 'table-left': {
                const style = element.style;
                const className = element.className;
                if (style) {
                    return (
                        <table className={className} style={style} {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                } else {
                    return (
                        <table {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                }
            }

            case 'table-center': {
                const style = element.style;
                const className = element.className;
                if (style) {
                    return (
                        <table className={className} style={style} {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                } else {
                    return (
                        <table {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                }
            }

            case 'table-right': {
                const style = element.style;
                const className = element.className;
                if (style) {
                    return (
                        <table className={className} style={style} {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                } else {
                    return (
                        <table {...attributes}>
                            <tbody>{children}</tbody>
                        </table>
                    );
                }
            }

            case 'table-row': {
                const style = element.style;
                if (style) {
                    return (
                        <tr style={style} {...attributes}>
                            {children}
                        </tr>
                    );
                } else {
                    return <tr {...attributes}>{children}</tr>;
                }
            }

            case 'table-cell': {
                const style = element.style;
                if (style) {
                    return (
                        <td style={style} {...attributes}>
                            {children}
                        </td>
                    );
                } else {
                    return <td {...attributes}>{children}</td>;
                }
            }

            case 'link':
                return <LinkComponent {...props} />;

            case 'button':
                return <EditableButtonComponent {...props} />;

            case 'badge':
                return <BadgeComponent {...props} />;

            case 'embeded': {
                const style = element.style;
                const width = element.width;
                const height = element.height;
                const src = element.youtubeUrl;
                return <iframe style={style} width={width} height={height} src={src} allowFullScreen></iframe>;
            }

            default: {
                const style = element.children.style;
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
            <Modal isOpen={imageModal} toggle={toggleImageModal} backdrop="static" size="xl">
                <ModalHeader>Kép feltöltése</ModalHeader>
                <ModalBody>
                    {uploadType && uploadType === 'link' ? (
                        <>
                            <div>
                                <Label>Kép linkje:</Label>
                                <Input
                                    type="text"
                                    value={image.src}
                                    onChange={(e) => {
                                        setImage({
                                            ...image,
                                            src: e.target.value
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Kép alt tagje:</Label>
                                <Input
                                    type="text"
                                    value={image.alt}
                                    onChange={(e) => {
                                        setImage({
                                            ...image,
                                            alt: e.target.value
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Kép szélessége:</Label>
                                <Input
                                    type="text"
                                    value={image.width}
                                    onChange={(e) => {
                                        setImage({
                                            ...image,
                                            width: e.target.value
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Kép magassága:</Label>
                                <Input
                                    type="text"
                                    value={image.height}
                                    onChange={(e) => {
                                        setImage({
                                            ...image,
                                            height: e.target.value
                                        });
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <Label>Kép feltöltése:</Label>
                                <Input type="file" />
                            </div>
                            <div>
                                {images &&
                                    images.map((i) => {
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
                    <Button type="button" onClick={toggleImageModal}>
                        Mégsem
                    </Button>
                </ModalFooter>
            </Modal>
        );
    };

    const renderTableModal = () => {
        return (
            <Modal isOpen={tableModal} toggle={toggleTableModal} backdrop="static" size="md">
                <ModalHeader>Táblázat hozzáadása</ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="col-md-12">
                            <Label for="tableClass">Táblázat osztályneve: </Label>
                            <Input type="text" name="tableClass" id="tableClass" onChange={(e) => setModalvalues({ ...modalValues, tableClass: e.target.value })} value={modalValues.tableClass} />
                        </div>
                        <div className="col-md-12">
                            <Label for="rowNumber">Táblázat sorainak száma: </Label>
                            <Input type="text" name="rowNumber" id="rowNumber" onChange={(e) => setModalvalues({ ...modalValues, rowNumber: e.target.value })} value={modalValues.rowNumber} />
                        </div>
                        <div className="col-md-12">
                            <Label for="colNumber">Táblázat oszlopainak száma: </Label>
                            <Input type="text" name="colNumber" id="colNumber" onChange={(e) => setModalvalues({ ...modalValues, colNumber: e.target.value })} value={modalValues.colNumber} />
                        </div>
                        <div className="col-md-12">
                            <Label for="textAlign">Táblázat cellaszövegének igazítása: </Label>
                            <Input type="select" name="textAlign" id="textAlign" onChange={(e) => setModalvalues({ ...modalValues, textAlign: e.target.value })} value={modalValues.textAlign}>
                                <option key="default" value="left">
                                    Kérjük válasszon cellaigazítást...
                                </option>
                                <option key="balra" value="left">
                                    Balra
                                </option>
                                <option key="center" value="center">
                                    Középre
                                </option>
                                <option key="jobbra" value="right">
                                    Jobbra
                                </option>
                            </Input>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => addTablazat(editor, modalValues.tableClass, parseInt(modalValues.rowNumber, 10), parseInt(modalValues.colNumber, 10), modalValues.textAlign)}>Mentés</Button>
                    <Button onClick={toggleTableModal}>Mégsem</Button>
                </ModalFooter>
            </Modal>
        );
    };

    const renderLinkModal = () => {
        return (
            <Modal isOpen={linkModal} toggle={toggleLinkModal} backdrop="static" size="md">
                <ModalHeader>Link hozzáadása</ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="col-md-12">
                            <Label for="linkUrl">Link URL címe: </Label>
                            <Input type="text" name="linkUrl" id="linkUrl" onChange={(e) => setModalvalues({ ...modalValues, linkUrl: e.target.value })} value={modalValues.linkUrl} />
                        </div>
                        <div className="col-md-12">
                            <Label for="linkDesc">Link szövege: </Label>
                            <Input type="text" name="linkDesc" id="linkDesc" onChange={(e) => setModalvalues({ ...modalValues, linkDesc: e.target.value })} value={modalValues.linkDesc} />
                        </div>
                        <div className="col-md-12">
                            <Label for="linkFontColor">Link betűszíne: </Label>
                            <Input
                                type="color"
                                name="linkFontColor"
                                id="linkFontColor"
                                onChange={(e) => setModalvalues({ ...modalValues, linkFontColor: e.target.value })}
                                value={modalValues.linkFontColor}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => insertLink(editor, modalValues.linkUrl, modalValues.linkDesc, modalValues.linkFontColor)}>Mentés</Button>
                    <Button onClick={toggleLinkModal}>Mégsem</Button>
                </ModalFooter>
            </Modal>
        );
    };

    const renderYoutubeModal = () => {
        return (
            <Modal isOpen={youtubeModal} toggle={toggleYoutubeModal} backdrop="static" size="md">
                <ModalHeader>Youtube beágyazott videó hozzáadása</ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="col-md-12">
                            <Label for="youtubeUrl">Youtube videó URL címe: </Label>
                            <Input type="text" name="youtubeUrl" id="youtubeUrl" onChange={(e) => setModalvalues({ ...modalValues, youtubeUrl: e.target.value })} value={modalValues.youtubeUrl} />
                        </div>
                        <div className="col-md-12">
                            <Label for="youtubeWidth">Videó szélessége (px vagy %): </Label>
                            <Input
                                type="text"
                                name="youtubeWidth"
                                id="youtubeWidth"
                                onChange={(e) => setModalvalues({ ...modalValues, youtubeWidth: e.target.value })}
                                value={modalValues.youtubeWidth}
                            />
                        </div>
                        <div className="col-md-12">
                            <Label for="youtubeHeight">Videó magassága (px vagy %): </Label>
                            <Input
                                type="text"
                                name="youtubeHeight"
                                id="youtubeHeight"
                                onChange={(e) => setModalvalues({ ...modalValues, youtubeHeight: e.target.value })}
                                value={modalValues.youtubeHeight}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => addYoutube(editor, modalValues.youtubeUrl, modalValues.youtubeWidth, modalValues.youtubeHeight)}>Mentés</Button>
                    <Button onClick={toggleYoutubeModal}>Mégsem</Button>
                </ModalFooter>
            </Modal>
        );
    };

    const renderCTAModal = () => {
        return (
            <Modal isOpen={CTAModal} toggle={toggleCTAModal} backdrop="static" size="md">
                <ModalHeader>CTA gomb hozzáadása</ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="col-md-12">
                            <Label for="CTALeiras">CTA gomb címe: </Label>
                            <Input type="text" name="CTALeiras" id="CTALeiras" onChange={(e) => setModalvalues({ ...modalValues, CTALeiras: e.target.value })} value={modalValues.CTALeiras} />
                        </div>
                        <div className="col-md-12">
                            <Label for="CTAFunc">CTA gomb megnyomásának URL-je: </Label>
                            <Input type="text" name="CTAFunc" id="CTAFunc" onChange={(e) => setModalvalues({ ...modalValues, CTAFunc: e.target.value })} value={modalValues.CTAFunc} />
                        </div>
                        <div className="col-md-12">
                            <Label for="CTABgColor">CTA gomb háttérszíne: </Label>
                            <Input type="color" name="CTABgColor" id="CTABgColor" onChange={(e) => setModalvalues({ ...modalValues, CTABgColor: e.target.value })} value={modalValues.CTABgColor} />
                        </div>
                        <div className="col-md-12">
                            <Label for="CTAFontColor">CTA gomb betűszíne: </Label>
                            <Input
                                type="color"
                                name="CTAFontColor"
                                id="CTAFontColor"
                                onChange={(e) => setModalvalues({ ...modalValues, CTAFontColor: e.target.value })}
                                value={modalValues.CTAFontColor}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => addCTA(editor, modalValues.CTALeiras, modalValues.CTAFunc, modalValues.CTAFontColor, modalValues.CTABgColor)}>Mentés</Button>
                    <Button onClick={toggleCTAModal}>Mégsem</Button>
                </ModalFooter>
            </Modal>
        );
    };

    const renderEmojiModal = () => {
        return (
            <Modal isOpen={emojiModal} toggle={toggleEmojiModal} backdrop="static" size="md">
                <ModalHeader>Emoji hozzáadása</ModalHeader>
                <ModalBody></ModalBody>
                <ModalFooter>
                    <Button onClick={() => addEmoji(editor)}>Mentés</Button>
                    <Button onClick={toggleEmojiModal}>Mégsem</Button>
                </ModalFooter>
            </Modal>
        );
    };

    const setFont = (e: any, editor: Editor) => {
        const value = e.target.value;
        setFontSize(value);
        toggleFontsize(editor, value);
    };

    function isMarkActive(editor: any, format: any) {
        const [match] = Editor.nodes(editor, {
            match: (n: any) => n[format] === true,
            universal: true
        });
        return !!match;
    }

    const isBlockActive = (editor: Editor, format: Format, blockType: any = 'type') => {
        const obj: AccessNode = { keyName: blockType };
        const { selection } = editor;
        if (!selection) return false;
        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: (n) => {
                    return !Editor.isEditor(n) && SlateElement.isElement(n) && n[obj.keyName] === format;
                }
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
        const isActive = isBlockActive(editor, format);
        const isList = LIST_TYPES.includes(format);
        /*   const { selection } = editor;
        let selected;
        if (selection !== null && selection.anchor !== null) {
            selected = editor.children[selection.anchor.path[0]];
        } else {
            selected = {};
        } */

        Transforms.unwrapNodes(editor, {
            match: (n) => {
                return !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format);
            },
            split: true
        });

        let newProperties: Partial<SlateElement> = {};

        if (TEXT_ALIGN_TYPES.includes(format)) {
            const { selection } = editor;
            if (selection) {
                const [parent]: any = Editor.parent(editor, selection.focus?.path);
                let style = Object.assign({}, parent.style);
                let f = format.substring(format.lastIndexOf('-') + 1, format.length);
                const newStyle = Object.assign(style, { textAlign: f });

                newProperties = {
                    align: isActive ? undefined : f,
                    style: newStyle,
                    type: `align-${f}`
                };
            }
        } else {
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
        const { selection } = editor;
        if (selection) {
            const [parent]: any = Editor.parent(editor, selection.focus?.path);
            let style = Object.assign({}, parent.style);
            let newStyle = Object.assign(style, { fontSize: value });
            const newParameters = {
                style: newStyle
            };
            Transforms.setNodes(editor, newParameters);
            Editor.addMark(editor, 'style', newParameters.style);
        }
    };

    const BlockButton = (props: FormatButtonProps) => {
        const editor = useSlate();
        const { format, icon, colors } = props;
        const headingNumberIndex = format.indexOf('-');
        const headingNumber = icon === 'fa fa-header' && format.slice(headingNumberIndex + 1);
        return (
            <ToolbarButton
                reserved={reserved}
                className="block_button"
                active={isBlockActive(editor, format)}
                onMouseDown={(event: MouseEvent) => {
                    event.preventDefault();
                    toggleBlock(editor, format);
                }}
                colors={colors}
            >
                {icon === 'fa fa-header' ? (
                    <>
                        <Icon buttonIcons={[icon]} className={icon} />
                        {headingNumber && headingNumber}
                    </>
                ) : (
                    <Icon buttonIcons={[icon]} className={icon} />
                )}
            </ToolbarButton>
        );
    };

    const MarkButton = (props: FormatButtonProps) => {
        const editor = useSlate();
        const { format, icon, colors } = props;

        return (
            <ToolbarButton
                className="mark_button"
                active={isMarkActive(editor, format)}
                reserved={reserved}
                onMouseDown={(event: MouseEvent) => {
                    event.preventDefault();
                    toggleMark(editor, format);
                }}
                colors={colors}
            >
                <Icon buttonIcons={[icon]} className={icon} />
            </ToolbarButton>
        );
    };

    const ImageButton = (props: FormatButtonProps) => {
        const { icon, format } = props;
        const align = format.substring(format.indexOf('-') + 1, format.length);
        const plusIcon = align === 'image' ? `fa-solid fa-align-justify` : `fa-solid fa-align-${align}`;
        return (
            <ToolbarButton className="image_button" onClick={() => toggleImageModal(format)}>
                <Icon buttonIcons={[plusIcon, icon]} className={icon} />
            </ToolbarButton>
        );
    };

    const TableButton = (props: FormatButtonProps) => {
        const { icon, format } = props;
        const align = format.substring(format.indexOf('-') + 1, format.length);
        const plusIcon = `fa-solid fa-align-${align}`;
        return (
            <ToolbarButton className="table_button" onClick={() => toggleTableModal(format)}>
                <Icon buttonIcons={[plusIcon, icon]} className={icon} />
            </ToolbarButton>
        );
    };

    const LinkButton = (props: FormatButtonProps) => {
        const { icon } = props;
        return (
            <ToolbarButton active={isLinkActive(editor)} className="link_button" onClick={() => toggleLinkModal()}>
                <Icon buttonIcons={[icon]} className={icon} />
            </ToolbarButton>
        );
    };

    const YoutubeButton = (props: FormatButtonProps) => {
        const { icon } = props;
        return (
            <ToolbarButton className="youtube_button" onClick={() => toggleYoutubeModal()}>
                <Icon buttonIcons={[icon]} className={icon} />
            </ToolbarButton>
        );
    };

    /*     const CTAButton = (props: FormatButtonProps) => {
        const { icon } = props;
        return (
            <ToolbarButton className="cta_button" onClick={() => toggleCTAModal()}>
                <Icon buttonIcons={[icon]} className={icon} />
            </ToolbarButton>
        );
    }; */

    /* const EmojiButton = (props: FormatButtonProps) => {
        const { icon } = props;
        return (
            <ToolbarButton className="emoji_button" onClick={() => toggleEmojiModal()}>
                <Icon buttonIcons={[icon]} className={icon} />
            </ToolbarButton>
        );
    }; */

    const FontsizeButton = (props: any): any => {
        const editor = useSlate();
        const { format } = props;
        return (
            <ToolbarButton className="font_button" style={{ position: 'relative', top: '-3px', left: '15px' }} onMouseUp={() => {}} name={format} active={isFontSizeActive(editor, setFontSize)}>
                <select
                    value={fontSize}
                    onChange={(e) => {
                        setFont(e, editor);
                    }}
                    className="font_button"
                    onMouseUp={() => {}}
                    name={format}
                >
                    <option key="17px" value="17px">
                        17 px
                    </option>
                    <option key="18px" value="18px">
                        18 px
                    </option>
                    <option key="19px" value="19px">
                        19 px
                    </option>
                    <option key="20px" value="20px">
                        20 px
                    </option>
                    <option key="21px" value="21px">
                        21 px
                    </option>
                    <option key="22px" value="22px">
                        22 px
                    </option>
                    <option key="23px" value="23px">
                        23 px
                    </option>
                    <option key="24px" value="24px">
                        24 px
                    </option>
                    <option key="25px" value="25px">
                        25 px
                    </option>
                </select>
            </ToolbarButton>
        );
    };

    return (
        <div style={{ display: 'inline-grid', width: '100%' }}>
            <Slate
                editor={editor}
                onChange={(value) => {
                    onChange(value);
                    editor.children = value;
                    editor.onChange();
                }}
                value={value}
            >
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
                    <FontsizeButton format="fontSizeButton" icon={'fontSizeButton'} />
                </Toolbar>
                <Toolbar className="wysiwyg-editor-toolbar">
                    <BlockButton format="block-quote" icon="fa-solid fa-indent" colors={colors} />
                    <BlockButton format="numbered-list" icon="fa-solid fa-list-ol" colors={colors} />
                    <BlockButton format="bulleted-list" icon="fa-solid fa-list-ul" colors={colors} />
                    <BlockButton format="align-left" icon="fa-solid fa-align-left" colors={colors} />
                    <BlockButton format="align-center" icon="fa-solid fa-align-center" colors={colors} />
                    <BlockButton format="align-right" icon="fa-solid fa-align-right" colors={colors} />
                    <BlockButton format="align-justify" icon="fa-solid fa-align-justify" colors={colors} />
                </Toolbar>
                <Toolbar className="wysiwyg-editor-toolbar">
                    <ImageButton format="image" icon="fa-regular fa-image" />
                    <ImageButton format="image-center" icon="fa-regular fa-image" />
                    <ImageButton format="image-left" icon="fa-regular fa-image" />
                    <ImageButton format="image-right" icon="fa-regular fa-image" />
                    <TableButton format="table-left" icon="fa-solid fa-table" />
                    <TableButton format="table-center" icon="fa-solid fa-table" />
                    <TableButton format="table-right" icon="fa-solid fa-table" />
                </Toolbar>
                <Toolbar className="wysiwyg-editor-toolbar">
                    <LinkButton format="link" icon="fa-solid fa-link" />
                    <RemoveLinkButton format="removelink" icon="fa-solid fa-unlink" />
                    <YoutubeButton format="youtube" icon="fa-brands fa-youtube" />
                    <ToggleEditableButtonButton format="CTA" icon="fa-solid fa-earth-europe" />
                    {/* <EmojiButton format="emoji" icon="fa-regular fa-face-smile" /> */}
                </Toolbar>
                <Toolbar className="wysiwyg-editor-toolbar">{renderCustomButtons()}</Toolbar>
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
                    renderElement={renderElement}
                />
            </Slate>
            <div>
                {imageModal ? renderImageModal() : ''}
                {renderTableModal()}
                {renderLinkModal()}
                {renderYoutubeModal()}
                {renderCTAModal()}
                {renderEmojiModal()}
            </div>
        </div>
    );
};

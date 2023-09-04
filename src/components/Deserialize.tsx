import { jsx } from 'slate-hyperscript';
import { CustomText } from './InterfacesAndTypes';
import { getStyleFromHtmlStyle } from './HelperFucntions';

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
            break;
        case 'EM': {
            nodeAttributes.italic = true;
            break;
        }
        case 'U': {
            nodeAttributes.underline = true;
            break;
        }
        case 'CODE': {
            nodeAttributes.code = true;
            break;
        }
        case 'SPAN': {
            nodeAttributes.style = style ? style : undefined;
            break;
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
            return jsx(
                'element',
                {
                    type: `align-${style.textAlign ? style.textAlign : 'left'}`,
                    style: style
                },
                children
            );
        case 'A':
            return jsx(
                'element',
                {
                    type: 'link',
                    url: el.href,
                    style: style,
                    linkText: el.innerText ? el.innerText : ''
                },
                children
            );
        case 'BUTTON':
            const buttonChildren = el.children[0];
            const href = buttonChildren.href || '';
            const text = buttonChildren.innerText || '';
            const textColor = style.color || 'black';
            const bgColor = style.backgroundColor || 'white';
            return jsx(
                'element',
                {
                    type: 'button',
                    CTAFunc: href,
                    CTALeiras: text,
                    CTAColor: textColor,
                    CTABgColor: bgColor,
                    style: style
                },
                children
            );
        case 'IMG':
            return jsx('element', { type: `image`, style: style, src: el.src, alt: el.alt }, children);
        case 'IFRAME':
            return jsx(
                'element',
                {
                    type: 'embeded',
                    style: style,
                    youtubeUrl: el.src,
                    height: el.height,
                    width: el.width
                },
                children
            );
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

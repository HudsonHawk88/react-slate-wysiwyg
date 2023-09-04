import { serialize } from './Serialize';

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

    if (key === 'fontColor') {
        newKey = 'color';
    }
    return newKey;
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

export const getNode = (node: any, ch?: any) => {
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
            return `<a style="${style}" href="${href}" target="_blank">${text}</a>`;
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

export const getStyleFromHtmlStyle = (style: string, toReactStyle?: boolean) => {
    const key: any = style || {};
    let newStyle = {};
    Object.keys(key).forEach((s) => {
        if (key[s] !== '' && isNaN(parseInt(s))) {
            Object.assign(newStyle, s === 'color' && !toReactStyle ? { ['color']: key['color'] } : { [s]: key[s] });
        }
    });

    let res = newStyle ? newStyle : undefined;
    return res;
};

export const getElementsFromHtml = (html: string) => {
    const el = new DOMParser().parseFromString(html, 'text/html').body;
    return el;
};

import escapeHtml from 'escape-html';
import { Text } from 'slate';
import { CustomElement, CustomText } from './InterfacesAndTypes';
import { getNode } from './HelperFucntions';

export const serialize = (nodes: CustomElement[] | Node[]) => {
    let result = nodes.map((node: any): string[] => {
        const children =
            node.children &&
            node.children.map((nn: CustomText): any => {
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
                    const ch = getNode(nn, nn['children']);
                    return ch;
                }
            });
        const ch = getNode(node, children);
        return ch;
    });
    let serialized = result.join('');
    return serialized;
};

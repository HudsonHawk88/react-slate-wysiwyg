import escapeHtml from "escape-html";
import { Text } from "slate";
import { CustomElement } from "./InterfacesAndTypes";
import { getNode } from "./HelperFucntions";

const getHtmlStyleKey = (styleKey: string) => {
  const key = styleKey || "";
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

  let newKey = hasUpper
    ? key.toLowerCase().substring(0, upperPosition) +
      "-" +
      key.toLowerCase().substring(upperPosition, key.length)
    : key;

  if (styleKey === "fontColor") {
    newKey = "color";
  }

  return newKey;
};

function getStilus(style: any) {
  let stilus: string = "";

  if (style) {
    for (const [key] of Object.entries(style)) {
      if (style[key]) {
        stilus = stilus.concat(`${getHtmlStyleKey(key)}: ${style[key]};`);
      }
    }
  }

  return `${stilus}`;
}

export const serialize = (nodes: CustomElement[] | Node[]) => {
  let result = nodes.map((node: any): string[] => {
    const children =
      node.children &&
      node.children.map((nn: any): any => {
        if (Text.isText(nn) || nn.style) {
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
          if (nn.style) {
            string = `<span style="${getStilus(nn.style)}">${string}</span>`;
          }
          return string;
        } else {
          const ch = getNode(nn, nn["children"]);
          return ch;
        }
      });
    const ch = getNode(node, children);
    return ch;
  });
  let serialized = result.join("");
  return serialized;
};

import { ElementType, HTMLProps } from 'react';
import { Text, BaseText, BaseElement, NodeInterface, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export interface CustomElement extends BaseElement {
    type?: string;
    className?: string;
    align?: string;
    style?: object;
    children: CustomElement[] | CustomText[] | Descendant[];
}

export interface CustomNode extends NodeInterface {
    TEXT_NODE: any;
    ELEMENT_NODE: any;
}

export declare type Node = ReactEditor | Element | Text;
export type CustomImage = { type: string; url: string; children?: EmptyText[] };
export type LinkElement = {
    type: string;
    url: string;
    style?: object;
    linkText?: string;
    children: CustomText[] | CustomElement[] | any;
};
export type YoutubeElement = {
    type: string;
    youtubeUrl: string;
    height: string | number;
    width: string | number;
    children: CustomText[];
    style: object;
};
export type ButtonElement = {
    type: string;
    CTAFunc?: string;
    CTAColor?: string;
    CTABgColor?: string;
    CTALeiras: string;
    style?: object;
    color?: string;
    bgColor?: string;
    children?: LinkElement[];
};

export interface CustomTooolbarButton extends HTMLProps<HTMLButtonElement> {
    format: string;
    icon?: string;
    text?: string;
    colors?: object;
}

export interface CustomText extends BaseText {
    type?: string;
    emoji?: any;
    bold?: boolean | undefined;
    italic?: boolean | undefined;
    underline?: boolean | undefined;
    code?: boolean | undefined;
    style?: object | undefined;
    align?: string;
    children?: any;
}

export type onUploadType = (file: File) => void;

export interface WysiwygProps {
    as: ElementType;
    children: any;
    className?: string;
    editorClass?: string;
    key?: string;
    id?: string | undefined;
    value: CustomElement[];
    onChange?: (v: CustomElement[]) => void;
    customButtons?: Array<[]>;
    colors?: Object;
    reserved?: Boolean;
    placeholder?: string;
    uploadType?: 'pc' | 'link' | 'objectstore';
    onUpload?: onUploadType;
}

export interface FormatButtonProps {
    className?: string;
    format: string;
    icon: any;
    colors?: object;
    plusIcon?: string;
}

export type Format = string;

export interface Image {
    src: string;
    alt?: string;
    width?: string;
    height?: string;
}

export interface AccessNode {
    keyName: keyof CustomElement; // 👈️ one of Employee's keys
}

export type EmptyText = {
    text: string;
};

export type ImageElement = {
    type: string;
    src: string | ArrayBuffer;
    children?: EmptyText[] | CustomText[] | CustomElement[] | any;
    style: object | undefined;
};

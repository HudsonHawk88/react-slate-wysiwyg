import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from 'reactstrap';
import { Transforms, Editor as SlateEditor, Element as SlateElement, Range, Point, createEditor, Path } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import isUrl from 'is-url';
/* import imageExtensions from 'image-extensions'; */
import { css } from '@emotion/css';
import { ToolbarButton, Icon } from './components';
import {
    WysiwygProps,
    // CustomText,
    Image,
    LinkElement,
    YoutubeElement,
    FormatButtonProps,
    AccessNode,
    CustomText
} from './InterfacesAndTypes';
import { initialValue, defaultColors, defaultImage, defaultStyle } from './InitialValue';
import { EmojiList } from './Emojis';
import { getStyleFromHtmlStyle } from './HelperFucntions';

export let Editor: any = [];

export const setEditorValue = (value: any, e: any) => {
    if (e && e.current) {
        e.current.children = value;
    }
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['align-left', 'align-center', 'align-right', 'align-justify'];
/* const HEADING_TYPES = ['heading-one', 'heading-2', 'heading-3', 'heading-4', 'heading-5']; */

const SharedAppContext = React.createContext({});

export const FontColorButton = (props: FormatButtonProps) => {
    const { format, className } = props;

    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { editor, isMarkActive, setFontCol, fontColor } = propps;
                return (
                    <ToolbarButton className={`fontColor_button ${className}`} onMouseDown={() => {}}>
                        <Input
                            type="color"
                            style={{ width: '60px', height: '35px' }}
                            value={fontColor}
                            onChange={(e) => {
                                setFontCol(e, editor);
                            }}
                            className={`fontColor_input`}
                            active={isMarkActive(editor, format)}
                        />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const BlockButton = (props: FormatButtonProps) => {
    const { format, icon, className } = props;
    const headingNumberIndex = format.indexOf('-');
    const headingNumber = icon === 'fa fa-header' && format.slice(headingNumberIndex + 1);
    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { editor, isBlockActive, toggleBlock, colors } = propps;
                return (
                    <ToolbarButton
                        className={`block_button ${className}`}
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
            }}
        </SharedAppConsumer>
    );
};

export const MarkButton = (props: FormatButtonProps) => {
    const { format, icon, className } = props;

    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { editor, isMarkActive, toggleMark, colors } = propps;
                return (
                    <ToolbarButton
                        className={`mark_button ${className}`}
                        active={isMarkActive(editor, format)}
                        onMouseDown={(event: MouseEvent) => {
                            event.preventDefault();
                            toggleMark(editor, format);
                        }}
                        colors={colors}
                    >
                        <Icon buttonIcons={[icon]} className={icon} />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const FontsizeButton = (props: any): any => {
    const { format, editor, setFontSize, isFontSizeActive, fontSize, setFont, className } = props;
    return (
        <ToolbarButton
            className={`font_button ${className}`}
            style={{ position: 'relative', top: '-3px', left: '15px' }}
            onMouseUp={() => {}}
            name={format}
            active={isFontSizeActive(editor, setFontSize)}
        >
            <select
                name="fontsize"
                id="fontsize"
                value={fontSize}
                onChange={(e) => {
                    setFont(e, editor);
                }}
                className="font_button"
                onMouseUp={() => {}}
                // name={format}
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

export const TableButton = (props: FormatButtonProps) => {
    const { icon, format, plusIcon, className } = props;
    const align = format.substring(format.indexOf('-') + 1, format.length);
    const plusIc = plusIcon || `fa-solid fa-align-${align}`;
    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { toggleTableModal } = propps;
                return (
                    <ToolbarButton className={`table_button ${className}`} onClick={() => toggleTableModal(format)}>
                        <Icon buttonIcons={[plusIc, icon]} className={icon} />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const ImageButton = (props: any) => {
    const { icon, format, plusIcon, className } = props;
    const align = format.substring(format.indexOf('-') + 1, format.length);
    const plusIco = plusIcon ? plusIcon : align === 'image' ? `fa-solid fa-align-justify` : `fa-solid fa-align-${align}`;

    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { toggleImageModal } = propps;
                return (
                    <ToolbarButton className={`image_button ${className || ''}`} onClick={() => toggleImageModal(format)}>
                        <Icon buttonIcons={align === 'image' ? [icon] : [plusIco, icon]} className={icon} />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const CustomButton = (props: any) => {
    const { format, key, className, text } = props;
    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { editor, addText, colors } = propps;
                return (
                    <ToolbarButton
                        key={key}
                        style={{ width: 'fit-content' }}
                        className={`custom_button ${className || ''}`}
                        onMouseDown={(event: MouseEvent) => {
                            event.preventDefault();
                            addText(editor, format);
                        }}
                        colors={colors}
                    >
                        {text}
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const LinkButton = (props: FormatButtonProps) => {
    const { icon, className } = props;
    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { editor, isLinkActive, toggleLinkModal } = propps;
                return (
                    <ToolbarButton active={isLinkActive(editor)} className={`link_button ${className || ''}`} onClick={() => toggleLinkModal()}>
                        <Icon buttonIcons={[icon]} className={icon} />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const RemoveLinkButton = (props: FormatButtonProps) => {
    const { format, icon, className } = props;

    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { editor, isLinkActive, unwrapLink } = propps;
                return (
                    <ToolbarButton
                        active={isLinkActive(editor)}
                        className={`removelink_button ${className || ''}`}
                        format={format}
                        onClick={() => {
                            // console.log(isLinkActive(editor));
                            if (isLinkActive(editor)) {
                                unwrapLink(editor);
                            }
                        }}
                    >
                        <Icon buttonIcons={[icon]} className={icon} />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const ToggleEditableButtonButton = (props: FormatButtonProps) => {
    const { format, icon, className } = props;
    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { editor, isButtonActive, unwrapButton, toggleCTAModal } = propps;
                return (
                    <ToolbarButton
                        format={format}
                        active={isButtonActive(editor)}
                        className={`cta_button ${className || ''}`}
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
            }}
        </SharedAppConsumer>
    );
};

export const YoutubeButton = (props: FormatButtonProps) => {
    const { icon, className } = props;
    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { toggleYoutubeModal } = propps;
                return (
                    <ToolbarButton className={`youtube_button ${className || ''}`} onClick={() => toggleYoutubeModal()}>
                        <Icon buttonIcons={[icon]} className={icon} />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const EmojiButton = (props: FormatButtonProps) => {
    const { icon, className } = props;
    return (
        <SharedAppConsumer>
            {(propps: any) => {
                const { toggleEmojiModal } = propps;
                return (
                    <ToolbarButton className={`emoji_button ${className}`} onClick={() => toggleEmojiModal()}>
                        <Icon buttonIcons={[icon]} className={icon} />
                    </ToolbarButton>
                );
            }}
        </SharedAppConsumer>
    );
};

export const Wysiwyg = ({
    className = 'react-slate-wysiwyg',
    editorClass = 'react-slate-wysiwyg-editor',
    children,
    id,
    value = initialValue,
    colors = defaultColors,
    placeholder = 'Ide írjon szöveget...',
    uploadType = 'link',
    customButtons = [],
    onChange,
    as: Component = 'div',
    editorKey,
    refEditor
}: WysiwygProps) => {
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

    const withTables = (editor: SlateEditor) => {
        const { deleteBackward, deleteForward, insertBreak } = editor;

        editor.deleteBackward = (unit) => {
            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
                const [cell] = SlateEditor.nodes(editor, {
                    match: (n: any) => !SlateEditor.isEditor(n) && n.type === 'table-cell'
                });

                if (cell) {
                    const [, cellPath] = cell;
                    const start = SlateEditor.start(editor, cellPath);

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
                const [cell] = SlateEditor.nodes(editor, {
                    match: (n: any) => !SlateEditor.isEditor(n) && n.type === 'table-cell'
                });

                if (cell) {
                    const [, cellPath] = cell;
                    const end = SlateEditor.end(editor, cellPath);

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
                const [table] = SlateEditor.nodes(editor, {
                    match: (n: any) => !SlateEditor.isEditor(n) && n.type === 'table'
                });

                if (table) {
                    return;
                }
            }

            insertBreak();
        };

        return editor;
    };

    const withImages = (editor: SlateEditor) => {
        const { isVoid } = editor;

        editor.isVoid = (element: any) => {
            return element.type === 'image' || element.type === 'image-center' || element.type === 'image-right' || element.type === 'image-left' ? true : isVoid(element);
        };

        return editor;
    };

    const withInlines = (editor: ReactEditor) => {
        const { insertData, insertText, isInline, isElementReadOnly, isSelectable } = editor;

        editor.isInline = (element: any) => ['link', 'button', 'badge'].includes(element.type) || isInline(element);

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

    const editor: any = useMemo(() => withImages(withTables(withInlines(withHistory(withReact(createEditor()))))), []);

    const [fontSize, setFontSize] = useState('17px');
    const [fontColor, setFontColor] = useState('#000000');
    const [imageModal, setImageModal] = useState(false);
    const [tableModal, setTableModal] = useState(false);
    const [linkModal, setLinkModal] = useState(false);
    const [youtubeModal, setYoutubeModal] = useState(false);
    const [CTAModal, setCTAModal] = useState(false);
    const [emojiModal, setEmojiModal] = useState(false);
    const [image, setImage] = useState(defaultImage);
    const [format, setFormat] = useState('');
    const [modalValues, setModalvalues] = useState(defaultModalValues);
    const [images] = useState([]);

    useEffect(() => {
        if (refEditor) {
            refEditor.current = editor;
        }
    }, [editor]);

    const toggleImageModal = (format?: any) => {
        setImageModal(!imageModal);
        if (format) {
            setFormat(format);
        }
    };

    function toggleBlock(editor: SlateEditor, format: any) {
        const isActive = isBlockActive(editor, format);
        const isList = LIST_TYPES.includes(format);

        Transforms.unwrapNodes(editor, {
            match: (n: any) => {
                return !SlateEditor.isEditor(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format);
            },
            split: true
        });

        let newProperties: any = {};

        if (TEXT_ALIGN_TYPES.includes(format)) {
            // console.log('AAAAAAA');
            const { selection } = editor;
            if (selection) {
                const [parent]: any = SlateEditor.parent(editor, selection.focus?.path);
                let style = Object.assign({}, parent.style);
                let f = format.substring(format.lastIndexOf('-') + 1, format.length);
                const newStyle = Object.assign(style, { textAlign: f });
                if ((parent && parent.type.includes('heading') && format.includes('align')) || (parent && parent.type.includes('align') && format.includes('heading'))) {
                    delete newStyle['fontSize'];
                }
                newProperties = {
                    align: isActive ? undefined : f,
                    style: newStyle,
                    type: `${parent && parent.type.includes('heading') && format.includes('align') ? parent.type : `align-${f}`}`
                };
            }

            Transforms.setNodes<SlateElement>(editor, newProperties);
        } else {
            const { selection } = editor;

            if (selection) {
                const [parent]: any = SlateEditor.parent(editor, selection.focus?.path);
                // console.log('BBBBBB');
                newProperties = {
                    type: isActive ? 'align-left' : isList ? 'list-item' : format,
                    style: format.includes('heading') && parent && parent.type.includes('align') ? {} : { fontSize: '17px' }
                };
            }

            Transforms.setNodes<SlateElement>(editor, newProperties);
        }

        if (!isActive && isList) {
            const { selection } = editor;
            // console.log('CCCCC');
            if (selection) {
                const [parent]: any = SlateEditor.parent(editor, selection.focus?.path);
                newProperties = {
                    type: isActive ? 'align-left' : isList ? 'list-item' : format,
                    align: isActive ? undefined : format,
                    style: format.includes('heading') && parent && parent.type.includes('align') ? {} : { fontSize: '17px' }
                };
                const block = {
                    type: format,
                    style: format.includes('heading') && parent && parent.type.includes('align') ? {} : { fontSize: '17px' },
                    children: []
                };
                Transforms.wrapNodes(editor, block);
            }
        }
    }

    const isBlockActive = (editor: SlateEditor, format: string, blockType: any = 'type') => {
        const obj: AccessNode = { keyName: blockType };
        const { selection } = editor;
        if (!selection) return false;
        const [match] = Array.from(
            SlateEditor.nodes(editor, {
                at: SlateEditor.unhangRange(editor, selection),
                match: (n: any) => {
                    return !SlateEditor.isEditor(n) && n[obj.keyName] === format;
                }
            })
        );

        return !!match;
    };

    function isMarkActive(editor: any, format: any, color?: string) {
        const [match] = SlateEditor.nodes(editor, {
            match: (n: any) => n[format] === true,
            universal: true
        });
        return !!match;
    }

    const toggleMark = (editor: any, format: any) => {
        const isActive = isMarkActive(editor, format);

        if (isActive) {
            SlateEditor.removeMark(editor, format);
        } else {
            SlateEditor.addMark(editor, format, true);
        }
    };

    const isFontSizeActive = (editor: SlateEditor, setFontSize: Function) => {
        const [match] = SlateEditor.nodes(editor, {
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

    const addText = (editor: SlateEditor, text: string) => {
        const variable: CustomText = {
            text: text
        };
        Transforms.insertNodes(editor, variable);
    };

    const addImage = (editor: SlateEditor, image: Image) => {
        const text = { text: '', style: { display: 'none' } };
        let style = {};
        /* let divStyle = {}; */
        if (format === 'image-left' || format === 'image-right') {
            if (format === 'image-left') {
                style = {
                    float: 'left',
                    margin: '20px 20px 20px 0px',
                    clear: 'both',
                    width: image.width + 'px',
                    height: image.height + 'px'
                };
            }
            if (format === 'image-right') {
                style = {
                    float: 'right',
                    margin: '20px 0px 20px 20px',
                    clear: 'both',
                    width: image.width + 'px',
                    height: image.height + 'px'
                };
            }
            const img: any = {
                type: format,
                style: Object.assign(style, {
                    width: image.width + 'px',
                    height: image.height + 'px'
                }),
                src: image.src,
                alt: image.alt,
                children: [text]
            };
            /*   const d: CustomElement = { type: 'div', style: divStyle, children: [img] }; */
            Transforms.insertNodes(editor, img);
            /*   Transforms.wrapNodes(editor, d); */
        } else {
            if (format === 'image-center') {
                style = Object.assign(style, {
                    display: 'block',
                    margin: '0 auto',
                    width: image.width + 'px',
                    height: image.height + 'px'
                });
            }
            const img: any = {
                type: format,
                style: style,
                src: image.src,
                alt: image.alt,
                children: [text]
            };

            Transforms.insertNodes(editor, img);
        }
    };

    const addTablazat = (editor: SlateEditor, tableClass: string, rowNumber: number, colNumber: number, textAlign: string) => {
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
                cols.push({
                    type: 'table-cell',
                    style: colStyle,
                    children: [{ text: `cell-${j}`, style: { fontSize: '17px' } }]
                });
            }
            rows.push({ type: 'table-row', style: rowStyle, children: cols });
        }

        const table = {
            type: 'table',
            style: tableStyle,
            className: tableClass,
            children: rows
        };

        Transforms.insertNodes(editor, table);
        toggleTableModal();
    };

    const insertLink = (editor: SlateEditor, url: string, text: string, color: string) => {
        if (editor.selection) {
            wrapLink(editor, url, text, color);
            toggleLinkModal();
        }
    };

    const insertButton = (editor: SlateEditor, CTALeiras: string, CTAFunc: string, CTAColor: string, CTABgColor: string) => {
        if (editor.selection) {
            wrapButton(editor, CTALeiras, CTAFunc, CTAColor, CTABgColor);
            toggleCTAModal();
        }
    };

    const insertYoutube = (editor: SlateEditor, youtubeUrl: string, youtubeWidth: string | number, youtubeHeight: string | number) => {
        const { selection } = editor;
        const text = { text: '', style: { display: 'none' } };
        if (selection) {
            const [parent]: any = SlateEditor.parent(editor, selection.focus?.path);
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
                children: [text]
            };

            Transforms.insertNodes(editor, youtube);
        }
    };

    const isLinkActive = (editor: SlateEditor) => {
        const { selection } = editor;
        // console.log('selection: ', selection);
        if (!selection) return false;
        // console.log('SlateEditor.unhangRange(editor, selection): ', SlateEditor.unhangRange(editor, selection));
        const [match] = SlateEditor.nodes(editor, {
            at: SlateEditor.unhangRange(editor, selection),
            match: (n: any) => {
                return !SlateEditor.isEditor(n) && n.type === 'link';
            }
        });

        return !!match;
    };

    const isButtonActive = (editor: SlateEditor) => {
        const [button] = SlateEditor.nodes(editor, {
            match: (n: any) => !SlateEditor.isEditor(n) && n.type === 'button'
        });
        return !!button;
    };

    const unwrapLink = (editor: SlateEditor) => {
        Transforms.unwrapNodes(editor, {
            match: (n: any) => {
                // console.log('NNNNNNN: ', n);
                return !SlateEditor.isEditor(n) && n.type === 'link';
            }
        });
    };

    const unwrapButton = (editor: SlateEditor) => {
        Transforms.unwrapNodes(editor, {
            match: (n: any) => !SlateEditor.isEditor(n) && n.type === 'button'
        });
    };

    const wrapLink = (editor: SlateEditor, url: string, linkText?: string, linkColor?: string) => {
        if (!url) return;

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

        const paragraphNode = { type: 'align-left', style: { fontSize: fontSize }, children: [link] };

        if (!!selection) {
            // const [parent]: any = SlateEditor.parent(editor, selection.focus?.path);
            const [parentNode, parentPath]: any = SlateEditor.parent(editor, selection.focus?.path);

            // Remove the Link node if we're inserting a new link node inside of another
            // link.
            if (parentNode.type === 'link') {
                unwrapLink(editor);
            }

            if (editor.isVoid(parentNode)) {
                // console.log('AAA');
                // Insert the new link after the void node
                Transforms.insertNodes(editor, paragraphNode, {
                    at: Path.next(parentPath),
                    select: true
                });
            } else if (Range.isCollapsed(selection)) {
                // Insert the new link in our last known location
                // console.log('BBB');
                // console.log(Selection, parentNode);
                const ch = [...parentNode.children];
                if (ch) {
                    ch.push(link);
                }
                // console.log('CH: ', ch);
                // const p = { type: parentNode.type, children: ch, style: parentNode.style };
                // Transforms.unwrapNodes(editor);
                Transforms.insertNodes(editor, link);
            } else {
                // console.log('CCC');
                // Wrap the currently selected range of text into a Link
                Transforms.wrapNodes(editor, link, { split: true });
                // Remove the highlight and move the cursor to the end of the highlight
                Transforms.collapse(editor, { edge: 'end' });
            }
        } else {
            // Insert the new link node at the bottom of the Editor when selection
            // is falsey
            Transforms.insertNodes(editor, paragraphNode);
        }
        // if (isLinkActive(editor)) {
        //     unwrapLink(editor);
        // }

        // const { selection } = editor;
        // const isCollapsed = selection && Range.isCollapsed(selection);
        // const link: LinkElement = {
        //     type: 'link',
        //     url,
        //     style: {
        //         color: linkColor,
        //         textDecoration: 'none'
        //     },
        //     linkText: linkText,
        //     children: isCollapsed ? [{ text: linkText }] : []
        // };

        // console.log('LINK: ', link);
        // console.log('isCollapsed: ', isCollapsed);

        // if (isCollapsed) {
        //     Transforms.wrapNodes(editor, link, { split: true });
        // } else {
        //     Transforms.wrapNodes(editor, link, { split: true });
        //     Transforms.collapse(editor, { edge: 'end' });
        // }
    };

    const wrapButton = (editor: SlateEditor, CTALeiras: string, CTAFunc: string, CTAColor: string, CTABgColor: string) => {
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
        const button: any = {
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
    const InlineChromiumBugfix = (props: any) => (
        <span
            contentEditable={false}
            className={css`
                font-size: 0;
            `}
            {...props.attributes}
        >
            {props.children ? props.children : String.fromCodePoint(160) /* Non-breaking space */}
            {/* {console.log(props)} */}
            {/* {props.children} */}
        </span>
    );

    const LinkComponent = (props: any) => {
        let newStyle: any = {};
        const { attributes, element } = props;
        Object.assign(newStyle, element.style);
        Object.assign(newStyle, { textDecoration: 'none' });
        return (
            <a {...attributes} href={element.url} style={newStyle}>
                <InlineChromiumBugfix {...props} />
                {element && element.linkText ? element.linkText : ''}
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
                <a
                    href={CTAFunc}
                    style={{
                        color: CTAColor,
                        textDecoration: 'none',
                        fontSize: fontSize
                    }}
                    target="_blank"
                >
                    {CTALeiras}
                </a>
                <InlineChromiumBugfix />
            </button>
        );
    };

    const BadgeComponent = (props: any) => {
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
                `}
            >
                <InlineChromiumBugfix />
                {children}
                <InlineChromiumBugfix />
            </span>
        );
    };

    const addYoutube = (editor: SlateEditor, youtubeUrl: string, youtubeWidth: string | number, youtubeHeight: string | number) => {
        insertYoutube(editor, youtubeUrl, youtubeWidth, youtubeHeight);
    };

    const addCTA = (editor: SlateEditor, CTALeiras: string, CTAFunc: string, CTAColor: string, CTABgColor: string) => {
        insertButton(editor, CTALeiras, CTAFunc, CTAColor, CTABgColor);
    };

    const addEmoji = (editor: SlateEditor, emoji: string) => {
        editor.insertText(emoji);
    };

    /* const isImageUrl = (url: string) => {
        if (!url) return false;
        if (!isUrl(url)) return false;
        const ext = new URL(url).pathname.split('.').pop() || '';
        return imageExtensions.includes(ext);
    }; */

    const toggleTableModal = (format?: any) => {
        setTableModal(!tableModal);
        if (format) {
            setFormat(format);
        }
    };

    const toggleLinkModal = () => {
        setModalvalues({
            ...modalValues,
            linkDesc: '',
            linkFontColor: '',
            linkUrl: ''
        });
        setLinkModal(!linkModal);
    };

    const toggleYoutubeModal = () => {
        setModalvalues({
            ...modalValues,
            youtubeHeight: '',
            youtubeWidth: '',
            youtubeUrl: ''
        });
        setYoutubeModal(!youtubeModal);
    };

    const toggleCTAModal = () => {
        setModalvalues({
            ...modalValues,
            CTABgColor: '',
            CTAFontColor: '',
            CTAFunc: '',
            CTALeiras: ''
        });
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

    const deleteImage = (editor: any, element: any) => {
        const path = ReactEditor.findPath(editor, element);
        Transforms.removeNodes(editor, { at: path });
    };

    const Leaf = (props: any) => {
        let { attributes, children, leaf } = props;
        let style = JSON.parse(JSON.stringify(leaf.style));
        let headingStyle = {
            textAlign: style && style.textAlign ? style.textAlign : undefined
        };

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

        if (leaf.emoji) {
            const newStyle = getStyleFromHtmlStyle(style, true);
            children = (
                <span style={newStyle} {...attributes} {...props}>
                    {leaf.emoji}
                </span>
            );
        }

        // if (leaf.style) {
        //     const newStyle = getStyleFromHtmlStyle(style, true);
        //     children = (
        //         <span style={newStyle} {...attributes} {...props}>
        //             {children}
        //         </span>
        //     );
        // }

        if (isParentHeading(props) && style && style.fontSize) {
            children.style;
            delete style.fontSize;
        }

        // console.log(children);

        return leaf.emoji ? (
            <React.Fragment>{children}</React.Fragment>
        ) : (
            <span style={isParentHeading(props) ? headingStyle : style} {...attributes} {...props}>
                {children}
            </span>
        );
    };

    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

    const renderElement = useCallback((props: any) => {
        let style = props.element.style || {};
        const { attributes, element, children } = props;
        // style["textAlign"] = { textAlign: props.element.align };
        // if (
        //   props.element.type === "heading-1" ||
        //   props.element.type === "heading-2" ||
        //   props.element.type === "heading-3" ||
        //   props.element.type === "heading-4" ||
        //   props.element.type === "heading-5"
        // ) {
        //   delete style["fontSize"];
        // }

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
                                <Icon buttonIcons={[]} />
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
                                <Icon buttonIcons={[]} />
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
                                <Icon buttonIcons={[]} />
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
                                <Icon buttonIcons={[]} />
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
                        <p style={style} {...attributes}>
                            {children}
                        </p>
                    );
                } else {
                    return <p {...attributes}>{children}</p>;
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
                                    images.map((i: any) => {
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
                    <Button
                        onClick={() => {
                            addImage(editor, image);
                            toggleImageModal();
                        }}
                    >
                        OK
                    </Button>
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
                                onChange={(e) =>
                                    setModalvalues({
                                        ...modalValues,
                                        linkFontColor: e.target.value
                                    })
                                }
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
                                onChange={(e) =>
                                    setModalvalues({
                                        ...modalValues,
                                        youtubeWidth: e.target.value
                                    })
                                }
                                value={modalValues.youtubeWidth}
                            />
                        </div>
                        <div className="col-md-12">
                            <Label for="youtubeHeight">Videó magassága (px vagy %): </Label>
                            <Input
                                type="text"
                                name="youtubeHeight"
                                id="youtubeHeight"
                                onChange={(e) =>
                                    setModalvalues({
                                        ...modalValues,
                                        youtubeHeight: e.target.value
                                    })
                                }
                                value={modalValues.youtubeHeight}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        onClick={() => {
                            addYoutube(editor, modalValues.youtubeUrl, modalValues.youtubeWidth, modalValues.youtubeHeight);
                            toggleYoutubeModal();
                        }}
                    >
                        Mentés
                    </Button>
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
                                onChange={(e) =>
                                    setModalvalues({
                                        ...modalValues,
                                        CTAFontColor: e.target.value
                                    })
                                }
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
                <ModalBody>
                    {EmojiList.map((emoji) => {
                        return (
                            <button
                                key={emoji.name}
                                style={{ fontSize: '25px' }}
                                onClick={() => {
                                    addEmoji(editor, emoji.id);
                                    setTimeout(() => {
                                        toggleEmojiModal();
                                    }, 200);
                                }}
                            >
                                <span>{emoji.id}</span>
                            </button>
                        );
                    })}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleEmojiModal}>OK</Button>
                </ModalFooter>
            </Modal>
        );
    };

    const setFont = (e: any, editor: SlateEditor) => {
        const value = e.target.value;
        setFontSize(value);
        toggleFontsize(editor, value);
    };

    const setFontCol = (e: any, editor: SlateEditor) => {
        const value = e.target.value;
        setFontColor(value);
        toggleFontColor(editor, value);
    };

    const toggleFontsize = (editor: SlateEditor, value: string) => {
        const { selection } = editor;
        if (selection) {
            const [selectedText]: any = SlateEditor.leaf(editor, selection);
            let style = Object.assign({}, selectedText.style);
            let newStyle = Object.assign(style, { fontSize: value });
            editor.addMark('style', newStyle);
        }
    };

    const toggleFontColor = (editor: SlateEditor, value: string) => {
        const { selection } = editor;
        if (selection) {
            const [selectedText]: any = SlateEditor.leaf(editor, selection);
            let style = Object.assign({}, selectedText.style);
            let newStyle = Object.assign(style, { color: value });
            editor.addMark('style', newStyle);
        }
    };

    // console.log('VALUE, ', value);
    // console.log('ref, ref && ref.current: ', ref, ref && ref.current);

    return (
        <React.Fragment>
            <Component
                className={`wysiwyg-app ${className}`}
                style={{ display: 'inline-grid', width: '100%' }}
                value={value}
                onChange={onChange}
                // id={id}
                colors={colors}
                placeholder={placeholder}
                uploadType={uploadType}
                customButtons={customButtons}
            >
                <SharedAppContext.Provider
                    value={{
                        value: value,
                        onChange: onChange,
                        colors: colors,
                        placeholder: placeholder,
                        uploadType: uploadType,
                        customButtons: customButtons,
                        toggleBlock: toggleBlock,
                        toggleMark: toggleMark,
                        toggleFontColor: toggleFontColor,
                        toggleFontsize: toggleFontsize,
                        toggleCTAModal: toggleCTAModal,
                        toggleEmojiModal: toggleEmojiModal,
                        toggleImageModal: toggleImageModal,
                        toggleLinkModal: toggleLinkModal,
                        toggleTableModal: toggleTableModal,
                        toggleYoutubeModal: toggleYoutubeModal,
                        isBlockActive: isBlockActive,
                        isMarkActive: isMarkActive,
                        isLinkActive: isLinkActive,
                        isButtonActive: isButtonActive,
                        isUrl: isUrl,
                        isFontSizeActive: isFontSizeActive,
                        addText: addText,
                        unwrapLink: unwrapLink,
                        unwrapButton: unwrapButton,
                        editor: editor,
                        fontSize: fontSize,
                        fontColor: fontColor,
                        setFontColor: setFontColor,
                        setFontCol: setFontCol,
                        setFontSize: setFontSize,
                        setFont: setFont
                    }}
                >
                    <Slate
                        editor={editor}
                        key={editorKey}
                        initialValue={value}
                        onChange={(v: any) => {
                            if (onChange) {
                                onChange(v);
                            }
                        }}
                    >
                        {children}
                        <Editable
                            className={`react-slate-wysiwyg-editor ${editorClass}`}
                            id={id}
                            style={defaultStyle}
                            placeholder={placeholder}
                            renderLeaf={renderLeaf}
                            renderElement={renderElement}
                        />
                    </Slate>
                </SharedAppContext.Provider>

                {/* <Toolbar className="wysiwyg-editor-toolbar">
                <MarkButton format="bold" icon="fa fa-bold" colors={colors} />
                <MarkButton format="italic" icon="fa fa-italic" colors={colors} />
                <MarkButton
                format="underline"
                icon="fa fa-underline"
                colors={colors}
                />
                <MarkButton format="code" icon="fa fa-code" colors={colors} />
                <BlockButton format="heading-1" icon="fa fa-header" colors={colors} />
                <BlockButton format="heading-2" icon="fa fa-header" colors={colors} />
                <BlockButton format="heading-3" icon="fa fa-header" colors={colors} />
                <BlockButton format="heading-4" icon="fa fa-header" colors={colors} />
                <BlockButton format="heading-5" icon="fa fa-header" colors={colors} />
                <FontsizeButton format="fontSizeButton" icon={"fontSizeButton"} />
            </Toolbar>
            <Toolbar className="wysiwyg-editor-toolbar">
                <BlockButton
                format="block-quote"
                icon="fa-solid fa-indent"
                colors={colors}
                />
                <BlockButton
                format="numbered-list"
                icon="fa-solid fa-list-ol"
                colors={colors}
                />
                <BlockButton
                format="bulleted-list"
                icon="fa-solid fa-list-ul"
                colors={colors}
                />
                <BlockButton
                format="align-left"
                icon="fa-solid fa-align-left"
                colors={colors}
                />
                <BlockButton
                format="align-center"
                icon="fa-solid fa-align-center"
                colors={colors}
                />
                <BlockButton
                format="align-right"
                icon="fa-solid fa-align-right"
                colors={colors}
                />
                <BlockButton
                format="align-justify"
                icon="fa-solid fa-align-justify"
                colors={colors}
                />
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
                <ToggleEditableButtonButton
                format="CTA"
                icon="fa-solid fa-earth-europe"
                />
                // <EmojiButton format="emoji" icon="fa-regular fa-face-smile" />
            </Toolbar>
            <Toolbar className="wysiwyg-editor-toolbar">
                {renderCustomButtons()}
            </Toolbar> */}
            </Component>
            {imageModal ? renderImageModal() : ''}
            {renderTableModal()}
            {renderLinkModal()}
            {renderYoutubeModal()}
            {renderCTAModal()}
            {renderEmojiModal()}
        </React.Fragment>
    );
};

export const SharedAppConsumer = SharedAppContext.Consumer;

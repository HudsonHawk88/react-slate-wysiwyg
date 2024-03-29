import React, { Ref, PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
import { cx, css } from '@emotion/css';
import {
    BlockButton,
    CustomButton,
    FontColorButton,
    FontsizeButton,
    ImageButton,
    LinkButton,
    MarkButton,
    RemoveLinkButton,
    SharedAppConsumer,
    TableButton,
    ToggleEditableButtonButton,
    YoutubeButton,
    EmojiButton
} from './Wysiwyg';
import { defaultColors } from './InitialValue';
import { CustomTooolbarButton } from './InterfacesAndTypes';

interface BaseProps {
    className: string;
    [key: string]: any;
}

interface HtmlAttributesWithButtonIcons extends React.HTMLAttributes<HTMLElement> {
    buttonIcons: any;
}

type RefButtonObject = Ref<HTMLButtonElement>;

type RefDivObject = Ref<HTMLDivElement>;

export const CustomToolbar = React.forwardRef(({ className, ...props }: PropsWithChildren<BaseProps>, ref: RefDivObject) => {
    return <Menu {...props} ref={ref} className={className} />;
});

export const ToolbarGroup = React.forwardRef(({ as: Component = 'div', className, children, ...props }: PropsWithChildren<BaseProps>, ref: RefDivObject) => {
    return (
        <Component {...props} className={`$react-slate-wysiwyg toolbargroup ${className}`}>
            {children}
        </Component>
    );
});

export const ToolbarButton = React.forwardRef(
    (
        {
            className,
            active,
            reversed,
            colors,
            ...props
        }: PropsWithChildren<
            {
                active: boolean;
                reversed?: boolean;
            } & BaseProps
        >,
        ref: RefButtonObject
    ) => {
        if (props && props.name && props.name.format === 'fontSizeButton') {
            return <>{props.children}</>;
        } else {
            if (colors) {
                return (
                    <button
                        type="button"
                        {...props}
                        ref={ref}
                        className={cx(
                            className,
                            css`
                                cursor: pointer !important;
                                color: ${reversed ? (active ? colors.reverse.activeColor : colors.reverse.color) : active ? colors.normal.activeColor : colors.normal.color} !important;
                            `
                        )}
                    />
                );
            } else {
                return (
                    <button
                        type="button"
                        {...props}
                        ref={ref}
                        className={cx(
                            className,
                            css`
                                cursor: pointer !important;
                            `
                        )}
                    />
                );
            }
        }
    }
);

export const EditorValue = React.forwardRef(
    (
        {
            className,
            value,
            ...props
        }: PropsWithChildren<
            {
                value: any;
            } & BaseProps
        >,
        ref: RefDivObject
    ) => {
        const textLines = value.document.nodes
            .map((node: any) => node.text)
            .toArray()
            .join('\n');
        return (
            <div
                ref={ref}
                {...props}
                className={cx(
                    className,
                    css`
                        margin: 30px -20px 0;
                    `
                )}
            >
                <div
                    className={css`
                        font-size: 14px;
                        padding: 5px 20px;
                        color: #404040;
                        border-top: 2px solid #eeeeee;
                        background: #f8f8f8;
                    `}
                >
                    Slate's value as text
                </div>
                <div
                    className={css`
                        color: #404040;
                        font: 12px monospace;
                        white-space: pre-wrap;
                        padding: 10px 20px;
                        div {
                            margin: 0 0 0.5em;
                        }
                    `}
                >
                    {textLines}
                </div>
            </div>
        );
    }
);

const iconButton = ({ buttonIcons, ...rest }: HtmlAttributesWithButtonIcons, ref: RefDivObject) => {
    return (
        <React.Fragment>
            {buttonIcons.length === 0 ? (
                <i>&#10060;</i>
            ) : (
                buttonIcons.map((icon: string) => {
                    return <i {...rest} ref={ref} key={icon} className={icon} />;
                })
            )}
        </React.Fragment>
    );
};

export const Icon = React.forwardRef(iconButton);

export const Instruction = React.forwardRef(({ className, ...props }: PropsWithChildren<BaseProps>, ref: RefDivObject) => <div {...props} ref={ref} className={className} />);

export const Menu = React.forwardRef(({ className, ...props }: PropsWithChildren<BaseProps>, ref: RefDivObject) => <div {...props} ref={ref} className={className} />);

export const Portal = (props: any) => {
    const child = props.children;
    return typeof document === 'object' ? ReactDOM.createPortal(child, document.body) : null;
};

export const Toolbar = React.forwardRef(({ className, ...props }: PropsWithChildren<BaseProps>, ref: RefDivObject) => {
    return <Menu {...props} ref={ref} className={className} />;
});

export const ToolbarItem = React.forwardRef(({ type = '', format = '', icon = '', text = '', colors = defaultColors, ...rest }: CustomTooolbarButton, ref: RefButtonObject) => {
    let element = <button></button>;

    if (type === 'block') {
        element = (
            <SharedAppConsumer>
                {(propps: any) => {
                    return <BlockButton ref={ref} format={format} icon={icon} colors={propps.colors} {...propps} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'mark') {
        element = (
            <SharedAppConsumer>
                {(props: any) => {
                    return <MarkButton ref={ref} format={format} icon={icon} colors={props.colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'fontColor') {
        element = (
            <SharedAppConsumer>
                {(props: any) => {
                    return <FontColorButton ref={ref} format={format} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'fontsize') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <FontsizeButton ref={ref} format={format} icon={icon} colors={colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'table') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <TableButton ref={ref} format={format} icon={icon} colors={colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'link') {
        element = (
            <SharedAppConsumer>
                {(props: any) => {
                    return <LinkButton ref={ref} format={format} icon={icon} colors={props.colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'removelink') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <RemoveLinkButton ref={ref} format={format} icon={icon} colors={colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'image') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <ImageButton ref={ref} format={format} icon={icon} colors={colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'cta') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <ToggleEditableButtonButton ref={ref} format={format} icon={icon} colors={colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'youtube') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <YoutubeButton ref={ref} format={format} icon={icon} colors={colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'emoji') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <EmojiButton ref={ref} format={format} icon={icon} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    if (type === 'custom') {
        element = (
            <SharedAppConsumer>
                {(props) => {
                    return <CustomButton ref={ref} text={text} format={format} icon={icon} colors={colors} {...props} {...rest} />;
                }}
            </SharedAppConsumer>
        );
    }

    return element;
});

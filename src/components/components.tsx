import React, { Ref, PropsWithChildren } from "react";
import ReactDOM from "react-dom";
import { cx, css } from "@emotion/css";

interface BaseProps {
  className: string;
  [key: string]: any;
}

interface HtmlAttributesWithButtonIcons
  extends React.HTMLAttributes<HTMLElement> {
  buttonIcons: string[];
}

type RefButtonObject = Ref<HTMLButtonElement>;

type RefDivObject = Ref<HTMLDivElement>;

export const CustomToolbar = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: RefDivObject
  ) => {
    return <Menu {...props} ref={ref} className={className} />;
  }
);

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
    if (props && props.name && props.name.format === "fontSizeButton") {
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
                cursor: pointer;
                color: ${reversed
                  ? active
                    ? colors.reverse.activeColor
                    : colors.reverse.color
                  : active
                  ? colors.normal.activeColor
                  : colors.normal.color};
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
                cursor: pointer;
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
      .join("\n");
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

const iconButton = (
  { buttonIcons, ...rest }: HtmlAttributesWithButtonIcons,
  ref: RefDivObject
) => {
  return (
    <React.Fragment>
      {buttonIcons.map((icon: string) => {
        return <i {...rest} ref={ref} key={icon} className={icon} />;
      })}
    </React.Fragment>
  );
};

/* export const Icon = React.forwardRef(({ props }: StyledTextareaInputProps, ref: RefDivObject) => {
    console.log(props);
    props.buttonIcons.map((icon: string) => {
        return (
            <i {...props} ref={ref} className={icon} />
        );
    })
}); */

export const Icon = React.forwardRef(iconButton);

export const Instruction = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: RefDivObject
  ) => <div {...props} ref={ref} className={className} />
);

export const Menu = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: RefDivObject
  ) => <div {...props} ref={ref} className={className} />
);

export const Portal = (props: any) => {
  const child = props.children;
  return typeof document === "object"
    ? ReactDOM.createPortal(child, document.body)
    : null;
};

export const Toolbar = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: RefDivObject
  ) => {
    return <Menu {...props} ref={ref} className={className} />;
  }
);

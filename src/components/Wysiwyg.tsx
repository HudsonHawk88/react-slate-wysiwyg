import React, { ChangeEventHandler, FunctionComponent } from 'react';
import { Editable } from 'slate-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/index.css';

interface WysiwygProps {
    className: string;
    id: string | undefined;
    value: number | string;
    onChange: ChangeEventHandler<HTMLDivElement>;
    onUpload: FunctionComponent;
}

export const Wysiwyg = ({ className = 'react-slate-wysiwyg', id, value, onChange, onUpload }: WysiwygProps) => {
    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        // Implement custom event logic...
        // When no value is returned, Slate will execute its own event handler when
        // neither isDefaultPrevented nor isPropagationStopped was set on the event
    };

    const onDrop = (event: React.MouseEvent<HTMLElement>) => {
        // Implement custom event logic...

        // No matter the state of the event, treat it as being handled by returning
        // true here, Slate will skip its own event handler
        return true;
    };

    const onDragStart = (event: React.MouseEvent<HTMLElement>) => {
        // Implement custom event logic...

        // No matter the status of the event, treat event as *not* being handled by
        // returning false, Slate will execute its own event handler afterward
        return false;
    };

    return <Editable className={className} id={id} value={value} onChange={onChange} onClick={onClick} onDrop={onDrop} onDragStart={onDragStart} />;
};

import React from 'react';
import classes from './code-block.styles.module.css'

import Highlight from 'react-highlight.js';

const CodeBlock = ({ language, content }) => {
    const [open, setOpen] = React.useState(false);

    const handeClick = async () => {
        setOpen(!open);
    };

    return (
        <>
            <a onClick={handeClick} className={classes.button}>
                {open ? `Hide source` : `Show source`}
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill={"rgb(255, 86, 79)"} />
                </svg>
            </a>
            {open && <Highlight language={language}>{content}</Highlight>}
        </>
    );
}

export default CodeBlock

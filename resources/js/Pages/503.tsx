import React from 'react';
import Error from './Error';

export default function ServiceUnavailable() {
    return <Error status={503} />;
}

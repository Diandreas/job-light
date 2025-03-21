import React from 'react';
import Error from './Error';

export default function ServerError() {
    return <Error status={500} />;
}
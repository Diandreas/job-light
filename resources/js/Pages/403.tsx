import React from 'react';
import Error from './Error';

export default function Forbidden() {
    return <Error status={403} />;
}

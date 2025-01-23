import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface InertiaComponentProps {
    component: string;
    props: Record<string, any>;
}

const InertiaComponent: React.FC<InertiaComponentProps> = ({ component, props }) => {
    const [Content, setContent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        //@ts-ignore
        router.visit(component, {
            preserveState: true,
            preserveScroll: true,
            only: ['default'],
            data: props,
            replace: true,
            // @ts-ignore
        }).then((page) => {
            setContent(() => page.props.default);
        });
    }, [component, props]);

    if (!Content) {
        return <div>Loading...</div>;
    }

    return <Content {...props} />;
};

export default InertiaComponent;

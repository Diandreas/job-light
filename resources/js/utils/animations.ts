export const transitions = {
    page: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
    },
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
    },
    staggerContainer: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    },
    staggerItem: {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }
};

export const hoverEffects = {
    card: {
        whileHover: { y: -5, transition: { duration: 0.2 } },
        whileTap: { scale: 0.98 }
    },
    button: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 }
    }
};

// resources/js/types/i18next.d.ts
import 'i18next';
import { resources } from '../config/i18n';

declare module 'i18next' {
    interface CustomTypeOptions {
        resources: typeof resources;
    }
}

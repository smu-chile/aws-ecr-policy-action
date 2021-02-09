import 'reflect-metadata';
export declare const RequiredSymbol: unique symbol;
export declare const OptionalSymbol: unique symbol;
export declare const InputSymbol: unique symbol;
export declare const Required: {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare const Optional: {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function Input(inputName: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function isRequired(target: any, propertyKey: string): boolean;
export declare function isOptional(target: any, propertyKey: string): boolean;
export declare function getInputName(target: any, propertyKey: string): string;

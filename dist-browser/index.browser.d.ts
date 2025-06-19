import { initDilithium as initDilithiumBrowser } from './sig/dilithium/src-browser';
export interface PQSignatures {
    dilithium: Record<string, any>;
    sphincs: Record<string, any>;
    falcon: Record<string, any>;
}
export interface PQKeyEncapsulation {
    mlkem: Record<string, any>;
    frodokem: Record<string, any>;
    mceliece: Record<string, any>;
}
export interface PQFull {
    signatures: PQSignatures;
    kem: PQKeyEncapsulation;
}
export declare function createPQ(): Promise<PQFull>;
export declare function cleanupPQ(): void;
export declare function cleanupPQFull(): void;
export declare function createSignatures(): Promise<PQSignatures>;
export declare function createKEM(): Promise<PQKeyEncapsulation>;
export declare function createKEMFull(): Promise<PQKeyEncapsulation>;
export declare function cleanupSignatures(): void;
export declare function cleanupKEM(): void;
export declare function cleanupKEMFull(): void;
export declare const initDilithium: typeof initDilithiumBrowser;
export declare const initSphincs: () => Promise<{}>;
export declare const initFalcon: () => Promise<{}>;
export declare const initMlkem: () => Promise<{}>;
export declare const initFrodokem: () => Promise<{}>;
export declare const initMcElieceSmall: () => Promise<{}>;
export declare const initMcElieceFull: () => Promise<{}>;
export declare const cleanupSphincs: () => void;
export declare const cleanupFalcon: () => void;
export declare const cleanupMlkem: () => void;
export declare const cleanupFrodokem: () => void;
export declare const cleanupMcElieceSmall: () => void;
export declare const cleanupMcElieceFull: () => void;

import { Game } from "./game.model";

export enum Theme {
    Light = 'light',
    Dark = 'dark'
}

export interface User {
    id: number;
    username: string;
    datebirth?: Date;
    user_credentials?: string;
    password: string;
    email?: string;
    phone: number;
    balance: number;
    purchases?: Game[];
    theme?: Theme;
    avatarURL?: string;
    created_at: Date;
}
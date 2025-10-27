import { Game } from "./game.model";
import { Theme, UserRole } from "./enumerators.model";

export interface User {
    id: number;
    username: string;
    datebirth?: Date;
    user_credentials?: string;
    password: string;
    email?: string;
    phone: number;
    balance: number;
    purchases: Game[];
    theme?: Theme;
    avatarURL?: string;
    role: UserRole;
    created_at: Date;
}
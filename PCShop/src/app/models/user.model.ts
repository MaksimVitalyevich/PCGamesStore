import { Theme, UserRole } from "./enumerators.model";
import { PurchaseItem } from "./purchase.model";

export interface User {
    id: number;
    username: string;
    datebirth?: Date;
    user_credentials?: string;
    password: string;
    email?: string;
    phone: number;
    balance: number;
    purchases: PurchaseItem[];
    theme?: Theme;
    avatarURL?: string;
    role: UserRole;
    created_at: Date;
}
export interface Promocode {
    id: number;
    code: string;
    discount: number;
    description?: string;
    is_active: boolean;
    created_at: Date;
    expires_at?: Date;
    max_uses: number;
    is_new_user_only?: boolean;
    used_count: number;
}
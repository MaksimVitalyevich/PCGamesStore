export interface PurchaseItem {
    id: number;
    title: string;
    genre?: string;
    user_id: number;
    game_id: number;
    price: number;
    purchase_date: Date;
    promo_used?: boolean;
}
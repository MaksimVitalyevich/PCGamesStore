export interface CartItem {
    id: number;
    user_id: number;
    game_id: number;
    title: string;
    genre?: string;
    price: number;
    added_at?: string

}
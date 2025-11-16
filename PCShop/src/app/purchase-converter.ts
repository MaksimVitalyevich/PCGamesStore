import { CartItem } from "./models/cart.model";
import { PurchaseItem } from "./models/purchase.model";

export function cartToPurchase(item: CartItem): PurchaseItem {
    return {
        id: 0,
        user_id: item.user_id,
        game_id: item.game_id,
        title: item.title,
        genre: item.genre || '',
        price: item.price,
        purchase_date: item.added_at ? new Date(item.added_at) : new Date()
    };
}
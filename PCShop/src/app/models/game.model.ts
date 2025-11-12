export interface Game {
    id: number;
    title: string;
    published_at?: Date;
    purchaseDate?: Date;
    short?: string;
    genre: string;
    rating: number;
    full?: string;
    developer?: string;
    companyName?: string;
    localization?: string;
    systemRequirements: string;
    price: number;
    image?: string;
}
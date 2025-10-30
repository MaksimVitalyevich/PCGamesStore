import { Game } from "./game.model"

export const defaultGames: Game[] = [
    {
      id: 1, title: "Cyberpunk 2077", published_at: new Date(2023), genre: "Action / RPG", rating: 5.5, systemRequirements: "Windows 10, 8GB RAM, GTX 1060",
      price: 1999, image: 'games/cyberpunk.webp', developer: "CD Projekt RED", companyName: "CD Projekt", localization: "RU / ENG"
    },
    {
      id: 2, title: "Half-Life: Alyx", published_at: new Date(2020), genre: "Sci-Fi / Shooter", rating: 8.0, systemRequirements: "Windows 10, 12GB RAM, RTX 2060",
      price: 2499, image: 'games/half-life-alyx.webp', developer: "Valve", companyName: "Valve Software", localization: "RU / ENG"
    },
    {
      id: 3, title: "Red Dead Redemption 2", published_at: new Date(2019), genre: "Action / Adventure", rating: 7.7, systemRequirements: "Windows 7/8/10, 8GB RAM, GTX 770",
      price: 2599, image: 'games/rd-redemption-two.webp', developer: "Rockstar Games", companyName: "Take-Two Interactive", localization: "RU / ENG"
    },
    {
      id: 4, title: "Counter Strike - 2", published_at: new Date(2023), genre: "Action / Shooter", rating: 4.4, systemRequirements: "Windows 10/11, 1GB RAM, GeForce 7600 GT",
      price: 1520, image: 'games/cs-two.webp', developer: "Valve", companyName: "Valve Software", localization: "RU / ENG"
    },
    {
      id: 5, title: "Postal 4: No Regrets", published_at: new Date(2022), genre: "Action / Adventure", rating: 4.2, systemRequirements: "Windows 10/11, 8GB RAM, DirectX 11",
      price: 1300, image: 'games/postal-four.webp', developer: "Running With Scissors", companyName: "Running With Scissors", localization: "RU / ENG"
    },
    {
      id: 6, title: "Doom Eternal", published_at: new Date(2020), genre: "Action / Shooter", rating: 6.9, systemRequirements: "Windows 7/8/10, 8GB RAM, GeForce 1050 Ti / AMD Radeon R9 280",
      price: 1660, image: 'games/doom-eternal.webp', developer: "ID Software", companyName: "Bethesda Softworks", localization: "RU / ENG"
    },
    {
      id: 7, title: "Borderlands 3", published_at: new Date(2020), genre: "RPG / Shooter", rating: 7.2, systemRequirements: "Windows 7/8/10, 6GB RAM, AMD Radeon 7970 HD",
      price: 1255, image: 'games/borderlands-three.webp', developer: "Gearbox Software", companyName: "2K Games", localization: "RU / ENG"
    },
    {
      id: 8, title: "Back 4 Blood", published_at: new Date(2021), genre: "Horror / Shooter", rating: 8.2, systemRequirements: "Windows 10/11, 8GB RAM, GeForce GTX 1050 Ti / AMD Radeon RX 570",
      price: 2299, image: 'games/back-for-blood.webp', developer: "Turtle Rock Studios", companyName: "Warner Bros. Games", localization: "RU / ENG"
    },
    {
      id: 9, title: "Garrys Mod", published_at: new Date(2024), genre: "Simulator / Sandbox", rating: 9.0, systemRequirements: "Windows XP/Vista/7/8/10, 512MB RAM, DirectX 8",
      price: 1100, image: 'games/garrys-mod.webp', developer: "Valve", companyName: "Valve Software", localization: "RU / ENG"
    },
    {
      id: 10, title: "Serious Sam 4", published_at: new Date(2020), genre: "Adventure / Shooter", rating: 9.1, systemRequirements: "Windows 7/8/10, 8GB RAM, GeForce 1050 / AMD Radeon 7950 / DirectX 11",
      price: 1449, image: 'games/serious-sam-four.webp', developer: "Croteam", companyName: "Devolver Digital", localization: "RU / ENG"
    },
    {
      id: 11, title: "Grand Theft Auto 5", published_at: new Date(2015), genre: "Open World / Action", rating: 7.6, systemRequirements: "Windows Vista/7/8/10, 4GB RAM, GT 9800 / AMD 4870 HD",
      price: 960, image: 'games/gta-five.webp', developer: "Rockstar North", companyName: "Rockstar Games", localization: "RU / ENG"
    }
]
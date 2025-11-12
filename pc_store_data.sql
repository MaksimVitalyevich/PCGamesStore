-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Ноя 07 2025 г., 10:55
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `pc_store_data`
--

-- --------------------------------------------------------

--
-- Структура таблицы `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `published_at` year(4) DEFAULT NULL,
  `genre` varchar(120) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT NULL,
  `short` text DEFAULT NULL,
  `full` text DEFAULT NULL,
  `developer` varchar(120) DEFAULT NULL,
  `company_name` varchar(120) DEFAULT NULL,
  `localization` varchar(60) DEFAULT NULL,
  `system_requirements` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `games`
--

INSERT INTO `games` (`id`, `title`, `published_at`, `genre`, `rating`, `short`, `full`, `developer`, `company_name`, `localization`, `system_requirements`, `price`, `image`) VALUES
(1, 'Cyberpunk 2077', '2023', 'Action / RPG', 5.5, NULL, NULL, 'CD Projekt RED', 'CD Projekt', 'RU / ENG', 'Windows 10, 8GB RAM, GTX 1060', 1499.00, 'games/cyberpunk.webp'),
(2, 'Half-Life: Alyx', '2020', 'Sci-Fi / Shooter', 5.5, NULL, NULL, 'Valve', 'Valve Software', 'RU / ENG', 'Windows 10, 8GB ОП, NVIDIA GTX 1060', 2299.00, 'games/half-life-alyx.webp'),
(3, 'Red Dead Redemption 2', '2018', 'Action / Adventure', 7.7, NULL, NULL, 'Rockstar Games', 'Take-Two Interactive', 'RU / ENG', 'Windows 7/8/10, 8GB ОП, NVIDIA GTX 770', 2199.00, 'games/rd-redemption-two.webp'),
(4, 'Counter Strike - 2', '2023', 'Action / Shooter', 4.4, NULL, NULL, 'Valve', 'Valve Software', 'RU / ENG', 'Windows 10/11, 1GB ОП, NVIDIA GeForce 7600 GT', 1220.00, 'games/cs-two.webp'),
(5, 'Postal 4: No Regrets', '2022', 'Action / Adventure', 4.2, NULL, NULL, 'Running With Scissors', 'Running With Scissors', 'RU / ENG', 'Windows 10/11, 8GB ОП, DirectX 11', 1300.00, 'games/postal-four.webp'),
(6, 'Doom Eternal', '2020', 'Action / Shooter', 6.9, NULL, NULL, 'ID Software', 'Bethesda Softworks', 'RU / ENG', 'Windows 7/8/10, 8GB ОП, NVIDIA GeForce 1050 Ti / AMD Radeon R9 280', 1660.00, 'games/doom-eternal.webp'),
(7, 'Borderlands 3', '2020', 'RPG / Shooter', 7.2, NULL, NULL, 'Gearbox Software', '2K Games', 'RU / ENG', 'Windows 7/8/10, 6GB ОП, AMD Radeon 7970 HD', 1255.00, 'games/borderlands-three.webp'),
(8, 'Back 4 Blood', '2021', 'Horror / Shooter', 8.2, NULL, NULL, 'Turtle Rock Studios', 'Warner Bros. Games', 'RU / ENG', 'Windows 10/11, 8GB ОП, NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 570', 1999.00, 'games/back-for-blood.webp'),
(9, 'Garrys Mod', '2024', 'Simulator / Sandbox', 9.0, NULL, NULL, 'Valve', 'Valve Software', 'RU / ENG', 'Windows XP/Vista/7/8/10, 512MB ОП, DirectX 8', 1100.00, 'games/garrys-mod.webp'),
(10, 'Serious Sam 4', '2020', 'Adventure / Shooter', 9.1, NULL, NULL, 'Croteam', 'Devolver Digital', 'RU / ENG', 'Windows 7/8/10, 8GB ОП, NVIDIA GeForce 1050 / AMD Radeon 7950 / DirectX 11', 1500.00, 'games/serious-sam-four.webp'),
(11, 'Grand Theft Auto 5', '2015', 'Open World / Action', 7.6, NULL, NULL, 'Rockstar North', 'Rockstar Games', 'RU / ENG', 'Windows Vista/7/8/10, 4GB ОП, NVIDIA GT 9800 / AMD 4870 HD', 960.00, 'games/gta-five.webp'),
(12, 'Escape From Tarkov', '2017', 'Shooter / FPS', 8.5, NULL, NULL, 'Battlestate Game', 'Battlestate Game', 'RU / ENG', 'Windows 7/8/10/11, 8GB ОП, DX11 / Совместимая 2GB', 1400.00, 'games/escape-from-tarkov.webp'),
(13, 'Mafia 3', '2016', 'Shooter / Open World', 6.6, NULL, NULL, 'Hangar 13', '2K Games', 'RU / ENG', 'Windows 7/8/10, 6GB ОП, NVIDIA GeForce GTX660 / AMD Radeon HD', 880.00, 'games/mafia-three.webp'),
(14, 'Postal 2', '2003', 'Action / Shooter', 8.9, NULL, NULL, 'Running With Scissors', 'Running With Scissors', 'RU / ENG', 'Windows XP/Vista/7/8/10, 128 MB ОП, NVIDIA GeForce / AMD Radeon', 350.00, 'games/postal-two.webp'),
(15, 'Half-Life 2', '2004', 'Action / FPS', 9.4, NULL, NULL, 'Valve', 'Valve Software', 'RU / ENG', 'Windows 7/8/10/11, 512 MB ОП, DirectX8 / Совместимая 128MB', 500.00, 'games/half-life-two.webp'),
(16, 'Far Cry 6', '2021', 'Adventure / Action', 8.2, NULL, NULL, 'Ubisoft Monreal', 'Ubisoft Entertainment', 'RU / ENG', 'Windows 10, 8GB ОП, NVIDIA GeForce GTX 960 / AMD Radeon 460', 1370.00, 'games/far-cry-six.webp'),
(17, 'Left 4 Dead 2', '2009', 'Action / Horror', 9.6, NULL, NULL, 'Valve', 'Valve Software', 'RU / ENG', 'Windows XP/Vista/7/8/10, 1-2GB ОП, DirectX9 / Совместимая', 500.00, 'games/left-for-dead-two.webp'),
(18, 'COD: Modern Warfare 3', '2023', 'Action / Shooter', 7.1, NULL, NULL, 'Activision', 'Infinity Ward', 'RU / ENG', 'Windows 10/11, 8GB ОП, NVIDIA GeForce GTX 960 / AMD Radeon RX 470', 1700.00, 'games/cod-modern-warfare-three.webp'),
(19, 'Portal', '2007', 'Puzzle / Action', 6.3, NULL, NULL, 'Valve', 'Valve Software', 'RU / ENG', 'Windows XP/Vista/7/8/10, 512MB ОП, DirectX9 / Совместимая', 550.00, 'games/portal.webp'),
(20, 'Stalker 2', '2024', 'RPG / Shooter', 3.9, NULL, NULL, 'GSC Game World', 'GSC Game World', 'RU / ENG', 'Windows 10/11, 8GB ОП, AMD Radeon RX 580 / NVIDIA GeForce GTX 1060', 2600.00, 'games/stalker-two.webp'),
(21, 'Pillars of Eternity', '2015', 'RPG / Adventure', 9.0, NULL, NULL, 'Obsidian Entertainment', 'Paradox Interactive', 'RU / ENG', 'Windows Vista/7/8/10, 4GB ОП, ATI Radeon HD 4850 / NVIDIA GeForce 9600 GT', 1680.00, 'games/pillars-of-eternity.webp'),
(22, 'Mortal Kombat X', '2015', 'Fighting / Action', 8.0, NULL, NULL, 'NetherRealm Studios, High Voltage Software', 'Warner Bros. Entertainment', 'RU / ENG', 'Windows Vista/7/8/10, 3GB ОП, NVIDIA GeForce GTX 460 / AMD Radeon HD', 2200.00, 'games/mortal-kombat-x.webp'),
(23, 'Need For Speed (2015)', '2015', 'Racing / Arcade', 7.5, NULL, NULL, 'Ghost Games', 'Electronic Arts', 'RU / ENG', 'Windows 7/8/10, 6GB ОП, NVIDIA GeForce GTX 750 Ti / AMD Radeon HD', 1900.00, 'games/need-for-speed-remaster.webp'),
(24, 'Resident Evil 4 Remake', '2023', 'Horror / Action', 6.6, NULL, NULL, 'Capcom', 'Capcom', 'RU / ENG', 'Windows 10/11, 8GB ОП, AMD Radeon RX 560 / NVIDIA GeForce GTX 1050 Ti', 1440.00, 'games/re-four-remake.webp'),
(25, 'Hatred', '2015', 'Action', 4.0, NULL, NULL, 'Destructive Creations', 'Destructive Creations', 'RU / ENG', 'Windows Vista/7/8/10, 4GB ОП, NVIDIA GeForce GTX 460 / AMD Radeon HD', 700.00, 'games/hatred.webp'),
(26, 'Batman: Arkham Knight', '2015', 'Action / Adventure', 8.8, NULL, NULL, 'Rocksteady', 'Warner Bros. Entertainment', 'RU / ENG', 'Windows 7/8/10, 6GB ОП, NVIDIA GeForce GTX 660 / AMD Radeon HD', 1050.00, 'games/batman-arkham-knight.webp'),
(27, 'Watch Dogs 2', '2016', 'Action / Open World', 8.3, NULL, NULL, 'Ubisoft Monreal', 'Ubisoft Entertainment', 'RU / ENG', 'Windows 7/8/10, 6GB ОП, NVIDIA GeForce GTX 660 / AMD Radeon HD', 999.00, 'games/watch-dogs-two.webp'),
(28, 'Dishonored 2', '2016', 'RPG / Action', 9.2, NULL, NULL, 'Arkane Studios', 'Bethesda Softworks', 'RU / ENG', 'Windows 7/8/10, 8GB ОП, NVIDIA GTX 660 / AMD Radeon HD', 2800.00, 'games/dishonored-two.webp'),
(29, 'Just Cause 4', '2018', 'Action / Adventure', 5.7, NULL, NULL, 'Avalanche Studios', 'Square Enix', 'RU / ENG', 'Windows 7/8/10, 8GB ОП, NVIDIA GeForce GTX 760 / AMD R9 270', 1599.00, 'games/just-cause-four.webp'),
(30, 'Dying Light', '2015', 'Action / Horror', 7.4, NULL, NULL, 'Techland', 'Techland', 'RU / ENG', 'Windows 7/8/10/11, 8GB ОП, NVIDIA GeForce GTX 560 / AMD Radeon HD', 1199.00, 'games/dying-light.webp'),
(31, 'Dead Space 3', '2013', 'Horror / Shooter', 8.6, NULL, NULL, 'Visceral Games', 'Visceral Games', 'RU / ENG', 'Windows XP/Vista/7/8/10, 2GB ОП, NVIDIA GeForce 8800 GT / AMD Radeon HD', 660.00, 'games/dead-space-three.webp'),
(32, 'Grand Theft Auto 4', '2010', 'Action / Open World', 9.1, NULL, NULL, 'Rockstar North, Rockstar Toronto', 'Rockstar Games', 'RU / ENG', 'Windows XP/Vista/7/8/10, 1.5GB ОП, NVIDIA 7900 / ATI X1900', 480.00, 'games/gta-four.webp'),
(33, 'Serious Sam 3: BFE', '2011', 'Action / FPS', 8.5, NULL, NULL, 'Croteam', 'Devolver Digital', 'RU / ENG', 'Windows XP/Vista/7/8/10, 2GB ОП, ATI Radeon 4870 / NVIDIA GeForce 9800 GT', 750.00, 'games/serious-sam-three.webp'),
(34, 'Valorant', '2021', 'Action', 8.1, NULL, NULL, 'Riot Games', 'Riot Games', 'RU / ENG', 'Windows 7/8/10, 4GB ОП, Intel HD 3000', 888.00, 'games/valorant.webp'),
(35, 'Dirt 5', '2020', 'Racing / Simulator', 6.0, NULL, NULL, 'Codemasters', 'Codemasters', 'RU / ENG', 'Windows 10, 8GB ОП, AMD RX 480 / NVIDIA GTX 970', 1099.00, 'games/dirt-five.webp'),
(36, 'Elder Ring', '2022', 'Action / RPG', 7.9, NULL, NULL, 'From Software', 'Bandai Namco Entertainment', 'RU / ENG', 'Windows 10/11, 12 GB ОП, NVIDIA GeForce GTX 1060 / AMD Radeon RX 580', 1200.00, 'games/elder-ring.webp'),
(37, 'SS: Siberian Siberian', '2022', 'Shooter / Adventure', 9.7, NULL, NULL, 'Croteam', 'Devolver Digital', 'RU / ENG', 'Windows 7/8/10/11, 8GB ОП, NVIDIA GeForce 1050 / AMD Radeon 7950', 1700.00, 'games/serious-sam-siberian-mayhem.webp'),
(38, 'Sniper Elite 5', '2022', 'Adventure / Simulator', 5.6, NULL, NULL, 'Rebellion', 'Rebellion', 'RU / ENG', 'Windows 10/11, 8GB ОП, DirectX12 Совместимая', 1130.00, 'games/sniper-elite-five.webp'),
(39, '<<Smuta>>', '2024', 'Adventure / RPG', 3.9, NULL, NULL, 'Pixellcore Inc', 'Freedom Games', 'RU / ENG', 'Windows 10/11, 16GB ОП, NVIDIA GTX 980 / DirectX12', 600.00, 'games/smuta.webp'),
(41, 'Undertale', '2015', 'RPG / Arcade', 9.8, NULL, NULL, 'TobyFox', 'TobyFox', 'RU / ENG', 'Windows XP/7/8/10, 512 MB ОП, Совместимая 128MB', 2000.00, 'games/undertale.webp'),
(42, 'PayDay 2', '2013', 'Action / FPS', 9.0, NULL, NULL, 'Overkill Software', '505 Games', 'RU / ENG', 'Windows XP/Vista/7/8/10, 2GB ОП, NVIDIA GeForce 8800 GT / ATI Radeon HD', 1510.00, 'games/payday-two.webp'),
(43, 'Portal 2', '2011', 'Puzzle / Action', 9.5, NULL, NULL, 'Valve', 'Buka Entertainment', 'RU / ENG', 'Windows XP/Vista/7/8/10, 1GB ОП, Совместимая 512MB', 840.00, 'games/portal-two.webp'),
(44, 'Cry Of Fear', '2013', 'Horror / Shooter', 8.8, NULL, NULL, 'Team Psykskallar', 'Team Psykskallar', 'RU / ENG', 'Windows XP/Vista/7/8, 2GB ОП, NVIDIA GeForce 7800 / AMD Radeon HD', 420.00, 'games/cry-of-fear.webp'),
(45, 'Far Cry 3', '2012', 'Action / Open World', 9.3, NULL, NULL, 'Ubisoft Monreal', 'Ubisoft Entertainment', 'RU / ENG', 'Windows Vista/7/8/10, 2GB ОП, NVIDIA GeForce 8800 GT / AMD Radeon HD Pro', 899.00, 'games/far-cry-three.webp'),
(52, 'Doom 4', '2016', 'Shooter', 8.2, NULL, NULL, 'ID Software', 'Bethesda Softworks', 'RU / ENG', 'Windows 7/8/10, 8GB ОП, NVIDIA GTX 670 / AMD Radeon HD', 1699.00, 'games/doom-four.webp');

-- --------------------------------------------------------

--
-- Структура таблицы `promocodes`
--

CREATE TABLE `promocodes` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount` int(11) NOT NULL CHECK (`discount` between 1 and 100),
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL,
  `used_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `promocodes`
--

INSERT INTO `promocodes` (`id`, `code`, `discount`, `description`, `is_active`, `created_at`, `expires_at`, `used_by`) VALUES
(1, 'STARTER', 10, 'Базовый бонус новым пользователям', 1, '2025-10-01 02:00:00', '2026-10-01 00:00:00', NULL),
(2, 'WINTER', 15, 'Зимние акции на 15%', 1, '2025-10-31 18:00:00', '2026-12-01 00:00:00', NULL),
(3, 'PREMGAMER', 50, 'Ограниченная акция для PREMIUM пользователей', 1, '2025-10-09 21:00:00', NULL, NULL),
(4, 'COOL20', 20, 'Для крутых пользователей на 20%', 1, '2025-09-20 13:00:00', '2026-09-20 20:00:00', NULL),
(5, 'EXPIREDTEST', 5, 'Истекший тестовый промокод', 0, '2025-06-05 17:00:00', '2025-09-05 00:00:00', NULL),
(6, 'NEONVIBE', 30, 'Акция в 30% на все!', 1, '2025-10-25 03:00:00', '2026-06-28 23:00:00', NULL),
(7, 'FUTURE900', 25, 'Хайповая акция на 25%', 1, '2025-09-27 08:00:00', NULL, NULL),
(8, 'PRENEW26', 40, 'Предновогодняя акция 40%', 1, '2025-11-03 11:00:00', '2026-03-15 12:00:00', NULL),
(9, 'TURBO500', 55, 'Премиальная одноразовая скидка на 55%', 1, '2025-11-01 17:00:00', NULL, NULL),
(10, 'ENJOYERPLUS', 17, 'Простая скидка на все в 17%', 1, '2025-10-17 10:30:00', '2026-04-04 04:00:00', NULL),
(11, 'RETRO80', 22, 'Ваша обожаемая ностальгия за 22%', 1, '2025-08-30 12:50:00', '2026-07-10 07:00:00', NULL),
(12, 'SHOPPING100', 10, 'Простая акция на 10%', 1, '2025-10-12 05:30:00', '2026-11-01 11:00:00', NULL),
(13, 'SWAG28', 28, 'Крутая акция на 28%', 1, '2025-09-09 06:30:00', '2026-01-09 00:00:00', NULL),
(14, 'ADVANCEDPACK', 45, 'Для заядлых любителей, одноразовая акция на 45%', 1, '2025-11-01 13:00:00', NULL, NULL),
(15, 'MAKS98', 60, 'Топовая скидка для PREMIUM покупок по 60%', 1, '2025-11-04 04:40:00', NULL, NULL),
(16, 'NOSTALGER', 24, 'Ностальгическая акция всем желающим!', 1, '2025-11-03 07:50:00', NULL, NULL),
(17, 'FIRST30', 30, '30% всем новым пользователям', 1, '2025-11-04 09:00:00', NULL, NULL),
(18, 'PREM40', 40, 'Для PREMIUM пользователей по 40%', 1, '2025-10-27 14:30:00', '2026-05-10 10:00:00', NULL),
(19, 'ENJOYER50', 50, 'Для игроманов на все по 50%', 1, '2025-10-01 11:00:00', '2026-08-25 19:00:00', NULL),
(20, 'SYNTH22', 22, 'Осинтетичные скидки на 22%', 1, '2025-11-05 04:50:00', '2026-12-07 07:00:00', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `purchase_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `promo_used` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` bigint(20) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `role` enum('user','premium','moderator') DEFAULT 'user',
  `avatar_url` varchar(255) DEFAULT NULL,
  `datebirth` date DEFAULT NULL,
  `user_credentials` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `phone`, `balance`, `role`, `avatar_url`, `datebirth`, `user_credentials`, `created_at`) VALUES
(1, 'Player-Default', '123Sec88Test', 'Player@example.ru', 79991234488, 5000.00, 'user', 'avatars/default.png', NULL, NULL, '2025-10-05 06:30:00'),
(2, 'Player-Premium', 'Test777Prem4', 'PlayerPrem@example.ru', 79256003669, 10000.00, 'premium', 'avatars/retro.png', NULL, NULL, '2025-10-06 07:15:00'),
(3, 'MaksimVit', 'Vit9831M5', 'Makson@Yandex.ru', 79501123577, 100000.00, 'moderator', 'avatars/neon.png', '1998-12-31', 'Козлов Максим Витальевич', '2025-09-30 10:00:00');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`game_id`),
  ADD KEY `game_id` (`game_id`);

--
-- Индексы таблицы `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `promocodes`
--
ALTER TABLE `promocodes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `used_by` (`used_by`);

--
-- Индексы таблицы `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`game_id`),
  ADD KEY `game_id` (`game_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT для таблицы `promocodes`
--
ALTER TABLE `promocodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT для таблицы `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `promocodes`
--
ALTER TABLE `promocodes`
  ADD CONSTRAINT `promocodes_ibfk_1` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

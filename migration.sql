-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2024 at 10:56 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ghm`
--

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `created_at`, `updated_at`) VALUES
(1, 'Men Polo', 23000.00, '2024-11-10 16:07:15.641', '2024-11-10 16:07:15.641'),
(2, 'Beat Headset', 120000.00, '2024-11-10 16:07:15.641', '2024-11-10 16:07:15.641'),
(3, 'Airpod 4.3', 40000.00, '2024-11-10 16:07:15.641', '2024-11-10 16:07:15.641');

--
-- Dumping data for table `product_photos`
--

INSERT INTO `product_photos` (`id`, `product_id`, `file`, `is_cover`) VALUES
(1, 1, 'uploads/shop/shirt.jpg', 1),
(2, 1, 'uploads/shop/shirt2.jpg', 0),
(3, 2, 'uploads/shop/headset.jpg', 1),
(4, 3, 'uploads/shop/airpod.png', 1),
(5, 3, 'uploads/shop/airpod2.jpeg', 0),
(6, 3, 'uploads/shop/airpod3.jpeg', 0),
(7, 3, 'uploads/shop/airpod4.jpeg', 0);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: skincare_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analysis_histories`
--

DROP TABLE IF EXISTS `analysis_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analysis_histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `skin_type_label` varchar(50) NOT NULL,
  `skin_type_conf` float NOT NULL,
  `problems_data` json DEFAULT NULL,
  `advices_data` json DEFAULT NULL,
  `sharpness_score` float DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `ix_analysis_histories_id` (`id`),
  CONSTRAINT `analysis_histories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analysis_histories`
--

LOCK TABLES `analysis_histories` WRITE;
/*!40000 ALTER TABLE `analysis_histories` DISABLE KEYS */;
INSERT INTO `analysis_histories` VALUES (1,1,'error_upload','oily_skin',0.97,'[{\"box\": [152.4, 14.82, 298.83, 202.44], \"label\": \"Combination skin\", \"confidence\": 0.3}]','[{\"title\": \"Chăm sóc Da dầu\", \"content\": \"Sử dụng sữa rửa mặt dạng Gel có pH 5.5. Dùng Niacinamide để kiềm dầu và chọn dưỡng ẩm dạng Lotion mỏng nhẹ.\"}]',926.31,'2026-05-17 15:07:08'),(2,1,'error_upload','oily_skin',0.93,'[{\"box\": [14.88, 89.07, 184.3, 226.56], \"label\": \"Freckles\", \"confidence\": 0.75}, {\"box\": [9.62, 3.14, 184.28, 195.01], \"label\": \"Freckles\", \"confidence\": 0.11}, {\"box\": [6.45, 1.35, 185.15, 179.76], \"label\": \"Oily skin\", \"confidence\": 0.11}]','[{\"title\": \"Chăm sóc Da dầu\", \"content\": \"Sử dụng sữa rửa mặt dạng Gel có pH 5.5. Dùng Niacinamide để kiềm dầu và chọn dưỡng ẩm dạng Lotion mỏng nhẹ.\"}]',1565.36,'2026-05-17 15:07:26'),(3,1,'error_upload','combination_skin',0.99,'[{\"box\": [4.08, 11.27, 200.0, 177.46], \"label\": \"Blackheads\", \"confidence\": 0.2}]','[{\"title\": \"Chăm sóc Da hỗn hợp\", \"content\": \"Tập trung làm sạch kỹ vùng chữ T (trán, mũi, cằm) và dưỡng ẩm sâu cho vùng chữ U (hai bên má).\"}]',185.05,'2026-05-17 15:07:46'),(4,1,'error_upload','oily_skin',0.55,'[{\"box\": [405.21, 409.86, 1961.11, 1681.12], \"label\": \"Oily skin\", \"confidence\": 0.34}, {\"box\": [17.46, 238.93, 1950.02, 1646.99], \"label\": \"Oily skin\", \"confidence\": 0.14}, {\"box\": [482.69, 771.74, 1631.16, 1770.94], \"label\": \"Freckles\", \"confidence\": 0.11}]','[{\"title\": \"Chăm sóc Da dầu\", \"content\": \"Sử dụng sữa rửa mặt dạng Gel có pH 5.5. Dùng Niacinamide để kiềm dầu và chọn dưỡng ẩm dạng Lotion mỏng nhẹ.\"}]',84.42,'2026-05-17 15:08:05'),(5,1,'error_upload','oily_skin',0.95,'[{\"box\": [73.04, 217.28, 354.04, 478.06], \"label\": \"Wrinkles\", \"confidence\": 0.38}, {\"box\": [58.82, 210.63, 351.12, 474.58], \"label\": \"Oily skin\", \"confidence\": 0.35}, {\"box\": [23.1, 125.75, 364.01, 455.06], \"label\": \"Oily skin\", \"confidence\": 0.15}]','[{\"title\": \"Chăm sóc Da dầu\", \"content\": \"Sử dụng sữa rửa mặt dạng Gel có pH 5.5. Dùng Niacinamide để kiềm dầu và chọn dưỡng ẩm dạng Lotion mỏng nhẹ.\"}]',198.73,'2026-05-17 15:08:28'),(6,1,'error_upload','oily_skin',0.98,'[{\"box\": [106.78, 27.61, 270.82, 191.36], \"label\": \"Wrinkles\", \"confidence\": 0.27}, {\"box\": [101.79, 26.85, 270.33, 198.46], \"label\": \"Oily skin\", \"confidence\": 0.14}]','[{\"title\": \"Chăm sóc Da dầu\", \"content\": \"Sử dụng sữa rửa mặt dạng Gel có pH 5.5. Dùng Niacinamide để kiềm dầu và chọn dưỡng ẩm dạng Lotion mỏng nhẹ.\"}]',859.6,'2026-05-17 15:13:38'),(7,1,'error_upload','Da dầu',0.97,'[{\"box\": [23.82, 26.43, 194.49, 197.76], \"label\": \"Da dầu\", \"confidence\": 0.41}]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',908.74,'2026-05-17 15:14:02'),(8,1,'error_upload','Da dầu',0.97,'[{\"box\": [0.0611, 0.0944, 0.4987, 0.7063], \"label\": \"Da dầu\", \"confidence\": 0.41}]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',908.74,'2026-05-17 15:19:35'),(9,1,'error_upload','Da khô',0.52,'[{\"box\": [0.0984, 0.3537, 0.9287, 0.7664], \"label\": \"Tàn nhang\", \"confidence\": 0.76}]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',599.72,'2026-05-17 15:19:50'),(10,1,'error_upload','Da dầu',0.95,'[{\"box\": [0.1584, 0.355, 0.768, 0.7811], \"label\": \"Nếp nhăn\", \"confidence\": 0.38}, {\"box\": [0.1276, 0.3442, 0.7616, 0.7755], \"label\": \"Da dầu\", \"confidence\": 0.35}]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',198.73,'2026-05-17 15:20:02'),(11,1,'error_upload','Da hỗn hợp',0.89,'[]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',94.32,'2026-05-17 15:20:23'),(12,1,'error_upload','Da dầu',0.97,'[]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',370.46,'2026-05-17 15:23:08'),(13,1,'error_upload','Da dầu',0.83,'[{\"box\": [0.4162, 0.4255, 1.0, 0.9894], \"label\": \"Tàn nhang\", \"confidence\": 0.44}, {\"box\": [0.0623, 0.1783, 0.7129, 0.8983], \"label\": \"Mụn đầu đen\", \"confidence\": 0.34}, {\"box\": [0.4925, 0.4566, 0.9994, 1.0], \"label\": \"Mụn đầu đen\", \"confidence\": 0.29}, {\"box\": [0.1548, 0.1468, 0.8675, 0.8987], \"label\": \"Mụn đầu đen\", \"confidence\": 0.27}]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',43.62,'2026-05-17 15:25:08'),(14,1,'error_upload','Da dầu',0.83,'[{\"box\": [0.4162, 0.4255, 1.0, 0.9894], \"label\": \"Tàn nhang\", \"confidence\": 0.44}, {\"box\": [0.0623, 0.1783, 0.7129, 0.8983], \"label\": \"Mụn đầu đen\", \"confidence\": 0.34}, {\"box\": [0.4925, 0.4566, 0.9994, 1.0], \"label\": \"Mụn đầu đen\", \"confidence\": 0.29}, {\"box\": [0.1548, 0.1468, 0.8675, 0.8987], \"label\": \"Mụn đầu đen\", \"confidence\": 0.27}]','[{\"title\": \"Tàn nhang\", \"content\": \"Luôn dùng kem chống nắng quang phổ rộng để tránh tàn nhang đậm màu hơn.\"}, {\"title\": \"Mụn đầu đen\", \"content\": \"Sử dụng tẩy tế bào chết hóa học (BHA) để làm sạch lỗ chân lông.\"}]',43.62,'2026-05-17 15:38:42'),(15,1,'error_upload','Da hỗn hợp',0.53,'[]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',887.34,'2026-05-17 15:39:05'),(16,1,'error_upload','Da hỗn hợp',0.97,'[{\"box\": [0.0533, 0.0051, 1.0, 0.992], \"label\": \"Lỗ chân lông to\", \"confidence\": 0.29}]','[{\"title\": \"Lỗ chân lông to\", \"content\": \"Kết hợp dùng Retinoids và đắp mặt nạ đất sét hàng tuần.\"}]',311.19,'2026-05-17 15:39:14'),(17,1,'error_upload','Da dầu',0.64,'[{\"box\": [0.0092, 0.154, 0.9945, 0.9132], \"label\": \"Mụn đầu đen\", \"confidence\": 0.49}]','[{\"title\": \"Mụn đầu đen\", \"content\": \"Sử dụng tẩy tế bào chết hóa học (BHA) để làm sạch lỗ chân lông.\"}]',51.51,'2026-05-17 15:39:30'),(18,1,'error_upload','Da dầu',0.94,'[{\"box\": [0.2395, 0.0529, 0.9838, 0.8475], \"label\": \"Da dầu\", \"confidence\": 0.44}, {\"box\": [0.2455, 0.1511, 0.907, 0.8385], \"label\": \"Nếp nhăn\", \"confidence\": 0.32}]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',369.93,'2026-05-17 15:53:19'),(19,1,'error_upload','Da hỗn hợp',0.99,'[]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',185.05,'2026-05-17 15:53:56'),(20,1,'error_upload','Da hỗn hợp',0.89,'[]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',94.32,'2026-05-17 15:54:08'),(21,1,'error_upload','Da dầu',0.98,'[{\"box\": [0.2738, 0.0986, 0.6944, 0.6834], \"label\": \"Nếp nhăn\", \"confidence\": 0.27}]','[{\"title\": \"Chăm sóc cơ bản\", \"content\": \"Duy trì làm sạch và chống nắng hàng ngày.\"}]',859.6,'2026-05-17 15:55:22');
/*!40000 ALTER TABLE `analysis_histories` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-17 23:20:23

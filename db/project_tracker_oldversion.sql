-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 06, 2025 at 06:32 AM
-- Server version: 8.0.41
-- PHP Version: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_tracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department` varchar(100) NOT NULL,
  `project_title` varchar(255) NOT NULL,
  `description` text,
  `focal_in_charge` varchar(100) NOT NULL,
  `vendor_name` varchar(100) DEFAULT NULL,
  `wo_issuance_date` date DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `timeline` varchar(50) DEFAULT NULL,
  `revised_timeline` varchar(50) DEFAULT NULL,
  `dependencies_risks` text,
  `key_deliverables` text,
  `milestones_achieved` text,
  `budget` decimal(15,2) DEFAULT '0.00',
  `po_value` decimal(15,2) DEFAULT '0.00',
  `budget_utilization` decimal(5,2) DEFAULT '0.00',
  `ytd_utilization` decimal(15,2) DEFAULT '0.00',
  `projected_next_qtr_utilization` decimal(15,2) DEFAULT '0.00',
  `balance` decimal(15,2) DEFAULT '0.00',
  `total_yep` decimal(15,2) DEFAULT '0.00',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `department`, `project_title`, `description`, `focal_in_charge`, `vendor_name`, `wo_issuance_date`, `status`, `timeline`, `revised_timeline`, `dependencies_risks`, `key_deliverables`, `milestones_achieved`, `budget`, `po_value`, `budget_utilization`, `ytd_utilization`, `projected_next_qtr_utilization`, `balance`, `total_yep`, `remarks`, `created_at`, `updated_at`) VALUES
(83, 'IT', 'Sample Project', 'Project Description', 'John Smith', 'Vendor ABC', NULL, 'Planned', 'Q2 2025', 'Q3 2025', 'List key dependencies and risks here', 'List key deliverables here', 'List achieved milestones here', 100000.00, 90000.00, 90.00, 20000.00, 0.00, 70000.00, 90000.00, 'Some Remark, <div id=\"pdfContent\">\r\n        <div class=\"banner\">\r\n            MPSO - FIELD OFFICER LEADERBOARD\r\n            <button id=\"exportPdf\" style=\"display: none;\">Export as PDF</button>\r\n        </div>\r\n        <div class=\"content\">\r\n            <input type=\"file\" id=\"uploadExcel\" accept=\".xlsx, .xls\">\r\n            <div id=\"charts\"></div>\r\n        </div>\r\n    </div>', '2025-04-05 19:11:18', '2025-04-05 19:11:18'),
(85, 'Retail/ALDS - HO', 'Project 2', 'Description of Project 2', 'Person 7', 'Vendor 2', '2025-01-14', 'On Hold', '4/8/25', '5/20/25', 'Dependency 5', 'Deliverable 1', '3', 2310377.00, 3827559.00, 42.00, 105457.00, 0.00, 2204920.00, 6137936.00, 'Remark 9', '2025-04-05 19:11:19', '2025-04-05 19:11:19'),
(86, 'IT', 'Project 3', 'Description of Project 3', 'Person 7', 'Vendor 5', '2024-06-25', 'Planned', '4/1/25', '8/23/25', 'Dependency 4', 'Deliverable 3', '3', 4922109.00, 4945352.00, 9.00, 427635.00, 0.00, 4494474.00, 9867461.00, 'Remark 5', '2025-04-05 19:11:19', '2025-04-05 19:11:19'),
(87, 'Terminal - Haldia', 'Project 4', 'Description of Project 4', 'Person 5', 'Vendor 3', '2023-11-12', 'Planned', '5/29/24', '8/22/25', 'Dependency 4', 'Deliverable 4', '4', 1182715.00, 2395330.00, 72.00, 628690.00, 0.00, 554025.00, 3578045.00, 'Remark 2', '2025-04-05 19:11:20', '2025-04-05 19:11:20'),
(88, 'HR', 'Project 5', 'Description of Project 5', 'Person 5', 'Vendor 3', '2024-09-22', 'Completed', '7/26/25', '10/19/25', 'Dependency 3', 'Deliverable 4', '1', 3519174.00, 1529719.00, 100.00, 99832.00, 0.00, 3419342.00, 5048893.00, 'Remark 2', '2025-04-05 19:11:20', '2025-04-05 19:11:20'),
(89, 'Terminal - Haldia', 'Project 6', 'Description of Project 6', 'Person 7', 'Vendor 2', '2024-07-19', 'In Progress', '7/10/25', '5/30/25', 'Dependency 5', 'Deliverable 3', '4', 2454708.00, 4880829.00, 27.00, 234255.00, 0.00, 2220453.00, 7335537.00, 'Remark 3', '2025-04-05 19:11:21', '2025-04-05 19:11:21'),
(90, 'Others', 'Project 7', 'Description of Project 7', 'Person 6', 'Vendor 3', '2024-10-26', 'Completed', '4/25/25', '8/24/25', 'Dependency 3', 'Deliverable 1', '4', 3400834.00, 4191919.00, 52.00, 785609.00, 0.00, 2615225.00, 7592753.00, 'Remark 9', '2025-04-05 19:11:21', '2025-04-05 19:11:21'),
(91, 'Others', 'Project 11', 'Description of Project 11', 'Person 10', 'Vendor 2', NULL, 'In Progress', '8/22/25', '4/27/25', 'Dependency 3', 'Deliverable 1', '4', 1415921.00, 2121860.00, 65.00, 710627.00, 0.00, 705294.00, 3537781.00, 'Remark 6, this is ipsum lorem,<div id=\"pdfContent\">\r\n        <div class=\"banner\">\r\n            MPSO - FIELD OFFICER LEADERBOARD\r\n            <button id=\"exportPdf\" style=\"display: none;\">Export as PDF</button>\r\n        </div>\r\n        <div class=\"content\">\r\n            <input type=\"file\" id=\"uploadExcel\" accept=\".xlsx, .xls\">\r\n            <div id=\"charts\"></div>\r\n        </div>\r\n    </div>', '2025-04-05 19:11:22', '2025-04-05 19:11:22'),
(92, 'Others', 'Project 12', 'Description of Project 12', 'Person 4', 'Vendor 2', '2024-05-19', 'Completed', '5/30/25', '5/14/25', 'Dependency 1', 'Deliverable 3', '0', 3483861.00, 4338333.00, 17.00, 564066.00, 0.00, 2919795.00, 7822194.00, 'Remark 3', '2025-04-05 19:11:23', '2025-04-05 19:11:23'),
(93, 'Finance', 'Project 13', 'Description of Project 13', 'Person 9', 'Vendor 1', '2024-06-08', 'In Progress', '5/16/25', '10/1/25', 'Dependency 4', 'Deliverable 2', '4', 1720216.00, 4962905.00, 91.00, 548917.00, 0.00, 1171299.00, 6683121.00, 'Remark 6', '2025-04-05 19:11:23', '2025-04-05 19:11:23'),
(94, 'HR', 'Project 14', 'Description of Project 14', 'Person 5', 'Vendor 5', '2024-12-01', 'In Progress', '4/29/25', '5/8/25', 'Dependency 3', 'Deliverable 2', '1', 2706162.00, 3300315.00, 59.00, 382047.00, 0.00, 2324115.00, 6006477.00, 'Remark 5', '2025-04-05 19:11:24', '2025-04-05 19:11:24'),
(95, 'Terminal - Haldia', 'Project 15', 'Description of Project 15', 'Person 3', 'Vendor 1', '2024-05-16', 'Planned', '4/11/25', '7/17/25', 'Dependency 1', 'Deliverable 4', '5', 2783088.00, 1678977.00, 3.00, 264536.00, 0.00, 2518552.00, 4462065.00, 'Remark 9', '2025-04-05 19:11:24', '2025-04-05 19:11:24'),
(96, 'Finance', 'Project 16', 'Description of Project 16', 'Person 3', 'Vendor 4', '2024-03-18', 'Planned', '4/19/25', '5/17/25', 'Dependency 2', 'Deliverable 3', '2', 3492494.00, 1757016.00, 73.00, 920405.00, 0.00, 2572089.00, 5249510.00, 'Remark 5', '2025-04-05 19:11:25', '2025-04-05 19:11:25'),
(97, 'Retail/ALDS - HO', 'Project 17', 'Description of Project 17', 'Person 7', 'Vendor 2', '2024-08-28', 'Completed', '5/4/25', '5/14/25', 'Dependency 3', 'Deliverable 5', '2', 2187832.00, 1774952.00, 77.00, 998146.00, 0.00, 1189686.00, 3962784.00, 'Remark 1', '2025-04-05 19:11:25', '2025-04-05 19:11:25'),
(98, 'Others', 'Project 18', 'Description of Project 18', 'Person 1', 'Vendor 1', '2024-08-10', 'In Progress', '4/11/25', '6/28/25', 'Dependency 5', 'Deliverable 3', '1', 4988256.00, 732150.00, 58.00, 419023.00, 0.00, 4569233.00, 5720406.00, 'Remark 6', '2025-04-05 19:11:26', '2025-04-05 19:11:26'),
(99, 'Terminal - Ennore', 'Project 19', 'Description of Project 19', 'Person 10', 'Vendor 2', NULL, 'Planned', '7/13/25', '7/24/25', 'Dependency 2', 'Deliverable 3', '4', 507500.00, 2014231.00, 100.28, 508906.00, 0.00, 1505325.00, 2014231.00, 'Remark 5', '2025-04-05 19:11:26', '2025-04-05 19:11:26'),
(100, 'Terminal - Haldia', 'Project 20', 'Description of Project 20', 'Person 5', 'Vendor 2', '2024-11-12', 'In Progress', '7/31/25', '10/6/25', 'Dependency 3', 'Deliverable 2', '1', 719834.00, 1797287.00, 35.00, 749189.00, 0.00, -29355.00, 2517121.00, 'Remark 6', '2025-04-05 19:11:27', '2025-04-05 19:11:27'),
(101, 'Marketing & Operations - HO', 'Project 5', 'Description of Project 21', 'Person 4', 'Vendor 3', '2024-02-29', 'Completed', '7/31/25', '7/14/25', 'Dependency 1', 'Deliverable 4', '4', 3779039.00, 3005165.00, 84.00, 995458.00, 0.00, 2783581.00, 6784204.00, 'Remark 1', '2025-04-05 19:11:27', '2025-04-05 19:11:27'),
(102, 'HR', 'Project 6', 'Description of Project 22', 'Person 7', 'Vendor 3', '2024-03-20', 'In Progress', '8/15/25', '9/11/25', 'Dependency 4', 'Deliverable 4', '2', 872432.00, 1269364.00, 64.00, 486978.00, 0.00, 385454.00, 2141796.00, 'Remark 1', '2025-04-05 19:11:28', '2025-04-05 19:11:28'),
(103, 'Others', 'Project 7', 'Description of Project 23', 'Person 2', 'Vendor 1', '2024-09-20', 'On Hold', '4/29/25', '7/17/25', 'Dependency 2', 'Deliverable 1', '4', 3193820.00, 3474031.00, 79.00, 287832.00, 0.00, 2905988.00, 6667851.00, 'Remark 4', '2025-04-05 19:11:28', '2025-04-05 19:11:28'),
(104, 'Retail/ALDS - HO', 'Project 8', 'Description of Project 24', 'Person 1', 'Vendor 2', '2024-08-24', 'Planned', '4/2/25', '6/28/25', 'Dependency 3', 'Deliverable 1', '4', 1396168.00, 1776696.00, 4.00, 923167.00, 0.00, 473001.00, 3172864.00, 'Remark 1', '2025-04-05 19:11:29', '2025-04-05 19:11:29'),
(105, 'Retail/ALDS - HO', 'Project 9', 'Description of Project 25', 'Person 5', 'Vendor 5', '2024-03-07', 'Completed', '8/10/25', '9/8/25', 'Dependency 4', 'Deliverable 3', '0', 1858738.00, 3221045.00, 100.00, 885381.00, 0.00, 973357.00, 5079783.00, 'Remark 6', '2025-04-05 19:11:30', '2025-04-05 19:11:30'),
(106, 'Retail/ALDS - HO', 'Project 26', 'Description of Project 26', 'Person 10', 'Vendor 3', '2024-08-31', 'Planned', '5/24/25', '4/29/25', 'Dependency 1', 'Deliverable 2', '5', 2349019.00, 1416873.00, 6.00, 470948.00, 0.00, 1878071.00, 3765892.00, 'Remark 8', '2025-04-05 19:11:30', '2025-04-05 19:11:30'),
(107, 'Marketing & Operations - HO', 'Project 27', 'Description of Project 27', 'Person 8', 'Vendor 2', '2024-12-03', 'Planned', '8/20/25', '6/20/25', 'Dependency 3', 'Deliverable 5', '5', 835390.00, 4119434.00, 69.00, 961955.00, 0.00, -126565.00, 4954824.00, 'Remark 1', '2025-04-05 19:11:31', '2025-04-05 19:11:31'),
(108, 'Finance', 'Project 28', 'Description of Project 28', 'Person 4', 'Vendor 4', '2024-08-08', 'In Progress', '7/22/25', '5/25/25', 'Dependency 1', 'Deliverable 4', '2', 3312882.00, 1716761.00, 74.00, 532362.00, 0.00, 2780520.00, 5029643.00, 'Remark 10', '2025-04-05 19:11:31', '2025-04-05 19:11:31'),
(109, 'Others', 'Project 29', 'Description of Project 29', 'Person 3', 'Vendor 3', '2024-12-13', 'Planned', '6/19/25', '8/11/25', 'Dependency 3', 'Deliverable 5', '5', 1371788.00, 2506929.00, 50.00, 118691.00, 0.00, 1253097.00, 3878717.00, 'Remark 8', '2025-04-05 19:11:32', '2025-04-05 19:11:32'),
(110, 'Terminal - Haldia', 'Project 30', 'Description of Project 30', 'Person 2', 'Vendor 2', '2024-10-27', 'On Hold', '7/26/25', '9/26/25', 'Dependency 4', 'Deliverable 2', '2', 712506.00, 2520602.00, 60.00, 213905.00, 0.00, 498601.00, 3233108.00, 'Remark 7', '2025-04-05 19:11:32', '2025-04-05 19:11:32');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `is_admin`, `created_at`) VALUES
(1, 'admin', '$2y$10$dNeaTY33iLBoHdmhW/b3rOp8/9NIdNfuww9eLLG09XEzxIljSpBne', 1, '2025-04-05 20:56:58'),
(2, 'Haldia', '$2y$10$9a9rhxNjNZhyfa5QlE8sEuyXfThGFNQwdFWHoJcpQqMPGNxEyaDzW', 0, '2025-04-05 20:59:21'),
(3, 'Ennore', '$2y$10$AKQnKvE7P6XfAohedEHTM.eCxjYuaR3n/Mw2nDFVLJLG8.t7Y/Jl.', 0, '2025-04-05 21:54:07'),
(4, 'HR', '$2y$10$NRcOuyZdAuqdF9EGKf03fu0R1GcI.OWv.1w9HIVUf13oHfPsrg9ey', 0, '2025-04-05 21:56:22');

-- --------------------------------------------------------

--
-- Table structure for table `user_department_mapping`
--

DROP TABLE IF EXISTS `user_department_mapping`;
CREATE TABLE IF NOT EXISTS `user_department_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `department` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_dept` (`user_id`,`department`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_department_mapping`
--

INSERT INTO `user_department_mapping` (`id`, `user_id`, `department`) VALUES
(1, 2, 'Terminal - Haldia'),
(2, 3, 'Terminal - Ennore'),
(3, 4, 'HR'),
(4, 4, 'Others');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user_department_mapping`
--
ALTER TABLE `user_department_mapping`
  ADD CONSTRAINT `user_department_mapping_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

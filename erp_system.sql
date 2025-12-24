-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 24, 2025 at 09:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `erp_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE `applicants` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `job_posting_id` varchar(36) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `resume_path` varchar(500) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `application_date` date NOT NULL,
  `status` enum('APPLIED','SCREENING','INTERVIEWED','OFFERED','HIRED','REJECTED') DEFAULT 'APPLIED',
  `interview_date` datetime DEFAULT NULL,
  `interview_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approval_history`
--

CREATE TABLE `approval_history` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `request_id` varchar(36) NOT NULL,
  `step_number` int(11) NOT NULL,
  `approver_id` varchar(36) NOT NULL,
  `action` enum('APPROVED','REJECTED','RETURNED') NOT NULL,
  `comments` text DEFAULT NULL,
  `action_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approval_requests`
--

CREATE TABLE `approval_requests` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `workflow_id` varchar(36) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `document_id` varchar(36) NOT NULL,
  `document_number` varchar(50) NOT NULL,
  `current_step` int(11) DEFAULT 1,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',
  `requested_by` varchar(36) NOT NULL,
  `requested_date` datetime DEFAULT current_timestamp(),
  `completed_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approval_workflows`
--

CREATE TABLE `approval_workflows` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `workflow_name` varchar(200) NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `approval_levels` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approval_workflow_steps`
--

CREATE TABLE `approval_workflow_steps` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `workflow_id` varchar(36) NOT NULL,
  `step_number` int(11) NOT NULL,
  `step_name` varchar(200) NOT NULL,
  `approver_role` varchar(100) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `employee_id` varchar(36) NOT NULL,
  `attendance_date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('PRESENT','LATE','ABSENT','UNDERTIME','HALF_DAY','ON_LEAVE') DEFAULT 'PRESENT',
  `hours_worked` decimal(5,2) DEFAULT NULL,
  `overtime_hours` decimal(5,2) DEFAULT 0.00,
  `is_validated` tinyint(1) DEFAULT 0,
  `validated_by` varchar(36) DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(50) NOT NULL,
  `record_id` varchar(36) DEFAULT NULL,
  `record_type` varchar(50) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` enum('SUCCESS','FAILED') NOT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `module`, `record_id`, `record_type`, `old_value`, `new_value`, `ip_address`, `user_agent`, `status`, `error_message`, `created_at`) VALUES
(1, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'FAILED', 'Invalid password', '2025-12-23 16:28:27'),
(2, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'FAILED', 'Invalid password', '2025-12-23 16:29:01'),
(3, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'FAILED', 'Invalid password', '2025-12-23 16:29:04'),
(4, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'FAILED', 'Invalid password', '2025-12-23 16:29:33'),
(5, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'FAILED', 'Invalid password', '2025-12-23 16:29:43'),
(6, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 16:30:03'),
(7, 'hr-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hr\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 16:35:28'),
(8, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 16:38:29'),
(9, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:04:45'),
(10, 'purch-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:05:02'),
(11, 'purch-001', 'CREATE', 'purchase_requisitions', '9b317566-e021-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0001\",\"prDate\":\"2025-12-23\",\"department\":\"Maintenance\",\"items\":[{\"itemId\":\"357b14c5-e01c-11f0-93ac-74d435ebdbb2\",\"quantity\":500,\"estimatedUnitPrice\":5.5,\"estimatedTotalPrice\":2750,\"requiredDate\":\"2025-12-29\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:05:38'),
(12, 'purch-001', 'SUBMIT', 'purchase_requisitions', '9b317566-e021-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:05:46'),
(13, 'dh-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"depthead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:06:27'),
(14, 'dh-001', 'APPROVE', 'purchase_requisitions', '9b317566-e021-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:06:35'),
(15, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:06:57'),
(16, 'dh-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"depthead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:08:51'),
(17, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:08:57'),
(18, 'purch-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:09:02'),
(19, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:09:12'),
(20, 'purch-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:09:51'),
(21, 'gm-001', 'CREATE', 'purchase_orders', 'cd2fe33e-e022-11f0-93ac-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0001\",\"prId\":\"9b317566-e021-11f0-93ac-74d435ebdbb2\",\"supplierId\":\"357c7771-e01c-11f0-93ac-74d435ebdbb2\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:14:12'),
(22, 'gm-001', 'CREATE', 'purchase_orders', 'd633254f-e022-11f0-93ac-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0002\",\"poDate\":\"2025-12-23\",\"supplierId\":\"357c7771-e01c-11f0-93ac-74d435ebdbb2\",\"totalAmount\":2750}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:14:27'),
(23, 'gm-001', 'CREATE', 'purchase_orders', 'df90785c-e022-11f0-93ac-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0003\",\"poDate\":\"2025-12-22\",\"supplierId\":\"357c7771-e01c-11f0-93ac-74d435ebdbb2\",\"totalAmount\":2750}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:14:42'),
(24, 'purch-001', 'CREATE', 'purchase_orders', 'f85c2c2c-e022-11f0-93ac-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0004\",\"poDate\":\"2025-12-23\",\"supplierId\":\"357c7771-e01c-11f0-93ac-74d435ebdbb2\",\"totalAmount\":2750}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:15:24'),
(25, 'purch-001', 'CREATE', 'purchase_requisitions', 'a2aa5d41-e023-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0001\",\"prDate\":\"2025-12-23\",\"department\":\"Maintenance\",\"items\":[{\"itemId\":\"357b14c5-e01c-11f0-93ac-74d435ebdbb2\",\"quantity\":500,\"estimatedUnitPrice\":5.5,\"estimatedTotalPrice\":2750,\"requiredDate\":\"2025-12-28\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:20:10'),
(26, 'purch-001', 'DELETE', 'purchase_requisitions', 'a2aa5d41-e023-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', NULL, NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:21:19'),
(27, 'purch-001', 'CREATE', 'purchase_requisitions', '2cbd5568-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0001\",\"prDate\":\"2025-12-23\",\"department\":\"Maintenance\",\"items\":[{\"itemId\":\"357b14c5-e01c-11f0-93ac-74d435ebdbb2\",\"quantity\":50,\"estimatedUnitPrice\":5.5,\"estimatedTotalPrice\":275,\"requiredDate\":\"2025-12-31\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:24:01'),
(28, 'purch-001', 'DELETE', 'purchase_requisitions', '2cbd5568-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', NULL, NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:25:39'),
(29, 'purch-001', 'CREATE', 'purchase_requisitions', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0001\",\"prDate\":\"2025-12-23\",\"department\":\"Maintenance\",\"items\":[{\"itemId\":\"357b5381-e01c-11f0-93ac-74d435ebdbb2\",\"quantity\":50,\"estimatedUnitPrice\":45,\"estimatedTotalPrice\":2250,\"requiredDate\":\"2025-12-30\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:26:14'),
(30, 'purch-001', 'UPDATE', 'purchase_requisitions', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prDate\":\"2025-12-22\",\"department\":\"Maintenance\",\"items\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:28:00'),
(31, 'purch-001', 'UPDATE', 'purchase_requisitions', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prDate\":\"2025-12-22\",\"department\":\"Maintenance\",\"items\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:28:00'),
(32, 'purch-001', 'UPDATE', 'purchase_requisitions', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prDate\":\"2025-12-21\",\"department\":\"Maintenance\",\"items\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:31:53'),
(33, 'purch-001', 'SUBMIT', 'purchase_requisitions', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:32:12'),
(34, 'gm-001', 'APPROVE', 'purchase_requisitions', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:32:21'),
(35, 'gm-001', 'CREATE', 'purchase_orders', '5c4ea8c5-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0001\",\"prId\":\"7b9f2c37-e024-11f0-93ac-74d435ebdbb2\",\"supplierId\":\"357c7771-e01c-11f0-93ac-74d435ebdbb2\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:32:31'),
(36, 'gm-001', 'UPDATE', 'purchase_orders', '5c4ea8c5-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:32:51'),
(37, 'gm-001', 'APPROVE', 'purchase_orders', '5c4ea8c5-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:32:57'),
(38, 'gm-001', 'CREATE', 'purchase_requisitions', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0002\",\"prDate\":\"2025-12-23\",\"department\":\"Executive\",\"items\":[{\"itemId\":\"357b560d-e01c-11f0-93ac-74d435ebdbb2\",\"quantity\":50,\"estimatedUnitPrice\":12.5,\"estimatedTotalPrice\":625,\"requiredDate\":\"2025-12-31\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:33:23'),
(39, 'gm-001', 'SUBMIT', 'purchase_requisitions', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:33:26'),
(40, 'gm-001', 'APPROVE', 'purchase_requisitions', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:33:36'),
(41, 'gm-001', 'CREATE', 'purchase_orders', '8d122fdd-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0002\",\"prId\":\"7b686fd2-e025-11f0-93ac-74d435ebdbb2\",\"supplierId\":\"357c9d3f-e01c-11f0-93ac-74d435ebdbb2\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:33:52'),
(42, 'gm-001', 'UPDATE', 'purchase_orders', '8d122fdd-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', NULL, '{\"poDate\":\"2025-12-23\",\"supplierId\":\"357c9d3f-e01c-11f0-93ac-74d435ebdbb2\",\"items\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:34:09'),
(43, 'gm-001', 'UPDATE', 'purchase_orders', '8d122fdd-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:34:18'),
(44, 'gm-001', 'APPROVE', 'purchase_orders', '8d122fdd-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:34:21'),
(45, 'purch-001', 'SEND', 'purchase_orders', '5c4ea8c5-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', '{\"status\":\"APPROVED\"}', '{\"status\":\"SENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:35:13'),
(46, 'purch-001', 'SEND', 'purchase_orders', '8d122fdd-e025-11f0-93ac-74d435ebdbb2', 'purchase_orders', '{\"status\":\"APPROVED\"}', '{\"status\":\"SENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 17:35:14'),
(47, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"warehouse\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:35:56'),
(48, 'hr-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hr\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:45:41'),
(49, 'purch-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:45:58'),
(50, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'FAILED', 'Invalid password', '2025-12-23 17:46:09'),
(51, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"warehouse\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:46:12'),
(52, 'purch-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:46:16'),
(53, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"warehouse\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:46:29'),
(54, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"warehouse\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 17:57:10'),
(55, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"warehouse\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:09:56'),
(56, 'purch-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:12:32'),
(57, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"warehouse\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:28:24'),
(58, 'ware-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"warehouse\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:30:43'),
(59, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:32:54'),
(60, 'gm-001', 'APPROVE', 'stock_issues', '2', 'stock_issues', NULL, '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 18:34:22'),
(61, 'gm-001', 'APPROVE', 'stock_issues', '1', 'stock_issues', NULL, '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 18:34:23'),
(62, 'ware-001', 'COMPLETE', 'stock_issues', '2', 'stock_issues', NULL, '{\"stock_issued\":true}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 18:39:07'),
(63, 'ware-001', 'COMPLETE', 'stock_issues', '1', 'stock_issues', NULL, '{\"stock_issued\":true}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 18:39:09'),
(64, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:41:52'),
(65, 'admin-001', 'UPDATE', 'users', 'plan-001', 'users', '{\"email\":\"planner@erp.com\",\"role\":\"\",\"isActive\":1}', '{\"role\":\"PRODUCTION_PLANNER\",\"isActive\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 18:42:15'),
(66, 'plan-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"planner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:42:48'),
(67, 'plan-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"planner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:43:02'),
(68, 'plan-001', 'CREATE', 'work_orders', '0', 'work_orders', NULL, '{\"woNumber\":\"WO-0001\",\"itemId\":\"357b5381-e01c-11f0-93ac-74d435ebdbb2\",\"plannedQuantity\":10}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 18:54:29'),
(69, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:55:45'),
(70, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:57:40'),
(71, 'super-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"supervisor\",\"role\":\"PRODUCTION_SUPERVISOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:58:15'),
(72, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 18:58:24'),
(73, 'super-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"supervisor\",\"role\":\"PRODUCTION_SUPERVISOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 19:00:22'),
(74, 'admin-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 19:00:39'),
(75, 'oper-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 19:00:51'),
(76, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 19:02:04'),
(77, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 19:07:17'),
(78, 'gm-001', 'APPROVE', 'work_orders', 'd03c7d2a-e030-11f0-93ac-74d435ebdbb2', 'work_orders', '{\"status\":\"DRAFT\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 19:09:06'),
(79, 'super-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"supervisor\",\"role\":\"PRODUCTION_SUPERVISOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 07:14:30'),
(80, 'super-001', 'RELEASE', 'work_orders', 'd03c7d2a-e030-11f0-93ac-74d435ebdbb2', 'work_orders', '{\"status\":\"APPROVED\"}', '{\"status\":\"RELEASED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-24 07:14:42'),
(81, 'oper-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 07:14:55'),
(82, 'plan-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"planner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 07:28:10'),
(83, 'oper-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 07:36:18'),
(84, 'plan-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"planner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 07:42:51'),
(85, 'plan-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"planner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 07:58:03'),
(86, 'plan-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"planner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:19:16'),
(87, 'plan-001', 'CREATE', 'work_orders', '0', 'work_orders', NULL, '{\"woNumber\":\"WO-0001\",\"itemId\":\"357b5381-e01c-11f0-93ac-74d435ebdbb2\",\"plannedQuantity\":100}', NULL, NULL, 'SUCCESS', NULL, '2025-12-24 08:40:06'),
(88, 'oper-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:40:34'),
(89, 'plan-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"planner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:41:06'),
(90, 'oper-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:41:43'),
(91, 'super-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"supervisor\",\"role\":\"PRODUCTION_SUPERVISOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:42:05'),
(92, 'gm-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gm\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:42:35'),
(93, 'gm-001', 'APPROVE', 'work_orders', '262b97c2-e0a4-11f0-80db-74d435ebdbb2', 'work_orders', '{\"status\":\"DRAFT\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-24 08:42:44'),
(94, 'super-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"supervisor\",\"role\":\"PRODUCTION_SUPERVISOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:42:55'),
(95, 'super-001', 'RELEASE', 'work_orders', '262b97c2-e0a4-11f0-80db-74d435ebdbb2', 'work_orders', '{\"status\":\"APPROVED\"}', '{\"status\":\"RELEASED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-24 08:43:15'),
(96, 'oper-001', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-24 08:43:30');

-- --------------------------------------------------------

--
-- Table structure for table `bill_of_materials`
--

CREATE TABLE `bill_of_materials` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `bom_number` varchar(50) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `version` varchar(20) DEFAULT '1.0',
  `description` text DEFAULT NULL,
  `base_quantity` decimal(15,3) DEFAULT 1.000,
  `uom_id` varchar(36) DEFAULT NULL,
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `quantity` decimal(15,3) DEFAULT 1.000,
  `is_active` tinyint(1) DEFAULT 1,
  `status` enum('DRAFT','ACTIVE','OBSOLETE') DEFAULT 'DRAFT',
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bill_of_materials`
--

INSERT INTO `bill_of_materials` (`id`, `bom_number`, `item_id`, `version`, `description`, `base_quantity`, `uom_id`, `effective_date`, `expiry_date`, `quantity`, `is_active`, `status`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
('f149f9e6-e0a1-11f0-80db-74d435ebdbb2', 'BOM2025-00001', '357b5381-e01c-11f0-93ac-74d435ebdbb2', '1.0', NULL, 1.000, NULL, '2025-12-16', NULL, 1.000, 1, 'OBSOLETE', 'test', 'plan-001', '2025-12-24 16:24:19', '2025-12-24 16:39:42');

-- --------------------------------------------------------

--
-- Table structure for table `bom`
--

CREATE TABLE `bom` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `bom_number` varchar(50) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `version` varchar(20) DEFAULT '1.0',
  `description` text DEFAULT NULL,
  `base_quantity` decimal(15,3) DEFAULT 1.000,
  `uom_id` varchar(36) DEFAULT NULL,
  `status` enum('DRAFT','ACTIVE','INACTIVE') DEFAULT 'DRAFT',
  `effective_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bom_headers`
--

CREATE TABLE `bom_headers` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `bom_number` varchar(50) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `version` int(11) DEFAULT 1,
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` enum('DRAFT','ACTIVE','OBSOLETE') DEFAULT 'DRAFT',
  `base_quantity` decimal(15,3) DEFAULT 1.000,
  `uom_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bom_items`
--

CREATE TABLE `bom_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `bom_id` varchar(36) NOT NULL,
  `component_item_id` varchar(36) NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `scrap_percentage` decimal(5,2) DEFAULT 0.00,
  `sequence_number` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bom_items`
--

INSERT INTO `bom_items` (`id`, `bom_id`, `component_item_id`, `quantity`, `scrap_percentage`, `sequence_number`, `notes`, `created_at`, `updated_at`) VALUES
('0a7a278b-e0a4-11f0-80db-74d435ebdbb2', 'f149f9e6-e0a1-11f0-80db-74d435ebdbb2', '357b560d-e01c-11f0-93ac-74d435ebdbb2', 10.000, 0.00, 1, NULL, '2025-12-24 16:39:20', '2025-12-24 16:39:20'),
('0a7a6962-e0a4-11f0-80db-74d435ebdbb2', 'f149f9e6-e0a1-11f0-80db-74d435ebdbb2', '357b14c5-e01c-11f0-93ac-74d435ebdbb2', 5.000, 0.00, 2, NULL, '2025-12-24 16:39:20', '2025-12-24 16:39:20');

-- --------------------------------------------------------

--
-- Table structure for table `bom_lines`
--

CREATE TABLE `bom_lines` (
  `id` int(11) NOT NULL,
  `bom_id` varchar(36) NOT NULL,
  `line_number` int(11) NOT NULL,
  `component_item_id` varchar(36) NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `uom_id` varchar(36) DEFAULT NULL,
  `scrap_percentage` decimal(5,2) DEFAULT 0.00,
  `operation_sequence` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `id` varchar(36) NOT NULL,
  `account_code` varchar(50) NOT NULL,
  `account_name` varchar(200) NOT NULL,
  `account_type` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL,
  `account_category` varchar(100) DEFAULT NULL,
  `parent_account_id` varchar(36) DEFAULT NULL,
  `is_header` tinyint(1) NOT NULL DEFAULT 0,
  `normal_balance` enum('DEBIT','CREDIT') NOT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `account_category`, `parent_account_id`, `is_header`, `normal_balance`, `opening_balance`, `current_balance`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
('357f5be3-e01c-11f0-93ac-74d435ebdbb2', '1000', 'Assets', 'ASSET', NULL, NULL, 0, 'DEBIT', 0.00, 0.00, 1, NULL, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('357f63ec-e01c-11f0-93ac-74d435ebdbb2', '1110', 'Cash', 'ASSET', NULL, NULL, 0, 'DEBIT', 0.00, 0.00, 1, NULL, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('357f6471-e01c-11f0-93ac-74d435ebdbb2', '4000', 'Revenue', 'REVENUE', NULL, NULL, 0, 'DEBIT', 0.00, 0.00, 1, NULL, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('357f64b7-e01c-11f0-93ac-74d435ebdbb2', '5000', 'Cost of Goods Sold', 'EXPENSE', NULL, NULL, 0, 'DEBIT', 0.00, 0.00, 1, NULL, '2025-12-23 16:27:00', '2025-12-23 16:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `customer_code` varchar(50) NOT NULL,
  `customer_name` varchar(200) NOT NULL,
  `customer_type` enum('INDIVIDUAL','CORPORATE') NOT NULL DEFAULT 'CORPORATE',
  `contact_person` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Philippines',
  `tax_id` varchar(100) DEFAULT NULL,
  `credit_limit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_terms_days` int(11) NOT NULL DEFAULT 30,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers_new`
--

CREATE TABLE `customers_new` (
  `id` varchar(36) NOT NULL,
  `customer_code` varchar(50) NOT NULL,
  `customer_name` varchar(200) NOT NULL,
  `customer_type` varchar(20) DEFAULT 'CORPORATE',
  `contact_person` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Philippines',
  `tax_id` varchar(100) DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT 0.00,
  `payment_terms_days` int(11) DEFAULT 30,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_payments`
--

CREATE TABLE `customer_payments` (
  `id` varchar(36) NOT NULL,
  `payment_number` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `payment_method` enum('CASH','CHECK','BANK_TRANSFER','CREDIT_CARD','ONLINE') NOT NULL DEFAULT 'BANK_TRANSFER',
  `reference_number` varchar(100) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `bank_name` varchar(200) DEFAULT NULL,
  `check_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `manager_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`, `description`, `manager_id`, `is_active`, `created_at`, `updated_at`) VALUES
('35754cc6-e01c-11f0-93ac-74d435ebdbb2', 'EXEC', 'Executive', 'Executive Management', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357574e6-e01c-11f0-93ac-74d435ebdbb2', 'HR', 'Human Resources', 'HR Department', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357575b2-e01c-11f0-93ac-74d435ebdbb2', 'FIN', 'Finance', 'Finance Department', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('3575760f-e01c-11f0-93ac-74d435ebdbb2', 'PURCH', 'Purchasing', 'Procurement', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('35757d12-e01c-11f0-93ac-74d435ebdbb2', 'PROD', 'Production', 'Manufacturing', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('3576301c-e01c-11f0-93ac-74d435ebdbb2', 'QC', 'Quality Control', 'Quality Assurance', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('35763269-e01c-11f0-93ac-74d435ebdbb2', 'MAINT', 'Maintenance', 'Equipment Maintenance', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357632d1-e01c-11f0-93ac-74d435ebdbb2', 'WARE', 'Warehouse', 'Inventory Management', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `downtime_records`
--

CREATE TABLE `downtime_records` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `wo_id` varchar(36) NOT NULL,
  `downtime_date` datetime NOT NULL,
  `downtime_type` enum('MACHINE_BREAKDOWN','MATERIAL_SHORTAGE','POWER_OUTAGE','CHANGEOVER','MAINTENANCE','OTHER') NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `recorded_by` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `employee_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `department_id` varchar(36) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `hire_date` date NOT NULL,
  `employment_type` enum('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP') DEFAULT 'FULL_TIME',
  `status` enum('ACTIVE','ON_LEAVE','INACTIVE','RESIGNED','TERMINATED') DEFAULT 'ACTIVE',
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `emergency_contact_name` varchar(200) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `basic_salary` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_number`, `first_name`, `last_name`, `email`, `phone`, `address`, `department_id`, `position`, `hire_date`, `employment_type`, `status`, `date_of_birth`, `gender`, `emergency_contact_name`, `emergency_contact_phone`, `basic_salary`, `created_at`, `updated_at`) VALUES
('emp-hr-001', 'EMP-001', 'Mary', 'Allen', 'hr@erp.com', '555-0101', NULL, '357574e6-e01c-11f0-93ac-74d435ebdbb2', 'HR Manager', '2020-01-15', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, 65000.00, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('emp-hr-002', 'EMP-002', 'David', 'Wilson', 'purchasing@erp.com', '555-0102', NULL, '3575760f-e01c-11f0-93ac-74d435ebdbb2', 'Purchasing Officer', '2020-03-20', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, 55000.00, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('emp-hr-003', 'EMP-003', 'James', 'Martinez', 'warehouse@erp.com', '555-0103', NULL, '357632d1-e01c-11f0-93ac-74d435ebdbb2', 'Warehouse Supervisor', '2020-05-10', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, 50000.00, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('emp-hr-004', 'EMP-004', 'Robert', 'Garcia', 'planner@erp.com', '555-0104', NULL, '35757d12-e01c-11f0-93ac-74d435ebdbb2', 'Production Planner', '2020-07-01', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, 60000.00, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('emp-hr-005', 'EMP-005', 'Linda', 'Rodriguez', 'supervisor@erp.com', '555-0105', NULL, '35757d12-e01c-11f0-93ac-74d435ebdbb2', 'Production Supervisor', '2020-08-15', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, 58000.00, '2025-12-23 16:27:00', '2025-12-23 16:27:00'),
('emp-hr-006', 'EMP-006', 'William', 'Lopez', 'operator@erp.com', '555-0106', NULL, '35757d12-e01c-11f0-93ac-74d435ebdbb2', 'Production Operator', '2021-01-10', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, 45000.00, '2025-12-23 16:27:00', '2025-12-23 16:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `employee_id` varchar(36) NOT NULL,
  `document_type` enum('CONTRACT','ID','CERTIFICATE','EVALUATION','OTHER') NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `upload_date` date NOT NULL,
  `uploaded_by` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_leave_credits`
--

CREATE TABLE `employee_leave_credits` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `employee_id` varchar(36) NOT NULL,
  `leave_type_id` varchar(36) NOT NULL,
  `year` int(11) NOT NULL,
  `total_credits` decimal(5,2) DEFAULT 0.00,
  `used_credits` decimal(5,2) DEFAULT 0.00,
  `remaining_credits` decimal(5,2) GENERATED ALWAYS AS (`total_credits` - `used_credits`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `equipment_code` varchar(50) NOT NULL,
  `equipment_name` varchar(200) NOT NULL,
  `equipment_type` varchar(100) DEFAULT NULL,
  `manufacturer` varchar(200) DEFAULT NULL,
  `model_number` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `warranty_expiry_date` date DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` enum('OPERATIONAL','DOWN','MAINTENANCE','RETIRED') DEFAULT 'OPERATIONAL',
  `specifications` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`id`, `equipment_code`, `equipment_name`, `equipment_type`, `manufacturer`, `model_number`, `serial_number`, `purchase_date`, `installation_date`, `warranty_expiry_date`, `location`, `department`, `status`, `specifications`, `notes`, `created_at`, `updated_at`) VALUES
('357d3a19-e01c-11f0-93ac-74d435ebdbb2', 'EQ-001', 'CNC Milling Machine', 'MACHINING', 'Haas Automation', 'VF-2', 'SN-12345', NULL, '2020-06-15', NULL, 'Production Floor A', NULL, 'OPERATIONAL', NULL, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357d76d0-e01c-11f0-93ac-74d435ebdbb2', 'EQ-002', 'Welding Robot', 'WELDING', 'FANUC', 'ARC Mate 120iC', 'SN-67890', NULL, '2021-03-20', NULL, 'Production Floor B', NULL, 'OPERATIONAL', NULL, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357d7861-e01c-11f0-93ac-74d435ebdbb2', 'EQ-003', 'Paint Booth', 'FINISHING', 'Spray Systems', 'PB-500', 'SN-11223', NULL, '2019-11-10', NULL, 'Finishing Area', NULL, 'OPERATIONAL', NULL, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `fiscal_periods`
--

CREATE TABLE `fiscal_periods` (
  `id` varchar(36) NOT NULL,
  `period_name` varchar(50) NOT NULL,
  `fiscal_year` int(11) NOT NULL,
  `period_number` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('OPEN','CLOSED','LOCKED') NOT NULL DEFAULT 'OPEN',
  `closed_date` datetime DEFAULT NULL,
  `closed_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goods_receipts`
--

CREATE TABLE `goods_receipts` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `gr_number` varchar(50) NOT NULL,
  `gr_date` date NOT NULL,
  `po_id` varchar(36) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `supplier_delivery_note` varchar(100) DEFAULT NULL,
  `received_by` varchar(36) NOT NULL,
  `status` enum('DRAFT','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goods_receipt_items`
--

CREATE TABLE `goods_receipt_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `gr_id` varchar(36) NOT NULL,
  `po_item_id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `quantity_received` decimal(15,3) NOT NULL,
  `quantity_accepted` decimal(15,3) NOT NULL,
  `quantity_rejected` decimal(15,3) DEFAULT 0.000,
  `rejection_reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inspection_parameters`
--

CREATE TABLE `inspection_parameters` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `plan_id` varchar(36) NOT NULL,
  `parameter_name` varchar(200) NOT NULL,
  `parameter_type` enum('MEASUREMENT','VISUAL','FUNCTIONAL','DIMENSIONAL') NOT NULL,
  `specification` varchar(200) DEFAULT NULL,
  `lower_limit` decimal(15,3) DEFAULT NULL,
  `upper_limit` decimal(15,3) DEFAULT NULL,
  `target_value` decimal(15,3) DEFAULT NULL,
  `measurement_unit` varchar(50) DEFAULT NULL,
  `is_critical` tinyint(1) DEFAULT 0,
  `sequence_number` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inspection_results`
--

CREATE TABLE `inspection_results` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `inspection_id` varchar(36) NOT NULL,
  `parameter_id` varchar(36) NOT NULL,
  `measured_value` decimal(15,3) DEFAULT NULL,
  `result_status` enum('PASS','FAIL','NA') NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_alerts`
--

CREATE TABLE `inventory_alerts` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `item_id` varchar(36) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `alert_type` enum('LOW_STOCK','OUT_OF_STOCK','REORDER_POINT') DEFAULT 'LOW_STOCK',
  `current_quantity` decimal(15,3) DEFAULT NULL,
  `reorder_level` decimal(15,3) DEFAULT NULL,
  `suggested_order_quantity` decimal(15,3) DEFAULT NULL,
  `status` enum('PENDING','PR_CREATED','RESOLVED','IGNORED') DEFAULT 'PENDING',
  `pr_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `resolved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_stock`
--

CREATE TABLE `inventory_stock` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `item_id` varchar(36) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `quantity` decimal(15,3) DEFAULT 0.000,
  `reserved_quantity` decimal(15,3) DEFAULT 0.000,
  `available_quantity` decimal(15,3) GENERATED ALWAYS AS (`quantity` - `reserved_quantity`) STORED,
  `last_transaction_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_stock`
--

INSERT INTO `inventory_stock` (`id`, `item_id`, `warehouse_id`, `quantity`, `reserved_quantity`, `last_transaction_date`, `created_at`, `updated_at`) VALUES
('357babf2-e01c-11f0-93ac-74d435ebdbb2', '357b14c5-e01c-11f0-93ac-74d435ebdbb2', '357a36ed-e01c-11f0-93ac-74d435ebdbb2', 1450.000, 0.000, NULL, '2025-12-24 00:27:00', '2025-12-24 02:39:09'),
('357bd035-e01c-11f0-93ac-74d435ebdbb2', '357b5381-e01c-11f0-93ac-74d435ebdbb2', '357a37a8-e01c-11f0-93ac-74d435ebdbb2', 130.000, 0.000, NULL, '2025-12-24 00:27:00', '2025-12-24 02:39:07'),
('357bd17f-e01c-11f0-93ac-74d435ebdbb2', '357b560d-e01c-11f0-93ac-74d435ebdbb2', '357a111a-e01c-11f0-93ac-74d435ebdbb2', 200.000, 0.000, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `transaction_number` varchar(50) NOT NULL,
  `transaction_date` datetime NOT NULL,
  `transaction_type` enum('IN','OUT','TRANSFER','ADJUSTMENT') NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_cost` decimal(15,2) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `invoice_number` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `invoice_type` enum('PURCHASE','SALES') NOT NULL,
  `supplier_id` varchar(36) DEFAULT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `po_id` varchar(36) DEFAULT NULL,
  `due_date` date NOT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','PAID','PARTIAL','OVERDUE','CANCELLED') DEFAULT 'DRAFT',
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `discount_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `balance_amount` decimal(15,2) GENERATED ALWAYS AS (`total_amount` - `paid_amount`) STORED,
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `invoice_id` varchar(36) NOT NULL,
  `item_id` varchar(36) DEFAULT NULL,
  `description` text NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `discount_rate` decimal(5,2) DEFAULT 0.00,
  `account_id` varchar(36) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `uom_id` varchar(36) NOT NULL,
  `item_type` enum('RAW_MATERIAL','FINISHED_GOODS','SEMI_FINISHED','CONSUMABLE','SPARE_PARTS') NOT NULL,
  `reorder_level` decimal(15,3) DEFAULT 0.000,
  `reorder_quantity` decimal(15,3) DEFAULT 0.000,
  `min_stock_level` decimal(15,3) DEFAULT 0.000,
  `max_stock_level` decimal(15,3) DEFAULT 0.000,
  `standard_cost` decimal(15,2) DEFAULT 0.00,
  `selling_price` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `code`, `name`, `description`, `category_id`, `uom_id`, `item_type`, `reorder_level`, `reorder_quantity`, `min_stock_level`, `max_stock_level`, `standard_cost`, `selling_price`, `is_active`, `notes`, `created_at`, `updated_at`) VALUES
('357b14c5-e01c-11f0-93ac-74d435ebdbb2', 'RM-001', 'Steel Sheet 1mm', 'Cold rolled steel sheet', '3578e1b5-e01c-11f0-93ac-74d435ebdbb2', '35796271-e01c-11f0-93ac-74d435ebdbb2', 'RAW_MATERIAL', 500.000, 1000.000, 0.000, 0.000, 5.50, 0.00, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357b5381-e01c-11f0-93ac-74d435ebdbb2', 'FG-001', 'Product A - Standard', 'Standard model', '357907b7-e01c-11f0-93ac-74d435ebdbb2', '35793ed4-e01c-11f0-93ac-74d435ebdbb2', 'FINISHED_GOODS', 50.000, 100.000, 0.000, 0.000, 45.00, 89.99, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357b560d-e01c-11f0-93ac-74d435ebdbb2', 'CONS-001', 'Cutting Oil', 'Industrial cutting oil', '3579086f-e01c-11f0-93ac-74d435ebdbb2', '357962f7-e01c-11f0-93ac-74d435ebdbb2', 'CONSUMABLE', 50.000, 100.000, 0.000, 0.000, 12.50, 0.00, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `item_categories`
--

CREATE TABLE `item_categories` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `item_categories`
--

INSERT INTO `item_categories` (`id`, `code`, `name`, `description`, `parent_id`, `is_active`, `created_at`, `updated_at`) VALUES
('3578e1b5-e01c-11f0-93ac-74d435ebdbb2', 'RM', 'Raw Materials', 'Raw materials for production', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357907b7-e01c-11f0-93ac-74d435ebdbb2', 'FG', 'Finished Goods', 'Completed products', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('3579086f-e01c-11f0-93ac-74d435ebdbb2', 'CONS', 'Consumables', 'Consumable supplies', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `job_postings`
--

CREATE TABLE `job_postings` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `job_title` varchar(200) NOT NULL,
  `department_id` varchar(36) DEFAULT NULL,
  `position_level` varchar(50) DEFAULT NULL,
  `job_description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `employment_type` enum('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP') DEFAULT 'FULL_TIME',
  `status` enum('DRAFT','OPEN','CLOSED','FILLED') DEFAULT 'DRAFT',
  `posted_date` date DEFAULT NULL,
  `closing_date` date DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` varchar(36) NOT NULL,
  `journal_number` varchar(50) NOT NULL,
  `journal_date` date NOT NULL,
  `journal_type` enum('GENERAL','SALES','PURCHASE','PAYMENT','RECEIPT','ADJUSTMENT') NOT NULL DEFAULT 'GENERAL',
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_debit` decimal(15,2) NOT NULL,
  `total_credit` decimal(15,2) NOT NULL,
  `status` enum('DRAFT','POSTED','REVERSED') NOT NULL DEFAULT 'DRAFT',
  `posted_date` datetime DEFAULT NULL,
  `posted_by` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entry_lines`
--

CREATE TABLE `journal_entry_lines` (
  `id` int(11) NOT NULL,
  `journal_id` varchar(36) NOT NULL,
  `line_number` int(11) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `description` text DEFAULT NULL,
  `debit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `employee_id` varchar(36) NOT NULL,
  `leave_type_id` varchar(36) NOT NULL,
  `year` int(11) NOT NULL,
  `total_days` decimal(5,2) DEFAULT 0.00,
  `used_days` decimal(5,2) DEFAULT 0.00,
  `remaining_days` decimal(5,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `employee_id` varchar(36) NOT NULL,
  `leave_type_id` varchar(36) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_requested` decimal(5,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approval_stage` enum('HR_REVIEW','DEPARTMENT_HEAD','GENERAL_MANAGER') DEFAULT 'HR_REVIEW',
  `dept_head_approved_by` varchar(36) DEFAULT NULL,
  `dept_head_approved_at` timestamp NULL DEFAULT NULL,
  `gm_approved_by` varchar(36) DEFAULT NULL,
  `gm_approved_at` timestamp NULL DEFAULT NULL,
  `dept_head_rejection_reason` text DEFAULT NULL,
  `gm_rejection_reason` text DEFAULT NULL,
  `hr_reviewed_by` varchar(36) DEFAULT NULL,
  `hr_reviewed_at` timestamp NULL DEFAULT NULL,
  `hr_rejection_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `leave_name` varchar(100) NOT NULL,
  `leave_code` varchar(20) NOT NULL,
  `default_credits` decimal(5,2) DEFAULT 0.00,
  `is_paid` tinyint(1) DEFAULT 1,
  `requires_approval` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_requests`
--

CREATE TABLE `maintenance_requests` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `request_number` varchar(50) NOT NULL,
  `request_date` datetime NOT NULL,
  `equipment_id` varchar(36) NOT NULL,
  `request_type` enum('BREAKDOWN','PREVENTIVE','IMPROVEMENT','OTHER') NOT NULL,
  `priority` enum('LOW','NORMAL','HIGH','URGENT') DEFAULT 'NORMAL',
  `problem_description` text NOT NULL,
  `status` enum('PENDING','APPROVED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `requested_by` varchar(36) NOT NULL,
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_schedules`
--

CREATE TABLE `maintenance_schedules` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `schedule_code` varchar(50) NOT NULL,
  `equipment_id` varchar(36) NOT NULL,
  `maintenance_type` enum('PREVENTIVE','PREDICTIVE','ROUTINE') NOT NULL,
  `frequency_type` enum('DAILY','WEEKLY','MONTHLY','QUARTERLY','YEARLY','HOURS_BASED') NOT NULL,
  `frequency_value` int(11) NOT NULL,
  `last_maintenance_date` date DEFAULT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `estimated_duration_hours` decimal(5,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `checklist` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maintenance_schedules`
--

INSERT INTO `maintenance_schedules` (`id`, `schedule_code`, `equipment_id`, `maintenance_type`, `frequency_type`, `frequency_value`, `last_maintenance_date`, `next_maintenance_date`, `estimated_duration_hours`, `is_active`, `description`, `checklist`, `created_at`, `updated_at`) VALUES
('357e341e-e01c-11f0-93ac-74d435ebdbb2', 'MS-001', '357d3a19-e01c-11f0-93ac-74d435ebdbb2', 'PREVENTIVE', 'MONTHLY', 1, NULL, '2026-01-08', NULL, 1, 'Monthly lubrication', NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357e5bad-e01c-11f0-93ac-74d435ebdbb2', 'MS-002', '357d76d0-e01c-11f0-93ac-74d435ebdbb2', 'PREVENTIVE', 'QUARTERLY', 3, NULL, '2026-01-23', NULL, 1, 'Quarterly calibration', NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_spare_parts`
--

CREATE TABLE `maintenance_spare_parts` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `wo_id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `quantity_used` decimal(15,3) NOT NULL,
  `unit_cost` decimal(15,2) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_work_orders`
--

CREATE TABLE `maintenance_work_orders` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `wo_number` varchar(50) NOT NULL,
  `wo_date` date NOT NULL,
  `equipment_id` varchar(36) NOT NULL,
  `request_id` varchar(36) DEFAULT NULL,
  `schedule_id` varchar(36) DEFAULT NULL,
  `maintenance_type` enum('PREVENTIVE','CORRECTIVE','PREDICTIVE','EMERGENCY') NOT NULL,
  `priority` enum('LOW','NORMAL','HIGH','URGENT') DEFAULT 'NORMAL',
  `description` text NOT NULL,
  `scheduled_start_date` datetime DEFAULT NULL,
  `scheduled_end_date` datetime DEFAULT NULL,
  `actual_start_date` datetime DEFAULT NULL,
  `actual_end_date` datetime DEFAULT NULL,
  `status` enum('PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `assigned_to` varchar(36) DEFAULT NULL,
  `completed_by` varchar(36) DEFAULT NULL,
  `downtime_hours` decimal(5,2) DEFAULT NULL,
  `labor_cost` decimal(15,2) DEFAULT 0.00,
  `parts_cost` decimal(15,2) DEFAULT 0.00,
  `total_cost` decimal(15,2) DEFAULT 0.00,
  `work_performed` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maintenance_work_orders`
--

INSERT INTO `maintenance_work_orders` (`id`, `wo_number`, `wo_date`, `equipment_id`, `request_id`, `schedule_id`, `maintenance_type`, `priority`, `description`, `scheduled_start_date`, `scheduled_end_date`, `actual_start_date`, `actual_end_date`, `status`, `assigned_to`, `completed_by`, `downtime_hours`, `labor_cost`, `parts_cost`, `total_cost`, `work_performed`, `notes`, `created_at`, `updated_at`) VALUES
('357e9a5d-e01c-11f0-93ac-74d435ebdbb2', 'MWO-2025-001', '2025-12-24', '357d3a19-e01c-11f0-93ac-74d435ebdbb2', NULL, NULL, 'PREVENTIVE', 'NORMAL', 'Scheduled monthly maintenance', '2025-12-26 00:00:00', NULL, NULL, NULL, '', 'maint-001', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357ea894-e01c-11f0-93ac-74d435ebdbb2', 'MWO-2025-002', '2025-12-24', '357d76d0-e01c-11f0-93ac-74d435ebdbb2', NULL, NULL, 'CORRECTIVE', 'HIGH', 'Fix welding arm alignment', '2025-12-24 00:00:00', NULL, NULL, NULL, 'IN_PROGRESS', 'maint-001', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mrp_requirements`
--

CREATE TABLE `mrp_requirements` (
  `id` int(11) NOT NULL,
  `mrp_run_id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `requirement_date` date NOT NULL,
  `gross_requirement` decimal(15,3) NOT NULL,
  `scheduled_receipts` decimal(15,3) DEFAULT 0.000,
  `projected_on_hand` decimal(15,3) DEFAULT 0.000,
  `net_requirement` decimal(15,3) DEFAULT 0.000,
  `planned_order_quantity` decimal(15,3) DEFAULT 0.000,
  `planned_order_release_date` date DEFAULT NULL,
  `source_type` enum('PRODUCTION_SCHEDULE','SALES_ORDER','STOCK_ISSUE','SAFETY_STOCK') DEFAULT 'PRODUCTION_SCHEDULE',
  `source_id` varchar(36) DEFAULT NULL,
  `action_required` enum('NONE','CREATE_PR','CREATE_PO','EXPEDITE','RESCHEDULE') DEFAULT 'NONE',
  `pr_generated` tinyint(1) DEFAULT 0,
  `pr_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mrp_runs`
--

CREATE TABLE `mrp_runs` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `run_number` varchar(50) NOT NULL,
  `run_date` datetime NOT NULL,
  `planning_horizon_days` int(11) DEFAULT 90,
  `status` enum('RUNNING','COMPLETED','FAILED') DEFAULT 'RUNNING',
  `total_items_processed` int(11) DEFAULT 0,
  `total_requirements_generated` int(11) DEFAULT 0,
  `run_by` varchar(36) NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `non_conformance_reports`
--

CREATE TABLE `non_conformance_reports` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `ncr_number` varchar(50) NOT NULL,
  `ncr_date` date NOT NULL,
  `inspection_id` varchar(36) DEFAULT NULL,
  `item_id` varchar(36) NOT NULL,
  `quantity_affected` decimal(15,3) NOT NULL,
  `defect_type` varchar(100) DEFAULT NULL,
  `defect_description` text NOT NULL,
  `root_cause` text DEFAULT NULL,
  `corrective_action` text DEFAULT NULL,
  `preventive_action` text DEFAULT NULL,
  `status` enum('OPEN','UNDER_INVESTIGATION','ACTION_TAKEN','CLOSED','CANCELLED') DEFAULT 'OPEN',
  `severity` enum('MINOR','MAJOR','CRITICAL') DEFAULT 'MINOR',
  `reported_by` varchar(36) DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `closed_by` varchar(36) DEFAULT NULL,
  `closed_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('INFO','SUCCESS','WARNING','ERROR') NOT NULL DEFAULT 'INFO',
  `category` varchar(50) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `category`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`) VALUES
(1, 'dh-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0001 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '9b317566-e021-11f0-93ac-74d435ebdbb2', 1, '2025-12-23 17:06:30', '2025-12-23 17:05:46'),
(3, 'pres-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0001 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '9b317566-e021-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:05:46'),
(4, 'vp-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0001 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '9b317566-e021-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:05:46'),
(6, 'pres-001', 'New PO Awaiting Approval', 'Purchase Order PO-0002 has been created and requires your approval', 'INFO', 'APPROVAL', 'purchase_order', 'd633254f-e022-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:14:27'),
(7, 'vp-001', 'New PO Awaiting Approval', 'Purchase Order PO-0002 has been created and requires your approval', 'INFO', 'APPROVAL', 'purchase_order', 'd633254f-e022-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:14:27'),
(9, 'pres-001', 'New PO Awaiting Approval', 'Purchase Order PO-0003 has been created and requires your approval', 'INFO', 'APPROVAL', 'purchase_order', 'df90785c-e022-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:14:42'),
(10, 'vp-001', 'New PO Awaiting Approval', 'Purchase Order PO-0003 has been created and requires your approval', 'INFO', 'APPROVAL', 'purchase_order', 'df90785c-e022-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:14:42'),
(12, 'pres-001', 'New PO Awaiting Approval', 'Purchase Order PO-0004 has been created and requires your approval', 'INFO', 'APPROVAL', 'purchase_order', 'f85c2c2c-e022-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:15:24'),
(13, 'vp-001', 'New PO Awaiting Approval', 'Purchase Order PO-0004 has been created and requires your approval', 'INFO', 'APPROVAL', 'purchase_order', 'f85c2c2c-e022-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:15:24'),
(14, 'dh-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0001 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:32:12'),
(15, 'gm-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0001 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 1, '2025-12-23 17:32:18', '2025-12-23 17:32:12'),
(16, 'pres-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0001 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:32:12'),
(17, 'vp-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0001 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:32:12'),
(18, 'dh-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0002 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:33:26'),
(19, 'gm-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0002 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', 1, '2025-12-23 17:33:33', '2025-12-23 17:33:26'),
(20, 'pres-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0002 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:33:26'),
(21, 'vp-001', 'New PR Awaiting Approval', 'Purchase Requisition PR-0002 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', 0, NULL, '2025-12-23 17:33:26'),
(22, 'ware-001', 'Stock Issue Approved', 'Stock Issue SI2025-00002 for dsad has been approved and is ready to be completed', '', 'INVENTORY', 'STOCK_ISSUE', '2', 1, '2025-12-23 18:35:07', '2025-12-23 18:34:22'),
(23, 'ware-001', 'Stock Issue Approved', 'Stock Issue SI2025-00001 for dsad has been approved and is ready to be completed', '', 'INVENTORY', 'STOCK_ISSUE', '1', 1, '2025-12-23 18:35:05', '2025-12-23 18:34:23'),
(24, 'gm-001', 'Work Order Approval Required', 'Work Order WO-0001 for Product A - Standard (Qty: 10) requires your approval', '', 'PRODUCTION', 'WORK_ORDER', '0', 1, '2025-12-23 18:55:49', '2025-12-23 18:54:30'),
(25, 'super-001', 'Work Order Ready to Release', 'Work Order WO-0001 has been approved and is ready to be released to production', '', 'PRODUCTION', 'WORK_ORDER', 'd03c7d2a-e030-11f0-93ac-74d435ebdbb2', 1, '2025-12-24 07:14:33', '2025-12-23 19:09:06'),
(26, 'oper-001', 'Work Order Released', 'Work Order WO-0001 has been released and is ready for production', '', 'PRODUCTION', 'WORK_ORDER', 'd03c7d2a-e030-11f0-93ac-74d435ebdbb2', 1, '2025-12-24 07:14:57', '2025-12-24 07:14:42'),
(27, 'gm-001', 'Work Order Approval Required', 'Work Order WO-0001 for Product A - Standard (Qty: 100) requires your approval', '', 'PRODUCTION', 'WORK_ORDER', '0', 1, '2025-12-24 08:42:40', '2025-12-24 08:40:06'),
(28, 'super-001', 'Work Order Ready to Release', 'Work Order WO-0001 has been approved and is ready to be released to production', '', 'PRODUCTION', 'WORK_ORDER', '262b97c2-e0a4-11f0-80db-74d435ebdbb2', 1, '2025-12-24 08:43:18', '2025-12-24 08:42:44'),
(29, 'oper-001', 'Work Order Released', 'Work Order WO-0001 has been released and is ready for production', '', 'PRODUCTION', 'WORK_ORDER', '262b97c2-e0a4-11f0-80db-74d435ebdbb2', 1, '2025-12-24 08:43:33', '2025-12-24 08:43:15');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `payment_number` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_type` enum('PAYMENT','RECEIPT') NOT NULL,
  `payment_method` enum('CASH','CHECK','BANK_TRANSFER','CREDIT_CARD','OTHER') NOT NULL,
  `invoice_id` varchar(36) DEFAULT NULL,
  `supplier_id` varchar(36) DEFAULT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `bank_account` varchar(100) DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_allocations`
--

CREATE TABLE `payment_allocations` (
  `id` int(11) NOT NULL,
  `payment_id` varchar(36) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `allocated_amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_inputs`
--

CREATE TABLE `payroll_inputs` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `employee_id` varchar(36) NOT NULL,
  `payroll_period_start` date NOT NULL,
  `payroll_period_end` date NOT NULL,
  `input_type` enum('ALLOWANCE','DEDUCTION','ADJUSTMENT','BONUS') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `is_taxable` tinyint(1) DEFAULT 1,
  `encoded_by` varchar(36) DEFAULT NULL,
  `encoded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed` tinyint(1) DEFAULT 0,
  `processed_by` varchar(36) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll_inputs`
--

INSERT INTO `payroll_inputs` (`id`, `employee_id`, `payroll_period_start`, `payroll_period_end`, `input_type`, `description`, `amount`, `is_taxable`, `encoded_by`, `encoded_at`, `processed`, `processed_by`, `processed_at`, `notes`) VALUES
('16c0fcf0-ddcd-11f0-83eb-74d435ebdbb2', 'c01b2d74-ddc3-11f0-83eb-74d435ebdbb2', '2025-12-16', '2025-12-30', 'BONUS', 'dsa', 500.00, 1, '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 17:55:35', 0, NULL, NULL, NULL),
('9e3c6f27-dff8-11f0-93ac-74d435ebdbb2', '6f12b49a-dff8-11f0-93ac-74d435ebdbb2', '2025-12-01', '2025-12-14', 'BONUS', 'Allowance', 1500.00, 1, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', '2025-12-23 12:12:14', 0, NULL, NULL, NULL),
('e903fcf9-ddbe-11f0-83eb-74d435ebdbb2', '79ba8ef3-ddbc-11f0-83eb-74d435ebdbb2', '2025-12-01', '2025-12-14', 'ALLOWANCE', 'Transpo allowance', 1500.00, 1, '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 16:14:06', 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `po_email_log`
--

CREATE TABLE `po_email_log` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `po_id` varchar(36) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `sent_by` varchar(36) NOT NULL,
  `sent_at` datetime DEFAULT current_timestamp(),
  `status` enum('SENT','FAILED','PENDING') DEFAULT 'SENT',
  `error_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_output`
--

CREATE TABLE `production_output` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `output_number` varchar(50) NOT NULL,
  `output_date` datetime NOT NULL,
  `wo_id` varchar(36) NOT NULL,
  `shift` varchar(50) DEFAULT NULL,
  `quantity_produced` decimal(15,3) NOT NULL,
  `quantity_good` decimal(15,3) NOT NULL,
  `quantity_rejected` decimal(15,3) DEFAULT 0.000,
  `operator_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_plans`
--

CREATE TABLE `production_plans` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `plan_number` varchar(50) NOT NULL,
  `plan_date` date NOT NULL,
  `plan_period_start` date NOT NULL,
  `plan_period_end` date NOT NULL,
  `status` enum('DRAFT','APPROVED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_plan_items`
--

CREATE TABLE `production_plan_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `plan_id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `planned_quantity` decimal(15,3) NOT NULL,
  `scheduled_date` date NOT NULL,
  `priority` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_schedules`
--

CREATE TABLE `production_schedules` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `schedule_number` varchar(50) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `scheduled_date` date NOT NULL,
  `planned_quantity` decimal(15,3) NOT NULL,
  `confirmed_quantity` decimal(15,3) DEFAULT 0.000,
  `status` enum('PLANNED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PLANNED',
  `work_center_id` varchar(36) DEFAULT NULL,
  `priority` int(11) DEFAULT 5,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `po_number` varchar(50) NOT NULL,
  `po_date` date NOT NULL,
  `supplier_id` varchar(36) NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `supplier_confirmation_date` date DEFAULT NULL,
  `supplier_confirmation_notes` text DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','SENT','PARTIAL','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `discount_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `po_number`, `po_date`, `supplier_id`, `delivery_date`, `expected_delivery_date`, `actual_delivery_date`, `supplier_confirmation_date`, `supplier_confirmation_notes`, `delivery_address`, `payment_terms`, `status`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `approved_by`, `approved_date`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
('5c4ea8c5-e025-11f0-93ac-74d435ebdbb2', 'PO-0001', '2025-12-24', '357c7771-e01c-11f0-93ac-74d435ebdbb2', '2026-01-02', NULL, NULL, NULL, NULL, '123 Industrial Ave', NULL, 'SENT', 55.00, 0.00, 0.00, 55.00, 'gm-001', '2025-12-24 01:32:57', NULL, 'gm-001', '2025-12-24 01:32:31', '2025-12-24 01:35:13'),
('8d122fdd-e025-11f0-93ac-74d435ebdbb2', 'PO-0002', '2025-12-23', '357c9d3f-e01c-11f0-93ac-74d435ebdbb2', '2026-01-09', NULL, NULL, NULL, NULL, '456 Metal Road', NULL, 'SENT', 1800.00, 216.00, 0.00, 2016.00, 'gm-001', '2025-12-24 01:34:21', NULL, 'gm-001', '2025-12-24 01:33:52', '2025-12-24 01:35:14');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_attachments`
--

CREATE TABLE `purchase_order_attachments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `po_id` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(36) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `po_id` varchar(36) NOT NULL,
  `pr_item_id` varchar(36) DEFAULT NULL,
  `item_id` varchar(36) NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `received_quantity` decimal(15,3) DEFAULT 0.000,
  `unit_price` decimal(15,2) NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `discount_rate` decimal(5,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `po_id`, `pr_item_id`, `item_id`, `quantity`, `received_quantity`, `unit_price`, `total_price`, `tax_rate`, `discount_rate`, `notes`, `created_at`, `updated_at`) VALUES
('5c4f2a99-e025-11f0-93ac-74d435ebdbb2', '5c4ea8c5-e025-11f0-93ac-74d435ebdbb2', '4611db0c-e025-11f0-93ac-74d435ebdbb2', '357b14c5-e01c-11f0-93ac-74d435ebdbb2', 10.000, 0.000, 5.50, 55.00, 0.00, 0.00, NULL, '2025-12-24 01:32:31', '2025-12-24 01:32:31'),
('973c0c2b-e025-11f0-93ac-74d435ebdbb2', '8d122fdd-e025-11f0-93ac-74d435ebdbb2', NULL, '357b5381-e01c-11f0-93ac-74d435ebdbb2', 40.000, 0.000, 45.00, 2016.00, 12.00, 0.00, NULL, '2025-12-24 01:34:09', '2025-12-24 01:34:09');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requisitions`
--

CREATE TABLE `purchase_requisitions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `pr_number` varchar(50) NOT NULL,
  `pr_date` date NOT NULL,
  `requested_by` varchar(36) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `source_type` enum('MANUAL','MRP','LOW_STOCK','DEPARTMENTAL') DEFAULT 'MANUAL',
  `source_reference` varchar(100) DEFAULT NULL,
  `required_date` date DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','REJECTED','CANCELLED','CONVERTED') DEFAULT 'DRAFT',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_requisitions`
--

INSERT INTO `purchase_requisitions` (`id`, `pr_number`, `pr_date`, `requested_by`, `department`, `source_type`, `source_reference`, `required_date`, `status`, `approved_by`, `approved_date`, `rejection_reason`, `notes`, `created_at`, `updated_at`) VALUES
('7b686fd2-e025-11f0-93ac-74d435ebdbb2', 'PR-0002', '2025-12-23', 'gm-001', 'Executive', 'DEPARTMENTAL', NULL, '2025-12-25', 'CONVERTED', 'gm-001', '2025-12-24 01:33:36', NULL, NULL, '2025-12-24 01:33:23', '2025-12-24 01:33:52'),
('7b9f2c37-e024-11f0-93ac-74d435ebdbb2', 'PR-0001', '2025-12-21', 'purch-001', 'Maintenance', 'LOW_STOCK', NULL, '2025-12-29', 'CONVERTED', 'gm-001', '2025-12-24 01:32:21', NULL, NULL, '2025-12-24 01:26:14', '2025-12-24 01:32:31');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requisition_attachments`
--

CREATE TABLE `purchase_requisition_attachments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `pr_id` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(36) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requisition_items`
--

CREATE TABLE `purchase_requisition_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `pr_id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `estimated_unit_price` decimal(15,2) DEFAULT NULL,
  `estimated_total_price` decimal(15,2) DEFAULT NULL,
  `required_date` date DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_requisition_items`
--

INSERT INTO `purchase_requisition_items` (`id`, `pr_id`, `item_id`, `quantity`, `estimated_unit_price`, `estimated_total_price`, `required_date`, `purpose`, `notes`, `created_at`, `updated_at`) VALUES
('4611db0c-e025-11f0-93ac-74d435ebdbb2', '7b9f2c37-e024-11f0-93ac-74d435ebdbb2', '357b14c5-e01c-11f0-93ac-74d435ebdbb2', 10.000, 5.50, 55.00, '2025-12-30', NULL, NULL, '2025-12-24 01:31:53', '2025-12-24 01:31:53'),
('7b688a21-e025-11f0-93ac-74d435ebdbb2', '7b686fd2-e025-11f0-93ac-74d435ebdbb2', '357b560d-e01c-11f0-93ac-74d435ebdbb2', 50.000, 12.50, 625.00, '2025-12-31', NULL, NULL, '2025-12-24 01:33:23', '2025-12-24 01:33:23');

-- --------------------------------------------------------

--
-- Table structure for table `quality_inspections`
--

CREATE TABLE `quality_inspections` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `inspection_number` varchar(50) NOT NULL,
  `inspection_date` datetime NOT NULL,
  `plan_id` varchar(36) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `item_id` varchar(36) NOT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `quantity_inspected` decimal(15,3) NOT NULL,
  `quantity_accepted` decimal(15,3) DEFAULT 0.000,
  `quantity_rejected` decimal(15,3) DEFAULT 0.000,
  `status` enum('IN_PROGRESS','PASSED','FAILED','CONDITIONAL') DEFAULT 'IN_PROGRESS',
  `inspector_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quality_inspections`
--

INSERT INTO `quality_inspections` (`id`, `inspection_number`, `inspection_date`, `plan_id`, `reference_type`, `reference_id`, `reference_number`, `item_id`, `batch_number`, `quantity_inspected`, `quantity_accepted`, `quantity_rejected`, `status`, `inspector_id`, `notes`, `created_at`, `updated_at`) VALUES
('35811757-e01c-11f0-93ac-74d435ebdbb2', 'QI-2025-001', '2025-12-24 00:27:00', '35805a7a-e01c-11f0-93ac-74d435ebdbb2', NULL, NULL, NULL, '357b5381-e01c-11f0-93ac-74d435ebdbb2', NULL, 50.000, 48.000, 2.000, 'PASSED', 'qc-001', NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `quality_inspection_plans`
--

CREATE TABLE `quality_inspection_plans` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `plan_code` varchar(50) NOT NULL,
  `plan_name` varchar(200) NOT NULL,
  `item_id` varchar(36) DEFAULT NULL,
  `inspection_type` enum('INCOMING','IN_PROCESS','FINAL','OUTGOING') NOT NULL,
  `sampling_method` varchar(100) DEFAULT NULL,
  `sample_size` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quality_inspection_plans`
--

INSERT INTO `quality_inspection_plans` (`id`, `plan_code`, `plan_name`, `item_id`, `inspection_type`, `sampling_method`, `sample_size`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
('3580499a-e01c-11f0-93ac-74d435ebdbb2', 'QIP-001', 'Incoming Raw Material Inspection', '357b14c5-e01c-11f0-93ac-74d435ebdbb2', 'INCOMING', NULL, NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('35805a7a-e01c-11f0-93ac-74d435ebdbb2', 'QIP-002', 'Final Product Inspection', '357b5381-e01c-11f0-93ac-74d435ebdbb2', 'FINAL', NULL, NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `rework_orders`
--

CREATE TABLE `rework_orders` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `rework_number` varchar(50) NOT NULL,
  `rework_date` date NOT NULL,
  `ncr_id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `quantity_to_rework` decimal(15,3) NOT NULL,
  `quantity_reworked` decimal(15,3) DEFAULT 0.000,
  `rework_instructions` text DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `assigned_to` varchar(36) DEFAULT NULL,
  `completed_by` varchar(36) DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `role_name` varchar(100) NOT NULL,
  `module_name` varchar(100) NOT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_create` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_approve` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `routing_headers`
--

CREATE TABLE `routing_headers` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `routing_number` varchar(50) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `version` int(11) DEFAULT 1,
  `effective_date` date NOT NULL,
  `status` enum('DRAFT','ACTIVE','OBSOLETE') DEFAULT 'DRAFT',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `routing_operations`
--

CREATE TABLE `routing_operations` (
  `id` int(11) NOT NULL,
  `routing_id` varchar(36) NOT NULL,
  `operation_sequence` int(11) NOT NULL,
  `operation_name` varchar(200) NOT NULL,
  `work_center_id` varchar(36) DEFAULT NULL,
  `setup_time_minutes` decimal(10,2) DEFAULT 0.00,
  `run_time_per_unit_minutes` decimal(10,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_invoices`
--

CREATE TABLE `sales_invoices` (
  `id` varchar(36) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `due_date` date NOT NULL,
  `payment_terms_days` int(11) NOT NULL DEFAULT 30,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(15,2) NOT NULL,
  `amount_paid` decimal(15,2) NOT NULL DEFAULT 0.00,
  `balance_due` decimal(15,2) NOT NULL,
  `status` enum('DRAFT','SENT','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `reference_number` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_invoices`
--

INSERT INTO `sales_invoices` (`id`, `invoice_number`, `invoice_date`, `customer_id`, `due_date`, `payment_terms_days`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `amount_paid`, `balance_due`, `status`, `reference_number`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
('b0c7aa7c-e01b-11f0-93ac-74d435ebdbb2', 'INV-2025-001', '2025-01-15', '', '2025-02-14', 30, 4499.50, 449.95, 0.00, 4949.45, 0.00, 4949.45, 'SENT', NULL, NULL, 'acct-001', '2025-12-23 16:23:18', '2025-12-23 16:23:18'),
('b0c7c870-e01b-11f0-93ac-74d435ebdbb2', 'INV-2025-002', '2025-01-20', '', '2025-03-06', 30, 6499.50, 649.95, 0.00, 7149.45, 0.00, 7149.45, 'SENT', NULL, NULL, 'acct-001', '2025-12-23 16:23:18', '2025-12-23 16:23:18');

-- --------------------------------------------------------

--
-- Table structure for table `sales_invoice_items`
--

CREATE TABLE `sales_invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `line_number` int(11) NOT NULL,
  `item_id` varchar(36) DEFAULT NULL,
  `description` text NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
('9f61605c-e0a4-11f0-80db-74d435ebdbb2', 'oper-001', '12927665-0333-4b58-922d-eee9c2c5e47a', '2025-12-31 16:43:30', '2025-12-24 16:43:30');

-- --------------------------------------------------------

--
-- Table structure for table `stock_issues`
--

CREATE TABLE `stock_issues` (
  `id` int(11) NOT NULL,
  `issue_number` varchar(50) NOT NULL,
  `issue_date` date NOT NULL,
  `warehouse_id` char(36) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `requested_by` varchar(36) NOT NULL,
  `status` enum('PENDING','APPROVED','COMPLETED','REJECTED') DEFAULT 'PENDING',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_issues`
--

INSERT INTO `stock_issues` (`id`, `issue_number`, `issue_date`, `warehouse_id`, `department`, `requested_by`, `status`, `approved_by`, `approved_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'SI2025-00001', '2025-12-23', '357a36ed-e01c-11f0-93ac-74d435ebdbb2', 'dsad', 'ware-001', 'COMPLETED', 'gm-001', '2025-12-24 02:34:23', '', '2025-12-23 18:16:04', '2025-12-23 18:41:09'),
(2, 'SI2025-00002', '2025-12-23', '357a37a8-e01c-11f0-93ac-74d435ebdbb2', 'dsad', 'ware-001', 'COMPLETED', 'gm-001', '2025-12-24 02:34:22', 'dsad', '2025-12-23 18:23:52', '2025-12-23 18:41:12');

-- --------------------------------------------------------

--
-- Table structure for table `stock_issue_items`
--

CREATE TABLE `stock_issue_items` (
  `id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_issue_items`
--

INSERT INTO `stock_issue_items` (`id`, `issue_id`, `item_id`, `quantity`, `purpose`, `created_at`) VALUES
(1, 1, '357b14c5-e01c-11f0-93ac-74d435ebdbb2', 50.000, 'gdf', '2025-12-23 18:16:04'),
(2, 2, '357b5381-e01c-11f0-93ac-74d435ebdbb2', 20.000, 'dsa', '2025-12-23 18:23:52');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `contact_person` varchar(200) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `code`, `name`, `contact_person`, `email`, `phone`, `address`, `city`, `country`, `payment_terms`, `credit_limit`, `is_active`, `notes`, `created_at`, `updated_at`) VALUES
('357c7771-e01c-11f0-93ac-74d435ebdbb2', 'SUP-001', 'ABC Steel Corporation', 'John Supplier', 'sales@abcsteel.com', '555-1001', '123 Industrial Ave', NULL, NULL, NULL, 0.00, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357c9d3f-e01c-11f0-93ac-74d435ebdbb2', 'SUP-002', 'XYZ Aluminum Ltd', 'Jane Vendor', 'orders@xyzaluminum.com', '555-1002', '456 Metal Road', NULL, NULL, NULL, 0.00, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_performance`
--

CREATE TABLE `supplier_performance` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `supplier_id` varchar(36) NOT NULL,
  `po_id` varchar(36) NOT NULL,
  `on_time_delivery` tinyint(1) DEFAULT 1,
  `quality_rating` int(11) DEFAULT NULL CHECK (`quality_rating` between 1 and 5),
  `delivery_rating` int(11) DEFAULT NULL CHECK (`delivery_rating` between 1 and 5),
  `communication_rating` int(11) DEFAULT NULL CHECK (`communication_rating` between 1 and 5),
  `overall_rating` decimal(3,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `evaluated_by` varchar(36) DEFAULT NULL,
  `evaluated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_editable` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_editable`, `created_at`, `updated_at`) VALUES
('a13f8503-df0a-11f0-9861-74d435ebdbb2', 'companyName', 'Ogami', NULL, NULL, 1, '2025-12-22 15:48:38', '2025-12-22 15:48:38'),
('a13fc89a-df0a-11f0-9861-74d435ebdbb2', 'taxId', '42233067', NULL, NULL, 1, '2025-12-22 15:48:38', '2025-12-22 15:48:38'),
('a1400e92-df0a-11f0-9861-74d435ebdbb2', 'address', 'FCIE', NULL, NULL, 1, '2025-12-22 15:48:38', '2025-12-22 15:48:38'),
('a1405398-df0a-11f0-9861-74d435ebdbb2', 'phone', '091111111111111', NULL, NULL, 1, '2025-12-22 15:48:38', '2025-12-22 15:48:38'),
('a1409bed-df0a-11f0-9861-74d435ebdbb2', 'email', 'ogami@gmail.com', NULL, NULL, 1, '2025-12-22 15:48:38', '2025-12-22 15:48:38'),
('a53847ab-dd9f-11f0-83eb-74d435ebdbb2', 'company_name', 'Manufacturing Company', 'string', 'Company name', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a53852d6-dd9f-11f0-83eb-74d435ebdbb2', 'company_address', '', 'string', 'Company address', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a538537d-dd9f-11f0-83eb-74d435ebdbb2', 'company_phone', '', 'string', 'Company phone number', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a53853cc-dd9f-11f0-83eb-74d435ebdbb2', 'company_email', '', 'string', 'Company email', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a5385411-dd9f-11f0-83eb-74d435ebdbb2', 'currency', 'PHP', 'string', 'Default currency', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a5385454-dd9f-11f0-83eb-74d435ebdbb2', 'date_format', 'YYYY-MM-DD', 'string', 'Date format', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a538549b-dd9f-11f0-83eb-74d435ebdbb2', 'fiscal_year_start', '01-01', 'string', 'Fiscal year start (MM-DD)', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a53854de-dd9f-11f0-83eb-74d435ebdbb2', 'tax_rate', '12', 'number', 'Default tax rate percentage', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a5385525-dd9f-11f0-83eb-74d435ebdbb2', 'auto_backup_enabled', 'true', 'boolean', 'Enable automatic backups', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38'),
('a5385561-dd9f-11f0-83eb-74d435ebdbb2', 'backup_time', '02:00', 'string', 'Daily backup time (HH:MM)', 1, '2025-12-20 20:30:18', '2025-12-22 15:48:38');

-- --------------------------------------------------------

--
-- Table structure for table `units_of_measure`
--

CREATE TABLE `units_of_measure` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units_of_measure`
--

INSERT INTO `units_of_measure` (`id`, `code`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
('35793ed4-e01c-11f0-93ac-74d435ebdbb2', 'PC', 'Piece', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('35796271-e01c-11f0-93ac-74d435ebdbb2', 'KG', 'Kilogram', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357962f7-e01c-11f0-93ac-74d435ebdbb2', 'L', 'Liter', NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `email` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('SYSTEM_ADMIN','PRESIDENT','VICE_PRESIDENT','GENERAL_MANAGER','DEPARTMENT_HEAD','ACCOUNTING_STAFF','PURCHASING_STAFF','WAREHOUSE_STAFF','PRODUCTION_PLANNER','PRODUCTION_SUPERVISOR','PRODUCTION_OPERATOR','QC_INSPECTOR','MAINTENANCE_TECHNICIAN','MOLD_TECHNICIAN','HR_STAFF','IMPEX_OFFICER','AUDITOR','EMPLOYEE') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `employee_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `first_name`, `last_name`, `role`, `department`, `is_active`, `last_login`, `created_at`, `updated_at`, `employee_id`) VALUES
('acct-001', 'accounting@erp.com', 'accounting', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Thomas', 'Young', 'ACCOUNTING_STAFF', NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:31:23', NULL),
('admin-001', 'admin@erp.com', 'admin', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'System', 'Administrator', 'SYSTEM_ADMIN', NULL, 1, '2025-12-24 03:00:39', '2025-12-24 00:27:00', '2025-12-24 03:00:39', NULL),
('dh-001', 'depthead@erp.com', 'depthead', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Emily', 'Davis', 'DEPARTMENT_HEAD', NULL, 1, '2025-12-24 01:08:51', '2025-12-24 00:27:00', '2025-12-24 01:08:51', NULL),
('emp-001', 'employee@erp.com', 'employee', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Jessica', 'King', 'EMPLOYEE', NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:31:23', NULL),
('gm-001', 'gm@erp.com', 'gm', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Michael', 'Brown', 'GENERAL_MANAGER', NULL, 1, '2025-12-24 16:42:35', '2025-12-24 00:27:00', '2025-12-24 16:42:35', NULL),
('hr-001', 'hr@erp.com', 'hr', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Mary', 'Allen', 'HR_STAFF', NULL, 1, '2025-12-24 01:45:41', '2025-12-24 00:27:00', '2025-12-24 01:45:41', NULL),
('impex-001', 'impex@erp.com', 'impex', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Patricia', 'Hall', 'IMPEX_OFFICER', NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:31:23', NULL),
('maint-001', 'maintenance@erp.com', 'maintenance', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Richard', 'Walker', 'MAINTENANCE_TECHNICIAN', NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:31:23', NULL),
('oper-001', 'operator@erp.com', 'operator', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'William', 'Lopez', 'PRODUCTION_OPERATOR', NULL, 1, '2025-12-24 16:43:30', '2025-12-24 00:27:00', '2025-12-24 16:43:30', NULL),
('plan-001', 'planner@erp.com', 'planner', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Robert', 'Garcia', 'PRODUCTION_PLANNER', NULL, 1, '2025-12-24 16:41:06', '2025-12-24 00:27:00', '2025-12-24 16:41:06', NULL),
('pres-001', 'president@erp.com', 'president', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'John', 'Smith', 'PRESIDENT', NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:31:23', NULL),
('purch-001', 'purchasing@erp.com', 'purchasing', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'David', 'Wilson', 'PURCHASING_STAFF', NULL, 1, '2025-12-24 02:12:32', '2025-12-24 00:27:00', '2025-12-24 02:12:32', NULL),
('qc-001', 'qc@erp.com', 'qcinspector', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Jennifer', 'Lee', 'QC_INSPECTOR', NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:31:23', NULL),
('super-001', 'supervisor@erp.com', 'supervisor', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Linda', 'Rodriguez', 'PRODUCTION_SUPERVISOR', NULL, 1, '2025-12-24 16:42:55', '2025-12-24 00:27:00', '2025-12-24 16:42:55', NULL),
('vp-001', 'vp@erp.com', 'vicepresident', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'Sarah', 'Johnson', 'VICE_PRESIDENT', NULL, 1, NULL, '2025-12-24 00:27:00', '2025-12-24 00:31:23', NULL),
('ware-001', 'warehouse@erp.com', 'warehouse', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'James', 'Martinez', 'WAREHOUSE_STAFF', NULL, 1, '2025-12-24 02:30:43', '2025-12-24 00:27:00', '2025-12-24 02:30:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `manager_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `code`, `name`, `location`, `address`, `manager_id`, `is_active`, `created_at`, `updated_at`) VALUES
('357a111a-e01c-11f0-93ac-74d435ebdbb2', 'WH-MAIN', 'Main Warehouse', 'Building A', NULL, NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357a36ed-e01c-11f0-93ac-74d435ebdbb2', 'WH-RM', 'Raw Materials Warehouse', 'Building B', NULL, NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00'),
('357a37a8-e01c-11f0-93ac-74d435ebdbb2', 'WH-FG', 'Finished Goods Warehouse', 'Building C', NULL, NULL, 1, '2025-12-24 00:27:00', '2025-12-24 00:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `work_centers`
--

CREATE TABLE `work_centers` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `work_center_type` enum('MACHINE','ASSEMBLY','INSPECTION','PACKAGING') DEFAULT 'MACHINE',
  `capacity_per_day` decimal(10,2) DEFAULT 0.00,
  `capacity_uom` varchar(50) DEFAULT 'HOURS',
  `efficiency_percentage` decimal(5,2) DEFAULT 100.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_orders`
--

CREATE TABLE `work_orders` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `wo_number` varchar(50) NOT NULL,
  `wo_date` date NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `bom_id` varchar(36) DEFAULT NULL,
  `planned_quantity` decimal(15,3) NOT NULL,
  `produced_quantity` decimal(15,3) DEFAULT 0.000,
  `rejected_quantity` decimal(15,3) DEFAULT 0.000,
  `scheduled_start_date` datetime DEFAULT NULL,
  `scheduled_end_date` datetime DEFAULT NULL,
  `actual_start_date` datetime DEFAULT NULL,
  `actual_end_date` datetime DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','RELEASED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  `priority` enum('LOW','NORMAL','HIGH','URGENT') DEFAULT 'NORMAL',
  `warehouse_id` varchar(36) DEFAULT NULL,
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `mrp_requirement_id` int(11) DEFAULT NULL,
  `work_center_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_orders`
--

INSERT INTO `work_orders` (`id`, `wo_number`, `wo_date`, `item_id`, `bom_id`, `planned_quantity`, `produced_quantity`, `rejected_quantity`, `scheduled_start_date`, `scheduled_end_date`, `actual_start_date`, `actual_end_date`, `status`, `priority`, `warehouse_id`, `approved_by`, `approved_date`, `notes`, `created_by`, `created_at`, `updated_at`, `mrp_requirement_id`, `work_center_id`) VALUES
('262b97c2-e0a4-11f0-80db-74d435ebdbb2', 'WO-0001', '2025-12-24', '357b5381-e01c-11f0-93ac-74d435ebdbb2', NULL, 100.000, 0.000, 0.000, '2025-12-27 00:00:00', '2025-12-30 00:00:00', '2025-12-24 16:43:15', NULL, 'RELEASED', 'NORMAL', '357a37a8-e01c-11f0-93ac-74d435ebdbb2', 'gm-001', '2025-12-24 16:42:44', NULL, 'plan-001', '2025-12-24 16:40:06', '2025-12-24 16:43:15', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `work_order_materials`
--

CREATE TABLE `work_order_materials` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `wo_id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `required_quantity` decimal(15,3) NOT NULL,
  `issued_quantity` decimal(15,3) DEFAULT 0.000,
  `consumed_quantity` decimal(15,3) DEFAULT 0.000,
  `warehouse_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applicants`
--
ALTER TABLE `applicants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `approval_history`
--
ALTER TABLE `approval_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approver_id` (`approver_id`),
  ADD KEY `idx_request_id` (`request_id`);

--
-- Indexes for table `approval_requests`
--
ALTER TABLE `approval_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workflow_id` (`workflow_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `approval_workflows`
--
ALTER TABLE `approval_workflows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_module_name` (`module_name`),
  ADD KEY `idx_document_type` (`document_type`);

--
-- Indexes for table `approval_workflow_steps`
--
ALTER TABLE `approval_workflow_steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_workflow_id` (`workflow_id`);

--
-- Indexes for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`attendance_date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_module` (`module`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_record` (`record_type`,`record_id`),
  ADD KEY `idx_user_action_date` (`user_id`,`action`,`created_at`),
  ADD KEY `idx_module_status` (`module`,`status`);

--
-- Indexes for table `bill_of_materials`
--
ALTER TABLE `bill_of_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bom_number` (`bom_number`),
  ADD KEY `idx_bom_number` (`bom_number`),
  ADD KEY `idx_item_id` (`item_id`);

--
-- Indexes for table `bom`
--
ALTER TABLE `bom`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bom_number` (`bom_number`),
  ADD KEY `idx_item` (`item_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `bom_headers`
--
ALTER TABLE `bom_headers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bom_number` (`bom_number`),
  ADD KEY `idx_bom_number` (`bom_number`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `bom_items`
--
ALTER TABLE `bom_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bom_id` (`bom_id`),
  ADD KEY `idx_component_item_id` (`component_item_id`);

--
-- Indexes for table `bom_lines`
--
ALTER TABLE `bom_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bom_id` (`bom_id`),
  ADD KEY `idx_component_item_id` (`component_item_id`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_account_code` (`account_code`),
  ADD KEY `idx_account_type` (`account_type`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_customer_code` (`customer_code`),
  ADD KEY `idx_customer_name` (`customer_name`);

--
-- Indexes for table `customers_new`
--
ALTER TABLE `customers_new`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_code` (`customer_code`);

--
-- Indexes for table `customer_payments`
--
ALTER TABLE `customer_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_payment_number` (`payment_number`),
  ADD KEY `idx_customer_id` (`customer_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_manager_id` (`manager_id`);

--
-- Indexes for table `downtime_records`
--
ALTER TABLE `downtime_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recorded_by` (`recorded_by`),
  ADD KEY `idx_wo_id` (`wo_id`),
  ADD KEY `idx_downtime_date` (`downtime_date`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_number` (`employee_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_employee_number` (`employee_number`),
  ADD KEY `idx_department` (`department_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_leave_credits`
--
ALTER TABLE `employee_leave_credits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_leave_year` (`employee_id`,`leave_type_id`,`year`);

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `equipment_code` (`equipment_code`),
  ADD KEY `idx_equipment_code` (`equipment_code`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `fiscal_periods`
--
ALTER TABLE `fiscal_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_period` (`fiscal_year`,`period_number`),
  ADD KEY `idx_fiscal_year` (`fiscal_year`);

--
-- Indexes for table `goods_receipts`
--
ALTER TABLE `goods_receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gr_number` (`gr_number`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `received_by` (`received_by`),
  ADD KEY `idx_gr_number` (`gr_number`),
  ADD KEY `idx_gr_date` (`gr_date`),
  ADD KEY `idx_po_id` (`po_id`);

--
-- Indexes for table `goods_receipt_items`
--
ALTER TABLE `goods_receipt_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `idx_gr_id` (`gr_id`),
  ADD KEY `idx_po_item_id` (`po_item_id`);

--
-- Indexes for table `inspection_parameters`
--
ALTER TABLE `inspection_parameters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plan_id` (`plan_id`);

--
-- Indexes for table `inspection_results`
--
ALTER TABLE `inspection_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parameter_id` (`parameter_id`),
  ADD KEY `idx_inspection_id` (`inspection_id`);

--
-- Indexes for table `inventory_alerts`
--
ALTER TABLE `inventory_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `pr_id` (`pr_id`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_alert_type` (`alert_type`);

--
-- Indexes for table `inventory_stock`
--
ALTER TABLE `inventory_stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_item_warehouse` (`item_id`,`warehouse_id`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_warehouse_id` (`warehouse_id`);

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_number` (`transaction_number`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_transaction_number` (`transaction_number`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_warehouse_id` (`warehouse_id`),
  ADD KEY `idx_reference` (`reference_type`,`reference_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `po_id` (`po_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_invoice_number` (`invoice_number`),
  ADD KEY `idx_invoice_date` (`invoice_date`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_invoice_type` (`invoice_type`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_invoice_id` (`invoice_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `uom_id` (`uom_id`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_item_type` (`item_type`);

--
-- Indexes for table `item_categories`
--
ALTER TABLE `item_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_parent_id` (`parent_id`);

--
-- Indexes for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_journal_number` (`journal_number`),
  ADD KEY `idx_journal_date` (`journal_date`);

--
-- Indexes for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_journal_id` (`journal_id`),
  ADD KEY `idx_account_id` (`account_id`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employee_type_year` (`employee_id`,`leave_type_id`,`year`),
  ADD KEY `idx_employee` (`employee_id`),
  ADD KEY `idx_year` (`year`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `leave_code` (`leave_code`);

--
-- Indexes for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `request_number` (`request_number`),
  ADD KEY `equipment_id` (`equipment_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_request_number` (`request_number`),
  ADD KEY `idx_request_date` (`request_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indexes for table `maintenance_schedules`
--
ALTER TABLE `maintenance_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `schedule_code` (`schedule_code`),
  ADD KEY `idx_schedule_code` (`schedule_code`),
  ADD KEY `idx_equipment_id` (`equipment_id`),
  ADD KEY `idx_next_maintenance_date` (`next_maintenance_date`);

--
-- Indexes for table `maintenance_spare_parts`
--
ALTER TABLE `maintenance_spare_parts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `idx_wo_id` (`wo_id`);

--
-- Indexes for table `maintenance_work_orders`
--
ALTER TABLE `maintenance_work_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wo_number` (`wo_number`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `completed_by` (`completed_by`),
  ADD KEY `idx_wo_number` (`wo_number`),
  ADD KEY `idx_wo_date` (`wo_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_equipment_id` (`equipment_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `migration_name` (`migration_name`),
  ADD KEY `idx_migration_name` (`migration_name`);

--
-- Indexes for table `mrp_requirements`
--
ALTER TABLE `mrp_requirements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mrp_run_id` (`mrp_run_id`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_requirement_date` (`requirement_date`),
  ADD KEY `idx_action_required` (`action_required`);

--
-- Indexes for table `mrp_runs`
--
ALTER TABLE `mrp_runs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `run_number` (`run_number`),
  ADD KEY `idx_run_number` (`run_number`),
  ADD KEY `idx_run_date` (`run_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `non_conformance_reports`
--
ALTER TABLE `non_conformance_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ncr_number` (`ncr_number`),
  ADD KEY `inspection_id` (`inspection_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `reported_by` (`reported_by`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `closed_by` (`closed_by`),
  ADD KEY `idx_ncr_number` (`ncr_number`),
  ADD KEY `idx_ncr_date` (`ncr_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_reference` (`reference_type`,`reference_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_number` (`payment_number`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_payment_number` (`payment_number`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_payment_type` (`payment_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payment_id` (`payment_id`),
  ADD KEY `idx_invoice_id` (`invoice_id`);

--
-- Indexes for table `payroll_inputs`
--
ALTER TABLE `payroll_inputs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `po_email_log`
--
ALTER TABLE `po_email_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sent_by` (`sent_by`),
  ADD KEY `idx_po_id` (`po_id`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `production_output`
--
ALTER TABLE `production_output`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `output_number` (`output_number`),
  ADD KEY `operator_id` (`operator_id`),
  ADD KEY `idx_output_number` (`output_number`),
  ADD KEY `idx_output_date` (`output_date`),
  ADD KEY `idx_wo_id` (`wo_id`);

--
-- Indexes for table `production_plans`
--
ALTER TABLE `production_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plan_number` (`plan_number`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_plan_number` (`plan_number`),
  ADD KEY `idx_plan_date` (`plan_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `production_plan_items`
--
ALTER TABLE `production_plan_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_scheduled_date` (`scheduled_date`);

--
-- Indexes for table `production_schedules`
--
ALTER TABLE `production_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `schedule_number` (`schedule_number`),
  ADD KEY `idx_schedule_number` (`schedule_number`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_scheduled_date` (`scheduled_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `po_number` (`po_number`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_po_number` (`po_number`),
  ADD KEY `idx_po_date` (`po_date`),
  ADD KEY `idx_supplier_id` (`supplier_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `purchase_order_attachments`
--
ALTER TABLE `purchase_order_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_po_id` (`po_id`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_item_id` (`pr_item_id`),
  ADD KEY `idx_po_id` (`po_id`),
  ADD KEY `idx_item_id` (`item_id`);

--
-- Indexes for table `purchase_requisitions`
--
ALTER TABLE `purchase_requisitions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pr_number` (`pr_number`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_pr_number` (`pr_number`),
  ADD KEY `idx_pr_date` (`pr_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_requested_by` (`requested_by`);

--
-- Indexes for table `purchase_requisition_attachments`
--
ALTER TABLE `purchase_requisition_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_pr_id` (`pr_id`);

--
-- Indexes for table `purchase_requisition_items`
--
ALTER TABLE `purchase_requisition_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pr_id` (`pr_id`),
  ADD KEY `idx_item_id` (`item_id`);

--
-- Indexes for table `quality_inspections`
--
ALTER TABLE `quality_inspections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inspection_number` (`inspection_number`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `inspector_id` (`inspector_id`),
  ADD KEY `idx_inspection_number` (`inspection_number`),
  ADD KEY `idx_inspection_date` (`inspection_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_reference` (`reference_type`,`reference_id`);

--
-- Indexes for table `quality_inspection_plans`
--
ALTER TABLE `quality_inspection_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plan_code` (`plan_code`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `idx_plan_code` (`plan_code`),
  ADD KEY `idx_inspection_type` (`inspection_type`);

--
-- Indexes for table `rework_orders`
--
ALTER TABLE `rework_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rework_number` (`rework_number`),
  ADD KEY `ncr_id` (`ncr_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `completed_by` (`completed_by`),
  ADD KEY `idx_rework_number` (`rework_number`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_module` (`role_name`,`module_name`),
  ADD KEY `idx_role_name` (`role_name`),
  ADD KEY `idx_module_name` (`module_name`);

--
-- Indexes for table `routing_headers`
--
ALTER TABLE `routing_headers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `routing_number` (`routing_number`),
  ADD KEY `idx_routing_number` (`routing_number`),
  ADD KEY `idx_item_id` (`item_id`);

--
-- Indexes for table `routing_operations`
--
ALTER TABLE `routing_operations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_routing_id` (`routing_id`),
  ADD KEY `idx_work_center_id` (`work_center_id`);

--
-- Indexes for table `sales_invoices`
--
ALTER TABLE `sales_invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_invoice_number` (`invoice_number`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_invoice_date` (`invoice_date`);

--
-- Indexes for table `sales_invoice_items`
--
ALTER TABLE `sales_invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_id` (`invoice_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `stock_issues`
--
ALTER TABLE `stock_issues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `issue_number` (`issue_number`),
  ADD KEY `idx_issue_number` (`issue_number`),
  ADD KEY `idx_issue_date` (`issue_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `stock_issue_items`
--
ALTER TABLE `stock_issue_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_issue_id` (`issue_id`),
  ADD KEY `idx_item_id` (`item_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `supplier_performance`
--
ALTER TABLE `supplier_performance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluated_by` (`evaluated_by`),
  ADD KEY `idx_supplier_id` (`supplier_id`),
  ADD KEY `idx_po_id` (`po_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_setting_key` (`setting_key`);

--
-- Indexes for table `units_of_measure`
--
ALTER TABLE `units_of_measure`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `unique_employee_id` (`employee_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_employee_id` (`employee_id`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `manager_id` (`manager_id`),
  ADD KEY `idx_code` (`code`);

--
-- Indexes for table `work_centers`
--
ALTER TABLE `work_centers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wo_number` (`wo_number`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_wo_number` (`wo_number`),
  ADD KEY `idx_wo_date` (`wo_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_item_id` (`item_id`),
  ADD KEY `idx_wo_bom_id` (`bom_id`),
  ADD KEY `idx_wo_mrp_req_id` (`mrp_requirement_id`),
  ADD KEY `idx_wo_work_center` (`work_center_id`),
  ADD KEY `idx_wo_scheduled_start` (`scheduled_start_date`);

--
-- Indexes for table `work_order_materials`
--
ALTER TABLE `work_order_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `idx_wo_id` (`wo_id`),
  ADD KEY `idx_item_id` (`item_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `bom_lines`
--
ALTER TABLE `bom_lines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mrp_requirements`
--
ALTER TABLE `mrp_requirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `payment_allocations`
--
ALTER TABLE `payment_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `routing_operations`
--
ALTER TABLE `routing_operations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_invoice_items`
--
ALTER TABLE `sales_invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_issues`
--
ALTER TABLE `stock_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stock_issue_items`
--
ALTER TABLE `stock_issue_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `approval_history`
--
ALTER TABLE `approval_history`
  ADD CONSTRAINT `approval_history_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `approval_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `approval_history_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `approval_requests`
--
ALTER TABLE `approval_requests`
  ADD CONSTRAINT `approval_requests_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflows` (`id`),
  ADD CONSTRAINT `approval_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `approval_workflow_steps`
--
ALTER TABLE `approval_workflow_steps`
  ADD CONSTRAINT `approval_workflow_steps_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflows` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bill_of_materials`
--
ALTER TABLE `bill_of_materials`
  ADD CONSTRAINT `bill_of_materials_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `bom_items`
--
ALTER TABLE `bom_items`
  ADD CONSTRAINT `bom_items_ibfk_2` FOREIGN KEY (`component_item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `bom_lines`
--
ALTER TABLE `bom_lines`
  ADD CONSTRAINT `bom_lines_ibfk_1` FOREIGN KEY (`bom_id`) REFERENCES `bom_headers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_departments_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `downtime_records`
--
ALTER TABLE `downtime_records`
  ADD CONSTRAINT `downtime_records_ibfk_1` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`),
  ADD CONSTRAINT `downtime_records_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `goods_receipts`
--
ALTER TABLE `goods_receipts`
  ADD CONSTRAINT `goods_receipts_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`),
  ADD CONSTRAINT `goods_receipts_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`),
  ADD CONSTRAINT `goods_receipts_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `goods_receipt_items`
--
ALTER TABLE `goods_receipt_items`
  ADD CONSTRAINT `goods_receipt_items_ibfk_1` FOREIGN KEY (`gr_id`) REFERENCES `goods_receipts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `goods_receipt_items_ibfk_2` FOREIGN KEY (`po_item_id`) REFERENCES `purchase_order_items` (`id`),
  ADD CONSTRAINT `goods_receipt_items_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `inspection_parameters`
--
ALTER TABLE `inspection_parameters`
  ADD CONSTRAINT `inspection_parameters_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `quality_inspection_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inspection_results`
--
ALTER TABLE `inspection_results`
  ADD CONSTRAINT `inspection_results_ibfk_1` FOREIGN KEY (`inspection_id`) REFERENCES `quality_inspections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inspection_results_ibfk_2` FOREIGN KEY (`parameter_id`) REFERENCES `inspection_parameters` (`id`);

--
-- Constraints for table `inventory_alerts`
--
ALTER TABLE `inventory_alerts`
  ADD CONSTRAINT `inventory_alerts_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_alerts_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_alerts_ibfk_3` FOREIGN KEY (`pr_id`) REFERENCES `purchase_requisitions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_stock`
--
ALTER TABLE `inventory_stock`
  ADD CONSTRAINT `inventory_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_stock_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `inventory_transactions_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`),
  ADD CONSTRAINT `inventory_transactions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoice_items_ibfk_3` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `item_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `items_ibfk_2` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measure` (`id`);

--
-- Constraints for table `item_categories`
--
ALTER TABLE `item_categories`
  ADD CONSTRAINT `item_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `item_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`),
  ADD CONSTRAINT `maintenance_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `maintenance_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maintenance_schedules`
--
ALTER TABLE `maintenance_schedules`
  ADD CONSTRAINT `maintenance_schedules_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `maintenance_spare_parts`
--
ALTER TABLE `maintenance_spare_parts`
  ADD CONSTRAINT `maintenance_spare_parts_ibfk_1` FOREIGN KEY (`wo_id`) REFERENCES `maintenance_work_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_spare_parts_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `maintenance_work_orders`
--
ALTER TABLE `maintenance_work_orders`
  ADD CONSTRAINT `maintenance_work_orders_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`),
  ADD CONSTRAINT `maintenance_work_orders_ibfk_2` FOREIGN KEY (`request_id`) REFERENCES `maintenance_requests` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maintenance_work_orders_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `maintenance_schedules` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maintenance_work_orders_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maintenance_work_orders_ibfk_5` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `mrp_requirements`
--
ALTER TABLE `mrp_requirements`
  ADD CONSTRAINT `mrp_requirements_ibfk_1` FOREIGN KEY (`mrp_run_id`) REFERENCES `mrp_runs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `non_conformance_reports`
--
ALTER TABLE `non_conformance_reports`
  ADD CONSTRAINT `non_conformance_reports_ibfk_1` FOREIGN KEY (`inspection_id`) REFERENCES `quality_inspections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `non_conformance_reports_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `non_conformance_reports_ibfk_3` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `non_conformance_reports_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `non_conformance_reports_ibfk_5` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `po_email_log`
--
ALTER TABLE `po_email_log`
  ADD CONSTRAINT `po_email_log_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `po_email_log_ibfk_2` FOREIGN KEY (`sent_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `production_output`
--
ALTER TABLE `production_output`
  ADD CONSTRAINT `production_output_ibfk_1` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`),
  ADD CONSTRAINT `production_output_ibfk_2` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_plans`
--
ALTER TABLE `production_plans`
  ADD CONSTRAINT `production_plans_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `production_plans_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `production_plan_items`
--
ALTER TABLE `production_plan_items`
  ADD CONSTRAINT `production_plan_items_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_plan_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchase_order_attachments`
--
ALTER TABLE `purchase_order_attachments`
  ADD CONSTRAINT `purchase_order_attachments_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_order_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`pr_item_id`) REFERENCES `purchase_requisition_items` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchase_order_items_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `purchase_requisitions`
--
ALTER TABLE `purchase_requisitions`
  ADD CONSTRAINT `purchase_requisitions_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchase_requisitions_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_requisition_attachments`
--
ALTER TABLE `purchase_requisition_attachments`
  ADD CONSTRAINT `purchase_requisition_attachments_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `purchase_requisitions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_requisition_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchase_requisition_items`
--
ALTER TABLE `purchase_requisition_items`
  ADD CONSTRAINT `purchase_requisition_items_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `purchase_requisitions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_requisition_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `quality_inspections`
--
ALTER TABLE `quality_inspections`
  ADD CONSTRAINT `quality_inspections_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `quality_inspection_plans` (`id`),
  ADD CONSTRAINT `quality_inspections_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `quality_inspections_ibfk_3` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quality_inspection_plans`
--
ALTER TABLE `quality_inspection_plans`
  ADD CONSTRAINT `quality_inspection_plans_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rework_orders`
--
ALTER TABLE `rework_orders`
  ADD CONSTRAINT `rework_orders_ibfk_1` FOREIGN KEY (`ncr_id`) REFERENCES `non_conformance_reports` (`id`),
  ADD CONSTRAINT `rework_orders_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `rework_orders_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rework_orders_ibfk_4` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `routing_operations`
--
ALTER TABLE `routing_operations`
  ADD CONSTRAINT `routing_operations_ibfk_1` FOREIGN KEY (`routing_id`) REFERENCES `routing_headers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_issue_items`
--
ALTER TABLE `stock_issue_items`
  ADD CONSTRAINT `stock_issue_items_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `stock_issues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supplier_performance`
--
ALTER TABLE `supplier_performance`
  ADD CONSTRAINT `supplier_performance_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `supplier_performance_ibfk_2` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `supplier_performance_ibfk_3` FOREIGN KEY (`evaluated_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD CONSTRAINT `work_orders_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `work_orders_ibfk_2` FOREIGN KEY (`bom_id`) REFERENCES `bill_of_materials` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_orders_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_orders_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `work_orders_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `work_order_materials`
--
ALTER TABLE `work_order_materials`
  ADD CONSTRAINT `work_order_materials_ibfk_1` FOREIGN KEY (`wo_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `work_order_materials_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `work_order_materials_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

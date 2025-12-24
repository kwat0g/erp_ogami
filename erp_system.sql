-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 23, 2025 at 05:09 PM
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

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`id`, `job_posting_id`, `first_name`, `last_name`, `email`, `phone`, `address`, `resume_path`, `cover_letter`, `application_date`, `status`, `interview_date`, `interview_notes`, `rejection_reason`, `created_by`, `created_at`, `updated_at`) VALUES
('6463e3a4-dff8-11f0-93ac-74d435ebdbb2', '4db58e4e-dff8-11f0-93ac-74d435ebdbb2', 'Gnehm Ryien', 'Rane', 'gnehm@gmail.com', '09852662052', 'Paliparan', NULL, 'Ewan ano to', '2025-12-23', 'HIRED', NULL, NULL, NULL, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', '2025-12-23 12:10:37', '2025-12-23 12:10:55'),
('76c34894-ddc9-11f0-83eb-74d435ebdbb2', '52119934-ddc1-11f0-83eb-74d435ebdbb2', 'dsad', 'dsad', 'kwato1g@gmail.com', '09123456789', 'dsa', NULL, 'dsa', '2025-12-20', 'REJECTED', NULL, NULL, 'panget', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 17:29:39', '2025-12-20 17:58:39'),
('aa7ad5c5-ddc3-11f0-83eb-74d435ebdbb2', '52119934-ddc1-11f0-83eb-74d435ebdbb2', 'dasd', 'asd', 'bungubung.ehdrian@ncst.edu.ph', '3232', 'das', NULL, 'das', '2025-12-20', 'HIRED', NULL, NULL, NULL, '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 16:48:08', '2025-12-20 16:48:12'),
('bb757a17-ddc3-11f0-83eb-74d435ebdbb2', '52119934-ddc1-11f0-83eb-74d435ebdbb2', 'Jarmaine', 'Diegas', 'diegas.jarmaine@ncst.edu.ph', '3213123', 'dsadas', NULL, 'das', '2025-12-20', 'HIRED', NULL, NULL, NULL, '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 16:48:37', '2025-12-20 16:48:45');

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

--
-- Dumping data for table `approval_workflows`
--

INSERT INTO `approval_workflows` (`id`, `workflow_name`, `module_name`, `document_type`, `approval_levels`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
('a53abc25-dd9f-11f0-83eb-74d435ebdbb2', 'Purchase Requisition Approval', 'Purchasing', 'PURCHASE_REQUISITION', 2, 1, 'Two-level approval for purchase requisitions', '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53ac7c6-dd9f-11f0-83eb-74d435ebdbb2', 'Purchase Order Approval', 'Purchasing', 'PURCHASE_ORDER', 3, 1, 'Three-level approval for purchase orders', '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53ac867-dd9f-11f0-83eb-74d435ebdbb2', 'Work Order Approval', 'Production', 'WORK_ORDER', 1, 1, 'Single-level approval for work orders', '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53ac91d-dd9f-11f0-83eb-74d435ebdbb2', 'Payment Approval', 'Accounting', 'PAYMENT', 2, 1, 'Two-level approval for payments', '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53ac962-dd9f-11f0-83eb-74d435ebdbb2', 'Invoice Approval', 'Accounting', 'INVOICE', 1, 1, 'Single-level approval for invoices', '2025-12-20 20:30:18', '2025-12-20 20:30:18');

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

--
-- Dumping data for table `attendance_logs`
--

INSERT INTO `attendance_logs` (`id`, `employee_id`, `attendance_date`, `time_in`, `time_out`, `status`, `hours_worked`, `overtime_hours`, `is_validated`, `validated_by`, `validated_at`, `notes`, `created_at`, `updated_at`) VALUES
('2c6bb43c-dffd-11f0-93ac-74d435ebdbb2', '6f12b49a-dff8-11f0-93ac-74d435ebdbb2', '2025-12-23', '07:00:00', '19:00:00', 'PRESENT', 12.00, 0.00, 1, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', '2025-12-23 12:44:56', NULL, '2025-12-23 12:44:51', '2025-12-23 12:44:56'),
('ac2b7f32-e001-11f0-93ac-74d435ebdbb2', '21e774d3-dff8-11f0-93ac-74d435ebdbb2', '2025-12-16', '07:00:00', '17:00:00', 'PRESENT', 10.00, 0.00, 0, NULL, NULL, NULL, '2025-12-23 13:17:03', '2025-12-23 13:44:15');

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
(1, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-22 11:05:48'),
(2, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-22 11:07:46'),
(3, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 06:38:14'),
(4, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 06:38:23'),
(5, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 06:42:45'),
(6, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 06:49:31'),
(7, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 06:50:37'),
(8, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 06:51:20'),
(9, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_requisitions', 'a2946e1e-dfce-11f0-9857-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0002\",\"prDate\":\"2025-12-23\",\"department\":\"Quality Control\",\"items\":[{\"itemId\":\"78b2d7d4-df17-11f0-9861-74d435ebdbb2\",\"quantity\":100,\"estimatedUnitPrice\":100,\"estimatedTotalPrice\":10000,\"requiredDate\":\"2026-01-01\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:11:43'),
(10, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_orders', 'ac2bfcc5-dfce-11f0-9857-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0002\",\"poDate\":\"2025-12-23\",\"supplierId\":\"2146da91-df0e-11f0-9861-74d435ebdbb2\",\"totalAmount\":4480}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:11:59'),
(11, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'purchase_orders', 'ac2bfcc5-dfce-11f0-9857-74d435ebdbb2', 'purchase_orders', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:12:12'),
(12, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:12:31'),
(13, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:19:52'),
(14, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:20:12'),
(15, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:20:42'),
(16, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:20:58'),
(17, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:21:41'),
(18, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:21:52'),
(19, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:21:53'),
(20, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:23:31'),
(21, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:23:39'),
(22, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:23:43'),
(23, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:23:47'),
(24, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:23:50'),
(25, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:23:54'),
(26, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:23:57'),
(27, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:24:00'),
(28, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:24:12'),
(29, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:26:08'),
(30, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:26:15'),
(31, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:26:18'),
(32, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:26:21'),
(33, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:26:25'),
(34, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:26:36'),
(35, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:26:38'),
(36, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:28:39'),
(37, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:31:12'),
(38, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:31:57'),
(39, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:32:55'),
(40, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:33:38'),
(41, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:33:49'),
(42, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:34:26'),
(43, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:35:37'),
(44, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:40:22'),
(45, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:40:49'),
(46, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:41:22'),
(47, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:42:13'),
(48, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:42:25'),
(49, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:42:45'),
(50, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:43:08'),
(51, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_orders', '0f8c53ee-dfd3-11f0-9857-74d435ebdbb2', 'purchase_orders', NULL, '{\"poNumber\":\"PO-0003\",\"poDate\":\"2025-12-23\",\"supplierId\":\"df6d81ef-df00-11f0-9861-74d435ebdbb2\",\"totalAmount\":2240}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:43:24'),
(52, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'purchase_orders', '0f8c53ee-dfd3-11f0-9857-74d435ebdbb2', 'purchase_orders', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:43:30'),
(53, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:43:34'),
(54, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:54:30'),
(55, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'SUBMIT', 'purchase_requisitions', 'a2946e1e-dfce-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:54:42'),
(56, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'SUBMIT', 'purchase_requisitions', '89f22b14-df18-11f0-9861-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:55:03'),
(57, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_requisitions', 'c25f2127-dfd4-11f0-9857-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0003\",\"prDate\":\"2025-12-23\",\"department\":\"Sales\",\"items\":[{\"itemId\":\"78b2d7d4-df17-11f0-9861-74d435ebdbb2\",\"quantity\":1,\"estimatedUnitPrice\":100,\"estimatedTotalPrice\":100,\"requiredDate\":\"2025-12-30\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:55:33'),
(58, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'SUBMIT', 'purchase_requisitions', 'c25f2127-dfd4-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 07:55:44'),
(59, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 07:55:52'),
(60, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:02:33'),
(61, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_requisitions', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0004\",\"prDate\":\"2025-12-23\",\"department\":\"IT\",\"items\":[{\"itemId\":\"d6bd1f4a-df17-11f0-9861-74d435ebdbb2\",\"quantity\":10,\"estimatedUnitPrice\":40,\"estimatedTotalPrice\":400,\"requiredDate\":\"2025-12-30\",\"purpose\":\"\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:02:58'),
(62, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'purchase_requisitions', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prDate\":\"2025-12-22\",\"department\":\"IT\",\"items\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:03:09'),
(63, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'SUBMIT', 'purchase_requisitions', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:03:17'),
(64, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:03:22'),
(65, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:07:26'),
(66, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:21:03'),
(67, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_requisitions', '5e03886e-dfd8-11f0-9857-74d435ebdbb2', 'purchase_requisitions', NULL, '{\"prNumber\":\"PR-0005\",\"prDate\":\"2025-12-23\",\"department\":\"IT\",\"items\":[{\"itemId\":\"d6bd1f4a-df17-11f0-9861-74d435ebdbb2\",\"quantity\":6,\"estimatedUnitPrice\":40,\"estimatedTotalPrice\":240,\"requiredDate\":\"2025-12-29\",\"purpose\":\"das\"}]}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:21:23'),
(68, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'SUBMIT', 'purchase_requisitions', '5e03886e-dfd8-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:21:32'),
(69, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:21:37'),
(70, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'APPROVE', 'purchase_requisitions', '5e03886e-dfd8-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:22:38'),
(71, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'REJECT', 'purchase_requisitions', 'c25f2127-dfd4-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"REJECTED\",\"rejectionReason\":\"dsadas\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:22:53'),
(72, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'APPROVE', 'purchase_requisitions', '89f22b14-df18-11f0-9861-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:24:31'),
(73, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'APPROVE', 'purchase_requisitions', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:24:36'),
(74, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'REJECT', 'purchase_requisitions', 'a2946e1e-dfce-11f0-9857-74d435ebdbb2', 'purchase_requisitions', '{\"status\":\"PENDING\"}', '{\"status\":\"REJECTED\",\"rejectionReason\":\"DD\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:31:07'),
(75, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:31:39'),
(76, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:32:58'),
(77, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:33:58'),
(78, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:36:22'),
(79, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'APPROVE', 'purchase_orders', '0f8c53ee-dfd3-11f0-9857-74d435ebdbb2', 'purchase_orders', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:36:26'),
(80, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:42:42'),
(81, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 08:47:10'),
(82, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'SEND', 'purchase_orders', '0f8c53ee-dfd3-11f0-9857-74d435ebdbb2', 'purchase_orders', '{\"status\":\"APPROVED\"}', '{\"status\":\"SENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:56:28'),
(83, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'APPROVE', 'purchase_orders', 'ac2bfcc5-dfce-11f0-9857-74d435ebdbb2', 'purchase_orders', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:56:35'),
(84, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'APPROVE', 'purchase_orders', 'c6dfcc5f-df18-11f0-9861-74d435ebdbb2', 'purchase_orders', '{\"status\":\"PENDING\"}', '{\"status\":\"APPROVED\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 08:56:36'),
(85, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:03:58'),
(86, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:04:10'),
(87, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:05:03'),
(88, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:08:04'),
(89, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', 'employees', NULL, '{\"employeeNumber\":\"EMP007\",\"firstName\":\"Ehdrian\",\"lastName\":\"Bungubung\",\"email\":\"ehdrian@gmail.com\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:08:46'),
(90, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'employees', '21e774d3-dff8-11f0-93ac-74d435ebdbb2', 'employees', NULL, '{\"firstName\":\"Ehdrian\",\"lastName\":\"Bungubung\",\"email\":\"ehdrian@gmail.com\",\"position\":\"Software Engineer\",\"status\":\"ACTIVE\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:09:05'),
(91, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'job_postings', '0', 'job_postings', NULL, '{\"jobTitle\":\"HR Admin\",\"departmentId\":\"a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2\",\"status\":\"OPEN\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:09:59'),
(92, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'applicants', '0', 'applicants', NULL, '{\"jobPostingId\":\"4db58e4e-dff8-11f0-93ac-74d435ebdbb2\",\"firstName\":\"Gnehm Ryien\",\"lastName\":\"Rane\",\"email\":\"gnehm@gmail.com\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:10:37'),
(93, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'applicants', '6463e3a4-dff8-11f0-93ac-74d435ebdbb2', 'applicants', NULL, '{\"status\":\"SCREENING\",\"interviewDate\":null,\"interviewNotes\":null,\"rejectionReason\":null}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:10:45'),
(94, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'applicants', '6463e3a4-dff8-11f0-93ac-74d435ebdbb2', 'applicants', NULL, '{\"status\":\"INTERVIEWED\",\"interviewDate\":null,\"interviewNotes\":null,\"rejectionReason\":null}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:10:47'),
(95, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'applicants', '6463e3a4-dff8-11f0-93ac-74d435ebdbb2', 'applicants', NULL, '{\"status\":\"OFFERED\",\"interviewDate\":null,\"interviewNotes\":null,\"rejectionReason\":null}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:10:50'),
(96, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', 'employees', NULL, '{\"employeeNumber\":\"EMP008\",\"firstName\":\"Gnehm Ryien\",\"lastName\":\"Rane\",\"email\":\"gnehm@gmail.com\",\"convertedFromApplicant\":\"6463e3a4-dff8-11f0-93ac-74d435ebdbb2\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:10:55'),
(97, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'applicants', '6463e3a4-dff8-11f0-93ac-74d435ebdbb2', 'applicants', NULL, '{\"status\":\"HIRED\",\"convertedToEmployee\":0}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:10:55'),
(98, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'attendance_logs', '0', 'attendance_logs', NULL, '{\"employeeId\":\"6f12b49a-dff8-11f0-93ac-74d435ebdbb2\",\"attendanceDate\":\"2025-12-21\",\"status\":\"PRESENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:11:19'),
(99, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'payroll_inputs', '0', 'payroll_inputs', NULL, '{\"employeeId\":\"6f12b49a-dff8-11f0-93ac-74d435ebdbb2\",\"periodStart\":\"2025-12-01\",\"periodEnd\":\"2025-12-14\",\"inputType\":\"BONUS\",\"description\":\"Allowance\",\"amount\":1500}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:12:14'),
(100, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:12:56'),
(101, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:15:18'),
(102, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:41:11'),
(103, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:42:03'),
(104, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'employees', '6f12b49a-dff8-11f0-93ac-74d435ebdbb2', 'employees', NULL, '{\"firstName\":\"Gnehm Ryien\",\"lastName\":\"Rane\",\"email\":\"gnehm@gmail.com\",\"position\":\"HR Admin\",\"status\":\"ON_LEAVE\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:43:23'),
(105, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'attendance_logs', '0', 'attendance_logs', NULL, '{\"employeeId\":\"6f12b49a-dff8-11f0-93ac-74d435ebdbb2\",\"attendanceDate\":\"2025-12-23\",\"status\":\"PRESENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:44:51'),
(106, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'attendance_logs', '2c6bb43c-dffd-11f0-93ac-74d435ebdbb2', 'attendance_logs', NULL, '{\"isValidated\":true}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 12:44:56'),
(107, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:45:31'),
(108, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:45:59'),
(109, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 12:52:57'),
(110, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:02:49'),
(111, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:05:06'),
(112, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'employees', '6f12b49a-dff8-11f0-93ac-74d435ebdbb2', 'employees', NULL, '{\"firstName\":\"Gnehm Ryien\",\"lastName\":\"Rane\",\"email\":\"gnehm@gmail.com\",\"position\":\"HR Admin\",\"status\":\"ACTIVE\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:05:14'),
(113, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:05:18'),
(114, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', 'users', NULL, '{\"email\":\"gnehm@gmail.com\",\"username\":\"rane.gnehm ryien\",\"role\":\"WAREHOUSE_STAFF\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:05:43'),
(115, '16c73a64-e000-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"rane.gnehm ryien\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:05:56'),
(116, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:06:08'),
(117, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'users', '16c73a64-e000-11f0-93ac-74d435ebdbb2', 'users', '{\"email\":\"gnehm@gmail.com\",\"role\":\"WAREHOUSE_STAFF\",\"isActive\":1}', '{\"role\":\"WAREHOUSE_STAFF\",\"isActive\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:06:16'),
(118, '16c73a64-e000-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"rane.gnehm\",\"role\":\"WAREHOUSE_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:06:28'),
(119, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:06:34'),
(120, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:07:04'),
(121, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:08:15'),
(122, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', 'users', NULL, '{\"email\":\"ehdrian@gmail.com\",\"username\":\"bungubung.ehdrian\",\"role\":\"EMPLOYEE\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:08:25'),
(123, '771b4f6c-e000-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"bungubung.ehdrian\",\"role\":\"EMPLOYEE\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:08:30'),
(124, '771b4f6c-e000-11f0-93ac-74d435ebdbb2', 'CREATE', 'leave_requests', '0', 'leave_requests', NULL, '{\"employeeId\":\"21e774d3-dff8-11f0-93ac-74d435ebdbb2\",\"leaveTypeId\":\"300b006a-ddb4-11f0-83eb-74d435ebdbb2\",\"startDate\":\"2025-12-25\",\"endDate\":\"2025-12-27\",\"daysRequested\":1}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:09:00'),
(125, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:09:11'),
(126, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'leave_requests', '8c3bfdf7-e000-11f0-93ac-74d435ebdbb2', 'leave_requests', NULL, '{\"approvalStage\":\"DEPARTMENT_HEAD\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:09:20'),
(127, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:09:26'),
(128, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:09:40'),
(129, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:12:05'),
(130, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'SEND', 'purchase_orders', 'ac2bfcc5-dfce-11f0-9857-74d435ebdbb2', 'purchase_orders', '{\"status\":\"APPROVED\"}', '{\"status\":\"SENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:13:16'),
(131, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'SEND', 'purchase_orders', 'c6dfcc5f-df18-11f0-9861-74d435ebdbb2', 'purchase_orders', '{\"status\":\"APPROVED\"}', '{\"status\":\"SENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:13:18'),
(132, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:14:06'),
(133, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'attendance_logs', '0', 'attendance_logs', NULL, '{\"employeeId\":\"21e774d3-dff8-11f0-93ac-74d435ebdbb2\",\"attendanceDate\":\"2025-12-11\",\"status\":\"PRESENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:16:26'),
(134, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'attendance_logs', '0', 'attendance_logs', NULL, '{\"employeeId\":\"21e774d3-dff8-11f0-93ac-74d435ebdbb2\",\"attendanceDate\":\"2025-12-23\",\"status\":\"PRESENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:17:03'),
(135, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'attendance_logs', 'ac2b7f32-e001-11f0-93ac-74d435ebdbb2', 'attendance_logs', NULL, '{\"employeeId\":\"21e774d3-dff8-11f0-93ac-74d435ebdbb2\",\"attendanceDate\":\"2025-12-23\",\"status\":\"PRESENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:44:08'),
(136, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'attendance_logs', 'ac2b7f32-e001-11f0-93ac-74d435ebdbb2', 'attendance_logs', NULL, '{\"employeeId\":\"21e774d3-dff8-11f0-93ac-74d435ebdbb2\",\"attendanceDate\":\"2025-12-16\",\"status\":\"PRESENT\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:44:15'),
(137, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:49:27'),
(138, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', 'employees', NULL, '{\"employeeNumber\":\"EMP009\",\"firstName\":\"maintenance\",\"lastName\":\"maintenance\",\"email\":\"maintenance@gmail.com\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:49:59'),
(139, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', 'employees', NULL, '{\"employeeNumber\":\"EMP010\",\"firstName\":\"production\",\"lastName\":\"operator\",\"email\":\"prooperator@gmail.com\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:50:31'),
(140, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', 'employees', NULL, '{\"employeeNumber\":\"EMP011\",\"firstName\":\"quality\",\"lastName\":\"operator\",\"email\":\"quality@gmail.com\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:50:56'),
(141, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', 'employees', NULL, '{\"employeeNumber\":\"EMP012\",\"firstName\":\"import\",\"lastName\":\"export\",\"email\":\"import@gmail.com\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:51:27'),
(142, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"admin\",\"role\":\"SYSTEM_ADMIN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:51:43'),
(143, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', 'users', NULL, '{\"email\":\"maintenance@gmail.com\",\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:51:57'),
(144, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', 'users', NULL, '{\"email\":\"prooperator@gmail.com\",\"username\":\"operator.production\",\"role\":\"PRODUCTION_OPERATOR\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:52:11'),
(145, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', 'users', NULL, '{\"email\":\"quality@gmail.com\",\"username\":\"operator.quality\",\"role\":\"QC_INSPECTOR\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:52:29'),
(146, '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', 'users', NULL, '{\"email\":\"import@gmail.com\",\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 13:52:39'),
(147, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:53:14'),
(148, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:53:42'),
(149, '944ddfc2-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.production\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:54:52'),
(150, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:54:58'),
(151, '9f16e311-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.quality\",\"role\":\"QC_INSPECTOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 13:55:14'),
(152, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 14:35:45'),
(153, '944ddfc2-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.production\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 14:36:09'),
(154, '944ddfc2-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.production\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 14:50:21'),
(155, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 14:50:29'),
(156, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 14:50:59'),
(157, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 14:51:34'),
(158, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 14:52:46'),
(159, '9f16e311-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.quality\",\"role\":\"QC_INSPECTOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:12:35'),
(160, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:13:04'),
(161, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:15:09'),
(162, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'CREATE', 'equipment', '0', 'equipment', NULL, '{\"equipmentCode\":\"111\",\"equipmentName\":\"MARTILYO MOLDER\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 15:17:53');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `module`, `record_id`, `record_type`, `old_value`, `new_value`, `ip_address`, `user_agent`, `status`, `error_message`, `created_at`) VALUES
(163, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'CREATE', 'maintenance_schedules', '0', 'maintenance_schedules', NULL, '{\"equipmentId\":\"8da3b4db-e012-11f0-93ac-74d435ebdbb2\",\"scheduleType\":\"PREVENTIVE\",\"frequency\":\"weej\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 15:18:24'),
(164, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'UPDATE', 'maintenance_schedules', '9fee7bb8-e012-11f0-93ac-74d435ebdbb2', 'maintenance_schedules', NULL, '{\"equipmentId\":\"8da3b4db-e012-11f0-93ac-74d435ebdbb2\",\"scheduleType\":\"PREVENTIVE\",\"nextDueDate\":\"2025-12-31\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 15:18:49'),
(165, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:28:26'),
(166, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'DELETE', 'maintenance_schedules', '9fee7bb8-e012-11f0-93ac-74d435ebdbb2', 'maintenance_schedules', NULL, '{}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 15:38:50'),
(167, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'MAINTENANCE_WO_CREATE', 'MAINTENANCE', '0', 'maintenance_work_orders', NULL, '\"{\\\"woNumber\\\":\\\"MWO-1766504425296\\\",\\\"equipmentId\\\":\\\"8da3b4db-e012-11f0-93ac-74d435ebdbb2\\\",\\\"maintenanceType\\\":\\\"PREDICTIVE\\\",\\\"priority\\\":\\\"URGENT\\\"}\"', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 15:40:25'),
(168, '9f16e311-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.quality\",\"role\":\"QC_INSPECTOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:42:16'),
(169, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:42:36'),
(170, '944ddfc2-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.production\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:42:51'),
(171, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:43:03'),
(172, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:43:11'),
(173, '9f16e311-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.quality\",\"role\":\"QC_INSPECTOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:43:46'),
(174, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:44:58'),
(175, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'UPDATE', 'equipment', '8da3b4db-e012-11f0-93ac-74d435ebdbb2', 'equipment', NULL, '{\"equipmentCode\":\"111\",\"equipmentName\":\"MARTILYO MOLDER\",\"status\":\"MAINTENANCE\"}', NULL, NULL, 'SUCCESS', NULL, '2025-12-23 15:46:39'),
(176, '9f16e311-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.quality\",\"role\":\"QC_INSPECTOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:48:36'),
(177, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:48:56'),
(178, '9f16e311-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.quality\",\"role\":\"QC_INSPECTOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:50:31'),
(179, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:50:44'),
(180, 'a5033208-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"export.import\",\"role\":\"IMPEX_OFFICER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:52:19'),
(181, '944ddfc2-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"operator.production\",\"role\":\"PRODUCTION_OPERATOR\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:52:32'),
(182, 'dd92f398-df1f-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"proplanner.proplanner\",\"role\":\"PRODUCTION_PLANNER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:52:39'),
(183, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:52:50'),
(184, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:53:09'),
(185, '8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'USER_LOGIN', 'AUTHENTICATION', NULL, NULL, NULL, '{\"username\":\"maintenance.maintenance\",\"role\":\"MAINTENANCE_TECHNICIAN\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'SUCCESS', NULL, '2025-12-23 15:53:51');

-- --------------------------------------------------------

--
-- Table structure for table `bill_of_materials`
--

CREATE TABLE `bill_of_materials` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `bom_number` varchar(50) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `version` varchar(20) DEFAULT '1.0',
  `effective_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `quantity` decimal(15,3) DEFAULT 1.000,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('a52dce54-dd9f-11f0-83eb-74d435ebdbb2', 'PROD', 'Production', 'Manufacturing and production operations', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52dfa93-dd9f-11f0-83eb-74d435ebdbb2', 'QC', 'Quality Control', 'Quality assurance and inspection', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52dfb50-dd9f-11f0-83eb-74d435ebdbb2', 'WARE', 'Warehouse', 'Inventory and warehouse management', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52dfbfc-dd9f-11f0-83eb-74d435ebdbb2', 'PURCH', 'Purchasing', 'Procurement and supplier management', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52dfc3d-dd9f-11f0-83eb-74d435ebdbb2', 'ACCT', 'Accounting', 'Financial accounting and reporting', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 'HR', 'Human Resources', 'Employee management and payroll', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52e0561-dd9f-11f0-83eb-74d435ebdbb2', 'MAINT', 'Maintenance', 'Equipment maintenance and repair', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52e05b0-dd9f-11f0-83eb-74d435ebdbb2', 'PLAN', 'Planning', 'Production planning and scheduling', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52e05f4-dd9f-11f0-83eb-74d435ebdbb2', 'SALES', 'Sales', 'Sales and customer relations', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52e0639-dd9f-11f0-83eb-74d435ebdbb2', 'IT', 'IT', 'Information technology support', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 'MGMT', 'Management', 'Executive management', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52e06bc-dd9f-11f0-83eb-74d435ebdbb2', 'MOLD', 'Mold', 'Mold management and maintenance', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a52e06fe-dd9f-11f0-83eb-74d435ebdbb2', 'IMPEX', 'Import/Export', 'Import and export documentation', NULL, 1, '2025-12-20 20:30:18', '2025-12-20 20:30:18');

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
('19627bd6-df0d-11f0-9861-74d435ebdbb2', 'EMP005', 'dhead', 'dhead', 'dhead@gmail.com', '09123456998', NULL, 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 'department head', '2025-12-22', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 08:06:19', '2025-12-22 08:12:35'),
('21e774d3-dff8-11f0-93ac-74d435ebdbb2', 'EMP007', 'Ehdrian', 'Bungubung', 'ehdrian@gmail.com', '09852662051', NULL, 'a52e0639-dd9f-11f0-83eb-74d435ebdbb2', 'Software Engineer', '2025-12-22', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-23 12:08:46', '2025-12-23 12:09:05'),
('45fe7f2a-e006-11f0-93ac-74d435ebdbb2', 'EMP009', 'maintenance', 'maintenance', 'maintenance@gmail.com', '09123456330', NULL, 'a52e0561-dd9f-11f0-83eb-74d435ebdbb2', 'maintenance admin', '2025-12-23', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-23 13:49:59', '2025-12-23 13:49:59'),
('592c494d-e006-11f0-93ac-74d435ebdbb2', 'EMP010', 'production', 'operator', 'prooperator@gmail.com', '09123456225', NULL, 'a52dce54-dd9f-11f0-83eb-74d435ebdbb2', 'production ope admin', '2025-12-23', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-23 13:50:31', '2025-12-23 13:50:31'),
('67b9f9bc-e006-11f0-93ac-74d435ebdbb2', 'EMP011', 'quality', 'operator', 'quality@gmail.com', '09123456551', NULL, 'a52dfa93-dd9f-11f0-83eb-74d435ebdbb2', 'quality admin', '2025-12-23', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-23 13:50:56', '2025-12-23 13:50:56'),
('6f12b49a-dff8-11f0-93ac-74d435ebdbb2', 'EMP008', 'Gnehm Ryien', 'Rane', 'gnehm@gmail.com', '09852662052', NULL, 'a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 'HR Admin', '2025-12-21', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-23 12:10:55', '2025-12-23 13:05:14'),
('7a68e49a-e006-11f0-93ac-74d435ebdbb2', 'EMP012', 'import', 'export', 'import@gmail.com', '09123456227', NULL, 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 'dsa', '2025-12-23', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-23 13:51:27', '2025-12-23 13:51:27'),
('8d5a2edd-df0b-11f0-9861-74d435ebdbb2', 'EMP001', 'hr', 'hr', 'hr@gmail.com', '09123456789', 'ds', 'a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 'HR Admin', '2025-12-21', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 07:55:15', '2025-12-22 08:01:54'),
('a0345c28-df0c-11f0-9861-74d435ebdbb2', 'EMP002', 'purchasing', 'purchasing', 'purchasing@gmail.com', '09123123222', NULL, 'a52dfbfc-dd9f-11f0-83eb-74d435ebdbb2', 'purchasing admin', '2025-12-20', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 08:02:56', '2025-12-22 08:11:27'),
('d17e08e1-df1f-11f0-9861-74d435ebdbb2', 'EMP006', 'proplanner', 'proplanner', 'proplanner@gmail.com', '09123456437', NULL, 'a52dce54-dd9f-11f0-83eb-74d435ebdbb2', 'Production Admin', '2025-12-22', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 10:20:19', '2025-12-22 10:20:19'),
('d1be27c6-df0c-11f0-9861-74d435ebdbb2', 'EMP003', 'president', 'president', 'president@gmail.com', '09123456444', NULL, 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 'president', '2025-12-22', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 08:04:19', '2025-12-22 08:04:19'),
('ed53515a-df0c-11f0-9861-74d435ebdbb2', 'EMP004', 'gmanager', 'gmanager', 'gmanager@gmail.com', '09123126664', NULL, 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 'general manager', '2025-12-22', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 08:05:05', '2025-12-22 08:05:05');

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

--
-- Dumping data for table `employee_documents`
--

INSERT INTO `employee_documents` (`id`, `employee_id`, `document_type`, `document_name`, `file_path`, `upload_date`, `uploaded_by`, `notes`, `created_at`) VALUES
('da4e6b55-ddd0-11f0-83eb-74d435ebdbb2', '06b3c304-ddb8-11f0-83eb-74d435ebdbb2', 'CONTRACT', 'a.PNG', '/uploads/employee-documents/06b3c304-ddb8-11f0-83eb-74d435ebdbb2_1766254952434.PNG', '2025-12-21', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', NULL, '2025-12-20 18:22:32');

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
('8da3b4db-e012-11f0-93ac-74d435ebdbb2', '111', 'MARTILYO MOLDER', 'ewan', 'ewan', 'dsad', '3232', NULL, '2025-12-30', NULL, 'cavite', NULL, 'MAINTENANCE', NULL, NULL, '2025-12-23 23:17:53', '2025-12-23 23:46:39');

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
('78b37cd2-df17-11f0-9861-74d435ebdbb2', '78b2d7d4-df17-11f0-9861-74d435ebdbb2', '74c741c5-defa-11f0-9861-74d435ebdbb2', 50.000, 0.000, '2025-12-22 17:20:34', '2025-12-22 17:20:34', '2025-12-22 17:20:34'),
('d6be7c21-df17-11f0-9861-74d435ebdbb2', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', '74c741c5-defa-11f0-9861-74d435ebdbb2', 100.000, 0.000, '2025-12-22 17:24:41', '2025-12-22 17:23:12', '2025-12-22 17:24:41');

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

--
-- Dumping data for table `inventory_transactions`
--

INSERT INTO `inventory_transactions` (`id`, `transaction_number`, `transaction_date`, `transaction_type`, `item_id`, `warehouse_id`, `quantity`, `unit_cost`, `total_cost`, `reference_type`, `reference_id`, `reference_number`, `notes`, `created_by`, `created_at`) VALUES
('0bf23117-df18-11f0-9861-74d435ebdbb2', 'TXN2025-000003', '2025-12-22 17:24:41', 'ADJUSTMENT', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', '74c741c5-defa-11f0-9861-74d435ebdbb2', 100.000, NULL, NULL, 'ITEM_EDIT', NULL, NULL, 'Stock adjusted via item edit', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '2025-12-22 17:24:41'),
('78b44016-df17-11f0-9861-74d435ebdbb2', 'TXN2025-000001', '2025-12-22 17:20:34', 'ADJUSTMENT', '78b2d7d4-df17-11f0-9861-74d435ebdbb2', '74c741c5-defa-11f0-9861-74d435ebdbb2', 50.000, NULL, NULL, 'INITIAL_STOCK', NULL, NULL, 'Initial stock entry', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '2025-12-22 17:20:34'),
('d6bf5b77-df17-11f0-9861-74d435ebdbb2', 'TXN2025-000002', '2025-12-22 17:23:12', 'ADJUSTMENT', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', '74c741c5-defa-11f0-9861-74d435ebdbb2', 0.000, NULL, NULL, 'INITIAL_STOCK', NULL, NULL, 'Initial stock entry', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '2025-12-22 17:23:12');

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
('78b2d7d4-df17-11f0-9861-74d435ebdbb2', '242', 'Dos Por Dos', NULL, NULL, '78b25893-df17-11f0-9861-74d435ebdbb2', 'FINISHED_GOODS', 0.000, 0.000, 0.000, 0.000, 100.00, 150.00, 1, NULL, '2025-12-22 17:20:34', '2025-12-22 17:20:34'),
('d6bd1f4a-df17-11f0-9861-74d435ebdbb2', '001', 'Nut', NULL, NULL, '78b25893-df17-11f0-9861-74d435ebdbb2', 'FINISHED_GOODS', 0.000, 0.000, 0.000, 0.000, 40.00, 50.00, 1, NULL, '2025-12-22 17:23:12', '2025-12-22 17:24:41');

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

--
-- Dumping data for table `job_postings`
--

INSERT INTO `job_postings` (`id`, `job_title`, `department_id`, `position_level`, `job_description`, `requirements`, `salary_range`, `employment_type`, `status`, `posted_date`, `closing_date`, `created_by`, `created_at`, `updated_at`) VALUES
('4db58e4e-dff8-11f0-93ac-74d435ebdbb2', 'HR Admin', 'a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 'Admin', 'HR ADMIN', 'College Graduate', '11,000 - 15,000', 'FULL_TIME', 'OPEN', '2025-12-23', '2025-12-30', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', '2025-12-23 12:09:59', '2025-12-23 12:09:59'),
('52119934-ddc1-11f0-83eb-74d435ebdbb2', 'IT Support', 'a52e0639-dd9f-11f0-83eb-74d435ebdbb2', '1', 'r', 'r', '8000-11,000', 'PART_TIME', 'OPEN', '2025-12-20', '2025-12-29', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 16:31:21', '2025-12-20 17:19:15');

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

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `days_requested`, `reason`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`, `updated_at`, `approval_stage`, `dept_head_approved_by`, `dept_head_approved_at`, `gm_approved_by`, `gm_approved_at`, `dept_head_rejection_reason`, `gm_rejection_reason`, `hr_reviewed_by`, `hr_reviewed_at`, `hr_rejection_reason`) VALUES
('8c3bfdf7-e000-11f0-93ac-74d435ebdbb2', '21e774d3-dff8-11f0-93ac-74d435ebdbb2', '300b006a-ddb4-11f0-83eb-74d435ebdbb2', '2025-12-25', '2025-12-27', 1.00, NULL, 'PENDING', NULL, '2025-12-23 13:09:20', NULL, '2025-12-23 13:09:00', '2025-12-23 13:09:20', 'DEPARTMENT_HEAD', NULL, NULL, NULL, NULL, NULL, NULL, '9b489fe0-df0b-11f0-9861-74d435ebdbb2', '2025-12-23 13:09:20', NULL),
('c49bd385-ddbc-11f0-83eb-74d435ebdbb2', '79ba8ef3-ddbc-11f0-83eb-74d435ebdbb2', '300b0112-ddb4-11f0-83eb-74d435ebdbb2', '2025-12-21', '2025-12-22', 1.00, NULL, 'CANCELLED', NULL, '2025-12-20 16:10:34', NULL, '2025-12-20 15:58:46', '2025-12-20 16:10:34', 'DEPARTMENT_HEAD', NULL, NULL, NULL, NULL, NULL, NULL, '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 16:09:56', NULL);

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

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `leave_name`, `leave_code`, `default_credits`, `is_paid`, `requires_approval`, `description`, `is_active`, `created_at`) VALUES
('300ae94b-ddb4-11f0-83eb-74d435ebdbb2', 'Vacation Leave', 'VL', 15.00, 1, 1, 'Annual vacation leave', 1, '2025-12-20 14:57:21'),
('300b006a-ddb4-11f0-83eb-74d435ebdbb2', 'Sick Leave', 'SL', 15.00, 1, 1, 'Sick leave with medical certificate', 1, '2025-12-20 14:57:21'),
('300b0112-ddb4-11f0-83eb-74d435ebdbb2', 'Emergency Leave', 'EL', 5.00, 1, 1, 'Emergency or urgent personal matters', 1, '2025-12-20 14:57:21'),
('300b01b3-ddb4-11f0-83eb-74d435ebdbb2', 'Maternity Leave', 'ML', 105.00, 1, 1, 'Maternity leave for female employees', 1, '2025-12-20 14:57:21'),
('300b01eb-ddb4-11f0-83eb-74d435ebdbb2', 'Paternity Leave', 'PL', 7.00, 1, 1, 'Paternity leave for male employees', 1, '2025-12-20 14:57:21'),
('300b021e-ddb4-11f0-83eb-74d435ebdbb2', 'Unpaid Leave', 'UL', 0.00, 0, 1, 'Leave without pay', 1, '2025-12-20 14:57:21');

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
('18a1776f-e015-11f0-93ac-74d435ebdbb2', 'MWO-1766504166124', '2025-12-23', '8da3b4db-e012-11f0-93ac-74d435ebdbb2', NULL, NULL, 'PREDICTIVE', 'NORMAL', 'dsadas', '2025-12-30 00:00:00', NULL, NULL, NULL, '', '8c146c1a-e006-11f0-93ac-74d435ebdbb2', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, '2025-12-23 23:36:06', '2025-12-23 23:36:06'),
('4d00a7fd-e015-11f0-93ac-74d435ebdbb2', 'MWO-1766504253988', '2025-12-23', '8da3b4db-e012-11f0-93ac-74d435ebdbb2', NULL, NULL, 'PREDICTIVE', 'HIGH', '', '2025-12-28 00:00:00', NULL, NULL, NULL, '', '8c146c1a-e006-11f0-93ac-74d435ebdbb2', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, '2025-12-23 23:37:33', '2025-12-23 23:37:33'),
('b31c0a9f-e015-11f0-93ac-74d435ebdbb2', 'MWO-1766504425296', '2025-12-23', '8da3b4db-e012-11f0-93ac-74d435ebdbb2', NULL, NULL, 'PREDICTIVE', 'URGENT', '', '2025-12-25 00:00:00', NULL, NULL, NULL, '', '8c146c1a-e006-11f0-93ac-74d435ebdbb2', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, '2025-12-23 23:40:25', '2025-12-23 23:40:25');

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
(1, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'New PR Awaiting Approval', 'Purchase Requisition PR-0004 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 1, '2025-12-23 12:45:44', '2025-12-23 08:03:17'),
(2, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'New PR Awaiting Approval', 'Purchase Requisition PR-0004 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 1, '2025-12-23 12:15:52', '2025-12-23 08:03:17'),
(3, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'New PR Awaiting Approval', 'Purchase Requisition PR-0004 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 1, '2025-12-23 08:03:27', '2025-12-23 08:03:17'),
(4, '2025d81d-df0d-11f0-9861-74d435ebdbb2', 'New PR Awaiting Approval', 'Purchase Requisition PR-0005 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '5e03886e-dfd8-11f0-9857-74d435ebdbb2', 1, '2025-12-23 12:45:39', '2025-12-23 08:21:32'),
(5, 'd82c689c-df0c-11f0-9861-74d435ebdbb2', 'New PR Awaiting Approval', 'Purchase Requisition PR-0005 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '5e03886e-dfd8-11f0-9857-74d435ebdbb2', 1, '2025-12-23 12:15:33', '2025-12-23 08:21:32'),
(6, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'New PR Awaiting Approval', 'Purchase Requisition PR-0005 has been submitted and requires your approval', 'INFO', 'APPROVAL', 'purchase_requisition', '5e03886e-dfd8-11f0-9857-74d435ebdbb2', 1, '2025-12-23 08:21:51', '2025-12-23 08:21:32');

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
('0f8c53ee-dfd3-11f0-9857-74d435ebdbb2', 'PO-0003', '2025-12-23', 'df6d81ef-df00-11f0-9861-74d435ebdbb2', '2025-12-24', NULL, NULL, NULL, NULL, 'Blk 5 lot 10', 'ewan', 'SENT', 2000.00, 240.00, 0.00, 2240.00, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:36:26', NULL, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 15:43:24', '2025-12-23 16:56:28'),
('ac2bfcc5-dfce-11f0-9857-74d435ebdbb2', 'PO-0002', '2025-12-23', '2146da91-df0e-11f0-9861-74d435ebdbb2', '2025-12-27', NULL, NULL, NULL, NULL, 'Blk 5 lot 5', NULL, 'SENT', 4000.00, 480.00, 0.00, 4480.00, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:56:35', NULL, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 15:11:59', '2025-12-23 21:13:16'),
('c6dfcc5f-df18-11f0-9861-74d435ebdbb2', 'PO-0001', '2025-12-22', 'df6d81ef-df00-11f0-9861-74d435ebdbb2', '2025-12-31', NULL, NULL, NULL, NULL, 'Blk 5 lot 10', 'ewan', 'SENT', 400.00, 48.00, 0.00, 448.00, 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:56:36', NULL, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '2025-12-22 17:29:55', '2025-12-23 21:13:18');

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
('0f8ce5b1-dfd3-11f0-9857-74d435ebdbb2', '0f8c53ee-dfd3-11f0-9857-74d435ebdbb2', NULL, 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', 50.000, 0.000, 40.00, 2240.00, 12.00, 0.00, NULL, '2025-12-23 15:43:24', '2025-12-23 15:43:24'),
('ac2c719f-dfce-11f0-9857-74d435ebdbb2', 'ac2bfcc5-dfce-11f0-9857-74d435ebdbb2', NULL, 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', 100.000, 0.000, 40.00, 4480.00, 12.00, 0.00, NULL, '2025-12-23 15:11:59', '2025-12-23 15:11:59'),
('c6e0410c-df18-11f0-9861-74d435ebdbb2', 'c6dfcc5f-df18-11f0-9861-74d435ebdbb2', NULL, 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', 10.000, 0.000, 40.00, 448.00, 12.00, 0.00, NULL, '2025-12-22 17:29:55', '2025-12-22 17:29:55');

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
('5e03886e-dfd8-11f0-9857-74d435ebdbb2', 'PR-0005', '2025-12-23', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'IT', 'MANUAL', NULL, '2025-12-25', 'APPROVED', 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:22:38', NULL, 'das', '2025-12-23 16:21:23', '2025-12-23 16:22:38'),
('89f22b14-df18-11f0-9861-74d435ebdbb2', 'PR-0001', '2025-12-22', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'Maintenance', 'DEPARTMENTAL', NULL, '2025-12-30', 'APPROVED', 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:24:31', NULL, NULL, '2025-12-22 17:28:12', '2025-12-23 16:24:31'),
('a2946e1e-dfce-11f0-9857-74d435ebdbb2', 'PR-0002', '2025-12-23', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'Quality Control', 'LOW_STOCK', NULL, '2025-12-25', 'REJECTED', 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:31:07', 'DD', NULL, '2025-12-23 15:11:43', '2025-12-23 16:31:07'),
('c25f2127-dfd4-11f0-9857-74d435ebdbb2', 'PR-0003', '2025-12-23', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'Sales', 'LOW_STOCK', NULL, '2025-12-30', 'REJECTED', 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:22:53', 'dsadas', NULL, '2025-12-23 15:55:33', '2025-12-23 16:22:53'),
('cb43e719-dfd5-11f0-9857-74d435ebdbb2', 'PR-0004', '2025-12-22', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'IT', 'LOW_STOCK', NULL, '2025-12-31', 'APPROVED', 'f4de36c7-df0c-11f0-9861-74d435ebdbb2', '2025-12-23 16:24:36', NULL, NULL, '2025-12-23 16:02:58', '2025-12-23 16:24:36');

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
('5e03c0c7-dfd8-11f0-9857-74d435ebdbb2', '5e03886e-dfd8-11f0-9857-74d435ebdbb2', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', 6.000, 40.00, 240.00, '2025-12-29', 'das', NULL, '2025-12-23 16:21:23', '2025-12-23 16:21:23'),
('89f2a7e0-df18-11f0-9861-74d435ebdbb2', '89f22b14-df18-11f0-9861-74d435ebdbb2', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', 50.000, 40.00, 2000.00, '2025-12-30', NULL, NULL, '2025-12-22 17:28:12', '2025-12-22 17:28:12'),
('a294a3c0-dfce-11f0-9857-74d435ebdbb2', 'a2946e1e-dfce-11f0-9857-74d435ebdbb2', '78b2d7d4-df17-11f0-9861-74d435ebdbb2', 100.000, 100.00, 10000.00, '2026-01-01', NULL, NULL, '2025-12-23 15:11:43', '2025-12-23 15:11:43'),
('c25ff249-dfd4-11f0-9857-74d435ebdbb2', 'c25f2127-dfd4-11f0-9857-74d435ebdbb2', '78b2d7d4-df17-11f0-9861-74d435ebdbb2', 1.000, 100.00, 100.00, '2025-12-30', NULL, NULL, '2025-12-23 15:55:33', '2025-12-23 15:55:33'),
('d1e955a1-dfd5-11f0-9857-74d435ebdbb2', 'cb43e719-dfd5-11f0-9857-74d435ebdbb2', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', 10.000, 40.00, 400.00, '2025-12-29', NULL, NULL, '2025-12-23 16:03:09', '2025-12-23 16:03:09');

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
('93bc5ade-e017-11f0-93ac-74d435ebdbb2', '8c146c1a-e006-11f0-93ac-74d435ebdbb2', '7ac125f1-5a5b-49d7-a1fe-fee25ec1cb46', '2025-12-30 23:53:51', '2025-12-23 23:53:51');

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
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `approved_by` varchar(36) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('2146da91-df0e-11f0-9861-74d435ebdbb2', '002', 'MISUBIBI', 'dsada', 'dsad@gmail.com', '09123456789', 'Blk 5 lot 5', 'Imus', 'Philippines', NULL, 5.00, 1, NULL, '2025-12-22 16:13:42', '2025-12-22 16:13:42'),
('639feda2-df0e-11f0-9861-74d435ebdbb2', '003', 'HONDA', 'HONDA', 'HONDA@GMAIL.COM', '0912312321', 'Blk 5 lot 10', 'QC', 'PH', NULL, 0.00, 1, NULL, '2025-12-22 16:15:33', '2025-12-22 16:15:33'),
('df6d81ef-df00-11f0-9861-74d435ebdbb2', '001', 'TOYOTO', 'EWAN', 'EWAN@GMAIL.COM', '0912312322', 'Blk 5 lot 10', 'CAVITE', 'PH', 'ewan', 3.99, 1, NULL, '2025-12-22 14:38:48', '2025-12-22 14:38:48');

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
('78b25893-df17-11f0-9861-74d435ebdbb2', 'PCS', 'Pieces', 'Default unit of measure', 1, '2025-12-22 17:20:34', '2025-12-22 17:20:34');

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
('16c73a64-e000-11f0-93ac-74d435ebdbb2', 'gnehm@gmail.com', 'rane.gnehm', '$2a$10$PtqfmNDT94eIioo6k6V6GenZ5nq3w5chLIZBwrbA9ojcY1j52zfN.', 'Gnehm Ryien', 'Rane', 'WAREHOUSE_STAFF', 'a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 21:06:28', '2025-12-23 21:05:43', '2025-12-23 21:06:28', '6f12b49a-dff8-11f0-93ac-74d435ebdbb2'),
('2025d81d-df0d-11f0-9861-74d435ebdbb2', 'dhead@gmail.com', 'dhead.dhead', '$2a$10$7EZ/oKvMv/ycBTvN7alZJ.LBq/v7EphENIxm6Y.ifu4owWPY3eDlS', 'dhead', 'dhead', 'DEPARTMENT_HEAD', 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 21:12:05', '2025-12-22 16:06:30', '2025-12-23 21:12:05', '19627bd6-df0d-11f0-9861-74d435ebdbb2'),
('42e84e62-df0b-11f0-9861-74d435ebdbb2', 'admin@gmail.com', 'admin', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'admin', 'admin', 'SYSTEM_ADMIN', NULL, 1, '2025-12-23 21:51:43', '2025-12-22 15:53:10', '2025-12-23 21:51:43', NULL),
('771b4f6c-e000-11f0-93ac-74d435ebdbb2', 'ehdrian@gmail.com', 'bungubung.ehdrian', '$2a$10$h/N/TgSjmgxu/ZxawAAdNeTXKWNRkBMdro4lvJDhh.nlVjwlU70uS', 'Ehdrian', 'Bungubung', 'EMPLOYEE', 'a52e0639-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 21:08:30', '2025-12-23 21:08:25', '2025-12-23 21:08:30', '21e774d3-dff8-11f0-93ac-74d435ebdbb2'),
('8c146c1a-e006-11f0-93ac-74d435ebdbb2', 'maintenance@gmail.com', 'maintenance.maintenance', '$2a$10$viqKs99f.TtPOV9p7B0Buu0a8PDoDdC2TQbVKkfqZ36l8vwe7gwri', 'maintenance', 'maintenance', 'MAINTENANCE_TECHNICIAN', 'a52e0561-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 23:53:51', '2025-12-23 21:51:57', '2025-12-23 23:53:51', '45fe7f2a-e006-11f0-93ac-74d435ebdbb2'),
('944ddfc2-e006-11f0-93ac-74d435ebdbb2', 'prooperator@gmail.com', 'operator.production', '$2a$10$ZfDSTxdhL7TGNxA1feYWSOGbDFszu0fcbHUhEJz2M1.6swoqUBgI2', 'production', 'operator', 'PRODUCTION_OPERATOR', 'a52dce54-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 23:52:32', '2025-12-23 21:52:11', '2025-12-23 23:52:32', '592c494d-e006-11f0-93ac-74d435ebdbb2'),
('9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'hr@gmail.com', 'hruser', '$2a$10$DGjQhfoCoaiH90wU0HF8GOHKB0IxTaCAKR330MXMS.iXXpkX1wSpG', 'hr', 'hr', 'HR_STAFF', 'a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 22:50:29', '2025-12-22 15:55:38', '2025-12-23 22:50:29', '8d5a2edd-df0b-11f0-9861-74d435ebdbb2'),
('9f16e311-e006-11f0-93ac-74d435ebdbb2', 'quality@gmail.com', 'operator.quality', '$2a$10$CnnCcSOKr8JEGHP/oe9rAOHRDBDG7LgWBGN4cDkm730kGnzUEleNK', 'quality', 'operator', 'QC_INSPECTOR', 'a52dfa93-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 23:50:31', '2025-12-23 21:52:29', '2025-12-23 23:50:31', '67b9f9bc-e006-11f0-93ac-74d435ebdbb2'),
('a5033208-e006-11f0-93ac-74d435ebdbb2', 'import@gmail.com', 'export.import', '$2a$10$RNjQROVWd/opBs7SSBMlReRoVsZJcUNMt/qDOx4CrWPNKGuOOpCpK', 'import', 'export', 'IMPEX_OFFICER', 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 23:52:19', '2025-12-23 21:52:39', '2025-12-23 23:52:19', '7a68e49a-e006-11f0-93ac-74d435ebdbb2'),
('a7668bec-df0c-11f0-9861-74d435ebdbb2', 'purchasing@gmail.com', 'purchasing.purchasing', '$2a$10$aiekMn4tnH1/JpU7nmMjT.rVAAPa7K425ye3CQPeVerAeD3ts51k6', 'purchasing', 'purchasing', 'PURCHASING_STAFF', 'a52dfbfc-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 16:33:58', '2025-12-22 16:03:08', '2025-12-23 16:33:58', 'a0345c28-df0c-11f0-9861-74d435ebdbb2'),
('d82c689c-df0c-11f0-9861-74d435ebdbb2', 'president@gmail.com', 'president.president', '$2a$10$a.Cxwmy7btTYqRfWN8reYOAqVdOOzNOpLkGzCmc7StHLpsNxxrxAu', 'president', 'president', 'PRESIDENT', 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 20:15:18', '2025-12-22 16:04:30', '2025-12-23 20:15:18', 'd1be27c6-df0c-11f0-9861-74d435ebdbb2'),
('dd92f398-df1f-11f0-9861-74d435ebdbb2', 'proplanner@gmail.com', 'proplanner.proplanner', '$2a$10$8s1CO0kX3NkkDsi24x9z4.yWM5nsMjLC046dcz4yL2k6OBXfYcCVm', 'proplanner', 'proplanner', 'PRODUCTION_PLANNER', 'a52dce54-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 23:52:39', '2025-12-22 18:20:39', '2025-12-23 23:52:39', 'd17e08e1-df1f-11f0-9861-74d435ebdbb2'),
('f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'gmanager@gmail.com', 'gmanager.gmanager', '$2a$10$aio0mV0CdaBPzPGDI1mg4.hDcHpibxZ65yKw975Am0b2y2l/8vMo2', 'gmanager', 'gmanager', 'GENERAL_MANAGER', 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-23 23:53:09', '2025-12-22 16:05:18', '2025-12-23 23:53:09', 'ed53515a-df0c-11f0-9861-74d435ebdbb2');

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
('74c7181a-defa-11f0-9861-74d435ebdbb2', 'WH-MAIN', 'Main Warehouse', 'Building A', 'Main facility warehouse for general storage', NULL, 1, '2025-12-22 13:52:52', '2025-12-22 13:52:52'),
('74c740bc-defa-11f0-9861-74d435ebdbb2', 'WH-RAW', 'Raw Materials Warehouse', 'Building B', 'Storage for raw materials and components', NULL, 1, '2025-12-22 13:52:52', '2025-12-22 13:52:52'),
('74c741c5-defa-11f0-9861-74d435ebdbb2', 'WH-FG', 'Finished Goods Warehouse', 'Building C', 'Storage for finished products ready for shipment', NULL, 1, '2025-12-22 13:52:52', '2025-12-22 13:52:52'),
('74c7422c-defa-11f0-9861-74d435ebdbb2', 'WH-PROD', 'Production Warehouse', 'Production Floor', 'In-process inventory storage', NULL, 1, '2025-12-22 13:52:52', '2025-12-22 13:52:52');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=186;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_issue_items`
--
ALTER TABLE `stock_issue_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `bom_items_ibfk_1` FOREIGN KEY (`bom_id`) REFERENCES `bill_of_materials` (`id`) ON DELETE CASCADE,
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

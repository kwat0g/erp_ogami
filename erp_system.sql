-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 22, 2025 at 10:54 AM
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
('96b9c030-ddcd-11f0-83eb-74d435ebdbb2', '296f5978-ddc8-11f0-83eb-74d435ebdbb2', '2025-12-20', '07:00:00', '17:00:00', 'PRESENT', 10.00, 0.00, 0, NULL, NULL, 'dsa', '2025-12-20 17:59:10', '2025-12-20 17:59:10'),
('bfd2c170-ddba-11f0-83eb-74d435ebdbb2', '06b3c304-ddb8-11f0-83eb-74d435ebdbb2', '2025-12-20', '08:00:00', '20:00:00', 'LATE', 12.00, 0.00, 1, '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 15:44:51', '\n[2025-12-20T15:44:36.810Z] dsa', '2025-12-20 15:44:19', '2025-12-20 15:44:51'),
('cc8763e7-ddcc-11f0-83eb-74d435ebdbb2', 'c01b2d74-ddc3-11f0-83eb-74d435ebdbb2', '2025-12-20', '07:00:00', '19:00:00', 'PRESENT', 12.00, 0.00, 1, '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 17:58:52', NULL, '2025-12-20 17:53:31', '2025-12-20 17:58:52');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` varchar(36) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
('01b02fa3-defa-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'items', NULL, NULL, '{\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"\",\"categoryId\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":1,\"reorderQuantity\":1,\"minStockLevel\":5,\"maxStockLevel\":200,\"standardCost\":250,\"sellingPrice\":300,\"isActive\":true,\"initialStock\":100,\"warehouseId\":null}', NULL, NULL, '2025-12-22 13:49:39'),
('03222e99-ddac-11f0-83eb-74d435ebdbb2', 'admin-001', 'CREATE', 'users', '0', NULL, '{\"email\":\"hr@gmail.com\",\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', NULL, NULL, '2025-12-20 21:58:49'),
('035ca039-ddc8-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'job_postings', '52119934-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"OPEN\"}', NULL, NULL, '2025-12-21 01:19:15'),
('06b43b2a-ddb8-11f0-83eb-74d435ebdbb2', NULL, 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP001\",\"firstName\":\"hr\",\"lastName\":\"hr\",\"email\":\"hr@gmail.com\"}', NULL, NULL, '2025-12-20 23:24:49'),
('086fdc11-df13-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_orders', '086dfbe9-df13-11f0-9861-74d435ebdbb2', NULL, '{\"poNumber\":\"PO-0003\",\"poDate\":\"2025-12-22\",\"supplierId\":\"639feda2-df0e-11f0-9861-74d435ebdbb2\",\"totalAmount\":3920}', NULL, NULL, '2025-12-22 16:48:48'),
('091f46f9-df07-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '83fc4892-ddbc-11f0-83eb-74d435ebdbb2', '{\"email\":\"\",\"role\":\"EMPLOYEE\"}', '{\"role\":\"EMPLOYEE\"}', NULL, NULL, '2025-12-22 15:22:55'),
('093f499a-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'job_postings', '52119934-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"CLOSED\"}', NULL, NULL, '2025-12-21 00:36:28'),
('0bf27c61-df18-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'items', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', '{\"id\":\"d6bd1f4a-df17-11f0-9861-74d435ebdbb2\",\"code\":\"001\",\"name\":\"Nut\",\"description\":null,\"category_id\":null,\"uom_id\":\"78b25893-df17-11f0-9861-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"0.000\",\"reorder_quantity\":\"0.000\",\"min_stock_level\":\"0.000\",\"max_stock_level\":\"0.000\",\"standard_cost\":\"40.00\",\"selling_price\":\"50.00\",\"is_active\":0,\"notes\":null,\"created_at\":\"2025-12-22T09:23:12.000Z\",\"updated_at\":\"2025-12-22T09:23:12.000Z\"}', '{\"code\":\"001\",\"name\":\"Nut\",\"description\":\"\",\"itemType\":\"FINISHED_GOODS\",\"standardCost\":40,\"sellingPrice\":50,\"initialStock\":100,\"warehouseId\":\"74c741c5-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 17:24:41'),
('13e9dd0f-ddac-11f0-83eb-74d435ebdbb2', 'admin-001', 'DELETE', 'users', '03219c95-ddac-11f0-83eb-74d435ebdbb2', '{\"email\":\"hr@gmail.com\",\"username\":\"hruser\"}', NULL, NULL, NULL, '2025-12-20 21:59:17'),
('15308d81-defe-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_requisitions', '15303d97-defe-11f0-9861-74d435ebdbb2', NULL, '{\"prNumber\":\"PR-0001\",\"prDate\":\"2025-12-22\",\"department\":\"Purchasing\",\"items\":[{\"itemId\":\"f5cf1453-defa-11f0-9861-74d435ebdbb2\",\"quantity\":5,\"estimatedUnitPrice\":\"250.00\",\"estimatedTotalPrice\":1250,\"requiredDate\":\"2025-12-30\",\"purpose\":\"dsada\"}]}', NULL, NULL, '2025-12-22 14:18:50'),
('1590019f-def9-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'DELETE', 'items', '9ccc81a7-dda0-11f0-83eb-74d435ebdbb2', '{\"id\":\"9ccc81a7-dda0-11f0-83eb-74d435ebdbb2\",\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"TUBO\",\"category_id\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a530f1f2-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"5.000\",\"reorder_quantity\":\"5.000\",\"min_stock_level\":\"49.999\",\"max_stock_level\":\"100.000\",\"standard_cost\":\"150.00\",\"selling_price\":\"250.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-20T12:37:13.000Z\",\"updated_at\":\"2025-12-20T12:50:33.000Z\"}', NULL, NULL, NULL, '2025-12-22 13:43:03'),
('167a147c-def9-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'DELETE', 'items', 'ad8c8027-def8-11f0-9861-74d435ebdbb2', '{\"id\":\"ad8c8027-def8-11f0-9861-74d435ebdbb2\",\"code\":\"dsa\",\"name\":\"dsadsa\",\"description\":\"dsa\",\"category_id\":\"a53349b3-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"SEMI_FINISHED\",\"reorder_level\":\"2.000\",\"reorder_quantity\":\"6.000\",\"min_stock_level\":\"10.000\",\"max_stock_level\":\"198.999\",\"standard_cost\":\"323.00\",\"selling_price\":\"2222.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T05:40:08.000Z\",\"updated_at\":\"2025-12-22T05:40:08.000Z\"}', NULL, NULL, NULL, '2025-12-22 13:43:04'),
('16c1ae47-ddcd-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'payroll_inputs', '0', NULL, '{\"employeeId\":\"c01b2d74-ddc3-11f0-83eb-74d435ebdbb2\",\"periodStart\":\"2025-12-16\",\"periodEnd\":\"2025-12-30\",\"inputType\":\"BONUS\",\"description\":\"dsa\",\"amount\":500}', NULL, NULL, '2025-12-21 01:55:36'),
('1757267f-def9-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'DELETE', 'items', '777a00c8-dda4-11f0-83eb-74d435ebdbb2', '{\"id\":\"777a00c8-dda4-11f0-83eb-74d435ebdbb2\",\"code\":\"dsad\",\"name\":\"dasd\",\"description\":\"dsad\",\"category_id\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311c7e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"232.000\",\"reorder_quantity\":\"323.000\",\"min_stock_level\":\"232.000\",\"max_stock_level\":\"32322332.000\",\"standard_cost\":\"3232.00\",\"selling_price\":\"3232.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-20T13:04:48.000Z\",\"updated_at\":\"2025-12-20T13:04:48.000Z\"}', NULL, NULL, NULL, '2025-12-22 13:43:06'),
('18f9d9b9-df08-11f0-9861-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP008\",\"firstName\":\"president\",\"lastName\":\"president\",\"email\":\"president@gmail.com\"}', NULL, NULL, '2025-12-22 15:30:31'),
('1962c93d-df0d-11f0-9861-74d435ebdbb2', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP005\",\"firstName\":\"dhead\",\"lastName\":\"dhead\",\"email\":\"dhead@gmail.com\"}', NULL, NULL, '2025-12-22 16:06:19'),
('1fcbc162-ddac-11f0-83eb-74d435ebdbb2', 'admin-001', 'CREATE', 'users', '0', NULL, '{\"email\":\"hr@gmail.com\",\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', NULL, NULL, '2025-12-20 21:59:37'),
('20262e76-df0d-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', NULL, '{\"email\":\"dhead@gmail.com\",\"username\":\"dhead.dhead\",\"role\":\"DEPARTMENT_HEAD\"}', NULL, NULL, '2025-12-22 16:06:30'),
('2147e692-df0e-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'suppliers', '2146da91-df0e-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"002\",\"name\":\"MISUBIBI\"}', NULL, NULL, '2025-12-22 16:13:42'),
('234a2ce1-ddb6-11f0-83eb-74d435ebdbb2', NULL, 'CREATE', 'attendance_logs', '0', NULL, '{\"employeeId\":\"1fcb6ccb-ddac-11f0-83eb-74d435ebdbb2\",\"attendanceDate\":\"2025-12-20\",\"status\":\"PRESENT\"}', NULL, NULL, '2025-12-20 23:11:18'),
('240a820f-ddcc-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'job_postings', 'fcd13d3f-ddcb-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"DRAFT\"}', NULL, NULL, '2025-12-21 01:48:48'),
('25eea59c-df09-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '25f070ff-df08-11f0-9861-74d435ebdbb2', '{\"email\":\"president@gmail.com\",\"role\":\"PRESIDENT\",\"isActive\":1}', '{\"role\":\"GENERAL_MANAGER\",\"isActive\":1}', NULL, NULL, '2025-12-22 15:38:02'),
('25f0f46f-df08-11f0-9861-74d435ebdbb2', 'admin-001', 'CREATE', 'users', '0', NULL, '{\"email\":\"president@gmail.com\",\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', NULL, NULL, '2025-12-22 15:30:53'),
('260822c4-ddcc-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'job_postings', 'fcd13d3f-ddcb-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"CLOSED\"}', NULL, NULL, '2025-12-21 01:48:52'),
('296fbdba-ddc8-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP005\",\"firstName\":\"dsad\",\"lastName\":\"dsad\",\"email\":\"kwatog11@gmail.com\"}', NULL, NULL, '2025-12-21 01:20:19'),
('2a42590b-ddcc-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '76c34894-ddc9-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"SCREENING\",\"interviewDate\":null,\"interviewNotes\":null,\"rejectionReason\":null}', NULL, NULL, '2025-12-21 01:48:59'),
('2c1def0f-ddcc-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '76c34894-ddc9-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"INTERVIEWED\",\"interviewDate\":null,\"interviewNotes\":null,\"rejectionReason\":null}', NULL, NULL, '2025-12-21 01:49:02'),
('2d5c71f6-ddcc-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '76c34894-ddc9-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"OFFERED\",\"interviewDate\":null,\"interviewNotes\":null,\"rejectionReason\":null}', NULL, NULL, '2025-12-21 01:49:04'),
('307e7f76-def9-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'items', NULL, NULL, '{\"code\":\"242\",\"name\":\"DOS POR DOS\",\"description\":\"DOS POR DOS, PAMALO\",\"categoryId\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":1,\"reorderQuantity\":1,\"minStockLevel\":5,\"maxStockLevel\":500,\"standardCost\":200,\"sellingPrice\":250,\"isActive\":true,\"initialStock\":100,\"warehouseId\":null}', NULL, NULL, '2025-12-22 13:43:48'),
('317c9ba4-df05-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'UPDATE', 'items', 'f5cf1453-defa-11f0-9861-74d435ebdbb2', '{\"id\":\"f5cf1453-defa-11f0-9861-74d435ebdbb2\",\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":null,\"category_id\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"1.000\",\"reorder_quantity\":\"1.000\",\"min_stock_level\":\"50.000\",\"max_stock_level\":\"250.000\",\"standard_cost\":\"250.00\",\"selling_price\":\"300.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T05:56:29.000Z\",\"updated_at\":\"2025-12-22T05:56:29.000Z\"}', '{\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"\",\"categoryId\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a530f1f2-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":1,\"reorderQuantity\":1,\"minStockLevel\":50,\"maxStockLevel\":250,\"standardCost\":250,\"sellingPrice\":300,\"isActive\":1,\"initialStock\":0,\"warehouseId\":null}', NULL, NULL, '2025-12-22 15:09:44'),
('36a73639-df14-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'items', '36a18a54-df14-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"33333\",\"name\":\"dsad\",\"description\":\"\",\"categoryId\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311ade-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":1,\"reorderQuantity\":2,\"minStockLevel\":1,\"maxStockLevel\":4,\"standardCost\":111,\"sellingPrice\":1111,\"isActive\":true,\"initialStock\":0,\"warehouseId\":\"74c7422c-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 16:57:15'),
('3edae912-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '8f51294d-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"INTERVIEWED\"}', NULL, NULL, '2025-12-21 00:37:58'),
('40fd4d1e-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"dsad\",\"lastName\":\"dasd\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\"}', NULL, NULL, '2025-12-21 00:45:11'),
('416ece34-df05-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'UPDATE', 'purchase_orders', 'b7c1d050-df04-11f0-9861-74d435ebdbb2', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, '2025-12-22 15:10:10'),
('424fb211-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '8f51294d-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\"}', NULL, NULL, '2025-12-21 00:38:04'),
('44db3473-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP-0001\",\"firstName\":\"dsad\",\"lastName\":\"dasd\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\",\"convertedFromApplicant\":\"40fcf590-ddc3-11f0-83eb-74d435ebdbb2\"}', NULL, NULL, '2025-12-21 00:45:18'),
('44db7670-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '40fcf590-ddc3-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\",\"convertedToEmployee\":0}', NULL, NULL, '2025-12-21 00:45:18'),
('4650922a-df0f-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'items', 'f6eee35c-df0e-11f0-9861-74d435ebdbb2', '{\"id\":\"f6eee35c-df0e-11f0-9861-74d435ebdbb2\",\"code\":\"dsa\",\"name\":\"dsa\",\"description\":\"ds\",\"category_id\":\"a5337ec7-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"SEMI_FINISHED\",\"reorder_level\":\"1.000\",\"reorder_quantity\":\"2.000\",\"min_stock_level\":\"1.000\",\"max_stock_level\":\"50.000\",\"standard_cost\":\"323.00\",\"selling_price\":\"3223.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T08:19:40.000Z\",\"updated_at\":\"2025-12-22T08:19:40.000Z\"}', '{\"code\":\"dsa\",\"name\":\"dsa\",\"description\":\"ds\",\"categoryId\":\"a5337ec7-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"SEMI_FINISHED\",\"reorderLevel\":1,\"reorderQuantity\":2,\"minStockLevel\":1,\"maxStockLevel\":50,\"standardCost\":323,\"sellingPrice\":3223,\"isActive\":false,\"initialStock\":0,\"warehouseId\":null}', NULL, NULL, '2025-12-22 16:21:53'),
('46c1465f-df10-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'items', '46c0d816-df10-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"dsa11\",\"name\":\"dsa\",\"description\":\"\",\"categoryId\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311ba1-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"CONSUMABLE\",\"reorderLevel\":1,\"reorderQuantity\":2,\"minStockLevel\":1,\"maxStockLevel\":5,\"standardCost\":100,\"sellingPrice\":150,\"isActive\":true,\"initialStock\":0,\"warehouseId\":\"74c7422c-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 16:29:04'),
('4865aad5-df0f-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'items', 'f6eee35c-df0e-11f0-9861-74d435ebdbb2', '{\"id\":\"f6eee35c-df0e-11f0-9861-74d435ebdbb2\",\"code\":\"dsa\",\"name\":\"dsa\",\"description\":\"ds\",\"category_id\":\"a5337ec7-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"SEMI_FINISHED\",\"reorder_level\":\"1.000\",\"reorder_quantity\":\"2.000\",\"min_stock_level\":\"1.000\",\"max_stock_level\":\"50.000\",\"standard_cost\":\"323.00\",\"selling_price\":\"3223.00\",\"is_active\":0,\"notes\":null,\"created_at\":\"2025-12-22T08:19:40.000Z\",\"updated_at\":\"2025-12-22T08:21:53.000Z\"}', '{\"code\":\"dsa\",\"name\":\"dsa\",\"description\":\"ds\",\"categoryId\":\"a5337ec7-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"SEMI_FINISHED\",\"reorderLevel\":1,\"reorderQuantity\":2,\"minStockLevel\":1,\"maxStockLevel\":50,\"standardCost\":323,\"sellingPrice\":3223,\"isActive\":true,\"initialStock\":0,\"warehouseId\":null}', NULL, NULL, '2025-12-22 16:21:57'),
('4b47835e-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '8f51294d-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"REJECTED\"}', NULL, NULL, '2025-12-21 00:38:19'),
('4fe51247-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'job_postings', '52119934-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"OPEN\"}', NULL, NULL, '2025-12-21 00:38:27'),
('5211f6c0-ddc1-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'job_postings', '0', NULL, '{\"jobTitle\":\"IT Support\",\"departmentId\":\"a52e0639-dd9f-11f0-83eb-74d435ebdbb2\",\"status\":\"OPEN\"}', NULL, NULL, '2025-12-21 00:31:21'),
('544a8c4e-ddbe-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'leave_requests', 'c49bd385-ddbc-11f0-83eb-74d435ebdbb2', NULL, '{\"approvalStage\":\"DEPARTMENT_HEAD\"}', NULL, NULL, '2025-12-21 00:09:56'),
('592cda22-defb-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'items', '592ac672-defb-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"dsa\",\"name\":\"dsa\",\"description\":\"asddsa\",\"categoryId\":\"a53349b3-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a531197a-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"CONSUMABLE\",\"reorderLevel\":2,\"reorderQuantity\":2,\"minStockLevel\":323,\"maxStockLevel\":3232,\"standardCost\":3232,\"sellingPrice\":323232,\"isActive\":true,\"initialStock\":232,\"warehouseId\":\"74c740bc-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 13:59:15'),
('5b50e688-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"Ehdrian\",\"lastName\":\"Bungubung\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\"}', NULL, NULL, '2025-12-21 00:38:46'),
('5f6b00f8-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '5b50a1f1-ddc2-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\"}', NULL, NULL, '2025-12-21 00:38:53'),
('60b8ba64-df15-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'items', '46c0d816-df10-11f0-9861-74d435ebdbb2', '{\"id\":\"46c0d816-df10-11f0-9861-74d435ebdbb2\",\"code\":\"dsa11\",\"name\":\"dsa\",\"description\":null,\"category_id\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311ba1-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"CONSUMABLE\",\"reorder_level\":\"1.000\",\"reorder_quantity\":\"2.000\",\"min_stock_level\":\"1.000\",\"max_stock_level\":\"5.000\",\"standard_cost\":\"100.00\",\"selling_price\":\"150.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T08:29:04.000Z\",\"updated_at\":\"2025-12-22T08:29:04.000Z\"}', '{\"code\":\"dsa11\",\"name\":\"dsa\",\"description\":\"\",\"categoryId\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311ba1-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"CONSUMABLE\",\"reorderLevel\":1,\"reorderQuantity\":2,\"minStockLevel\":1,\"maxStockLevel\":5,\"standardCost\":100,\"sellingPrice\":150,\"isActive\":false,\"initialStock\":0,\"warehouseId\":null}', NULL, NULL, '2025-12-22 17:05:35'),
('63a051d3-df0e-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'suppliers', '639feda2-df0e-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"003\",\"name\":\"HONDA\"}', NULL, NULL, '2025-12-22 16:15:33'),
('6adcef80-ddbe-11f0-83eb-74d435ebdbb2', '83fc4892-ddbc-11f0-83eb-74d435ebdbb2', 'UPDATE', 'leave_requests', 'c49bd385-ddbc-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"CANCELLED\"}', NULL, NULL, '2025-12-21 00:10:34'),
('763c8897-ddba-11f0-83eb-74d435ebdbb2', 'admin-001', 'CREATE', 'users', '0', NULL, '{\"email\":\"hr@gmail.com\",\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', NULL, NULL, '2025-12-20 23:42:15'),
('76c476f0-ddc9-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"dsad\",\"lastName\":\"dsad\",\"email\":\"kwato1g@gmail.com\"}', NULL, NULL, '2025-12-21 01:29:39'),
('777a602d-dda4-11f0-83eb-74d435ebdbb2', 'admin-001', 'CREATE', 'items', NULL, NULL, '{\"code\":\"dsad\",\"name\":\"dasd\",\"description\":\"dsad\",\"categoryId\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311c7e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":232,\"reorderQuantity\":323,\"minStockLevel\":232,\"maxStockLevel\":32322332,\"standardCost\":3232,\"sellingPrice\":3232,\"isActive\":true}', NULL, NULL, '2025-12-20 21:04:48'),
('78694755-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"das\",\"lastName\":\"das\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\"}', NULL, NULL, '2025-12-21 00:46:44'),
('78b53c03-df17-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'items', '78b2d7d4-df17-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"\",\"itemType\":\"FINISHED_GOODS\",\"standardCost\":100,\"sellingPrice\":150,\"initialStock\":50,\"warehouseId\":\"74c741c5-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 17:20:34'),
('79231e45-df09-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '25f070ff-df08-11f0-9861-74d435ebdbb2', '{\"email\":\"president@gmail.com\",\"role\":\"GENERAL_MANAGER\",\"isActive\":1}', '{\"role\":\"GENERAL_MANAGER\",\"isActive\":1}', NULL, NULL, '2025-12-22 15:40:22'),
('79527377-dda2-11f0-83eb-74d435ebdbb2', 'admin-001', 'UPDATE', 'items', '9ccc81a7-dda0-11f0-83eb-74d435ebdbb2', '{\"id\":\"9ccc81a7-dda0-11f0-83eb-74d435ebdbb2\",\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"TUBO\",\"category_id\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a530f1f2-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"5.000\",\"reorder_quantity\":\"5.000\",\"min_stock_level\":\"1.000\",\"max_stock_level\":\"100.000\",\"standard_cost\":\"150.00\",\"selling_price\":\"250.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-20T12:37:13.000Z\",\"updated_at\":\"2025-12-20T12:37:13.000Z\"}', '{\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"TUBO\",\"categoryId\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a530f1f2-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":5,\"reorderQuantity\":5,\"minStockLevel\":49.999,\"maxStockLevel\":100,\"standardCost\":150,\"sellingPrice\":250,\"isActive\":1}', NULL, NULL, '2025-12-20 20:50:33'),
('79bb844a-ddbc-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP002\",\"firstName\":\"kwatog\",\"lastName\":\"kwatog\",\"email\":\"kwatog@gmail.com\"}', NULL, NULL, '2025-12-20 23:56:40'),
('7a7c6319-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP0003\",\"firstName\":\"das\",\"lastName\":\"das\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\",\"convertedFromApplicant\":\"7868fd5e-ddc3-11f0-83eb-74d435ebdbb2\"}', NULL, NULL, '2025-12-21 00:46:48'),
('7a7cbba4-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '7868fd5e-ddc3-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\",\"convertedToEmployee\":0}', NULL, NULL, '2025-12-21 00:46:48'),
('7a9a93b0-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '5b50a1f1-ddc2-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"REJECTED\"}', NULL, NULL, '2025-12-21 00:39:39'),
('7b8e71b7-df0c-11f0-9861-74d435ebdbb2', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'employees', '8d5a2edd-df0b-11f0-9861-74d435ebdbb2', NULL, '{\"firstName\":\"hr\",\"lastName\":\"hr\",\"email\":\"hr@gmail.com\",\"position\":\"HR Admin\",\"status\":\"ACTIVE\"}', NULL, NULL, '2025-12-22 16:01:54'),
('82cdbe10-defa-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'DELETE', 'items', '01afe8d5-defa-11f0-9861-74d435ebdbb2', '{\"id\":\"01afe8d5-defa-11f0-9861-74d435ebdbb2\",\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":null,\"category_id\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"1.000\",\"reorder_quantity\":\"1.000\",\"min_stock_level\":\"5.000\",\"max_stock_level\":\"200.000\",\"standard_cost\":\"250.00\",\"selling_price\":\"300.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T05:49:39.000Z\",\"updated_at\":\"2025-12-22T05:49:39.000Z\"}', NULL, NULL, NULL, '2025-12-22 13:53:16'),
('83fcd478-ddbc-11f0-83eb-74d435ebdbb2', 'admin-001', 'CREATE', 'users', '0', NULL, '{\"email\":\"kwatog@gmail.com\",\"username\":\"kwatog.kwatog\",\"role\":\"EMPLOYEE\"}', NULL, NULL, '2025-12-20 23:56:57'),
('8441a46f-ddcd-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '76c34894-ddc9-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"REJECTED\",\"interviewDate\":null,\"interviewNotes\":null,\"rejectionReason\":\"panget\"}', NULL, NULL, '2025-12-21 01:58:39'),
('876b878f-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"dsa\",\"lastName\":\"das\",\"email\":\"diegas.jarmaine@ncst.edu.ph\"}', NULL, NULL, '2025-12-21 00:40:00'),
('882851e6-df09-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '25f070ff-df08-11f0-9861-74d435ebdbb2', '{\"email\":\"president@gmail.com\",\"role\":\"GENERAL_MANAGER\",\"isActive\":1}', '{\"role\":\"PRESIDENT\",\"isActive\":1}', NULL, NULL, '2025-12-22 15:40:47'),
('891facaa-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '876b2e00-ddc2-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\"}', NULL, NULL, '2025-12-21 00:40:03'),
('89f2d3d2-df18-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_requisitions', '89f22b14-df18-11f0-9861-74d435ebdbb2', NULL, '{\"prNumber\":\"PR-0001\",\"prDate\":\"2025-12-22\",\"department\":\"Maintenance\",\"items\":[{\"itemId\":\"d6bd1f4a-df17-11f0-9861-74d435ebdbb2\",\"quantity\":50,\"estimatedUnitPrice\":40,\"estimatedTotalPrice\":2000,\"requiredDate\":\"2025-12-30\",\"purpose\":\"\"}]}', NULL, NULL, '2025-12-22 17:28:12'),
('8bb01f4e-df09-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '25f070ff-df08-11f0-9861-74d435ebdbb2', '{\"email\":\"president@gmail.com\",\"role\":\"PRESIDENT\",\"isActive\":1}', '{\"role\":\"PRESIDENT\",\"isActive\":1}', NULL, NULL, '2025-12-22 15:40:53'),
('8bfdf4ea-ddcd-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'attendance_logs', 'cc8763e7-ddcc-11f0-83eb-74d435ebdbb2', NULL, '{\"isValidated\":true}', NULL, NULL, '2025-12-21 01:58:52'),
('8c226800-df0a-11f0-9861-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP009\",\"firstName\":\"gmanager\",\"lastName\":\"gmanager\",\"email\":\"gmanager@gmail.com\"}', NULL, NULL, '2025-12-22 15:48:03'),
('8ee145a6-df0e-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'items', '8edd5d25-df0e-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"32\",\"name\":\"DSAD\",\"description\":\"DAS\",\"categoryId\":\"a5337fd9-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311c3d-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"SPARE_PARTS\",\"reorderLevel\":1,\"reorderQuantity\":1,\"minStockLevel\":20,\"maxStockLevel\":200,\"standardCost\":100,\"sellingPrice\":120,\"isActive\":true,\"initialStock\":110,\"warehouseId\":\"74c740bc-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 16:16:46'),
('8f5196f6-ddc1-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"Jarmaine\",\"lastName\":\"Diegas\",\"email\":\"kwatog116@gmail.com\"}', NULL, NULL, '2025-12-21 00:33:04'),
('90ec0c02-df09-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '25f070ff-df08-11f0-9861-74d435ebdbb2', '{\"email\":\"president@gmail.com\",\"role\":\"PRESIDENT\",\"isActive\":1}', '{\"role\":\"PRESIDENT\",\"isActive\":1}', NULL, NULL, '2025-12-22 15:41:02'),
('913f84df-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '876b2e00-ddc2-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"REJECTED\"}', NULL, NULL, '2025-12-21 00:40:17'),
('93c59d70-df0a-11f0-9861-74d435ebdbb2', 'admin-001', 'CREATE', 'users', '0', NULL, '{\"email\":\"gmanager@gmail.com\",\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', NULL, NULL, '2025-12-22 15:48:16'),
('943973df-def7-11f0-9861-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP007\",\"firstName\":\"purchasing\",\"lastName\":\"purchasing\",\"email\":\"purchasing@gmail.com\"}', NULL, NULL, '2025-12-22 13:32:17'),
('96ba07a5-ddcd-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'attendance_logs', '0', NULL, '{\"employeeId\":\"296f5978-ddc8-11f0-83eb-74d435ebdbb2\",\"attendanceDate\":\"2025-12-20\",\"status\":\"PRESENT\"}', NULL, NULL, '2025-12-21 01:59:10'),
('97f27acd-df0e-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'items', '592ac672-defb-11f0-9861-74d435ebdbb2', '{\"id\":\"592ac672-defb-11f0-9861-74d435ebdbb2\",\"code\":\"dsa\",\"name\":\"dsa\",\"description\":\"asddsa\",\"category_id\":\"a53349b3-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a531197a-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"CONSUMABLE\",\"reorder_level\":\"2.000\",\"reorder_quantity\":\"2.000\",\"min_stock_level\":\"323.000\",\"max_stock_level\":\"3232.000\",\"standard_cost\":\"3232.00\",\"selling_price\":\"323232.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T05:59:15.000Z\",\"updated_at\":\"2025-12-22T05:59:15.000Z\"}', '{\"code\":\"dsa\",\"name\":\"raw\",\"description\":\"asddsa\",\"categoryId\":\"a53349b3-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a531197a-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"CONSUMABLE\",\"reorderLevel\":2,\"reorderQuantity\":2,\"minStockLevel\":323,\"maxStockLevel\":3232,\"standardCost\":3232,\"sellingPrice\":323232,\"isActive\":1,\"initialStock\":0,\"warehouseId\":null}', NULL, NULL, '2025-12-22 16:17:01'),
('998004bb-ddba-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'attendance_logs', '2349c974-ddb6-11f0-83eb-74d435ebdbb2', NULL, '{\"isValidated\":true}', NULL, NULL, '2025-12-20 23:43:14'),
('9b490149-df0b-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', NULL, '{\"email\":\"hr@gmail.com\",\"username\":\"hruser\",\"role\":\"HR_STAFF\"}', NULL, NULL, '2025-12-22 15:55:38'),
('9ccd0b60-dda0-11f0-83eb-74d435ebdbb2', 'admin-001', 'CREATE', 'items', NULL, NULL, '{\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"TUBO\",\"categoryId\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a530f1f2-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":5,\"reorderQuantity\":5,\"minStockLevel\":1,\"maxStockLevel\":100,\"standardCost\":150,\"sellingPrice\":250,\"isActive\":true}', NULL, NULL, '2025-12-20 20:37:13'),
('9f7b8018-df00-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'UPDATE', 'purchase_requisitions', '15303d97-defe-11f0-9861-74d435ebdbb2', NULL, '{\"prDate\":\"2025-12-21\",\"department\":\"Purchasing\",\"items\":2}', NULL, NULL, '2025-12-22 14:37:01'),
('a034b6ee-df0c-11f0-9861-74d435ebdbb2', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP002\",\"firstName\":\"purchasing\",\"lastName\":\"purchasing\",\"email\":\"purchasing@gmail.com\"}', NULL, NULL, '2025-12-22 16:02:56'),
('a140f881-df0a-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'system_settings', 'system', NULL, '{\"company_name\":\"Manufacturing Company\",\"company_address\":\"\",\"company_phone\":\"\",\"company_email\":\"\",\"currency\":\"PHP\",\"date_format\":\"YYYY-MM-DD\",\"fiscal_year_start\":\"01-01\",\"tax_rate\":\"12\",\"auto_backup_enabled\":\"true\",\"backup_time\":\"02:00\",\"companyName\":\"Ogami\",\"taxId\":\"42233067\",\"address\":\"FCIE\",\"phone\":\"091111111111111\",\"email\":\"ogami@gmail.com\"}', NULL, NULL, '2025-12-22 15:48:38'),
('a36838d3-def7-11f0-9861-74d435ebdbb2', 'admin-001', 'CREATE', 'users', '0', NULL, '{\"email\":\"purchasing@gmail.com\",\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', NULL, NULL, '2025-12-22 13:32:42'),
('a767137a-df0c-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', NULL, '{\"email\":\"purchasing@gmail.com\",\"username\":\"purchasing.purchasing\",\"role\":\"PURCHASING_STAFF\"}', NULL, NULL, '2025-12-22 16:03:08'),
('aa7b2a61-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"dasd\",\"lastName\":\"asd\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\"}', NULL, NULL, '2025-12-21 00:48:08'),
('ac2055b5-df0e-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'items', '592ac672-defb-11f0-9861-74d435ebdbb2', '{\"id\":\"592ac672-defb-11f0-9861-74d435ebdbb2\",\"code\":\"dsa\",\"name\":\"raw\",\"description\":\"asddsa\",\"category_id\":\"a53349b3-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a531197a-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"CONSUMABLE\",\"reorder_level\":\"2.000\",\"reorder_quantity\":\"2.000\",\"min_stock_level\":\"323.000\",\"max_stock_level\":\"3232.000\",\"standard_cost\":\"3232.00\",\"selling_price\":\"323232.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T05:59:15.000Z\",\"updated_at\":\"2025-12-22T08:17:01.000Z\"}', '{\"code\":\"dsa3\",\"name\":\"raw\",\"description\":\"asddsa5\",\"categoryId\":\"a5337fd9-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b64-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"SPARE_PARTS\",\"reorderLevel\":5,\"reorderQuantity\":10,\"minStockLevel\":200,\"maxStockLevel\":500,\"standardCost\":150,\"sellingPrice\":250,\"isActive\":1,\"initialStock\":0,\"warehouseId\":null}', NULL, NULL, '2025-12-22 16:17:35'),
('ac7366c6-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP003\",\"firstName\":\"dasd\",\"lastName\":\"asd\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\",\"convertedFromApplicant\":\"aa7ad5c5-ddc3-11f0-83eb-74d435ebdbb2\"}', NULL, NULL, '2025-12-21 00:48:12'),
('ac73b538-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', 'aa7ad5c5-ddc3-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\",\"convertedToEmployee\":0}', NULL, NULL, '2025-12-21 00:48:12'),
('ad8d1fde-def8-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'items', NULL, NULL, '{\"code\":\"dsa\",\"name\":\"dsadsa\",\"description\":\"dsa\",\"categoryId\":\"a53349b3-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"SEMI_FINISHED\",\"reorderLevel\":2,\"reorderQuantity\":6,\"minStockLevel\":10,\"maxStockLevel\":198.999,\"standardCost\":323,\"sellingPrice\":2222,\"isActive\":true,\"initialStock\":50,\"warehouseId\":null}', NULL, NULL, '2025-12-22 13:40:08'),
('b6893d45-defa-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'items', NULL, NULL, '{\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"\",\"categoryId\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":1,\"reorderQuantity\":1,\"minStockLevel\":20,\"maxStockLevel\":199.999,\"standardCost\":250,\"sellingPrice\":300,\"isActive\":true,\"initialStock\":100,\"warehouseId\":\"74c741c5-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 13:54:42'),
('b7c2adcf-df04-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_orders', 'b7c1d050-df04-11f0-9861-74d435ebdbb2', NULL, '{\"poNumber\":\"PO-0002\",\"poDate\":\"2025-12-22\",\"supplierId\":\"df6d81ef-df00-11f0-9861-74d435ebdbb2\",\"totalAmount\":3360}', NULL, NULL, '2025-12-22 15:06:19'),
('bb068edf-ddd0-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'DELETE', 'job_postings', 'fcd13d3f-ddcb-11f0-83eb-74d435ebdbb2', NULL, '{}', NULL, NULL, '2025-12-21 02:21:39'),
('bb75c98e-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'applicants', '0', NULL, '{\"jobPostingId\":\"52119934-ddc1-11f0-83eb-74d435ebdbb2\",\"firstName\":\"Jarmaine\",\"lastName\":\"Diegas\",\"email\":\"diegas.jarmaine@ncst.edu.ph\"}', NULL, NULL, '2025-12-21 00:48:37'),
('be584f96-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', 'bb757a17-ddc3-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"OFFERED\"}', NULL, NULL, '2025-12-21 00:48:42'),
('bfa89db2-df00-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'UPDATE', 'purchase_requisitions', '15303d97-defe-11f0-9861-74d435ebdbb2', NULL, '{\"prDate\":\"2025-12-20\",\"department\":\"Purchasing\",\"items\":1}', NULL, NULL, '2025-12-22 14:37:55'),
('bfd3149a-ddba-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'attendance_logs', '0', NULL, '{\"employeeId\":\"06b3c304-ddb8-11f0-83eb-74d435ebdbb2\",\"attendanceDate\":\"2025-12-20\",\"status\":\"PRESENT\"}', NULL, NULL, '2025-12-20 23:44:19'),
('c01bd511-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP004\",\"firstName\":\"Jarmaine\",\"lastName\":\"Diegas\",\"email\":\"diegas.jarmaine@ncst.edu.ph\",\"convertedFromApplicant\":\"bb757a17-ddc3-11f0-83eb-74d435ebdbb2\"}', NULL, NULL, '2025-12-21 00:48:45'),
('c01c1fdf-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', 'bb757a17-ddc3-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\",\"convertedToEmployee\":0}', NULL, NULL, '2025-12-21 00:48:45'),
('c3946e68-ddac-11f0-83eb-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', 'admin-001', '{\"email\":\"admin@erp.local\",\"role\":\"SYSTEM_ADMIN\"}', '{\"email\":\"admin@erp.local\",\"role\":\"SYSTEM_ADMIN\"}', NULL, NULL, '2025-12-20 22:04:12'),
('c49c3a1c-ddbc-11f0-83eb-74d435ebdbb2', '83fc4892-ddbc-11f0-83eb-74d435ebdbb2', 'CREATE', 'leave_requests', '0', NULL, '{\"employeeId\":\"79ba8ef3-ddbc-11f0-83eb-74d435ebdbb2\",\"leaveTypeId\":\"300b0112-ddb4-11f0-83eb-74d435ebdbb2\",\"startDate\":\"2025-12-21\",\"endDate\":\"2025-12-22\",\"daysRequested\":1}', NULL, NULL, '2025-12-20 23:58:46'),
('c6e0859d-df18-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_orders', 'c6dfcc5f-df18-11f0-9861-74d435ebdbb2', NULL, '{\"poNumber\":\"PO-0001\",\"poDate\":\"2025-12-22\",\"supplierId\":\"df6d81ef-df00-11f0-9861-74d435ebdbb2\",\"totalAmount\":448}', NULL, NULL, '2025-12-22 17:29:55'),
('c7c6c891-df1a-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'UPDATE', 'purchase_orders', 'c6dfcc5f-df18-11f0-9861-74d435ebdbb2', '{\"status\":\"DRAFT\"}', '{\"status\":\"PENDING\"}', NULL, NULL, '2025-12-22 17:44:15'),
('ca5080eb-ddba-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'attendance_logs', 'bfd2c170-ddba-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"LATE\",\"flagged\":true}', NULL, NULL, '2025-12-20 23:44:36'),
('cc8c68a6-ddcc-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'attendance_logs', '0', NULL, '{\"employeeId\":\"c01b2d74-ddc3-11f0-83eb-74d435ebdbb2\",\"attendanceDate\":\"2025-12-20\",\"status\":\"PRESENT\"}', NULL, NULL, '2025-12-21 01:53:31'),
('ce728f9f-df0d-11f0-9861-74d435ebdbb2', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'employees', 'a0345c28-df0c-11f0-9861-74d435ebdbb2', NULL, '{\"firstName\":\"purchasing\",\"lastName\":\"purchasing\",\"email\":\"purchasing@gmail.com\",\"position\":\"purchasing admin\",\"status\":\"ON_LEAVE\"}', NULL, NULL, '2025-12-22 16:11:23'),
('d031c1a5-dda0-11f0-83eb-74d435ebdbb2', 'admin-001', 'CREATE', 'items', NULL, NULL, '{\"code\":\"222\",\"name\":\"dsad\",\"description\":\"dsad\",\"categoryId\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311c7e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":32,\"reorderQuantity\":2,\"minStockLevel\":232,\"maxStockLevel\":323,\"standardCost\":23,\"sellingPrice\":32,\"isActive\":true}', NULL, NULL, '2025-12-20 20:38:39'),
('d0deab37-df0d-11f0-9861-74d435ebdbb2', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'employees', 'a0345c28-df0c-11f0-9861-74d435ebdbb2', NULL, '{\"firstName\":\"purchasing\",\"lastName\":\"purchasing\",\"email\":\"purchasing@gmail.com\",\"position\":\"purchasing admin\",\"status\":\"ACTIVE\"}', NULL, NULL, '2025-12-22 16:11:27'),
('d1be8d00-df0c-11f0-9861-74d435ebdbb2', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP003\",\"firstName\":\"president\",\"lastName\":\"president\",\"email\":\"president@gmail.com\"}', NULL, NULL, '2025-12-22 16:04:19'),
('d27ae824-dda0-11f0-83eb-74d435ebdbb2', 'admin-001', 'DELETE', 'items', 'd03156ee-dda0-11f0-83eb-74d435ebdbb2', '{\"id\":\"d03156ee-dda0-11f0-83eb-74d435ebdbb2\",\"code\":\"222\",\"name\":\"dsad\",\"description\":\"dsad\",\"category_id\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311c7e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"32.000\",\"reorder_quantity\":\"2.000\",\"min_stock_level\":\"232.000\",\"max_stock_level\":\"323.000\",\"standard_cost\":\"23.00\",\"selling_price\":\"32.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-20T12:38:39.000Z\",\"updated_at\":\"2025-12-20T12:38:39.000Z\"}', NULL, NULL, NULL, '2025-12-20 20:38:43'),
('d3278d09-ddba-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'attendance_logs', 'bfd2c170-ddba-11f0-83eb-74d435ebdbb2', NULL, '{\"isValidated\":true}', NULL, NULL, '2025-12-20 23:44:51'),
('d6c0d902-df17-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'items', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"001\",\"name\":\"Nut\",\"description\":\"\",\"itemType\":\"FINISHED_GOODS\",\"standardCost\":40,\"sellingPrice\":50,\"initialStock\":0,\"warehouseId\":\"74c741c5-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 17:23:12'),
('d82cc56c-df0c-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', NULL, '{\"email\":\"president@gmail.com\",\"username\":\"president.president\",\"role\":\"PRESIDENT\"}', NULL, NULL, '2025-12-22 16:04:30'),
('da4eddda-ddd0-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employee_documents', '0', NULL, '{\"employeeId\":\"06b3c304-ddb8-11f0-83eb-74d435ebdbb2\",\"documentType\":\"CONTRACT\",\"documentName\":\"a.PNG\"}', NULL, NULL, '2025-12-21 02:22:32'),
('df6e3b06-df00-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'suppliers', 'df6d81ef-df00-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"001\",\"name\":\"TOYOTO\"}', NULL, NULL, '2025-12-22 14:38:48'),
('e0e7e3c4-defa-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'DELETE', 'items', 'b685eb41-defa-11f0-9861-74d435ebdbb2', '{\"id\":\"b685eb41-defa-11f0-9861-74d435ebdbb2\",\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":null,\"category_id\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"1.000\",\"reorder_quantity\":\"1.000\",\"min_stock_level\":\"20.000\",\"max_stock_level\":\"199.999\",\"standard_cost\":\"250.00\",\"selling_price\":\"300.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T05:54:42.000Z\",\"updated_at\":\"2025-12-22T05:54:42.000Z\"}', NULL, NULL, NULL, '2025-12-22 13:55:54'),
('e1ddf3a5-df06-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '83fc4892-ddbc-11f0-83eb-74d435ebdbb2', '{\"email\":\"kwatog@gmail.com\",\"role\":\"EMPLOYEE\"}', '{\"role\":\"EMPLOYEE\"}', NULL, NULL, '2025-12-22 15:21:49'),
('e2ffd82f-ddc3-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'job_postings', '52119934-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"CLOSED\"}', NULL, NULL, '2025-12-21 00:49:43'),
('e355f957-df03-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_orders', 'e35584b1-df03-11f0-9861-74d435ebdbb2', NULL, '{\"poNumber\":\"PO-0001\",\"poDate\":\"2025-12-22\",\"supplierId\":\"df6d81ef-df00-11f0-9861-74d435ebdbb2\",\"totalAmount\":2800}', NULL, NULL, '2025-12-22 15:00:23'),
('e592cf22-ddb4-11f0-83eb-74d435ebdbb2', NULL, 'CREATE', 'attendance_logs', '0', NULL, '{\"employeeId\":\"1fcb6ccb-ddac-11f0-83eb-74d435ebdbb2\",\"attendanceDate\":\"2025-12-20\",\"status\":\"PRESENT\"}', NULL, NULL, '2025-12-20 23:02:25'),
('e90466c1-ddbe-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'payroll_inputs', '0', NULL, '{\"employeeId\":\"79ba8ef3-ddbc-11f0-83eb-74d435ebdbb2\",\"periodStart\":\"2025-12-01\",\"periodEnd\":\"2025-12-14\",\"inputType\":\"ALLOWANCE\",\"description\":\"Transpo allowance\",\"amount\":1500}', NULL, NULL, '2025-12-21 00:14:06'),
('ebc2818b-ddc1-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '8f51294d-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"OFFERED\"}', NULL, NULL, '2025-12-21 00:35:39'),
('ec2789a8-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '5b50a1f1-ddc2-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"OFFERED\"}', NULL, NULL, '2025-12-21 00:42:49'),
('ed53b4f4-df0c-11f0-9861-74d435ebdbb2', '9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP004\",\"firstName\":\"gmanager\",\"lastName\":\"gmanager\",\"email\":\"gmanager@gmail.com\"}', NULL, NULL, '2025-12-22 16:05:05'),
('eec8aea0-ddc1-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '8f51294d-ddc1-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\"}', NULL, NULL, '2025-12-21 00:35:44'),
('eee57cad-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP-0NaN\",\"firstName\":\"Ehdrian\",\"lastName\":\"Bungubung\",\"email\":\"bungubung.ehdrian@ncst.edu.ph\",\"convertedFromApplicant\":\"5b50a1f1-ddc2-11f0-83eb-74d435ebdbb2\"}', NULL, NULL, '2025-12-21 00:42:54'),
('eee5bb86-ddc2-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'UPDATE', 'applicants', '5b50a1f1-ddc2-11f0-83eb-74d435ebdbb2', NULL, '{\"status\":\"HIRED\",\"convertedToEmployee\":0}', NULL, NULL, '2025-12-21 00:42:54'),
('f08daf67-ddcb-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'employees', '0', NULL, '{\"employeeNumber\":\"EMP006\",\"firstName\":\"Kurt\",\"lastName\":\"De Mesa\",\"email\":\"kurtz@gmail.com\"}', NULL, NULL, '2025-12-21 01:47:22'),
('f2d6c2ac-df0d-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'users', '2025d81d-df0d-11f0-9861-74d435ebdbb2', '{\"email\":\"dhead@gmail.com\",\"role\":\"DEPARTMENT_HEAD\",\"isActive\":1}', '{\"email\":\"dhead@gmail.com\",\"role\":\"DEPARTMENT_HEAD\",\"isActive\":false}', NULL, NULL, '2025-12-22 16:12:24'),
('f3285c8b-df12-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'purchase_requisitions', 'f3271258-df12-11f0-9861-74d435ebdbb2', NULL, '{\"prNumber\":\"PR-0002\",\"prDate\":\"2025-12-22\",\"department\":\"Mold\",\"items\":[{\"itemId\":\"f5cf1453-defa-11f0-9861-74d435ebdbb2\",\"quantity\":4,\"estimatedUnitPrice\":250,\"estimatedTotalPrice\":1000,\"requiredDate\":\"2025-12-30\",\"purpose\":\"ds\"}]}', NULL, NULL, '2025-12-22 16:48:12'),
('f48e3825-def9-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'DELETE', 'items', '307e2a63-def9-11f0-9861-74d435ebdbb2', '{\"id\":\"307e2a63-def9-11f0-9861-74d435ebdbb2\",\"code\":\"242\",\"name\":\"DOS POR DOS\",\"description\":\"DOS POR DOS, PAMALO\",\"category_id\":\"a5337f86-dd9f-11f0-83eb-74d435ebdbb2\",\"uom_id\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"item_type\":\"FINISHED_GOODS\",\"reorder_level\":\"1.000\",\"reorder_quantity\":\"1.000\",\"min_stock_level\":\"5.000\",\"max_stock_level\":\"500.000\",\"standard_cost\":\"200.00\",\"selling_price\":\"250.00\",\"is_active\":1,\"notes\":null,\"created_at\":\"2025-12-22T05:43:48.000Z\",\"updated_at\":\"2025-12-22T05:43:48.000Z\"}', NULL, NULL, NULL, '2025-12-22 13:49:17'),
('f4de89ef-df0c-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'CREATE', 'users', '0', NULL, '{\"email\":\"gmanager@gmail.com\",\"username\":\"gmanager.gmanager\",\"role\":\"GENERAL_MANAGER\"}', NULL, NULL, '2025-12-22 16:05:18'),
('f5d15e92-defa-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'CREATE', 'items', 'f5cf1453-defa-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"242\",\"name\":\"Dos Por Dos\",\"description\":\"\",\"categoryId\":\"a5337df0-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"FINISHED_GOODS\",\"reorderLevel\":1,\"reorderQuantity\":1,\"minStockLevel\":50,\"maxStockLevel\":250,\"standardCost\":250,\"sellingPrice\":300,\"isActive\":true,\"initialStock\":100,\"warehouseId\":\"74c741c5-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 13:56:29');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
('f6ef5b5a-df0e-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'CREATE', 'items', 'f6eee35c-df0e-11f0-9861-74d435ebdbb2', NULL, '{\"code\":\"dsa\",\"name\":\"dsa\",\"description\":\"ds\",\"categoryId\":\"a5337ec7-dd9f-11f0-83eb-74d435ebdbb2\",\"uomId\":\"a5311b1e-dd9f-11f0-83eb-74d435ebdbb2\",\"itemType\":\"SEMI_FINISHED\",\"reorderLevel\":1,\"reorderQuantity\":2,\"minStockLevel\":1,\"maxStockLevel\":50,\"standardCost\":323,\"sellingPrice\":3223,\"isActive\":true,\"initialStock\":0,\"warehouseId\":\"74c7422c-defa-11f0-9861-74d435ebdbb2\"}', NULL, NULL, '2025-12-22 16:19:40'),
('f8a33122-df07-11f0-9861-74d435ebdbb2', 'admin-001', 'UPDATE', 'users', '83fc4892-ddbc-11f0-83eb-74d435ebdbb2', '{\"email\":\"\",\"role\":\"EMPLOYEE\",\"isActive\":1}', '{\"email\":\"\",\"role\":\"EMPLOYEE\",\"isActive\":false}', NULL, NULL, '2025-12-22 15:29:37'),
('f9af89b0-df0d-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'UPDATE', 'users', '2025d81d-df0d-11f0-9861-74d435ebdbb2', '{\"email\":\"dhead@gmail.com\",\"role\":\"DEPARTMENT_HEAD\",\"isActive\":0}', '{\"email\":\"dhead@gmail.com\",\"role\":\"DEPARTMENT_HEAD\",\"isActive\":true}', NULL, NULL, '2025-12-22 16:12:35'),
('fcd1b6ce-ddcb-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'job_postings', '0', NULL, '{\"jobTitle\":\"dsa\",\"departmentId\":\"a52e05f4-dd9f-11f0-83eb-74d435ebdbb2\",\"status\":\"OPEN\"}', NULL, NULL, '2025-12-21 01:47:42'),
('ffc69c64-ddc0-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'CREATE', 'job_postings', '0', NULL, '{\"jobTitle\":\"IT Support\",\"departmentId\":\"a52e0639-dd9f-11f0-83eb-74d435ebdbb2\"}', NULL, NULL, '2025-12-21 00:29:03');

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
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `account_code` varchar(50) NOT NULL,
  `account_name` varchar(200) NOT NULL,
  `account_type` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL,
  `account_category` varchar(100) DEFAULT NULL,
  `parent_account_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `account_category`, `parent_account_id`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
('a535db49-dd9f-11f0-83eb-74d435ebdbb2', '1000', 'Assets', 'ASSET', 'Main', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53616df-dd9f-11f0-83eb-74d435ebdbb2', '1100', 'Current Assets', 'ASSET', 'Current Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53617c7-dd9f-11f0-83eb-74d435ebdbb2', '1110', 'Cash', 'ASSET', 'Current Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361831-dd9f-11f0-83eb-74d435ebdbb2', '1120', 'Accounts Receivable', 'ASSET', 'Current Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361893-dd9f-11f0-83eb-74d435ebdbb2', '1130', 'Inventory - Raw Materials', 'ASSET', 'Current Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53618fb-dd9f-11f0-83eb-74d435ebdbb2', '1131', 'Inventory - Work in Progress', 'ASSET', 'Current Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a536194f-dd9f-11f0-83eb-74d435ebdbb2', '1132', 'Inventory - Finished Goods', 'ASSET', 'Current Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53619a2-dd9f-11f0-83eb-74d435ebdbb2', '1200', 'Fixed Assets', 'ASSET', 'Fixed Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a53619f8-dd9f-11f0-83eb-74d435ebdbb2', '1210', 'Machinery and Equipment', 'ASSET', 'Fixed Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361a49-dd9f-11f0-83eb-74d435ebdbb2', '1220', 'Accumulated Depreciation', 'ASSET', 'Fixed Assets', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361a9e-dd9f-11f0-83eb-74d435ebdbb2', '2000', 'Liabilities', 'LIABILITY', 'Main', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361af4-dd9f-11f0-83eb-74d435ebdbb2', '2100', 'Current Liabilities', 'LIABILITY', 'Current Liabilities', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361b49-dd9f-11f0-83eb-74d435ebdbb2', '2110', 'Accounts Payable', 'LIABILITY', 'Current Liabilities', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361b97-dd9f-11f0-83eb-74d435ebdbb2', '2120', 'Accrued Expenses', 'LIABILITY', 'Current Liabilities', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361bea-dd9f-11f0-83eb-74d435ebdbb2', '2200', 'Long-term Liabilities', 'LIABILITY', 'Long-term Liabilities', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361c3d-dd9f-11f0-83eb-74d435ebdbb2', '3000', 'Equity', 'EQUITY', 'Main', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361c8f-dd9f-11f0-83eb-74d435ebdbb2', '3100', 'Capital', 'EQUITY', 'Capital', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361ce9-dd9f-11f0-83eb-74d435ebdbb2', '3200', 'Retained Earnings', 'EQUITY', 'Retained Earnings', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361d4d-dd9f-11f0-83eb-74d435ebdbb2', '4000', 'Revenue', 'REVENUE', 'Main', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361d9c-dd9f-11f0-83eb-74d435ebdbb2', '4100', 'Sales Revenue', 'REVENUE', 'Sales', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361df0-dd9f-11f0-83eb-74d435ebdbb2', '4200', 'Other Income', 'REVENUE', 'Other Income', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361e40-dd9f-11f0-83eb-74d435ebdbb2', '5000', 'Expenses', 'EXPENSE', 'Main', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361e90-dd9f-11f0-83eb-74d435ebdbb2', '5100', 'Cost of Goods Sold', 'EXPENSE', 'COGS', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361ee1-dd9f-11f0-83eb-74d435ebdbb2', '5200', 'Operating Expenses', 'EXPENSE', 'Operating', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361f32-dd9f-11f0-83eb-74d435ebdbb2', '5210', 'Salaries and Wages', 'EXPENSE', 'Operating', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361f83-dd9f-11f0-83eb-74d435ebdbb2', '5220', 'Utilities', 'EXPENSE', 'Operating', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5361fd3-dd9f-11f0-83eb-74d435ebdbb2', '5230', 'Maintenance and Repairs', 'EXPENSE', 'Operating', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18'),
('a5362021-dd9f-11f0-83eb-74d435ebdbb2', '5240', 'Supplies', 'EXPENSE', 'Operating', NULL, 1, NULL, '2025-12-20 20:30:18', '2025-12-20 20:30:18');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
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
('8d5a2edd-df0b-11f0-9861-74d435ebdbb2', 'EMP001', 'hr', 'hr', 'hr@gmail.com', '09123456789', 'ds', 'a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 'HR Admin', '2025-12-21', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 07:55:15', '2025-12-22 08:01:54'),
('a0345c28-df0c-11f0-9861-74d435ebdbb2', 'EMP002', 'purchasing', 'purchasing', 'purchasing@gmail.com', '09123123222', NULL, 'a52dfbfc-dd9f-11f0-83eb-74d435ebdbb2', 'purchasing admin', '2025-12-20', 'FULL_TIME', 'ACTIVE', NULL, NULL, NULL, NULL, NULL, '2025-12-22 08:02:56', '2025-12-22 08:11:27'),
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
('52119934-ddc1-11f0-83eb-74d435ebdbb2', 'IT Support', 'a52e0639-dd9f-11f0-83eb-74d435ebdbb2', '1', 'r', 'r', '8000-11,000', 'PART_TIME', 'OPEN', '2025-12-20', '2025-12-29', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '2025-12-20 16:31:21', '2025-12-20 17:19:15');

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `entry_number` varchar(50) NOT NULL,
  `entry_date` date NOT NULL,
  `entry_type` varchar(50) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('DRAFT','POSTED','CANCELLED') DEFAULT 'DRAFT',
  `posted_by` varchar(36) DEFAULT NULL,
  `posted_date` datetime DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entry_lines`
--

CREATE TABLE `journal_entry_lines` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `entry_id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `debit_amount` decimal(15,2) DEFAULT 0.00,
  `credit_amount` decimal(15,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
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
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `notification_type` varchar(50) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
('c6dfcc5f-df18-11f0-9861-74d435ebdbb2', 'PO-0001', '2025-12-22', 'df6d81ef-df00-11f0-9861-74d435ebdbb2', '2025-12-31', NULL, NULL, NULL, NULL, 'Blk 5 lot 10', 'ewan', 'PENDING', 400.00, 48.00, 0.00, 448.00, NULL, NULL, NULL, 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '2025-12-22 17:29:55', '2025-12-22 17:44:15');

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
('89f22b14-df18-11f0-9861-74d435ebdbb2', 'PR-0001', '2025-12-22', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', 'Maintenance', 'DEPARTMENTAL', NULL, '2025-12-30', 'DRAFT', NULL, NULL, NULL, NULL, '2025-12-22 17:28:12', '2025-12-22 17:28:12');

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
('89f2a7e0-df18-11f0-9861-74d435ebdbb2', '89f22b14-df18-11f0-9861-74d435ebdbb2', 'd6bd1f4a-df17-11f0-9861-74d435ebdbb2', 50.000, 40.00, 2000.00, '2025-12-30', NULL, NULL, '2025-12-22 17:28:12', '2025-12-22 17:28:12');

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
('02542677-df0e-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '59dcd07a-da6e-4f18-b83a-e3957cbffb5f', '2025-12-29 16:12:50', '2025-12-22 16:12:50'),
('1d1f12d4-def2-11f0-9861-74d435ebdbb2', 'admin-001', '7a668b68-b4d6-4fa1-b646-23922b2fe8ce', '2025-12-29 12:53:10', '2025-12-22 12:53:10'),
('52498c9e-df09-11f0-9861-74d435ebdbb2', 'admin-001', '49ca6318-e45c-46f8-bf78-1053f6308761', '2025-12-29 15:39:17', '2025-12-22 15:39:17'),
('74c19b42-ddbe-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '89fe29c1-1626-44fe-b86f-ff6b6bb033c6', '2025-12-28 00:10:51', '2025-12-21 00:10:51'),
('866d1198-df0c-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', '0f24dc11-5b83-43e3-9df4-35d6ef81f8ac', '2025-12-29 16:02:12', '2025-12-22 16:02:12'),
('92df87c9-ddcf-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '27ddbbc7-15f7-4678-90c3-573616fd666c', '2025-12-28 02:13:23', '2025-12-21 02:13:23'),
('9b94d666-ddc8-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '39695c00-c76d-4181-865b-5e5ede3371ed', '2025-12-28 01:23:31', '2025-12-21 01:23:31'),
('a25d2eb8-ddd0-11f0-83eb-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', '463e16e0-252b-4295-82d4-cff2b358cedd', '2025-12-28 02:20:58', '2025-12-21 02:20:58'),
('d2094664-dd9f-11f0-83eb-74d435ebdbb2', 'admin-001', '92d411fd-c083-4056-a14d-e3f137e5ac6c', '2025-12-27 20:31:33', '2025-12-20 20:31:33'),
('f073157f-df13-11f0-9861-74d435ebdbb2', '42e84e62-df0b-11f0-9861-74d435ebdbb2', 'a027f048-5497-4ab6-8da4-950080a3b2c2', '2025-12-29 16:55:17', '2025-12-22 16:55:17'),
('f12914fc-def9-11f0-9861-74d435ebdbb2', 'a367a9e3-def7-11f0-9861-74d435ebdbb2', 'a2b79cfc-2346-4135-b303-38f36c84e01f', '2025-12-29 13:49:11', '2025-12-22 13:49:11'),
('f1bba99c-df06-11f0-9861-74d435ebdbb2', '763c22d2-ddba-11f0-83eb-74d435ebdbb2', 'bad1c829-fe82-44a0-8752-98e406b301f1', '2025-12-29 15:22:16', '2025-12-22 15:22:16'),
('f6a5219d-df13-11f0-9861-74d435ebdbb2', 'a7668bec-df0c-11f0-9861-74d435ebdbb2', '8a456bdd-4d23-4216-b711-4090bfe2eb61', '2025-12-29 16:55:27', '2025-12-22 16:55:27');

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
('2025d81d-df0d-11f0-9861-74d435ebdbb2', 'dhead@gmail.com', 'dhead.dhead', '$2a$10$7EZ/oKvMv/ycBTvN7alZJ.LBq/v7EphENIxm6Y.ifu4owWPY3eDlS', 'dhead', 'dhead', 'DEPARTMENT_HEAD', 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 1, NULL, '2025-12-22 16:06:30', '2025-12-22 16:12:35', '19627bd6-df0d-11f0-9861-74d435ebdbb2'),
('42e84e62-df0b-11f0-9861-74d435ebdbb2', 'admin@gmail.com', 'admin', '$2a$10$LEw5Ec8D.f5gl6YUiHuau./C.laOXWqdHVvxfG//zOLNg0p5v1niW', 'admin', 'admin', 'SYSTEM_ADMIN', NULL, 1, '2025-12-22 16:55:17', '2025-12-22 15:53:10', '2025-12-22 16:55:17', NULL),
('9b489fe0-df0b-11f0-9861-74d435ebdbb2', 'hr@gmail.com', 'hruser', '$2a$10$DGjQhfoCoaiH90wU0HF8GOHKB0IxTaCAKR330MXMS.iXXpkX1wSpG', 'hr', 'hr', 'HR_STAFF', 'a52dfc7b-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-22 16:02:19', '2025-12-22 15:55:38', '2025-12-22 16:02:19', '8d5a2edd-df0b-11f0-9861-74d435ebdbb2'),
('a7668bec-df0c-11f0-9861-74d435ebdbb2', 'purchasing@gmail.com', 'purchasing.purchasing', '$2a$10$aiekMn4tnH1/JpU7nmMjT.rVAAPa7K425ye3CQPeVerAeD3ts51k6', 'purchasing', 'purchasing', 'PURCHASING_STAFF', 'a52dfbfc-dd9f-11f0-83eb-74d435ebdbb2', 1, '2025-12-22 16:55:27', '2025-12-22 16:03:08', '2025-12-22 16:55:27', 'a0345c28-df0c-11f0-9861-74d435ebdbb2'),
('d82c689c-df0c-11f0-9861-74d435ebdbb2', 'president@gmail.com', 'president.president', '$2a$10$a.Cxwmy7btTYqRfWN8reYOAqVdOOzNOpLkGzCmc7StHLpsNxxrxAu', 'president', 'president', 'PRESIDENT', 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 1, NULL, '2025-12-22 16:04:30', '2025-12-22 16:04:30', 'd1be27c6-df0c-11f0-9861-74d435ebdbb2'),
('f4de36c7-df0c-11f0-9861-74d435ebdbb2', 'gmanager@gmail.com', 'gmanager.gmanager', '$2a$10$aio0mV0CdaBPzPGDI1mg4.hDcHpibxZ65yKw975Am0b2y2l/8vMo2', 'gmanager', 'gmanager', 'GENERAL_MANAGER', 'a52e067c-dd9f-11f0-83eb-74d435ebdbb2', 1, NULL, '2025-12-22 16:05:18', '2025-12-22 16:05:18', 'ed53515a-df0c-11f0-9861-74d435ebdbb2');

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
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  ADD KEY `idx_table_name` (`table_name`),
  ADD KEY `idx_record_id` (`record_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `bill_of_materials`
--
ALTER TABLE `bill_of_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bom_number` (`bom_number`),
  ADD KEY `idx_bom_number` (`bom_number`),
  ADD KEY `idx_item_id` (`item_id`);

--
-- Indexes for table `bom_items`
--
ALTER TABLE `bom_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bom_id` (`bom_id`),
  ADD KEY `idx_component_item_id` (`component_item_id`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_code` (`account_code`),
  ADD KEY `parent_account_id` (`parent_account_id`),
  ADD KEY `idx_account_code` (`account_code`),
  ADD KEY `idx_account_type` (`account_type`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_name` (`name`);

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
  ADD UNIQUE KEY `entry_number` (`entry_number`),
  ADD KEY `posted_by` (`posted_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_entry_number` (`entry_number`),
  ADD KEY `idx_entry_date` (`entry_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entry_id` (`entry_id`),
  ADD KEY `idx_account_id` (`account_id`);

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
  ADD KEY `idx_created_at` (`created_at`);

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
-- Indexes for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wo_number` (`wo_number`),
  ADD KEY `bom_id` (`bom_id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_wo_number` (`wo_number`),
  ADD KEY `idx_wo_date` (`wo_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_item_id` (`item_id`);

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
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
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
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD CONSTRAINT `chart_of_accounts_ibfk_1` FOREIGN KEY (`parent_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD CONSTRAINT `journal_entries_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `journal_entries_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `journal_entry_lines`
--
ALTER TABLE `journal_entry_lines`
  ADD CONSTRAINT `journal_entry_lines_ibfk_1` FOREIGN KEY (`entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `journal_entry_lines_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`);

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
-- Constraints for table `non_conformance_reports`
--
ALTER TABLE `non_conformance_reports`
  ADD CONSTRAINT `non_conformance_reports_ibfk_1` FOREIGN KEY (`inspection_id`) REFERENCES `quality_inspections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `non_conformance_reports_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `non_conformance_reports_ibfk_3` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `non_conformance_reports_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `non_conformance_reports_ibfk_5` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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

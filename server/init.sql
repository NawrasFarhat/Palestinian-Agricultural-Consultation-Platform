-- Initialize database with proper character set and collation
CREATE DATABASE IF NOT EXISTS senior CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE senior;

-- Set proper timezone
SET time_zone = '+00:00'; 
-- Cinema tables for GIC Cinemas Booking System

-- Movies table to store movie information
CREATE TABLE IF NOT EXISTS `movies` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `total_rows` int NOT NULL,
  `seats_per_row` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bookings table to store booking information
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` varchar(36) NOT NULL,
  `booking_code` varchar(10) NOT NULL,
  `movie_id` varchar(36) NOT NULL,
  `num_tickets` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seats table to store seat information
CREATE TABLE IF NOT EXISTS `seats` (
  `id` varchar(36) NOT NULL,
  `booking_id` varchar(36) NOT NULL,
  `row_letter` char(1) NOT NULL,
  `seat_number` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- fotNet.seat_selection_rules definition

CREATE TABLE `seat_selection_rules` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `start_from_furthest_row` tinyint(4) NOT NULL DEFAULT 1,
  `start_from_middle_col` tinyint(4) NOT NULL DEFAULT 1,
  `overflow_to_closer_row` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
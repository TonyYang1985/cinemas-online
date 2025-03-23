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

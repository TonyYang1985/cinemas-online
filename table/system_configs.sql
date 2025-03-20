-- fotNet.system_configs definition

CREATE TABLE `system_configs` (
  `id` varchar(10) NOT NULL,
  `scope` varchar(255) NOT NULL,
  `config_name` varchar(255) NOT NULL,
  `config_value` longtext NOT NULL,
  `enabled` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
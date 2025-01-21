CREATE TABLE `Users`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `surname` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `active` BOOLEAN NOT NULL
    'token' VARCHAR(2048) NOT NULL   
);
CREATE TABLE `userRoles`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL
);
CREATE TABLE `Role`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
);
CREATE TABLE `cropType`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
);
CREATE TABLE `Rooms`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `city` VARCHAR(255) NOT NULL,
    `roomNumber` VARCHAR(255) NOT NULL,
    `floor` BIGINT NOT NULL,
    `cropType_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL
);
CREATE TABLE `Shelves`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id` BIGINT NOT NULL
);
CREATE TABLE `Sensors`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sensorBarcode` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `shelve_id` BIGINT NOT NULL,
    `sensorType` VARCHAR(255) NOT NULL,
    `status` BOOLEAN NOT NULL
);
CREATE TABLE `sensorMaintenance`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sensor_id` BIGINT NOT NULL,
    `timestamp` DATETIME NOT NULL,
    `review` VARCHAR(255) NOT NULL,
    `datetime_review` DATETIME NOT NULL,
    `status` VARCHAR(255) NOT NULL
);
CREATE TABLE `dataHistory`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sensor_id` BIGINT NOT NULL,
    `value` FLOAT(53) NOT NULL,
    `timestamp` DATETIME NOT NULL
);
CREATE TABLE `Alerts`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sensor_id` BIGINT NOT NULL,
    `alertType` VARCHAR(255) NOT NULL,
    `alertTime` DATETIME NOT NULL
);
CREATE TABLE 'Timestamps'(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `timestamp` DATETIME NOT NULL
);
ALTER TABLE
    `userRoles` ADD CONSTRAINT `userroles_role_id_foreign` FOREIGN KEY(`role_id`) REFERENCES `Role`(`id`);
ALTER TABLE
    `Sensors` ADD CONSTRAINT `sensors_shelve_id_foreign` FOREIGN KEY(`shelve_id`) REFERENCES `Shelves`(`id`);
ALTER TABLE
    `userRoles` ADD CONSTRAINT `userroles_id_foreign` FOREIGN KEY(`id`) REFERENCES `Users`(`id`);
ALTER TABLE
    `Alerts` ADD CONSTRAINT `alerts_sensor_id_foreign` FOREIGN KEY(`sensor_id`) REFERENCES `Sensors`(`id`);
ALTER TABLE
    `sensorMaintenance` ADD CONSTRAINT `sensormaintenance_sensor_id_foreign` FOREIGN KEY(`sensor_id`) REFERENCES `Sensors`(`id`);
ALTER TABLE
    `Rooms` ADD CONSTRAINT `rooms_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Users`(`id`);
ALTER TABLE
    `Rooms` ADD CONSTRAINT `rooms_croptype_id_foreign` FOREIGN KEY(`cropType_id`) REFERENCES `cropType`(`id`);
ALTER TABLE
    `Shelves` ADD CONSTRAINT `shelves_room_id_foreign` FOREIGN KEY(`room_id`) REFERENCES `Rooms`(`id`);
ALTER TABLE
    `dataHistory` ADD CONSTRAINT `datahistory_sensor_id_foreign` FOREIGN KEY(`sensor_id`) REFERENCES `Sensors`(`id`);
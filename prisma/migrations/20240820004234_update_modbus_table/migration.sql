-- CreateTable
CREATE TABLE `modbus_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME(0) NOT NULL,
    `temperature` DOUBLE NOT NULL,
    `humidity` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

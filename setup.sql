CREATE DATABASE IF NOT EXISTS childcare_db;
USE childcare_db;

CREATE TABLE IF NOT EXISTS children (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    birth_date DATE NOT NULL,
    registration_date DATETIME NOT NULL,
    CONSTRAINT age_check CHECK (age >= 0 AND age <= 12)
);

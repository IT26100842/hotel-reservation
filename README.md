# 🏨 Hotel Reservation System

A comprehensive, full-stack monolithic hotel room reservation system built with Spring Boot and React. This system is designed to streamline hotel operations, manage room inventories, handle guest reservations, and process billing efficiently.

## 📸 Screenshots

![App Screenshot](docs/web.webp)

## 🛠️ Tech Stack

- **Frontend:** React, npm, HTML, CSS
- **Backend:** Java 25, Spring Boot, Maven
- **Database:** MySQL

## 🚀 Core Components & Features

Based on our system architecture, the project is divided into 6 main components:

1. **👤 Guest Management:** Handles guest accounts, registration, profile updates, and booking history using secure encapsulation.
2. **🛏️ Room Management:** Manages room inventory, categorization (e.g., Suite vs. Standard), pricing, and real-time availability status.
3. **📅 Reservation Management:** Facilitates checking room availability, placing bookings, rescheduling, and handling cancellations safely.
4. **🛡️ Admin & Staff Management:** Controls system access for hotel employees, receptionists, and administrators with role-based privileges.
5. **💳 Billing & Payment:** Processes room charges, additional hotel services, and generates digital invoices dynamically.
6. **⭐ Feedback & Review:** Allows guests to rate their stay and leave reviews, with an admin moderation queue.

## 🏗️️ Architecture & Build Process

This project is structured as a monolithic repository where the React frontend and Spring Boot backend co-exist. 

The build process is automated: when you build the React application using `npm`, the compiled static files (HTML, CSS, JS) are automatically moved to the Spring Boot's static resources directory. This allows the Spring Boot server to serve both the REST API and the React frontend simultaneously on a single port.

## 💻 Prerequisites

Before you begin, ensure you have the following installed:
- **Java 25**
- **Maven**
- **Node.js & npm**
- **MySQL Server**

## ⚙️️ Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/IT26100842/hotel-reservation.git](https://github.com/IT26100842/hotel-reservation.git)
cd hotel-reservation

# Leave Management System (LMS)

A comprehensive leave management system that provides easy management of employee leave requests, approvals, and tracking.

---

## 📦 Overview

This application consists of three services:

- **Frontend**: React-based user interface  
- **Auth Service**: Spring Boot service for authentication and user management  
- **Leave Service**: Node.js service for leave management functionality  

---

## 🛠 Prerequisites

- Docker installed on your machine  
- Docker Compose (usually bundled with Docker Desktop)  
- Internet connection (to pull Docker images)  

---

## 🚀 Running the Application with Docker

### Option 1: Using Pre-built Images

The simplest way to run the application is using our pre-built Docker images:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/jkarenzi/leaveMS.git
    cd leaveMS
    ```

2. **Start the application**:

    ```bash
    docker-compose up -d
    ```

3. **Access the application**

The services will be available at:

- **Frontend**: [http://localhost:5173](http://localhost:5173)  
- **Auth Service API**: [http://localhost:4000/api](http://localhost:4000/api)  
- **Leave Service API**: [http://localhost:3000/api](http://localhost:3000/api)  

4. **To stop the application**:

    ```bash
    docker-compose down
    ```

---

## 🧰 Troubleshooting

### Common Issues

- **Port Conflicts**: If you encounter port conflicts, you may have other services running on the same ports. Stop those services and try again.

- **Network Issues**: Ensure the services can communicate with each other. The `docker-compose.yml` creates a network named `lms-network` for inter-service communication.

- **Database Connection**: If the services can't connect to the database, check your internet connection as the database is hosted on Supabase.

### Viewing Logs

To view logs for **all services**:

```bash
docker-compose logs -f
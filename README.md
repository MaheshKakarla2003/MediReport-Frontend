# MediReport - Medical Records Management System

A role-based medical records management system built with Spring Boot and PostgreSQL for managing hospital patients and medical documents.

Live demo Link : https://medi-report-frontend-30y0mxrce-maheshkakarla2003s-projects.vercel.app/login.html
## Features

- **2 User Roles**: Hospital (provider) and Customer (patient) with separate access
- **Patient Management**: Create, update, and manage patient records
- **Medical Visits**: Document patient visits with diagnosis and treatment
- **Document Upload**: Secure upload and storage of medical files
- **Multi-Hospital Support**: Manage multiple hospitals in a single system
- **RESTful APIs**: Easy integration with frontend applications

## Tech Stack

- **Backend**: Spring Boot 3.5.7 (Java 17)
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Deployment**: Docker, Render
<img width="1900" height="850" alt="Screenshot 2026-04-05 121127" src="https://github.com/user-attachments/assets/d2923da8-043e-4215-a6de-96131312952e" />
<img width="1900" height="850" alt="Screenshot 2026-04-05 121053" src="https://github.com/user-attachments/assets/5a0541ad-df12-46a5-a356-ee10775de542" />
   <img width="1900" height="850" alt="Screenshot 2026-04-05 121032" src="https://github.com/user-attachments/assets/43857284-b312-4aaf-8c1b-1b3a7216d88e" />





## Quick Start

### Prerequisites

- Java 17+
- Maven 3.9.9+
- PostgreSQL 12+

### Installation

```bash
# Clone and install
git clone <your-repo>
cd medi-report
mvn clean install

# Create database
createdb medi_report

# Set environment variables
export DB_URL=jdbc:postgresql://localhost:5432/medi_report
export DB_USER=postgres
export DB_PASSWORD=your_password
export PORT=8080

# Run
mvn spring-boot:run
```

Access at: `http://localhost:8080/swagger-ui.html`

## API Overview

### Main Endpoints

**User Management**

- `POST /api/register-hospital` - Register hospital
- `POST /api/register-customer` - Register customer

**Patients & Records**

- `POST /api/patients` - Create patient
- `GET /api/patients/{id}` - Get patient details
- `POST /api/visits` - Record a visit
- `POST /api/documents/upload` - Upload document

## Example Usage

### Register Hospital

```bash
curl -X POST http://localhost:8080/api/register-hospital \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@hospital.com",
    "password": "SecurePass123",
    "hospitalName": "City Hospital",
    "registrationNumber": "REG12345",
    "city": "New York",
    "state": "NY"
  }'
```

### Create Patient

```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "+1-555-9876",
    "age": 35,
    "gender": "Male",
    "hospitalId": 1
  }'
```

## How It Works

1. **Hospital** registers in the system
2. **Add patients** to the hospital database
3. **Record visits** for patients with diagnosis
4. **Upload documents** (reports, prescriptions, etc.)
5. **Customers** can view their records and download files

## Deployment

### Docker

```bash
docker build -t medi-report:1.0 .
docker run -d -e DB_URL=jdbc:postgresql://db:5432/medi_report \
  -e DB_USER=postgres -e DB_PASSWORD=pwd \
  -p 8080:8080 medi-report:1.0
```

### Render

1. Create PostgreSQL database on Render
2. Create Web Service with GitHub repo
3. Set environment variables (DB_URL, DB_USER, DB_PASSWORD)
4. Deploy

## Key Achievements

✓ Role-based system with 2 user types (Hospital & Customer)  
✓ RESTful APIs for all operations (Hospital, Patient, Visit, Document)  
✓ Web dashboard for managing medical records

## Support

- **Issues**: Report on GitHub Issues
- **Email**: maheshkakarla66@gmail.com

**Version**: 1.0.0 | **Status**: Production Ready

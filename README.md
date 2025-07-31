# 🎓 PrepLMS - Learning Management System

<div align="center">
  
  [![Django](https://img.shields.io/badge/Django-5.2.1-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com/)
  [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Material-UI](https://img.shields.io/badge/Material--UI-7.1.0-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)
  [![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

  **An advanced e-learning platform for primary and secondary students**
  
  *Delivering high-quality digital education through interactive video lessons, progress tracking, and gamified learning experiences.*

  [ Documentation](#documentation) • [🐛 Report Bug](https://github.com/Olalekan2040-slack/PrepLMS_Backend/issues) • [💡 Feature Request](https://github.com/Olalekan2040-slack/PrepLMS_Backend/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [⚙️ Configuration](#️-configuration)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [💳 Payment Integration](#-payment-integration)
- [📊 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 **Core Learning Features**
- **📚 Structured Content Delivery** - Organized by education level, class, and subject
- **🎥 High-Quality Video Lessons** - Optimized for low bandwidth with adaptive streaming
- **📖 Bookmark System** - Save lessons for later viewing
- **📈 Progress Tracking** - Monitor learning journey and completion rates
- **🏆 Gamification** - Points, streaks, and achievement system

### 👤 **User Management**
- **🔐 Secure Authentication** - JWT-based auth with OTP verification
- **👥 Role-Based Access Control** - Student and Admin roles with appropriate permissions
- **📱 Mobile-First Design** - Responsive UI optimized for all devices
- **💼 User Profiles** - Customizable profiles with avatar support

### 💰 **Subscription & Payments**
- **📦 Flexible Plans** - Free preview, Standard, and Scholar plans
- **💳 Secure Payments** - Integrated with Flutterwave payment gateway
- **🎫 Voucher System** - Support for promotional codes and free access vouchers
- **📊 Subscription Analytics** - Track user engagement and subscription metrics

### 🛠️ **Administrative Tools**
- **📹 Content Management** - Upload and organize video content with metadata
- **👥 User Management** - Monitor user activity, subscriptions, and progress
- **📊 Analytics Dashboard** - Insights into platform usage and performance
- **🔧 System Configuration** - Manage subjects, classes, and educational levels

---

## 🏗️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### **Backend**
- **Framework:** Django 5.2.1 + Django REST Framework
- **Database:** PostgreSQL with SQLite for development
- **Authentication:** JWT with Simple JWT
- **File Storage:** AWS S3 / Local storage
- **Payment:** Flutterwave API integration
- **Email:** SMTP configuration for notifications

</td>
<td valign="top" width="50%">

### **Frontend**
- **Framework:** React 18.2.0
- **UI Library:** Material-UI 7.1.0
- **Routing:** React Router DOM 7.6.0
- **HTTP Client:** Axios 1.9.0
- **State Management:** React Context API
- **Charts:** Recharts for analytics

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL** (for production)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Olalekan2040-slack/PrepLMS_Backend.git
cd PrepLMS_Backend
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd BACKEND

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment setup
cp .env.example .env
# Edit .env with your configuration

# Database setup
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../FRONTEND/Prep_frontend/prep-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000/api](http://localhost:8000/api)
- **Admin Panel:** [http://localhost:8000/admin](http://localhost:8000/admin)

> **Note:** Live demo will be available soon. Currently in development phase.

---

## 📁 Project Structure

```
PrepLMS_Backend/
├── 📁 BACKEND/                    # Django REST API
│   ├── 📁 prep_platform/          # Main project settings
│   ├── 📁 users/                  # User management & authentication
│   ├── 📁 content/                # Video lessons & content management
│   ├── 📁 subscription/           # Payment & subscription handling
│   ├── 📁 rewards/                # Points, streaks & gamification
│   ├── 📁 core/                   # Shared utilities & base models
│   ├── 📁 media/                  # Uploaded files (videos, thumbnails)
│   ├── 📄 requirements.txt        # Python dependencies
│   └── 📄 manage.py               # Django management script
│
├── 📁 FRONTEND/                   # React application
│   └── 📁 Prep_frontend/
│       └── 📁 prep-frontend/
│           ├── 📁 src/
│           │   ├── 📁 components/  # Reusable UI components
│           │   ├── 📁 pages/       # Page components
│           │   ├── 📁 contexts/    # React context providers
│           │   ├── 📁 api/         # API integration
│           │   └── 📄 App.js       # Main application component
│           ├── 📄 package.json     # NPM dependencies
│           └── 📄 public/          # Static assets
│
├── 📄 README.md                   # This file
└── 📄 LICENSE                     # MIT License
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `BACKEND` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: postgresql://user:password@localhost:5432/prepdb

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=your-region

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth API
    participant DB as Database
    
    C->>A: POST /api/token/ (email, password)
    A->>DB: Validate credentials
    DB-->>A: User data
    A-->>C: JWT tokens (access, refresh)
    
    C->>A: API request with Bearer token
    A->>A: Validate JWT token
    A-->>C: Protected resource
    
    Note over C,A: Token expires
    C->>A: POST /api/token/refresh/
    A-->>C: New access token
```

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Student** | View content, manage profile, track progress, access subscriptions |
| **Admin** | Full CRUD on content, user management, analytics access, subscription management |

---

## 💳 Payment Integration

### Flutterwave Integration

The platform uses Flutterwave for secure payment processing:

```javascript
// Payment initiation flow
const initiatePayment = async (planId) => {
  const response = await api.post(`/subscription/initiate-payment/${planId}/`);
  // Redirect to Flutterwave payment page
  window.location.href = response.data.payment_link;
};
```

### Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free Preview** | ₦0 | 5 videos per subject |
| **Standard** | ₦500/month | Unlimited access to all content |
| **Scholar** | Free | Full access with voucher code |

---

## 📊 API Documentation

### Core Endpoints

#### Authentication
```http
POST /api/token/                    # Login
POST /api/token/refresh/            # Refresh token
POST /api/users/register/           # User registration
POST /api/users/verify-otp/         # OTP verification
```

#### Content Management
```http
GET    /api/content/videos/         # List videos
GET    /api/content/videos/{id}/    # Video details
POST   /api/content/videos/{id}/bookmark/  # Bookmark video
DELETE /api/content/videos/{id}/bookmark/  # Remove bookmark
```

#### Subscriptions
```http
GET  /api/subscription/current/               # Current subscription
GET  /api/subscription/plans/                 # Available plans
POST /api/subscription/initiate-payment/{id}/ # Start payment
POST /api/subscription/verify-payment/        # Verify payment
```

### Response Format

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "pages": 10,
    "per_page": 20,
    "total": 200
  }
}
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test content

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test files
npm test -- Auth.test.js
```

---

## 🚢 Deployment

### Production Deployment

#### Using Heroku

```bash
# Install Heroku CLI
heroku create your-app-name

# Configure environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set DATABASE_URL=your-database-url

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

#### Using Docker

```dockerfile
# Dockerfile for backend
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "prep_platform.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Environment-Specific Settings

- **Development:** SQLite, Debug mode enabled
- **Staging:** PostgreSQL, Limited debug info
- **Production:** PostgreSQL, Debug disabled, Static files on CDN

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Standards

- Follow **PEP 8** for Python code
- Use **ESLint** configuration for JavaScript
- Write **comprehensive tests** for new features
- Update **documentation** for API changes
- Use **meaningful commit messages**

### Areas for Contribution

- 🐛 **Bug fixes** and performance improvements
- ✨ **New features** and enhancements
- 📚 **Documentation** improvements
- 🧪 **Testing** coverage expansion
- 🌐 **Internationalization** support

---

## 📞 Support & Community

- **📧 Email:** [Contact via GitHub Issues](https://github.com/Olalekan2040-slack/PrepLMS_Backend/issues)
- **� LinkedIn:** [Connect with the team](https://linkedin.com)
- **� GitHub:** [Olalekan2040-slack](https://github.com/Olalekan2040-slack)
- **📝 Documentation:** [Wiki (Coming Soon)](https://github.com/Olalekan2040-slack/PrepLMS_Backend/wiki)

---

## 📈 Project Status

- ✅ **Phase 1:** User authentication and basic platform setup
- 🔄 **Phase 2:** Content delivery and subscription system (In Progress)
- 📋 **Phase 3:** Advanced analytics and reporting (Planned)
- 🎯 **Phase 4:** Mobile applications (Future)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Daramola Adesuyi Foundation** - Project sponsorship and vision
- **Django & React Communities** - Excellent frameworks and documentation
- **Material-UI Team** - Beautiful and accessible UI components
- **Contributors** - Everyone who has helped shape this platform

---

<div align="center">

**Built with ❤️ by the PrepLMS Team**

*Empowering the next generation through accessible digital education*

[![Star this repo](https://img.shields.io/github/stars/Olalekan2040-slack/PrepLMS_Backend?style=social)](https://github.com/Olalekan2040-slack/PrepLMS_Backend)
[![Fork this repo](https://img.shields.io/github/forks/Olalekan2040-slack/PrepLMS_Backend?style=social)](https://github.com/Olalekan2040-slack/PrepLMS_Backend)

</div>

# LifeTrack - Healthcare SaaS Platform

A modern, responsive healthcare SaaS platform designed for aged care management with React.js frontend and Node.js backend.

## 🏥 Features

### Frontend Features
- **Modern UI/UX**: Clean, healthcare-themed design with Tailwind CSS
- **Responsive Design**: Fully responsive across all devices
- **Authentication**: Secure login/signup with JWT tokens
- **Protected Routes**: Role-based access control
- **Form Validation**: Client-side validation with React Hook Form
- **Toast Notifications**: User-friendly feedback system

### Backend Features
- **RESTful API**: Express.js with proper HTTP methods
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Server-side validation with express-validator
- **Security**: CORS, Helmet, Rate limiting
- **Email Notifications**: Contact form email notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lifetrack-healthcare-saas
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cd backend
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - Update `MONGODB_URI` in your `.env` file

5. **Start the application**
   ```bash
   # From root directory
   npm run dev
   
   # Or start separately
   npm run backend  # Backend on port 5000
   npm run frontend # Frontend on port 3000
   ```

## 📁 Project Structure

```
lifetrack-healthcare-saas/
├── backend/                 # Node.js Backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React.js Frontend
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   └── utils/        # Utility functions
│   └── package.json      # Frontend dependencies
└── package.json          # Root package.json
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lifetrack

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@lifetrack.com
CONTACT_EMAIL=contact@lifetrack.com

# Security
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin)
- `GET /api/contact/:id` - Get single contact (admin)
- `PUT /api/contact/:id` - Update contact (admin)
- `DELETE /api/contact/:id` - Delete contact (admin)

## 🎨 Frontend Pages

- **Home** (`/`) - Landing page with features and benefits
- **About** (`/about`) - Company information and team
- **Contact** (`/contact`) - Contact form and information
- **Login** (`/login`) - User authentication
- **Sign Up** (`/signup`) - User registration
- **Dashboard** (`/dashboard`) - Protected user dashboard

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **nodemailer** - Email notifications
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email contact@lifetrack.com or create an issue in the repository.

## 🔄 Updates

Stay updated with the latest features and improvements by checking the repository regularly.

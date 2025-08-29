# Stationary E-commerce Backend

A production-ready Node.js backend for a stationary e-commerce platform, designed to run on AWS Lambda with Express.js and Prisma ORM.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Local Development](#local-development)
  - [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Services Integration](#-services-integration)

## ✨ Features

- 🚀 Serverless architecture with AWS Lambda
- 🔒 JWT-based authentication with Supabase
- 🔑 Role-Based Access Control (RBAC)
- 🗄️ PostgreSQL database with Prisma ORM
- 📦 Product and inventory management
- 🛒 Shopping cart functionality
- 💳 Order processing with Razorpay integration
- 📊 Health check endpoints
- 📝 Request validation with Zod
- 🔄 CORS support
- ⚡ Rate limiting
- 🛡️ Security best practices

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, Supabase
- **Payments**: Razorpay
- **Validation**: Zod
- **Testing**: Jest, Supertest
- **CI/CD**: GitHub Actions
- **Infrastructure**: AWS Lambda, API Gateway

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10.0 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0.0 or later)
- [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or later)
- [AWS Account](https://aws.amazon.com/) (for deployment)
- [Supabase](https://supabase.com/) project (for authentication)
- [Razorpay](https://razorpay.com/) account (for payments)
- npm package manager

### Development with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stationary-ecommerce.git
   cd stationary-ecommerce/backend
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Update .env file with your configuration
   ```

3. **Start the application with Docker Compose**
   ```bash
   # Build and start all services in detached mode
   docker-compose up --build -d
   
   # Run database migrations
   docker-compose exec app npx prisma migrate dev --name init
   
   # Generate Prisma client
   docker-compose exec app npx prisma generate
   ```

4. **Access the services**
   - API: http://localhost:3000
   - Adminer (Database GUI): http://localhost:8080
     - System: PostgreSQL
     - Server: db
     - Username: postgres
     - Password: postgres
     - Database: stationary_ecommerce

5. **View logs**
   ```bash
   # View logs for all services
   docker-compose logs -f
   
   # View logs for a specific service
   docker-compose logs -f app
   ```

6. **Run commands in the container**
   ```bash
   # Run npm commands
   docker-compose exec app npm run test
   
   # Open a shell in the container
   docker-compose exec app sh
   ```

7. **Stop the services**
   ```bash
   # Stop all services
   docker-compose down
   
   # Stop and remove all containers, networks, and volumes
   docker-compose down -v
   ```

### Local Development (Without Docker)

1. **Clone the repository**

```bash
git clone https://github.com/your-username/stationary-ecommerce.git
cd stationary-ecommerce/backend
```

### Install dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### Set up environment variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Update the values in `.env` according to your setup.

### Database Setup

1. Ensure PostgreSQL is running
2. Create a new database
3. Update the `DATABASE_URL` in `.env`
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

## 💻 Local Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The server will be available at `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file in the root directory by copying the `.env.example` file and updating the values as needed. The main environment variables include:

- Server configuration (NODE_ENV, PORT)
- Database connection (DATABASE_URL)
- JWT settings (JWT_SECRET, JWT_EXPIRES_IN)
- Supabase credentials (SUPABASE_URL, SUPABASE_KEY)
- Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# AWS (for production)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route controllers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── tests/              # Test files
├── .env.example        # Environment variables example
└── package.json        # Project dependencies
```

## 📚 API Documentation

API documentation is available at `/api-docs` when running in development mode. The documentation is generated using Swagger/OpenAPI.

To access the API documentation:
1. Start the development server
2. Visit `http://localhost:3000/api-docs`

## 🧪 Testing

Run tests:
```bash
npm test
# or
yarn test
```

Run tests with coverage:
```bash
npm run test:coverage
# or
yarn test:coverage
```

## 🚀 Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- Serverless Framework installed globally

### Deployment Steps

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to AWS Lambda:
   ```bash
   serverless deploy
   ```

3. The API Gateway URL will be displayed in the output after successful deployment.

## 🔌 Services Integration

### Supabase Authentication
1. Create a new project in Supabase
2. Enable Email/Password authentication
3. Configure JWT settings
4. Update the Supabase URL and key in `.env`

### Razorpay Integration
1. Create a Razorpay account
2. Generate API keys
3. Update the Razorpay keys in `.env`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

### 2. Deploy to AWS Lambda

```bash
npm run deploy
```

## Project Structure

```
backend/
├── src/
│   ├── app.js              # Express application setup
│   ├── handler.js          # AWS Lambda handler
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── services/           # Business logic
│   ├── middlewares/        # Custom middlewares
│   └── lib/                # Shared utilities
├── prisma/
│   └── schema.prisma      # Database schema
├── .env.example           # Example environment variables
└── package.json
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Node environment | No | development |
| PORT | Port to run the server on | No | 3000 |
| DATABASE_URL | PostgreSQL connection URL | Yes | - |
| SUPABASE_JWKS_URL | Supabase JWKS URL | Yes | - |
| SUPABASE_AUD | Supabase JWT audience | Yes | - |
| RAZORPAY_KEY_ID | Razorpay API key ID | Yes | - |
| RAZORPAY_KEY_SECRET | Razorpay API secret | Yes | - |
| AWS_* | AWS credentials and configuration | Yes | - |
| LOG_LEVEL | Logging level | No | info |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.

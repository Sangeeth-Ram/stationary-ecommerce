# Stationary E-commerce Backend

A production-ready Node.js backend for a stationary e-commerce platform, designed to run on AWS Lambda with Express.js and Prisma ORM.

## Features

- 🚀 Serverless architecture with AWS Lambda
- 🔒 JWT-based authentication with Supabase
- 🔑 Role-Based Access Control (RBAC)
- 🗄️ PostgreSQL database with Prisma ORM
- 📦 Product and inventory management
- 🛒 Shopping cart functionality
- 💳 Order processing with Razorpay integration
- 📦 Bulk import/export functionality
- 📊 Health check endpoints
- 📝 Request validation with Zod
- 📈 Structured logging with Pino
- 🔄 CORS support
- ⚡ Rate limiting
- 🛡️ Security best practices

## Prerequisites

- Node.js 18.x or later
- PostgreSQL 14 or later
- AWS Account (for deployment)
- Supabase project (for authentication)
- Razorpay account (for payments)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stationary-ecommerce.git
cd stationary-ecommerce/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration.

### 4. Set up the database

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in `.env`
3. Run migrations:

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

## Development

### Running locally

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

### Environment Variables

See `.env.example` for all available environment variables.

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

## Testing

```bash
npm test
```

## Deployment

### 1. Build the application

```bash
npm run build
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

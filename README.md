# Eventify - Event Management System

A comprehensive event management system built with Next.js for educational institutions and organizations.

## 🚀 Features

- **Event Management**: Create, update, and manage events with comprehensive details
- **Venue Management**: Handle venue reservations and availability
- **User Management**: Role-based access control with authentication
- **Reporting**: Generate detailed reports and analytics
- **Security**: Password strength validation and secure authentication

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB database
- SMTP server for email functionality (optional)
- AWS S3 for file storage (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eventify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/eventify

   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # Email Configuration (SMTP)
   SMTP_USERNAME=your-email@example.com
   SMTP_PASSWORD=your-email-password

   # AWS S3 Configuration (Optional)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_BUCKET_NAME=your-bucket-name

   # Application Configuration
   IS_DEV=true
   NEXT_PUBLIC_URL=http://localhost:3000

   # Security Configuration
   # IMPORTANT: This is the bcrypt hash for the default password "Welcome@321"
   # Generate a new hash if you change the default password
   DEFAULT_PASSWORD_HASH=$2a$10$OTAVa.umH/vANyQ53DCpCOM9XrKAguEatocXzWSUQiXFSEIyTYcqG
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel


Edited

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

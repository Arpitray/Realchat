# Bando

Bando is a modern, real-time collaboration platform designed to streamline communication and creativity. It combines persistent chat rooms with interactive whiteboards, allowing teams to brainstorm, discuss, and visualize ideas seamlessly in one place.

**Live Demo:** [bando.arpitray.me](https://bando.arpitray.me)

## 🚀 Features

- **Real-time Messaging**: Create and join chat rooms for instant communication with your team.
- **Collaborative Whiteboard**: Integrated Excalidraw whiteboards for real-time drawing, diagramming, and brainstorming within each room.
- **Secure Authentication**: Robust user authentication system powered by NextAuth.js.
- **Modern Interface**: A clean, responsive UI built with Tailwind CSS and enhanced with smooth Framer Motion animations.
- **Real-time Updates**: Instant synchronization of messages and whiteboard states using Pusher.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Real-time Engine**: [Pusher](https://pusher.com/)
- **Whiteboard Engine**: [Excalidraw](https://excalidraw.com/)

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Pusher account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bando.git
   cd bando
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and configure the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Pusher
   PUSHER_APP_ID="your-app-id"
   PUSHER_KEY="your-key"
   PUSHER_SECRET="your-secret"
   PUSHER_CLUSTER="your-cluster"
   NEXT_PUBLIC_PUSHER_KEY="your-key"
   NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"
   ```

4. **Database Setup**
   Run the Prisma migrations to set up your database schema.
   ```bash
   npx prisma migrate dev
   ```

5. **Run the application**
   Start the development server.
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## 📄 License

This project is licensed under the MIT License.

# Romantic Moments Gallery

A visually appealing website with a romantic theme, featuring a rain of hearts in the background that changes direction based on a sliding bar. The website includes an interactive gallery where users can store and display images, each paired with meaningful moments.

## Features

- **Heart Rain Animation**: Dynamic background with heart-shaped particles that fall like rain
- **Direction Control**: Sliding bar with a heart icon to change the direction of the heart rain
- **Interactive Gallery**: Display images in cards that flip when hovered over
- **User Authentication**: Firebase authentication for secure login and signup
- **Image Storage**: Cloudinary integration for storing and managing images
- **Private Video Calling**: WebRTC-based video calling feature for couples with unique room IDs
- **Responsive Design**: Looks great on both mobile and desktop devices

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Firebase (Authentication, Firestore)
- Cloudinary (Image Storage)
- WebRTC & Socket.IO (Video Calling)
- Framer Motion (Animations)
- React Icons
- React Dropzone (Image Upload)
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Firebase account
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/romantic-moments-gallery.git
   cd romantic-moments-gallery
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Firebase and Cloudinary credentials (see `.env.local.example` for reference):
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/app`: Next.js app router pages
- `src/components`: Reusable React components
- `src/context`: React context providers
- `src/lib`: Utility functions and configurations
- `public`: Static assets

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Add your Firebase configuration to the `.env.local` file

## Cloudinary Setup

1. Create a Cloudinary account at [https://cloudinary.com/](https://cloudinary.com/)
2. Get your API credentials from the dashboard
3. Add your Cloudinary configuration to the `.env.local` file

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

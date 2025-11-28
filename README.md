# Project Haven - Mental Wellbeing Application

![Project Haven Logo](public/logo.jpeg)

Access the website at: [project-haven-iitb.vercel.app](project-haven-iitb.vercel.app)
Here's a demo video on how to use the website: [Demo Video](https://drive.google.com/file/d/1EP-d6YAQhTYUMBUu-nelUT_WGe8Z5IRY/view?usp=sharing)

## 🌟 Overview
Project Haven is a comprehensive mental wellbeing platform designed to support students and professionals in managing their mental health and wellness. The application provides a safe space for users to track their mood, connect with peers, access resources, and develop healthy habits.

## ✨ Features

### 🧠 Mental Health Tracking
- Mood tracking with visual analytics
- Habit formation and tracking
- Stress level monitoring
- Personalized wellness insights

### 🤝 Community Support
- Peer-to-peer chat support
- Group discussions and forums
- Anonymous sharing options
- Community challenges and activities

### 📱 User Experience
- Clean, intuitive interface
- Responsive design for all devices
- Dark/light mode support
- Personalized dashboard

### 🔒 Privacy & Security
- End-to-end encrypted messaging
- Role-based access control
- Data privacy compliance
- Secure authentication

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Components**: Radix UI, Tailwind CSS
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Chart.js
- **Animations**: Framer Motion

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **AI Integration**: Google Generative AI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/project-haven.git
   cd project-haven
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_AI_API_KEY=your_google_ai_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
project-haven/
├── public/              # Static files
├── src/
│   ├── app/             # App router pages
│   ├── components/      # Reusable components
│   │   ├── forms/       # Form components
│   │   ├── layout/      # Layout components
│   │   └── navigation/  # Navigation components
│   ├── lib/             # Utility functions
│   │   ├── actions/     # Server actions
│   │   ├── supabase/    # Supabase client
│   │   └── validations/ # Form validations
│   └── types/           # TypeScript types
├── supabase/            # Database migrations
├── .env.local           # Environment variables
└── package.json         # Project dependencies
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📧 Contact

For any questions or feedback, please reach out to 
- **Anika**  
  Email: [23b0763@iitb.ac.in](mailto:23b0763@iitb.ac.in)

- **Aryan**  
  Email: [aryankashyap@iitb.ac.in](mailto:aryankashyap@iitb.ac.in)

- **Avishkar**  
  Email: [23b0765@iitb.ac.in](mailto:23b0765@iitb.ac.in)

---

<div align="center">
  Made with ❤️ by the Project Haven Team
</div>

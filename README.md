# Quest Your Path - Interactive Career Discovery Platform

🎯 **Discover your ideal career path through AI-powered assessments and interactive quizzes**

🚀 **[Live Demo](https://career-quest-4utr.vercel.app/)** | 📖 **[Lovable Project](https://lovable.dev/projects/fe20eb83-89fe-44a8-8d41-9ed4eb0715ac)**

Quest Your Path is an innovative web application that helps users discover their ideal career direction through two distinctive assessment paths: **Talents Path** and **Scenarios Path**. Using advanced AI integration with Google's Generative AI, the platform provides personalized career recommendations, skill assessments, and actionable development plans.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

## 🌟 Features

### 🎯 Talents Path

- **Skill Selection**: Choose from 15 different skill categories
- **Adaptive Quizzing**: Two-phase quiz system with 50+ questions
- **AI-Powered Analysis**: Personalized career recommendations based on responses
- **Real-Time Insights**: Get immediate feedback and career matches
- **Industry Data**: Real job listings and salary information

### 🏢 Scenarios Path

- **Field-Specific Scenarios**: AI-generated workplace situations
- **Decision-Making Assessment**: Multiple-choice scenarios that reveal work style
- **Personality Profiling**: Understand your professional personality
- **Custom Analysis**: Field-specific insights based on your area of interest

### 🚀 Core Features

- **User Authentication**: Secure login system with JWT tokens
- **Responsive Design**: Mobile-first design with dark mode support
- **Progress Tracking**: Visual progress bars and completion tracking
- **AI Integration**: Advanced prompting system for personalized insights
- **Modern UI**: Built with shadcn/ui components and smooth animations

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4+ for fast development and building
- **Styling**: Tailwind CSS 3.4+ with PostCSS
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **State Management**: React Query, React Hook Form, Zustand
- **Routing**: React Router DOM 6.30+
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate

### AI & Backend Services

- **AI Integration**: Google Generative AI (Gemini) 0.24+
- **Database Ready**: MongoDB integration template (see MONGODB_SETUP.md)
- **Authentication**: JWT-based auth service
- **Form Validation**: Zod schemas
- **Notifications**: Sonner toast notifications

### Development Tools

- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript 5.8+
- **Package Manager**: npm
- **Hot Reload**: Vite HMR for instant updates

## 🚀 Quick Start

### Prerequisites

- Node.js (16.x or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd quest-your-path-85

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Gemini API key to .env.local
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── AdaptiveQuiz.tsx # Adaptive assessment component
│   ├── ScenarioQuiz.tsx # Scenario-based assessment
│   └── ResultsDisplay.tsx# Results visualization
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx   # Mobile detection hook
│   └── use-toast.ts     # Toast notification hook
├── lib/                 # Utility functions
│   └── utils.ts         # Common utilities
├── pages/               # Application pages/screens
│   ├── Index.tsx        # Main application router
│   ├── Landing.tsx      # Landing page
│   ├── PathSelection.tsx# Career path selection
│   ├── TalentsPath.tsx  # Talents assessment flow
│   └── ScenariosPath.tsx# Scenarios assessment flow
├── services/            # External service integrations
│   ├── authService.ts   # Authentication service
│   ├── geminiService.ts # AI/Gemini integration
│   └── mongoService.ts  # Database service template
└── types/               # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: Gemini API Key for AI features
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: MongoDB connection (see MONGODB_SETUP.md)
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=quest_your_path

# Optional: JWT secret for authentication
JWT_SECRET=your_jwt_secret_here
```

### API Key Setup

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file as `VITE_GEMINI_API_KEY`

## 🎮 Usage Guide

### For Users

1. **Sign Up/Login**: Create an account or log in to access assessments
2. **Choose Your Path**:
   - **Talents Path**: Focus on skill-based career matching
   - **Scenarios Path**: Explore through workplace situation analysis
3. **Complete Assessment**: Answer adaptive questions tailored to your choices
4. **Review Results**: Get detailed career recommendations and development plans
5. **Export/Save**: Save your results for future reference

### Assessment Flow

#### Talents Path

1. Select 5 skills from 15 available options
2. Complete Phase 1: Initial assessment (25 questions)
3. Complete Phase 2: Deep-dive assessment (25 questions)
4. Receive AI-analyzed results with career matches

#### Scenarios Path

1. Enter your field of interest
2. Complete AI-generated workplace scenarios
3. Make decisions based on realistic situations
4. Receive personality and work-style analysis

## 🧪 Features in Detail

### AI-Powered Assessment Engine

- **Adaptive Questioning**: Questions adapt based on previous responses
- **Field-Specific Scenarios**: Industry-relevant workplace situations
- **Comprehensive Analysis**: Multi-dimensional career fit analysis
- **Real-Time Processing**: Instant AI analysis and recommendations

### Assessment Results Include

- **Career Recommendations**: Top 3-5 matched career paths
- **Skill Gap Analysis**: Identified areas for development
- **Learning Pathways**: Structured development plans
- **Market Insights**: Industry trends and salary information
- **Personality Profile**: Work style and behavioral insights

### Security & Performance

- **Secure Authentication**: JWT-based user sessions
- **API Key Protection**: Environment-based configuration
- **Error Handling**: Comprehensive fallback mechanisms
- **Mobile Optimized**: Responsive design for all devices
- **Fast Loading**: Optimized with Vite and code splitting

## 🔮 Future Enhancements

- **MongoDB Integration**: Complete database setup (see MONGODB_SETUP.md)
- **Enhanced Skill Details**: Comprehensive skill-specific data
- **Improved Personality Analysis**: Advanced trait assessment
- **Export Functionality**: PDF/CSV result exports
- **Social Features**: Share results and compare with peers
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: User journey and assessment analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use provided ESLint configuration
- Write meaningful commit messages
- Add proper TypeScript types
- Test on mobile devices
- Follow the established component patterns

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:

- Check the [Issues](../../issues) page
- Review [MONGODB_SETUP.md](MONGODB_SETUP.md) for database setup
- Consult the inline code documentation

## 🚀 Deployment

### Via Lovable Platform

1. Visit [Lovable Project](https://lovable.dev/projects/fe20eb83-89fe-44a8-8d41-9ed4eb0715ac)
2. Click **Share → Publish**
3. Configure custom domain if needed

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
# The built files will be in the dist/ directory
```

### Custom Domain Setup

1. Navigate to Project > Settings > Domains in Lovable
2. Click **Connect Domain**
3. Follow the DNS configuration instructions

---

**Made with ❤️ using React, TypeScript, and AI**

_Quest Your Path - Empowering career discovery through intelligent assessments_

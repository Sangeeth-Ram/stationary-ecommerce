# Stationary E-commerce Frontend

A modern e-commerce frontend built with React, TypeScript, Vite, and Tailwind CSS. This application provides a responsive and interactive user interface for browsing and purchasing stationary products.

## 🚀 Features

- 🔍 Product browsing and search
- 🛒 Shopping cart functionality
- 🔐 User authentication (login/signup)
- 📱 Responsive design for all devices
- ⚡ Fast performance with Vite
- 🎨 Modern UI with Tailwind CSS
- 🔄 State management with Redux Toolkit
- 🛠️ Type-safe with TypeScript

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **API Client**: Axios
- **UI Components**: Headless UI, Hero Icons
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **API Integration**: Supabase

## 📦 Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Backend API server (see backend README for setup)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stationary-ecommerce.git
   cd stationary-ecommerce/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
# Build the application
npm run build
# or
yarn build

# Preview the production build locally
npm run preview
# or
yarn preview
```

## 🧪 Running Tests

```bash
# Run linter
npm run lint
# or
yarn lint
```

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── pages/           # Page components
├── store/           # Redux store and slices
├── types/           # TypeScript type definitions
└── App.tsx          # Main application component
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Supabase](https://supabase.com/)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

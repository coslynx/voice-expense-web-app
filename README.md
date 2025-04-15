<div class="hero-icon" align="center">
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
</div>

<h1 align="center">
voice-expense-web-app
</h1>
<h4 align="center">A mobile-first web app allowing users to track expenses easily using voice commands via the Web Speech API and Firebase.</h4>
<h4 align="center">Developed with the software and tools below.</h4>
<div class="badges" align="center">
  <img src="https://img.shields.io/badge/Framework-React_18-blue" alt="Framework: React 18">
  <img src="https://img.shields.io/badge/Frontend-JavaScript,_MUI_5,_Web_Speech_API-red" alt="Frontend: JavaScript, MUI 5, Web Speech API">
  <img src="https://img.shields.io/badge/Backend-Firebase_Firestore-orange" alt="Backend: Firebase Firestore">
  <img src="https://img.shields.io/badge/Database-Firestore_(NoSQL)-orange" alt="Database: Firestore (NoSQL)">
  <img src="https://img.shields.io/badge/Dev_Tools-Vite,_ESLint,_Prettier-lightblue" alt="Dev Tools: Vite, ESLint, Prettier">
</div>
<div class="badges" align="center">
  <img src="https://img.shields.io/github/last-commit/coslynx/voice-expense-web-app?style=flat-square&color=5D6D7E" alt="git-last-commit" />
  <img src="https://img.shields.io/github/commit-activity/m/coslynx/voice-expense-web-app?style=flat-square&color=5D6D7E" alt="GitHub commit activity" />
  <img src="https://img.shields.io/github/languages/top/coslynx/voice-expense-web-app?style=flat-square&color=5D6D7E" alt="GitHub top language" />
</div>

## 📑 Table of Contents
- 📍 Overview
- 📦 Features
- 📂 Structure
- 💻 Installation
- 🏗️ Usage
- 🌐 Hosting
- 📄 License
- 👏 Authors

## 📍 Overview
This repository contains a Minimum Viable Product (MVP) for a **Voice Expense Tracker**. It's a web application designed for mobile browsers that simplifies expense logging through voice commands. Built with React, Material UI, and Firebase Firestore, it leverages the browser's Web Speech API for voice recognition. The app provides real-time updates to the expense list stored in Firestore, offering an accessible and efficient way to manage finances on the go. This project serves as a learning platform for understanding voice processing, real-time database interactions with Firebase, and responsive web design principles.

## 📦 Features
|    | Feature            | Description                                                                                                        |
|----|--------------------|--------------------------------------------------------------------------------------------------------------------|
| ⚙️ | **Architecture**   | Component-based React architecture using functional components and hooks. State managed via Context API (`ExpenseContext`). Dedicated service layer (`expenseService.js`) interacts with Firebase. Custom hook (`useSpeechRecognition`) encapsulates Web Speech API logic. |
| 📄 | **Documentation**  | This README provides a comprehensive overview, setup instructions, usage guide, and hosting recommendations. Code includes JSDoc comments for key functions and components. |
| 🔗 | **Dependencies**   | Core: `react`, `react-dom`, `firebase`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`. Dev: `vite`, `vitest`, `@testing-library/react`, `eslint`, `prettier`. Browser API: Web Speech API. |
| 🧩 | **Modularity**     | Code organized into `components`, `context`, `hooks`, `services`, and `utils` directories within `src/` for clear separation of concerns and improved maintainability. |
| 🧪 | **Testing**        | Project configured with Vitest and React Testing Library for unit and integration testing (tests not implemented in this MVP). Includes basic testing setup (`vitest.config.js`, `jsdom`). |
| ⚡️ | **Performance**    | Leverages Vite for fast development builds and optimized production bundles. Real-time updates via Firestore `onSnapshot` are efficient. Performance depends on browser's Web Speech API implementation and Firestore responsiveness. |
| 🔐 | **Security**       | Requires microphone permissions handled by the browser. Firebase Firestore access control relies on Security Rules (must be configured separately in Firebase Console). Sensitive API keys managed via `.env` file (and `.gitignore`). |
| 🔀 | **Version Control**| Utilizes Git for version control. Standard `package.json` scripts for development, building, and linting. |
| 🔌 | **Integrations**   | Integrates directly with the browser's Web Speech API (via `useSpeechRecognition` hook) and Google's Firebase Firestore for real-time data persistence and synchronization. |
| 📶 | **Scalability**    | Firebase Firestore provides scalable backend infrastructure. React's component-based structure allows for frontend feature expansion. |

## 📂 Structure
```text
└─ public
   └─ favicon.ico
   └─ index.html
└─ src
   └─ components
      └─ ExpenseInput.jsx
      └─ ExpenseList.jsx
      └─ ExpenseItem.jsx
      └─ Loader.jsx
   └─ context
      └─ ExpenseContext.jsx
   └─ hooks
      └─ useSpeechRecognition.js
   └─ services
      └─ firebase.js
      └─ expenseService.js
   └─ utils
      └─ index.js
   └─ App.jsx
   └─ index.css
   └─ main.jsx
└─ .env
└─ commands.json
└─ package.json
└─ README.md
└─ startup.sh
```

## 💻 Installation
  > [!WARNING]
  > ### 🔧 Prerequisites
  > - **Node.js:** v18.x or later (check with `node -v`)
  > - **npm:** v8.x or later (usually comes with Node.js, check with `npm -v`)
  > - **Firebase Project:** A Firebase project with Firestore enabled. [Firebase Console](https://console.firebase.google.com/)
  > - **Browser:** A modern web browser supporting the Web Speech API (e.g., Chrome, Edge).

  ### 🚀 Setup Instructions
  1. Clone the repository:
     ```bash
     git clone https://github.com/coslynx/voice-expense-web-app.git
     cd voice-expense-web-app
     ```
  2. Install dependencies:
     ```bash
     npm install
     ```
  3. Configure environment variables:
     - Copy the example environment file:
       ```bash
       cp .env .env.local
       ```
     - Open `.env.local` in your editor.
     - Replace the placeholder values (`YOUR_API_KEY_HERE`, etc.) with your actual Firebase project credentials obtained from the Firebase Console (Project Settings > General > Your apps > SDK setup and configuration).
     ```dotenv
     # .env.local
     VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
     VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
     VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
     VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET_HERE
     VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID_HERE
     VITE_FIREBASE_APP_ID=YOUR_APP_ID_HERE
     ```
  4. **Firebase Security Rules:**
     > [!IMPORTANT]
     > For the app to read and write expenses, you **must** configure Firestore Security Rules in your Firebase project console. For MVP development, you can start with permissive rules (replace with more secure rules for production):
     > ```js
     > // Firestore Rules (e.g., Allow read/write access for development)
     > rules_version = '2';
     > service cloud.firestore {
     >   match /databases/{database}/documents {
     >     match /expenses/{expenseId} {
     >       allow read, write: if true; // WARNING: Open access for MVP development ONLY
     >     }
     >   }
     > }
     > ```
     > Go to Firebase Console -> Firestore Database -> Rules -> Edit rules -> Paste the rules -> Publish.

## 🏗️ Usage
### 🏃‍♂️ Running the MVP
  1. Start the development server:
     ```bash
     npm run dev
     ```
     This command bundles the application using Vite and starts a local development server.

  2. Access the application:
     - Open your web browser and navigate to the local address provided by Vite (usually [http://localhost:5173](http://localhost:5173)).
     - Ensure you grant microphone permission when prompted by the browser upon first use of the voice input feature.

  > [!TIP]
  > ### ⚙️ Configuration
  > - All client-side configuration (Firebase API keys) is handled via the `.env.local` file. Vite makes these variables available under `import.meta.env`.
  > - The Firestore collection name (`expenses`) is defined in `src/services/expenseService.js`.
  > - Speech recognition settings (language, continuous mode) are configured within `src/hooks/useSpeechRecognition.js`.

### 📚 Examples
The core interaction flow is designed to be simple:

1.  **Tap the Microphone Icon:** Click or tap the microphone button to activate voice recognition. The button area will show a loading/listening indicator.
2.  **Speak Your Expense:** Clearly state your expense using a simple phrase. The parser (`src/utils/index.js`) understands formats like:
    *   "Spent $10.50 on coffee"
    *   "Add expense 5 dollars for lunch"
    *   "Log 15 euro taxi"
    *   "$20 groceries"
    *   "Lunch 12 pounds"
3.  **View Results:**
    *   The app will briefly show a "Processing..." status.
    *   If successful, a confirmation message appears, and the new expense instantly shows up in the list below, fetched in real-time from Firestore.
    *   If parsing fails or speech isn't clear, a helpful warning message will guide you.
    *   If microphone access is denied or other errors occur, an error message will be displayed.

## 🌐 Hosting
### 🚀 Deployment Instructions
Firebase Hosting is recommended as it integrates seamlessly with Firestore and offers a generous free tier.

#### Deploying to Firebase Hosting
1.  **Build the Project:** Create an optimized production build:
    ```bash
    npm run build
    ```
    This generates a `dist/` directory containing the static assets.
2.  **Install Firebase CLI:** If you haven't already, install the Firebase command-line tools globally:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Login to Firebase:** Authenticate with your Firebase account:
    ```bash
    firebase login
    ```
4.  **Initialize Firebase Hosting:** Run this command in your project root directory:
    ```bash
    firebase init hosting
    ```
    - Select `Use an existing project` and choose the Firebase project you configured in `.env.local`.
    - Set your public directory to `dist`.
    - Configure as a single-page app: `Yes` (important for React Router if added later, harmless for this MVP).
    - Set up automatic builds and deploys with GitHub: Choose `No` for manual deployment initially.
    - This creates `firebase.json` and `.firebaserc` files.
5.  **Deploy:** Deploy the contents of your `dist` directory to Firebase Hosting:
    ```bash
    firebase deploy --only hosting
    ```
6.  **Access:** Firebase CLI will output the URL of your deployed application (e.g., `https://your-project-id.web.app`).

### 🔑 Environment Variables
- For Firebase Hosting, the Firebase configuration variables from your `.env.local` file are automatically included in the build process by Vite. **Do not** commit your `.env.local` file to Git.
- **Crucially, ensure your Firestore Security Rules are configured appropriately for production** (e.g., requiring user authentication if you add it later) before deploying publicly. The development rules provided earlier are insecure for production use.

## 📜 API Documentation
### 🔍 Endpoints
This is primarily a **frontend application** interacting directly with cloud services. There are no custom backend API endpoints created for this MVP. The application interacts with:

1.  **Google Firebase Firestore:**
    - **Service:** Cloud NoSQL Database
    - **Interaction:** Client-side SDK (`firebase/firestore`) used in `src/services/expenseService.js` to:
        - Add new documents to the `expenses` collection (`addDoc`).
        - Listen for real-time updates on the `expenses` collection (`onSnapshot`).
    - **Authentication/Authorization:** Controlled entirely by **Firestore Security Rules** configured in the Firebase Console. The MVP currently uses open rules for development.
2.  **Browser Web Speech API:**
    - **Service:** Native browser API for speech recognition (`window.SpeechRecognition`).
    - **Interaction:** Handled via the `src/hooks/useSpeechRecognition.js` custom hook.
    - **Authentication/Authorization:** Requires user permission granted via a browser prompt to access the microphone.

### 🔒 Authentication
This MVP **does not include user authentication**. All data added to the `expenses` collection is currently public based on the default open Firestore Security Rules suggested for development. For a production scenario, implementing Firebase Authentication and updating Security Rules to restrict access per user would be essential.

### 📝 Examples
See the [Usage Examples](#-examples) section for typical user interaction flows. Direct interaction with Firebase/Web Speech API is encapsulated within the service/hook layers.

> [!NOTE]
> ## 📜 License & Attribution
>
> ### 📄 License
> This Minimum Viable Product (MVP) is licensed under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) license.
>
> ### 🤖 AI-Generated MVP
> This MVP was entirely generated using artificial intelligence through [CosLynx.com](https://coslynx.com).
>
> No human was directly involved in the coding process of the repository: voice-expense-web-app
>
> ### 📞 Contact
> For any questions or concerns regarding this AI-generated MVP, please contact CosLynx at:
> - Website: [CosLynx.com](https://coslynx.com)
> - Twitter: [@CosLynxAI](https://x.com/CosLynxAI)

<p align="center">
  <h1 align="center">🌐 CosLynx.com</h1>
</p>
<p align="center">
  <em>Create Your Custom MVP in Minutes With CosLynxAI!</em>
</p>
<div class="badges" align="center">
<img src="https://img.shields.io/badge/Developers-Drix10,_Kais_Radwan-red" alt="">
<img src="https://img.shields.io/badge/Website-CosLynx.com-blue" alt="">
<img src="https://img.shields.io/badge/Backed_by-Google,_Microsoft_&_Amazon_for_Startups-red" alt="">
<img src="https://img.shields.io/badge/Finalist-Backdrop_Build_v4,_v6-black" alt="">
</div>
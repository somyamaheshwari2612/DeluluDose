# DeluluDose ✨

DeluluDose is a Gen Z-themed web application that serves up unhinged, clever, and emotionally intelligent content. Whether you need a sassy affirmation, a chaotic horoscope, or a reality-check roast, DeluluDose has you covered.

Built with React, Vite, Tailwind CSS, and powered by Google's **Gemini 3.1 Flash Lite** model.

## Features

- 🔮 **Custom Affirmations:** Get personalized, emotionally accurate affirmations based on your mood and keywords. No toxic positivity, just vibes.
- 🌌 **Unhinged Horoscopes:** Daily zodiac readings that feel like a fortune cookie written after a 6-hour doom-scrolling session.
- 🔥 **Roast or Toast:** Tell us your situation, and get a surgical roast calling out your delulu behavior, paired with a toast celebrating your chaotic courage.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion
- **AI Integration:** Google Gemini API (`gemini-3.1-flash-lite`)
- **Backend/API:** Serverless API Routes

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd affirmation-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Your Google Gemini API Key used for generating the AI content. |

## Scripts

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the app for production.
- `npm run lint` - Runs ESLint to check for code quality.
- `npm run preview` - Previews the production build locally.

## License

This project is open-source and available under the MIT License.

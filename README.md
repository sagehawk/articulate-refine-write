# Articulate & Refine

<p align="center">
  <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-green.svg">
  <img alt="Maintained" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
</p>

<p align="center">
  An AI-powered writing critic that analyzes essays for clarity, consistency, and logical soundness, transforming a proven writing guide into an interactive, step-by-step digital workspace.
</p>

---

<p align="center">
  <img src="https://i.imgur.com/8SL0btJ.png" alt="Main Application Dashboard" width="800"/>
</p>

## 🚀 Live Demo

**Try the application live:** [**articulate-refine.vercel.app**](https://your-live-demo-link.com) <!-- Replace with your actual live demo link -->

## ✨ Features

*   🤖 **AI-Powered Analysis:** Leverages the Google Gemini API to provide a deep structural analysis of writing, going far beyond simple grammar checks.
*   🎯 **Quantifiable Feedback:** Delivers objective scores for **Clarity**, **Consistency**, and **Overall Soundness**, helping writers pinpoint specific areas for improvement.
*   📝 **Interactive Highlighting:** Visually links the AI's feedback directly to the corresponding sentences in the text.
*   💾 **Local Persistence:** Automatically saves your work to the browser's `localStorage`, allowing you to pick up right where you left off.
*   📄 **PDF Export:** Download your completed and refined essay as a clean, formatted PDF document.

## 🧠 The AI Analysis Workflow

The core of this application is its ability to turn a wall of text into actionable, structured feedback. This is a three-step process:

| Step 1: Submission                                       | Step 2: AI Processing                                    | Step 3: Structured Results                               |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| The user submits their essay using the "Analyze" button. | The Gemini API processes the text against a complex prompt. | The app receives and visualizes the structured feedback. |
| <img src="https://i.imgur.com/bp0hAtz.png" width="250"/>  | <img src="https://i.imgur.com/cZwx53o.png" width="250"/>  | <img src="https://i.imgur.com/qhmAOV9.png" width="250"/>  |

This workflow is powered by careful **prompt engineering**, instructing the AI to return a predictable JSON object that the front-end can then parse into a rich, interactive dashboard.

## 🛠️ Tech Stack

*   **Front-End:** React.js, Vite
*   **Language:** TypeScript
*   **AI:** Google Gemini 2.0 Flash API (`@google/generative-ai`)
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Deployment:** Vercel

## ⚙️ Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/articulate-refine.git
    cd articulate-refine
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Create a `.env.local` file in the root of the project.
    *   Add your Google Gemini API key to this file:
        ```env
        VITE_GEMINI_API_KEY=your_api_key_here
        ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 📸 More Screenshots

| Full Lifecycle Management                                  | Interactive Highlighting                                | Simple Onboarding                                    |
| ---------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| <img src="https://i.imgur.com/vFPDpt0.png" width="250px" /> | <img src="https://i.imgur.com/inWwhGi.png" width="250px"/> | <img src="https://i.imgur.com/mCxykBW.png" width="250px"/> |
| The header provides full control over the essay workflow.  | Feedback points are visually linked to the source text. | A clear entry point lets users start writing instantly. |

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

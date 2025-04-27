# Articulate & Refine ✨

An interactive web application designed to guide users through the process of writing structured essays, based directly on the methodology outlined in Jordan B. Peterson's "Essay Writing Guide".

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 

---

## Overview

Articulate & Refine transforms Jordan B. Peterson's insightful essay writing guide from static text into a dynamic, step-by-step digital workspace. It aims to help students, writers, and thinkers improve their ability to formulate, structure, and articulate complex ideas effectively through the practice of writing.

Instead of just reading about the process, users actively engage with each stage – from brainstorming and outlining to drafting, refining sentences with AI assistance, and restructuring paragraphs – all within a single, persistent application interface.

## Core Concept

The application breaks down Peterson's 10-part guide into manageable, interactive steps:

1.  **Motivation & Setup:** Define goals, consider workspace, and set the stage.
2.  **Understanding Levels:** Learn about the different layers of writing (word, sentence, paragraph, etc.).
3.  **Topic & Research:** Brainstorm topics and actively take notes on readings.
4.  **Outline Creation:** Build the foundational structure and argument of the essay.
5.  **Paragraph Drafting:** Flesh out each outline point into a coherent paragraph.
6.  **Sentence Refinement:** Edit sentences for clarity, conciseness, and impact, with optional AI suggestions. (Potentially reorder sentences within paragraphs).
7.  **Paragraph Reordering:** Adjust the essay's flow by rearranging paragraphs.
8.  **Distillation & Restructuring:** Recreate the outline from memory and reorganize the draft based on the improved structure.
9.  **References & Formatting:** Compile bibliography and perform final checks.

Progress is saved locally in the browser, allowing users to work on multiple essays and return to their work later.

## Features

*   **Step-by-Step Guidance:** Follows Peterson's essay writing process sequentially.
*   **Interactive Workspace:** Provides text inputs, drag-and-drop interfaces, and other tools for each step.
*   **Essay Management:** Start new essays, view drafts and completed essays on the homepage.
*   **Local Persistence:** Saves essay title, current step, and all written content (topics, notes, outline, paragraphs, bibliography) in the browser's `localStorage`.
*   **AI-Powered Sentence Suggestions:** Integrates Google Gemini 1.5 Flash to offer feedback on sentence clarity, conciseness, and style (configurable).
*   **Paragraph Reordering:** Easy drag-and-drop interface to restructure the essay flow (Step 7).
*   **Outline Regeneration & Restructuring:** Dedicated step (Step 8) to facilitate Peterson's crucial distillation and rebuilding process.
*   **Progress Tracking:** Visual progress bar and step navigation dropdown.
*   **Data Management:** Option to delete individual essays and clear all stored data.

## Technology Stack

*   **Frontend:** React.js (`create-react-app`)
*   **Routing:** React Router (`react-router-dom`)
*   **AI:** Google Gemini 2.0 Flash API via `@google/generative-ai` SDK
*   **Persistence:** Browser `localStorage` API
*   **Styling:** CSS (Specify method if using Modules, Tailwind, Styled Components, etc.)

## Screenshots / Demo

![Homepage Screenshot](https://github.com/user-attachments/assets/c7f27236-d8dd-4e04-bea7-16f409d827c4)
![Step 1](https://github.com/user-attachments/assets/aadaf0d2-f536-414d-bcb7-ca3c25c06c95)
![Step 3](https://github.com/user-attachments/assets/8149f34e-688f-4aef-9e5e-cdd0b6a0da10)
![Step 4](https://github.com/user-attachments/assets/c22d96ac-1c5d-438e-a29e-a164929ba5e9)
![Step 5](https://github.com/user-attachments/assets/de0ca456-55f2-4991-a907-1e2ec7c36e54)
![Step 6](https://github.com/user-attachments/assets/7d472772-5aaa-4028-b54f-aa4297e0aa22)
![AI](https://github.com/user-attachments/assets/a5f7b4cd-1f63-41ab-81d7-ac5b4ca1e993)
![Suggestions](https://github.com/user-attachments/assets/6f6bb26d-32e5-4341-bdfc-713416beba06)


## Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sagehawk/articulate-refine-write.git
    cd articulate-refine-write
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **(Optional) Set up Environment Variables:** 
    *   You need a Google Gemini API key. Obtain one from [Google AI Studio](https://aistudio.google.com/).
    *   Create a file named `.env` in the root directory of the project.
    *   Add your API key to the `.env` file like this:
        ```
        REACT_APP_GEMINI_API_KEY=YOUR_API_KEY_HERE
        ```
        *(The `REACT_APP_` prefix is essential for Create React App).*
    *   **Important:** Add the `.env` file to your `.gitignore` file to prevent accidentally committing your secret key!

4.  **Run the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```

5.  **Open the application:**
    Navigate to `http://localhost:3000` (or the port specified) in your web browser.

## Usage

1.  **Start:** On the homepage, click "Start New Essay" or select an existing draft.
2.  **Follow Steps:** Progress through the steps using the "Next" and "Previous" buttons or the dropdown menu.
3.  **Input Content:** Enter your essay title, topics, readings, notes, outline, and paragraph drafts as prompted in each step.
4.  **Refine:** Utilize the sentence editing tools (Step 6) and paragraph reordering (Step 7). Leverage AI suggestions where helpful.
5.  **Restructure:** Engage with the crucial re-outlining and restructuring process in Step 8.
6.  **Save:** Progress is automatically saved to `localStorage` on step transitions and can be manually saved using the "Save Progress" button.
7.  **Finalize:** Add references and complete final checks in Step 9.

## Project Structure


/public
index.html
...
/src
/components # Reusable UI components (Button, etc.)
/common
/pages # Components for each step (HomePage, Step1, Step2, ...)
/services # API interaction logic (aiService.js)
App.css # Main app styles
App.js # Main application component with routing
index.css # Global styles
index.js # Entry point
.env # Environment variables (API Key - MUST BE IN .gitignore)
.gitignore
package.json
README.md

## AI Integration Details

*   This project uses the **Google Gemini 2.0 Flash Lite** model via the official `@google/generative-ai`.
*   API calls are handled in `src/pages/api/rewrite.ts`.
*   Ensure your `REACT_APP_GEMINI_API_KEY` is correctly set in the `.env` file for AI features to function.
*   Safety settings and generation configurations are set within `aiService.js`.

## Persistence Strategy

*   The application relies solely on the browser's `localStorage` for data persistence.
*   All data related to an essay (notes, outline, paragraphs, current step) is stored using keys prefixed or associated with the essay title provided in Step 1.
*   **Limitations:** Data is specific to the browser and machine used. Clearing browser data will erase all saved essays. `localStorage` has size limits (typically 5-10MB).

## Contributing

Contributions are welcome! If you have suggestions for improvements or find bugs, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information.
*(You should create a `LICENSE` file containing the MIT license text if you choose this license).*

## Acknowledgements

*   This project is based on the essay writing methodology detailed by **Jordan B. Peterson**. The goal is to make his structured approach more accessible and interactive.
*   [Google AI Studio](https://aistudio.google.com/) for providing the Gemini API.
*   [Create React App](https://create-react-app.dev/)

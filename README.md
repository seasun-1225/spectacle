# Spectacle. 👓
> **Interactive Visual Career Portfolio & STAR Compiler**

Spectacle is a modern, premium web application designed for job applicants to organize their experiences, refine achievements using the **STAR (Situation, Task, Action, Result) framework**, visualize their skills and strengths network, and build customized, high-converting resumes/cover letters.

Built with a sleek, responsive **sky blue theme**, glassmorphic panels, and smooth micro-animations.

demo: https://seasun-1225.github.io/spectacle/

---

## 🚀 Key Features

### 1. Career Builder Workspace
- **Document Text Extractor**: Upload `.txt`, `.docx`, or `.pdf` files client-side. The app parses the text and automatically extracts matching roles, skills, and strengths.
- **STAR Career Coach**: An interactive guided chatbot that reviews each experience, checks completion (Situation, Task, Action, Result), and asks supportive, paraphrased follow-up questions to fill in missing details.
- **Portfolio Knowledge Network**: A force-directed dynamic SVG graph showing how your experiences branch into **Skills**, **Education**, and **Strengths**. Selecting a card highlights connected nodes and active links while fading non-associated attributes.

### 2. Experience Repository
- A central inventory compiling all uploaded materials, raw text extracts, and structured STAR items.
- Search key phrases or filter instantly by experience type (Work, Internship, Personal Project).
- Review conversational audit trails and add new experiences manually with structured STAR details directly from the dashboard.

### 3. Resume & Cover Letter Builder
- Select preloaded job requirements (Google, Meta, Apple, etc.) or paste custom descriptions.
- **Wikidata / Wikipedia API Lookup**: Query company names to fetch live corporate insights and merge them into the tailoring context.
- Compile tailored resumes and cover letters in real-time, matching skills to the target role.
- Print-optimized layouts supporting Sleek Minimal, Corporate Print, and Retro Terminal templates.

---

## 🛠️ Technology Stack

- **Core**: React 19 + Vite 8
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid, SVG layout, custom Glassmorphism system)
- **Icons**: Lucide React
- **File Parsing**: Mammoth.js (DOCX), PDF.js (PDF)

---

## ⚙️ Installation & Setup

To run this project locally, make sure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/spectacle.git
   cd spectacle
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   This generates a static bundle in the `dist/` directory.

---

## 📦 How to Share & Publish on GitHub

To push this local codebase to your own GitHub account:

1. **Create a new, empty repository** on [GitHub](https://github.com/new) (do not initialize with README or license).
2. **Link the remote and push**:
   ```bash
   # Add the remote url
   git remote add origin https://github.com/YOUR_USERNAME/spectacle.git
   
   # Set main branch and push
   git branch -M main
   git add .
   git commit -m "Initial commit of Spectacle visual career workspace"
   git push -u origin main
   ```

### 🌐 Deploying to GitHub Pages (Optional)

You can host this application for free on GitHub Pages:

1. **Install the `gh-pages` helper**:
   ```bash
   npm install gh-pages --save-dev
   ```

2. **Update your `vite.config.js`** to include the repository base name:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/spectacle/' // Change 'spectacle' to your repository name
   })
   ```

3. **Add deploy scripts** to your `package.json` under `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

4. **Deploy the application**:
   ```bash
   npm run deploy
   ```
   Your app will be live at `https://YOUR_USERNAME.github.io/spectacle/`.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

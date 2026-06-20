# Tourist Company Login / Sign Up Page

This is a simple React app built with Vite. It includes a one-page login/signup interface for a tourist company with a modern dark theme.

## Files included

- `package.json` - project metadata and scripts
- `index.html` - entry HTML file
- `src/main.jsx` - React application entry point
- `src/App.jsx` - main page component with login/signup form
- `src/styles.css` - styles for the page

## Requirements

- Node.js (version 18 or later is recommended)
- npm (installed with Node.js)

> If your computer has an older Node version, the app may still work, but updating Node is recommended for best compatibility.

## Install

Open a terminal in `c:\Users\NEW USER\Desktop\ReactWebAI` and run:

```bash
npm install
```

This downloads the packages needed to run the app.

## Run the app

Start the development server with:

```bash
npm run dev
```

After the server starts, open the local URL shown in the terminal. Usually it looks like:

```bash
http://localhost:5173
```

## Backend setup

This project now includes a Node.js backend for authentication and tour data.

1. Open a terminal in `c:\Users\NEW USER\Desktop\ReactWebAI\backend`
2. Install backend dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm start
```

The backend runs at:

```bash
http://localhost:4000
```

The frontend sends login/signup requests to `http://localhost:4000/api` and loads tour data after login.

## Build for production

If you want to create a production-ready build, run:

```bash
npm run build
```

Then preview the build locally with:

```bash
npm run preview
```

## Notes

- The frontend now connects to a local Node.js backend for login and signup.
- After logging in, the page opens a home view with Indian tour information.
- The Google button is a UI demo and does not connect to Google authentication in this version.

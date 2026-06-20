# Backend for ReactWebAI Tourist App

This backend is a simple Node.js Express server for authentication and tour data.

## Requirements

- Node.js
- npm

## Install

Open a terminal in `c:\Users\NEW USER\Desktop\ReactWebAI\backend` and run:

```bash
npm install
```

## Run backend

```bash
npm start
```

The server listens on `http://localhost:4000`.

## API endpoints

- `POST /api/signup` - create a new user
- `POST /api/login` - login an existing user
- `GET /api/tours` - get tour listings (requires `Authorization: Bearer <token>`)

## Local storage

The backend saves user accounts to `users.json` in the backend folder.

## Notes

- JWT is used for authentication.
- Passwords are hashed with bcrypt.
- This is a simple local demo backend for learning, not production-ready.

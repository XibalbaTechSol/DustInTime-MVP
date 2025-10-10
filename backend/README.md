# Backend Documentation

This document provides an overview of the backend server for the application.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Cleaners](#cleaners)
  - [Bookings](#bookings)
  - [AI Generation](#ai-generation)
- [Database](#database)

## Overview

The backend is a Node.js server using the Express framework. It provides a RESTful API for the frontend to interact with, handling user authentication, data for cleaners and bookings, and integration with the Google Generative AI for creating cleaning task lists.

## Getting Started

To run the backend server locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add the following:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    JWT_SECRET=your_jwt_secret
    ```

3.  **Run the server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3001`.

## API Endpoints

### Authentication

Authentication is handled using JSON Web Tokens (JWT).

-   **`POST /api/auth/register`**: Registers a new user.
    -   **Request Body:** `{ "name": "...", "email": "...", "password": "..." }`
    -   **Response:** `{ "auth": true, "token": "..." }`

-   **`POST /api/auth/login`**: Logs in an existing user.
    -   **Request Body:** `{ "email": "...", "password": "..." }`
    -   **Response:** `{ "auth": true, "token": "..." }`

-   **`GET /api/protected`**: An example of a protected route that requires a valid JWT.

### Cleaners

-   **`GET /api/cleaners`**: Retrieves a list of all cleaners.
-   **`GET /api/cleaners/:id`**: Retrieves a single cleaner by their ID.

### Bookings

All booking routes are protected and require a valid JWT.

-   **`GET /api/bookings`**: Retrieves all bookings.
-   **`POST /api/bookings`**: Creates a new booking.
-   **`PUT /api/bookings/:id`**: Updates an existing booking.

### AI Generation

-   **`POST /api/generate`**: Generates a cleaning checklist using Google's Generative AI.
    -   **Request Body:** `{ "prompt": "..." }`
    -   **Response:** A JSON object with a `listName` and an array of `tasks`.

## Database

The backend uses `lowdb` to manage a simple JSON file database (`db.json`). The database stores information about users, cleaners, and bookings.

-   **`db.json`**: The main database file.
-   **`db.js`**: The setup file for `lowdb`.
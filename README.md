# Cleaner Booking Application

This is a web application for booking cleaning services. It features a React frontend, a Node.js/Express backend, and is containerized with Docker.

## Features

- User registration and authentication with JWT.
- Browse a list of cleaners.
- View cleaner profiles.
- Book cleaning services.
- A dashboard to view and manage bookings.
- AI-powered cleaning task list generation using the Google Gemini API.

## Running the Application

### Using Docker (Recommended)

This is the easiest way to get the application running.

**Prerequisites:**
- Docker installed and running.

1.  **Build the Docker image:**
    ```bash
    docker build -t cleaner-app .
    ```

2.  **Create a `.env` file:**
    - In the `backend` directory, create a file named `.env`.
    - Add the following environment variables to the file, replacing the placeholder values with your actual keys:
      ```
      GEMINI_API_KEY=your_gemini_api_key_here
      JWT_SECRET=your_super_secret_jwt_key_here
      ```

3.  **Run the Docker container:**
    ```bash
    docker run -p 3001:3001 --env-file backend/.env cleaner-app
    ```
    *Note: The `--env-file` flag is used to pass the environment variables from your `.env` file to the Docker container.*

4.  **Access the application:**
    - The application will be available at `http://localhost:3001`.

### Running Locally for Development

You can also run the frontend and backend servers separately for development.

**Prerequisites:**
- Node.js and npm installed.

#### Backend

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    - In the `backend` directory, create a file named `.env`.
    - Add the following environment variables:
      ```
      GEMINI_API_KEY=your_gemini_api_key_here
      JWT_SECRET=your_super_secret_jwt_key_here
      ```

4.  **Start the backend server:**
    ```bash
    npm start
    ```
    - The backend server will be running on `http://localhost:3001`.

#### Frontend

1.  **Navigate to the root directory.**

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    - The frontend will be running on `http://localhost:5173` (or another port if 5173 is in use).

## Project Structure

- `src/`: Contains the React frontend code.
- `backend/`: Contains the Node.js/Express backend code.
- `Dockerfile`: Used to build the Docker image for the application.
- `db.json`: A simple JSON file database used by `lowdb`.

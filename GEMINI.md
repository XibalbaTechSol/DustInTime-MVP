# Gemini Code Generation Guidelines for DustInTime-MVP

This document provides guidelines for generating code for the DustInTime-MVP project. The primary goal is to maintain the existing architecture, coding style, and core functionality.

**CRITICAL INSTRUCTION: Do not remove or fundamentally alter the core features of this application. Any changes should enhance, not detract from, the existing functionality.**

## 1. Core Features (Do Not Remove)

The following features are essential to the application and must be preserved:

*   **User Authentication:** JWT-based authentication for clients and cleaners (registration, login, protected routes).
*   **Dual User Roles:** The system is built around two distinct user roles: "Clients" who book services and "Cleaners" who provide them.
*   **Booking System:** The ability for clients to book cleaners, and for both parties to view and manage bookings.
*   **Cleaner Profiles & Discovery:** Displaying detailed cleaner profiles with ratings, hourly rates, and services.
*   **Client & Cleaner Onboarding:** The step-by-step onboarding process for new users.

## 2. Backend Principles

## 3. Frontend Principles

*   **Framework:** React with TypeScript and Vite.
*   **Component Style:** Use functional components with hooks (`React.FC`).
*   **Typing:** Define clear TypeScript interfaces for all component props and data structures. Add JSDoc comments to explain props.

*   **State Management:** Utilize React Context for shared application state. New contexts should be added to the `contexts` directory.
*   **File Structure:** New components should be placed in the appropriate `components` subdirectories (`client-app/components` or `cleaner-app/components`).

## 4. General Coding Style

*   **Naming Conventions:** Follow existing naming conventions for files, components, variables, and functions (e.g., `PascalCase` for components, `camelCase` for variables/functions).
*   **Modularity:** Keep components and functions small and focused on a single responsibility.
*   **Comments:** Add comments to explain complex logic, but avoid over-commenting simple code. Use JSDoc for component and function descriptions.

## 5. Build and Deployment

*   **Containerization:** This project is set up to use Docker. Please prefer Docker-based solutions for building and running the application. The project includes `Dockerfile`s and a `docker-compose.yml` file.

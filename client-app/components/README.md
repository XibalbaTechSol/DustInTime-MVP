# Frontend Components

This directory contains all the React components used in the application.

## Overview

The components are built with React and TypeScript, and they are designed to be modular and reusable. They are organized into two main categories:

-   **Page Components:** These are top-level components that represent a full page in the application (e.g., `HomePage`, `LoginPage`).
-   **UI Components:** These are smaller, reusable components that are used to build the page components (e.g., `Header`, `Footer`, `CleanerCard`).

## Component Structure

-   **`App.tsx`**: The root component of the application, which handles routing and state management.
-   **Page Components**:
    -   `HomePage.tsx`: The main landing page.
    -   `LoginPage.tsx` & `RegisterPage.tsx`: User authentication pages.
    -   `CleanerProfilePage.tsx`: Displays the profile of a single cleaner.
    -   `BookingPage.tsx`: The page for creating a new booking.
    -   `Dashboard.tsx`: The user's dashboard, showing their bookings.
    -   `JobTrackingPage.tsx`: A page for tracking the status of a cleaning job.
    -   `MessagesPage.tsx`: The messaging interface.
    -   `CleanerNavigationPage.tsx`: A page for cleaners to navigate to a job.
-   **UI Components**:
    -   `Header.tsx` & `Footer.tsx`: The main header and footer of the application.
    -   `CleanerCard.tsx` & `CleanerListRow.tsx`: Components for displaying cleaner information.
    -   `Map.tsx`: The main map component for displaying cleaners and jobs.
    -   `BookingModal.tsx` & `InstantBookModal.tsx`: Modals for the booking process.
    -   And many more, each with a specific purpose.

## State Management

The main application state is managed in `App.tsx` and passed down to the components as props. This includes user authentication, bookings, and cleaners. For more complex state, React's Context API is used in some places.
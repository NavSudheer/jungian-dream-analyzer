# Frontend & Backend Guidelines

## Frontend Guidelines
- Use **TypeScript** for all code to ensure type safety.
- Prefer **functional components** over class components.
- Style components using **Chakra UI** or **Tailwind CSS** for consistency and responsiveness.
- Implement voice input using the **Web Speech API** with proper error handling (e.g., "Unable to transcribe, please try again").
- Use **React hooks** (e.g., `useState`, `useEffect`) for state management.
- Ensure the UI is intuitive, with clear instructions for dream input and analysis viewing.

## Backend Guidelines
- **No server-side database** or authentication is required.
- If needed, use **Next.js API routes** for lightweight backend logic (e.g., complex analysis processing).
- Focus on client-side logic for dream analysis and local data storage.

## Data Handling
- Use **browser local storage** (`localStorage`) to save dream analyses.
- Provide an option to **download** analyses as text files.
- Ensure data privacy by not collecting or storing any user data on a server.
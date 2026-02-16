
# Project Blueprint

## Overview

This project is a Next.js application with Firebase integration. It includes a protected admin dashboard that requires Firebase authentication.

## Style and Design

* **Framework:** Next.js
* **Styling:** Tailwind CSS (default Next.js styling)
* **Authentication:** Firebase Authentication

## Features

* **Admin Dashboard:** A protected route at `/admin-dashboard` that requires user authentication.
* **Firebase Integration:** The application is connected to a Firebase project for authentication and other services.
* **Environment-based Configuration:** The application uses a `.env.local` file to manage Firebase credentials, separating them from the source code.

## Development Environment

* **Build System:** The project uses the Next.js build system. The build was failing due to a corrupted cache, which was resolved by deleting the `.next` directory and running a clean build.
* **Linting:** The project uses ESLint for code quality. The linter was failing due to a missing configuration file. A new `eslint.config.mjs` file was created and configured for a Next.js project. All linting errors and warnings have been resolved.

## Current Plan

**Objective:** The initial objective of resolving the "502 Bad Gateway" error and stabilizing the development environment has been completed. The project is now building successfully, and the linter is running without any errors or warnings.

**Next Steps:** The project is now ready for further development. The next steps will depend on the user's requirements.

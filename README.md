# Project Getting Started Guide

This guide provides the steps to install, configure, and run both the frontend (Create React App) and backend (Express) services for this project.

## 1. Prerequisites (One-Time Setup)

Before you begin, you must have the following tools installed on your system.

- **Node.js and npm**
  - This is required for both the frontend and backend.
  - Verify installation by running:
    ```bash
    node -v
    npm -v
    ```
  - If not installed, download the LTS version from https://nodejs.org/.

- **(Windows Only) Chocolatey Package Manager**
  - This is used to simplify the installation of `mkcert`.
  - Install it by running the following in PowerShell (as Administrator):
    ```powershell
    Set-ExecutionPolicy Bypass -Scope Process -Force; `
    [System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    ```
  - Verify installation by running:
    ```bash
    choco -v
    ```

- **mkcert (Local SSL Certificate Generator)**
  - This is required to run the backend server over HTTPS.
  - Install using Chocolatey:
    ```bash
    choco install mkcert -y
    ```

## 2. Installation and Configuration

Follow these steps to install project dependencies and generate the required SSL certificates.

1.  **Clone the Project**
    - (Assuming you have already cloned the project repository to your local machine).

2.  **Install Backend Dependencies**
    - Navigate to the `backend` directory and install its npm packages:
      ```bash
      cd backend
      npm install
      ```

3.  **Install Frontend Dependencies**
    - From the project's root directory, navigate to the `frontend` folder.
    - Install the base packages:
      ```bash
      cd frontend
      npm install
      ```

4.  **Generate Local SSL Certificates**
    - First, install a local Certificate Authority (CA) in your system's trust store. This only needs to be done once.
      ```bash
      mkcert -install
      ```
    - **Crucially**, navigate to the `backend` directory to generate the certificate files.
      ```bash
      cd ../backend
      # (Or 'cd backend' if you are in the root directory)

      mkcert localhost 127.0.0.1 ::1
      ```
    - This will create two files inside your `backend` folder: `localhost+2.pem` and `localhost+2-key.pem`. The Express server is configured to use these files.

## 3. Running the Application

You will need to run the backend and frontend in two separate terminals.

- **Terminal 1: Start the Backend Server**
  ```bash
  cd backend
  npm run dev
  # (Or the command specified in your backend's package.json, e.g., 'node server.js')
  ```

- **Terminal 2: Start the Frontend App**
  ```bash
  cd frontend
  npm start
  ```
  - This runs the app in development mode.
  - Open <http://localhost:3000> to view it in your browser.
  - The page will reload when you make changes.

## 4. Available Frontend Scripts

Inside the `frontend` directory, you can also run the following standard Create React App commands:

- **`npm test`**
  - Launches the test runner in interactive watch mode.

- **`npm run build`**
  - Builds the app for production to the `build` folder.
  - It correctly bundles React in production mode and optimizes the build for the best performance.

- **`npm run eject`**
  - **Note: this is a one-way operation. Once you `eject`, you can't go back!**
  - This command removes the single build dependency and copies all configuration files (webpack, Babel, ESLint, etc.) directly into your project so you have full control over them.

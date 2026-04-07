# EcoAventura - Frontend (React + Vite)

Welcome to **EcoAventura**, the leading platform for discovering and managing ecotourism in the heart of Risaralda! This repository contains the frontend source code, developed using modern technologies to deliver a fast, accessible, and visually appealing experience.

---

## 🛠️ Technology Stack

The project is built on a modern stack that prioritizes performance and the developer experience:

- **Core**: [React 19](https://react.dev/) (Latest version with support for Concurrent Rendering).
- **Build Framework**: [Vite 7](https://vitejs.dev/) (Ultra-fast bundler).
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/) (Static typing for greater safety).
- **Styles**: [Tailwind CSS 4](https://tailwindcss.com/) (Utility-first CSS framework).
- **Routing**: [React Router 7](https://reactrouter.com/) (Integrated navigation management).
- **Maps**: [Leaflet 1.9](https://leafletjs.com/) + [React Leaflet 5](https://react-leaflet.js.org/).
- **HTTP Requests**: [Axios](https://axios-http.com/).
- **Testing**: [Vitest 4](https://vitest.dev/) + [React Testing Library 16](https://testing-library.com/).

---

## 🔑 Environment Variables

For the frontend to communicate correctly with the backend, you must configure the following variables in a `.env` file in the project root:

| Variable | Description | Example |
| :--- | :--- | :--- |
| **`VITE_API_URL`** | Base URL of the Backend API (must end with `/api`). | `https://api.tu-proyecto.com/api` |

---

## 📖 Project Description

EcoAventura is a comprehensive solution that connects nature lovers with the ecological treasures of Risaralda. The platform allows users to:
*   **Explore**: Using an interactive map and dynamic listings.
*   **Interact**: With a system of reviews, ratings, and favorites management.
*   **AI Assistance**: An intelligent chatbot based on Google Gemini to answer questions about destinations.
*   **Management**: Specialized dashboards for Explorers, Tourism Partners, and Administrators.

---

## 📂 Project Map (Folder Structure)

The project follows a modular architecture based on components and services to facilitate maintenance and scalability:

| Folder | Function |
| :--- | :--- |
| **`src/`** | Root directory of the source code. |
| **`src/assets/`** | Static resources such as images and global styles (Tailwind CSS). |
| **`src/components/`** | Reusable components organized by modules (auth, dashboard, destination, layout, map, places). |
| **`src/context/`** | React Context providers for global state (Languages, Accessibility). |
| **`src/controllers/`** | Controller logic to handle interaction between views and services. |
| **`src/models/`** | TypeScript type definitions and interfaces (User, Place, Review). |
| **`src/services/`** | Communication layer with the backend API using Axios. |
| **`src/translations/`** | Localization files for multilingual support (Spanish / English). |
| **`src/utils/`** | Utility functions, formatters, and general helpers. |
| **`src/views/`** | High-level page components representing the application’s routes. |
| **`public/`** | Files served as-is, such as the `favicon` and root static assets. |

---

## 🚀 Deployment Guide - EcoAventura (Dokploy)

This project is designed to be deployed automatically using **Dokploy** (a self-hosted PaaS similar to Vercel/Heroku) on **DigitalOcean** infrastructure.

### 🏗️ Infrastructure and Domains
- **Domain**: Managed on **Namecheap**.
- **Hosting**: Server (VPS) on **DigitalOcean**.
- **Orchestration**: **Dokploy** for container management and CI/CD.

---

### 🛠️ Step-by-Step Setup Guide

If you want to deploy this platform for a new organization, follow these detailed steps:

#### 1. Server Preparation (DigitalOcean)
1. **Create a Droplet**: Launch a Droplet on DigitalOcean with the following minimum specifications:
   - **OS**: Ubuntu 22.04 LTS or higher.
   - **Plan**: Minimum 8GB of RAM and 2 CPUs (30GB+ of disk space).
2. **Configure Firewall**: In the DigitalOcean dashboard, ensure the following ports are **Open**:
   - `80` (HTTP) and `443` (HTTPS) for web traffic.
   - `3000` (Temporarily) to access the Dokploy initial dashboard.
   - `22` (SSH) for administration.

#### 2. Installing Dokploy
1. Connect to your server via SSH:
   ```bash
   ssh root@your-server-ip
   ```
2. Run the official Dokploy installation command:
   ```bash
   curl -sSL https://dokploy.com/install.sh | sh
   ```
3. Once complete, access the web interface at `http://tu-ip-servidor:3000` and create your administrator account.

#### 3. Domain Configuration (Namecheap)
1. Log in to **Namecheap** and go to the **Advanced DNS** section.
2. Create an **A Record**:
   - **Host**: `@` (or the desired subdomain, e.g., `app`).
   - **Value**: The IP address of your DigitalOcean Droplet.
   - **TTL**: Automatic.
3. (Optional) Create a similar record for the backend (e.g., `api`).

#### 4. Linking Applications in Dokploy
1. **Create Project**: In the Dokploy dashboard, create a new project named “EcoAventura”.
2. **Deploying Applications**:
   - Connect your GitHub/GitLab account.
   - Select the `ecoAventura-frontend` repository (and the backend repository).
   - **Environment Variables**: Configure the variables mentioned in the [Environment Variables](#-environment-variables) section.
3. **Configure Domain**: In the “Domains” tab of your application in Dokploy, enter your domain (e.g., `your-organization.com`) and enable **HTTPS (Let's Encrypt)**. Dokploy will automatically manage the SSL certificates.

---

### 🔄 CI/CD Workflow (Automatic Deployment)

1. **Push to Git**: Every time a `git push` is made to the `main` branch, Dokploy detects the change.
2. **Automatic Build**: The server automatically initiates a process that includes:
   - Installing dependencies (`npm install`).
   - Generating static files (`npm run build`).
3. **Deployment**: The new version is published without manual intervention once the build is complete.

### ⚙️ Configuration for New Organizations

#### 🌐 Frontend (ecoAventura-frontend)
It is essential to configure the following environment variable in the Dockploy dashboard:
- `VITE_API_URL`: Must point to the backend’s public URL ending in `/api` (e.g., `https://api.tu-organizacion.com/api`).

---

## 🛠️ Development and Maintenance

To work on this project locally:

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run in development mode**:
   ```bash
   npm run dev
   ```
3. **Run Automated Tests**:
   The project includes over 100 test cases to ensure the integrity of the components.
   ```bash
   npm run test
   ```
4. **Push Changes**:
   ```bash
   git add .
   git commit -m “Clear description of the change”
   git push origin main
   ```

---

## 📝 Additional Notes
- **Accessibility**: The platform includes an accessibility module to adjust contrast, grayscale, and font size.
- **Languages**: The system detects the user’s preferred language but allows manual changes from the header.
- **Security**: All admin and partner routes are protected by `Guards` that verify the user’s session and role.
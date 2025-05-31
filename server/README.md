# Girly Blog Platform - Server

Welcome to the server-side of the Girly Blog Platform! This README provides an overview of the server architecture, setup instructions, and key features.

## Overview

The Girly Blog Platform server is built using Node.js and Express. It provides RESTful APIs for user authentication, blog post management, and user profile handling. The server interacts with a MongoDB database to store user and post data.

## Key Features

- **User Authentication**: Secure sign-up and sign-in processes with age verification.
- **User Profiles**: Manage user profiles with customizable information.
- **Blog Post Management**: Create, read, update, and delete blog posts.
- **Middleware**: Authentication and age-check middleware to ensure secure access.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/girly-blog-platform.git
   cd girly-blog-platform/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   - Create a `.env` file in the server directory and add your MongoDB connection string and any other necessary configurations.

4. Start the server:
   ```
   npm start
   ```

The server will run on `http://localhost:5000` by default.

## API Endpoints

- **Authentication**
  - `POST /api/auth/signup`: Register a new user.
  - `POST /api/auth/signin`: Log in an existing user.

- **Posts**
  - `GET /api/posts`: Retrieve all blog posts.
  - `POST /api/posts`: Create a new blog post.
  - `GET /api/posts/:id`: Retrieve a specific blog post.
  - `PUT /api/posts/:id`: Update a specific blog post.
  - `DELETE /api/posts/:id`: Delete a specific blog post.

- **Users**
  - `GET /api/users/:id`: Retrieve user profile information.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

Thank you for checking out the Girly Blog Platform! We hope you enjoy building and using this creative blogging platform.
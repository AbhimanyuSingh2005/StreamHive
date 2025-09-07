# StreamHive  | [LIVE](https://streamhive-bdiz.onrender.com/)

StreamHive is a robust backend solution for a video sharing platform, inspired by services like YouTube. It provides all the essential features for user management, video handling, and social interactions like comments, likes, and subscriptions.

## Features

- **User Authentication:** Secure user registration and login using JWT and bcrypt for password hashing.
- **Video Management:** Upload, view, update, and delete videos.
- **Cloud Media Storage:** Integrates with Cloudinary for efficient video and image thumbnail storage.
- **Social Features:**
    - Like and dislike videos.
    - Comment on videos.
    - Subscribe to channels.
- **User Profiles:** View user profiles and their uploaded videos.
- **Search:** (Future implementation) Search for videos and channels.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **File Uploads:** Multer
- **Cloud Storage:** Cloudinary
- **API Development:** RESTful API design

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running.
- A [Cloudinary](https://cloudinary.com/) account for media storage.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/StreamHive.git
    cd StreamHive
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables. These are essential for the application to run correctly.

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/streamhive

CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

-   `PORT`: The port on which the server will run.
-   `MONGODB_URI`: The connection string for your MongoDB database.
-   `CORS_ORIGIN`: The allowed origin for Cross-Origin Resource Sharing.
-   `ACCESS_TOKEN_SECRET` & `REFRESH_TOKEN_SECRET`: Secret keys for JWT. You can generate these using a random string generator.
-   `CLOUDINARY_*`: Your Cloudinary account credentials.

## Running the Application

To run the application in development mode with automatic restarts on file changes, use:

```bash
npm test
```

This command utilizes `nodemon` to monitor for any changes in your source files and automatically restarts the server.

## API Routes

The application exposes the following RESTful API endpoints:

-   `api/v1/users`: User management (register, login, logout, profile)
-   `api/v1/vedios`: Video management (upload, get, update, delete)
-   `api/v1/comments`: Comment management on videos
-   `api/v1/likes`: Liking and unliking videos and comments
-   `api/v1/subscriptions`: Subscribing and unsubscribing to channels

For detailed information on the API, please refer to the route definitions in the `src/routes/` directory.

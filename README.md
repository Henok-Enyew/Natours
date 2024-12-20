# Natours App 🌍

Natours is a modern tour booking application that allows users to explore, book tours, and manage their bookings effortlessly. It features seamless integration with Chapa for payment processing and leverages the power of Node.js, Express, and MongoDB to deliver a fast and secure experience.

## 🌟 Features

- **Tour Booking**: Browse a variety of tours and book your favorite ones with ease.
- **Chapa Payment Integration**: Secure and reliable payment gateway to complete your bookings.
- **User Profiles**: Users can manage their accounts and view their booking history.
- **Dynamic Tour Pages**: Each tour features detailed information, making it easy to find the perfect trip.

## 🛠️ Technologies Used

- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Payment Gateway**: [Chapa](https://chapa.co)
- **Hosting**: [Render](https://natours-sbd8.onrender.com)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB](https://www.mongodb.com/) set up locally or with a cloud provider (e.g., MongoDB Atlas).
- A Chapa account for payment configuration.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/henok-enyew/natours.git
   cd natours
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create env file:
   ```bash
   NODE_ENV=development
   PORT=8035
   DATABASE=mongodb://<your-mongodb-connection-string>
   CHAPA_SECRET_KEY=<your-chapa-secret-key>
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   ```
4. Start the server:
   ```bash
   npm run start
   ```

## 🚀 Deployment

The application is live and hosted on Render. Check it out here:  
👉 [Natours on Render](https://natours-sbd8.onrender.com)

---

## 🌈 Future Improvements

- Improve the **UI for better user experience Making it Responsive**.
- Implement an **admin dashboard** for managing tours and bookings.
- Enable users to **leave reviews** for tours.

---

## 📬 Contact

If you have any questions or suggestions, feel free to contact me:

- **Developer**: [Your Name]
- **Email**: [your-email@example.com]
- **GitHub**: [Your GitHub Profile](https://github.com/your-username)

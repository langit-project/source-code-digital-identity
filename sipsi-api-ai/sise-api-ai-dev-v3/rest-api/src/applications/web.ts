import express from "express";
import apiRoutes from '../routes/api-route'; // Pastikan path ke file routes benar
import { errorMiddleware } from '../middlewares/error.middleware'; // Pastikan path ke middleware benar
import swaggerDocs from '../doc/swagger';
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
swaggerDocs(app);

// API Routes
app.use('/contracts', apiRoutes);

// Error handling middleware
app.use(errorMiddleware);

export default app;

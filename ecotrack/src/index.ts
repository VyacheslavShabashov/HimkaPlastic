import app from './server/server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
}); 
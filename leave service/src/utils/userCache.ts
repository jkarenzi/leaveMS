import axios from '../utils/axiosInstance';
import NodeCache from 'node-cache';
import cron from 'node-cron';


const userCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL as fallback
let isFetching = false;


export const refreshUserCache = async () => {
  if (isFetching) return;
  
  try {
    isFetching = true;
    console.log('Refreshing user cache...');
    
    const response = await axios.get('auth/users');
    
    if (response.status === 200 && response.data?.users) {
      const users = response.data.users;
      
      // Index users by ID for quick lookup
      users.forEach(user => {
        userCache.set(user.id, user);
      });
      
      console.log(`User cache refreshed. ${users.length} users cached.`);
    }
  } catch (error) {
    console.error('Failed to refresh user cache:', error.message);
  } finally {
    isFetching = false;
  }
};

/**
 * Get user by ID from cache
 */
export const getUserById = (userId) => {
  return userCache.get(userId) || null;
};

/**
 * Get all users from cache
 */
export const getAllUsers = () => {
  return Object.values(userCache.mget(userCache.keys()));
};

// Initialize cache on module load
refreshUserCache();

// Schedule refresh every 15 minutes
cron.schedule('*/15 * * * *', refreshUserCache);
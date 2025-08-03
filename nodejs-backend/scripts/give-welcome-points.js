const { MongoClient } = require('mongodb');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/redeem-web-app';

async function giveWelcomePointsToExistingUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Find users with 0 points or no points field
    const usersToUpdate = await usersCollection.find({
      $or: [
        { points: 0 },
        { points: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${usersToUpdate.length} users to update`);
    
    if (usersToUpdate.length > 0) {
      const result = await usersCollection.updateMany(
        {
          $or: [
            { points: 0 },
            { points: { $exists: false } }
          ]
        },
        {
          $set: { points: 500 }
        }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} users with 500 welcome points`);
      
      // Show the updated users
      const updatedUsers = await usersCollection.find({
        points: 500
      }).toArray();
      
      console.log('\nUpdated users:');
      updatedUsers.forEach(user => {
        console.log(`- ${user.email || user.username}: ${user.points} points`);
      });
    } else {
      console.log('No users found with 0 points');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
giveWelcomePointsToExistingUsers(); 
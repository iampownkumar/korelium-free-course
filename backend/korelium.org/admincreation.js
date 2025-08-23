const { Admin, sequelize } = require('./models'); // make sure `sequelize` is exported from your models
const bcrypt = require('bcrypt');

const createAdminUser = async (username, password) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { username } });
    if (existingAdmin) {
      console.log(`Admin user ${username} already exists.`);
      process.exit(0); // exit successfully
    }

    // Generate salt and hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin user with hashed password
    await Admin.create({
      username,
      password: hashedPassword,
    });

    console.log(`Admin user ${username} created successfully.`);
    process.exit(0); // exit successfully
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1); // exit with error
  } finally {
    // Close the DB connection before exiting
    await sequelize.close();
  }
};

// Example usage:
const username = 'pown';  // change to desired username
const password = '1234';   // change to desired password

createAdminUser(username, password);

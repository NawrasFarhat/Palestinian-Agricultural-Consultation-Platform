'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if phone column already exists
    const tableDescription = await queryInterface.describeTable('users');
    const hasPhoneColumn = tableDescription.phone;
    
    if (!hasPhoneColumn) {
      // Add phone column without unique constraint first
      await queryInterface.addColumn('users', 'phone', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '0000000000' // Temporary default for existing records
      });
      
      // Update existing records to have unique phone numbers
      await queryInterface.sequelize.query(`
        UPDATE users 
        SET phone = CONCAT('0000000000', id) 
        WHERE phone = '0000000000'
      `);
      
      // Now add unique constraint
      await queryInterface.addConstraint('users', {
        fields: ['phone'],
        type: 'unique',
        name: 'users_phone_unique'
      });
      
      // Add index on phone column
      await queryInterface.addIndex('users', ['phone'], {
        name: 'users_phone'
      });
      
      console.log('✅ Phone column and index added to users table');
    } else {
      console.log('ℹ️ Phone column already exists in users table');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove phone column and its index
    await queryInterface.removeIndex('users', 'users_phone');
    await queryInterface.removeConstraint('users', 'users_phone_unique');
    await queryInterface.removeColumn('users', 'phone');
  }
}; 
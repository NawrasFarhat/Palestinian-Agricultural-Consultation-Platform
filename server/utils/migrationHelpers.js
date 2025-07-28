/**
 * Migration helper utilities for making migrations idempotent
 */

/**
 * Safely add an index if it doesn't already exist
 * @param {Object} queryInterface - Sequelize query interface
 * @param {string} tableName - Name of the table
 * @param {Array} columns - Array of column names to index
 * @param {string} indexName - Optional custom index name
 */
export const addIndexIfNotExists = async (queryInterface, tableName, columns, indexName = null) => {
  try {
    const indexes = await queryInterface.showIndex(tableName);
    const indexExists = indexes.some(index => 
      indexName ? index.name === indexName : 
      index.fields.some(field => columns.includes(field.attribute))
    );
    
    if (!indexExists) {
      await queryInterface.addIndex(tableName, columns, {
        name: indexName
      });
      console.log(`✅ Added index ${indexName || columns.join('_')} to ${tableName}`);
    } else {
      console.log(`ℹ️  Index ${indexName || columns.join('_')} already exists on ${tableName}`);
    }
  } catch (error) {
    // If showIndex fails, try to add the index anyway
    console.log(`⚠️  Could not check index existence for ${tableName}.${columns.join(',')}. Adding index...`);
    try {
      await queryInterface.addIndex(tableName, columns, {
        name: indexName
      });
      console.log(`✅ Added index ${indexName || columns.join('_')} to ${tableName}`);
    } catch (addError) {
      console.log(`ℹ️  Index ${indexName || columns.join('_')} may already exist on ${tableName}`);
    }
  }
};

/**
 * Safely create a table if it doesn't already exist
 * @param {Object} queryInterface - Sequelize query interface
 * @param {string} tableName - Name of the table
 * @param {Object} tableDefinition - Table structure definition
 */
export const createTableIfNotExists = async (queryInterface, tableName, tableDefinition) => {
  try {
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes(tableName));
    
    if (!tableExists) {
      await queryInterface.createTable(tableName, tableDefinition);
      console.log(`✅ Created table ${tableName}`);
    } else {
      console.log(`ℹ️  Table ${tableName} already exists`);
    }
  } catch (error) {
    console.error(`❌ Error creating table ${tableName}:`, error.message);
    throw error;
  }
};

/**
 * Safely add a column if it doesn't already exist
 * @param {Object} queryInterface - Sequelize query interface
 * @param {string} tableName - Name of the table
 * @param {string} columnName - Name of the column
 * @param {Object} columnDefinition - Column definition
 */
export const addColumnIfNotExists = async (queryInterface, tableName, columnName, columnDefinition) => {
  try {
    const tableDescription = await queryInterface.describeTable(tableName);
    const columnExists = tableDescription[columnName];
    
    if (!columnExists) {
      await queryInterface.addColumn(tableName, columnName, columnDefinition);
      console.log(`✅ Added column ${columnName} to ${tableName}`);
    } else {
      console.log(`ℹ️  Column ${columnName} already exists in ${tableName}`);
    }
  } catch (error) {
    console.error(`❌ Error adding column ${columnName} to ${tableName}:`, error.message);
    throw error;
  }
}; 
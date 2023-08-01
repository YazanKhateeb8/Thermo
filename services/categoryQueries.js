const sequelize = require('../dbConnections');



const getAllCategories = async () => {
    try {
      const categories = await sequelize.query('SELECT * FROM categories', {
        type: sequelize.QueryTypes.SELECT,
      });
      return categories;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch categories');
    }
  };
  


module.exports = {
    getAllCategories
  };
  
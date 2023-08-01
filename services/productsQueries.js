const sequelize = require('../dbConnections');

// Service to fetch all products from the database
const getAllProducts = async () => {
  try {
    const productQuery = `
      SELECT p.product_id, p.name, p.price, p.rating, p.quantity, p.sold, p.size, p.description, p.category_id
      FROM products p;
    `;

    const imagesQuery = `
      SELECT pi.id, pi.image_url, pi.product_id
      FROM product_images pi;
    `;

    const [productResult, imagesResult] = await Promise.all([
      sequelize.query(productQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(imagesQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    const products = productResult.map((product) => {
      const images = imagesResult
        .filter((image) => image.product_id === product.product_id)
        .map((row) => ({
          id: row.id,
          image_url: row.image_url,
        }));

      return {
        ...product,
        images,
      };
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch products');
  }
};






const getAllProductsByCategory = async (categoryName) => {
  try {
    const productQuery = `
      SELECT p.product_id, p.name, p.price, p.rating, p.quantity, p.sold, p.size, p.description, p.category_id
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE c.category_name = :categoryName;
    `;

    const imagesQuery = `
      SELECT pi.id, pi.image_url, pi.product_id
      FROM product_images pi;
    `;

    const [productResult, imagesResult] = await Promise.all([
      sequelize.query(productQuery, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { categoryName },
      }),
      sequelize.query(imagesQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    const products = productResult.map((product) => {
      const images = imagesResult
        .filter((image) => image.product_id === product.product_id)
        .map((row) => ({
          id: row.id,
          image_url: row.image_url,
        }));

      return {
        ...product,
        images,
      };
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch products');
  }
};






const getProductById = async (productId) => {
  try {
    const productQuery = `
      SELECT p.product_id, p.name, p.price, p.rating, p.quantity, p.sold, p.size, p.description, p.category_id
      FROM products p
      WHERE p.product_id = :productId;
    `;

    const imagesQuery = `
      SELECT pi.id, pi.image_url
      FROM product_images pi
      WHERE pi.product_id = :productId;
    `;

    const [productResult, imagesResult] = await Promise.all([
      sequelize.query(productQuery, {
        replacements: { productId },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(imagesQuery, {
        replacements: { productId },
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    const product = productResult[0] || null;

    if (product) {
      product.images = imagesResult.map((row) => ({
        id: row.id,
        image_url: row.image_url,
      }));
    }

    return product;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch product by ID');
  }
};


const getMostSoldProducts = async () => {
  try {
    const query = `
      SELECT p.product_id, p.name, p.price, p.rating, p.quantity, p.sold, p.size, p.description, p.category_id
      FROM products p
      ORDER BY p.sold DESC
      LIMIT 8;
    `;

    const products = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    const productIds = products.map((product) => product.product_id);

    const imagesQuery = `
      SELECT pi.product_id, pi.id, pi.image_url
      FROM product_images pi
      WHERE pi.product_id IN (:productIds);
    `;

    const imagesResult = await sequelize.query(imagesQuery, {
      replacements: { productIds },
      type: sequelize.QueryTypes.SELECT,
    });

    const productImagesMap = {};

    imagesResult.forEach((row) => {
      if (!productImagesMap[row.product_id]) {
        productImagesMap[row.product_id] = [];
      }

      productImagesMap[row.product_id].push({
        id: row.id,
        image_url: row.image_url,
      });
    });

    products.forEach((product) => {
      product.images = productImagesMap[product.product_id] || [];
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch most sold products');
  }
};



const getProductsWithDiscount = async () => {
  try {
    const query = `
    SELECT p.product_id, p.name, p.price, p.rating, p.quantity, p.sold, p.size, p.description, p.category_id
    FROM products p
    WHERE p.discount > 0;
    `;

    const products = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    const productIds = products.map((product) => product.product_id);

    const imagesQuery = `
      SELECT pi.product_id, pi.id, pi.image_url
      FROM product_images pi
      WHERE pi.product_id IN (:productIds);
    `;

    const imagesResult = await sequelize.query(imagesQuery, {
      replacements: { productIds },
      type: sequelize.QueryTypes.SELECT,
    });

    const productImagesMap = {};

    imagesResult.forEach((row) => {
      if (!productImagesMap[row.product_id]) {
        productImagesMap[row.product_id] = [];
      }

      productImagesMap[row.product_id].push({
        id: row.id,
        image_url: row.image_url,
      });
    });

    products.forEach((product) => {
      product.images = productImagesMap[product.product_id] || [];
    });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch products with discount');
  }
};





module.exports = {
  getAllProducts,
  getProductById,
  getAllProductsByCategory,
  getMostSoldProducts,
  getProductsWithDiscount
};

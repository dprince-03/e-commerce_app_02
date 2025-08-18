const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/,
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.STRING,
  },
  parentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metaTitle: {
    type: DataTypes.STRING,
    validate: {
      len: [0, 60],
    },
  },
  metaDescription: {
    type: DataTypes.STRING,
    validate: {
      len: [0, 160],
    },
  },
}, {
  hooks: {
    beforeCreate: (category) => {
      if (!category.slug && category.name) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }
    },
    beforeUpdate: (category) => {
      if (category.changed('name') && !category.changed('slug')) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }
    },
  },
  indexes: [
    {
      fields: ['slug'],
      unique: true,
    },
    {
      fields: ['parentId'],
    },
    {
      fields: ['isActive'],
    },
    {
      fields: ['sortOrder'],
    },
  ],
});

// Self-referencing association for parent-child categories
Category.belongsTo(Category, { 
  as: 'parent', 
  foreignKey: 'parentId',
  onDelete: 'CASCADE',
});

Category.hasMany(Category, { 
  as: 'children', 
  foreignKey: 'parentId',
  onDelete: 'CASCADE',
});

// Instance methods
Category.prototype.getFullPath = async function() {
  const path = [this.name];
  let current = this;
  
  while (current.parentId) {
    current = await Category.findByPk(current.parentId);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

// Class methods
Category.findBySlug = function(slug) {
  return this.findOne({ where: { slug, isActive: true } });
};

Category.findActiveCategories = function() {
  return this.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });
};

Category.getTree = async function() {
  const categories = await this.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });

  const categoryMap = {};
  const tree = [];

  // Create a map of categories
  categories.forEach(category => {
    categoryMap[category.id] = {
      ...category.toJSON(),
      children: [],
    };
  });

  // Build the tree structure
  categories.forEach(category => {
    if (category.parentId && categoryMap[category.parentId]) {
      categoryMap[category.parentId].children.push(categoryMap[category.id]);
    } else {
      tree.push(categoryMap[category.id]);
    }
  });

  return tree;
};

module.exports = Category;
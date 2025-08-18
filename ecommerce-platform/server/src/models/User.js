const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50],
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 128],
    },
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^[+]?[1-9][\d\s\-()]{7,15}$/,
    },
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin', 'vendor'),
    defaultValue: 'customer',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lockUntil: {
    type: DataTypes.DATE,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
  },
  indexes: [
    {
      fields: ['email'],
      unique: true,
    },
    {
      fields: ['role'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.emailVerificationToken;
  delete values.passwordResetToken;
  delete values.loginAttempts;
  delete values.lockUntil;
  return values;
};

// Class methods
User.getAuthenticated = async function(email, password) {
  const user = await this.findOne({ where: { email } });
  
  if (!user) {
    return { user: null, error: 'Invalid credentials' };
  }

  if (user.isLocked()) {
    return { user: null, error: 'Account temporarily locked' };
  }

  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    user.loginAttempts += 1;
    
    // Lock account after 5 failed attempts for 2 hours
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
    }
    
    await user.save();
    return { user: null, error: 'Invalid credentials' };
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = null;
  }
  
  user.lastLogin = new Date();
  await user.save();

  return { user, error: null };
};

module.exports = User;
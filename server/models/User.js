const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  aiConfig: {
    mode: {
      type: String,
      enum: ['general', 'byok'],
      default: 'general'
    },
    provider: {
      type: String,
      enum: ['gemini', 'openai', 'groq', 'openrouter'],
      default: 'gemini'
    },
    apiKey: {
      type: String,
      default: ''
    },
    model: {
      type: String,
      default: ''
    },
    customEndpoint: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output and mask API key
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  if (userObject.aiConfig) {
    const rawKey = userObject.aiConfig.apiKey;
    userObject.aiConfig.hasCustomKey = Boolean(rawKey && rawKey.trim().length > 0);
    userObject.aiConfig.maskedKey = (rawKey && rawKey.length > 8)
      ? `${rawKey.slice(0, 4)}••••${rawKey.slice(-4)}`
      : (rawKey ? '••••••••' : '');
    delete userObject.aiConfig.apiKey;
  }
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

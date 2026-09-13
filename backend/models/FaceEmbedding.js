const mongoose = require('mongoose');

const faceEmbeddingSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    model_version: {
      type: String,
      default: 'face-api-v1',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.FaceEmbedding || mongoose.model('FaceEmbedding', faceEmbeddingSchema);


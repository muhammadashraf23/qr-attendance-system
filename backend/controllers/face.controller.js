/**
 * Face Recognition Controller
 *
 * Face embeddings are generated on the CLIENT (face-api.js in browser)
 * and sent to the API as float arrays. The server stores and compares them.
 * This avoids sending raw camera frames over the network.
 */

const { FaceEmbedding, Employee } = require('../models');
const { AppError } = require('../utils/AppError');
const env = require('../config/env');

const CONFIDENCE_THRESHOLD = env.FACE_CONFIDENCE_THRESHOLD;

/**
 * Cosine similarity between two embedding vectors.
 * Returns a value 0–1 where 1 = identical.
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* ─── POST /api/face/register ───────────────────────────── */
const registerFace = async (req, res, next) => {
  try {
    const { employee_id, embedding } = req.body;

    if (!employee_id || !Array.isArray(embedding) || embedding.length < 128)
      throw new AppError(
        'VALIDATION_ERROR',
        'employee_id and a valid embedding array (≥128 floats) are required.',
        400
      );

    // Verify employee
    const emp = await Employee.findOne({ employee_id, is_active: true });
    if (!emp) throw new AppError('NOT_FOUND', 'Employee not found.', 404);

    // Upsert the embedding
    const record = await FaceEmbedding.findOneAndUpdate(
      { employee_id },
      { embedding, model_version: 'face-api-v1', is_active: true },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Face embedding registered.',
      data: {
        id: record._id,
        employee_id: record.employee_id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/face/verify ─────────────────────────────── */
const verifyFace = async (req, res, next) => {
  try {
    const { embedding } = req.body;

    if (!Array.isArray(embedding) || embedding.length < 128)
      throw new AppError('VALIDATION_ERROR', 'Valid embedding array required.', 400);

    // Load all active embeddings
    const stored = await FaceEmbedding.find({ is_active: true }).lean();
    if (!stored.length) throw new AppError('NO_FACES', 'No registered faces in the system.', 400);

    const empIds = stored.map((s) => s.employee_id);
    const employees = await Employee.find({ employee_id: { $in: empIds }, is_active: true }).lean();
    const empMap = new Map();
    employees.forEach((e) => empMap.set(e.employee_id, e));

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const row of stored) {
      const emp = empMap.get(row.employee_id);
      if (!emp) continue; // skip inactive employee

      const storedEmbedding = row.embedding;
      const score = cosineSimilarity(embedding, storedEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...row, full_name: emp.full_name };
      }
    }

    const confidence = Math.round(bestScore * 1000) / 1000;

    if (bestScore < CONFIDENCE_THRESHOLD || !bestMatch) {
      return res.status(401).json({
        success: false,
        error: 'FACE_NOT_RECOGNIZED',
        message: `Face not recognized (confidence: ${confidence}, threshold: ${CONFIDENCE_THRESHOLD}).`,
        confidence,
      });
    }

    // Return recognized employee info (caller will then do check-in)
    return res.json({
      success: true,
      message: `Face recognized: ${bestMatch.full_name}`,
      data: {
        employee_id: bestMatch.employee_id,
        employee_name: bestMatch.full_name,
        confidence,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerFace, verifyFace };

/**
 * Face Recognition Controller
 *
 * Face embeddings are generated on the CLIENT (face-api.js in browser)
 * and sent to the API as float arrays. The server stores and compares them.
 * This avoids sending raw camera frames over the network.
 */

const { FaceEmbedding, Member } = require('../models');
const { AppError } = require('../utils/AppError');
const env = require('../config/env');

const CONFIDENCE_THRESHOLD = env.FACE_CONFIDENCE_THRESHOLD || 0.85;

/**
 * Cosine similarity between two embedding vectors.
 * Returns a value 0–1 where 1 = identical.
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* ─── POST /api/face/activate  (Member — student/teacher) ── */
const activateFace = async (req, res, next) => {
  try {
    // member_id from JWT (req.user) or from body (for admin-assist enrollment)
    const member_id = req.user?.member_id || req.body.member_id;
    const { embedding } = req.body;

    if (!member_id || !Array.isArray(embedding) || embedding.length < 128)
      throw new AppError(
        'VALIDATION_ERROR',
        'member_id and a valid embedding array (≥128 floats) are required.',
        400
      );

    // Verify member
    const member = await Member.findOne({ member_id, is_active: true });
    if (!member) throw new AppError('NOT_FOUND', 'Member not found.', 404);

    // Upsert the embedding
    const record = await FaceEmbedding.findOneAndUpdate(
      { employee_id: member_id },  // keep field name for FaceEmbedding schema compatibility
      { embedding, model_version: 'face-api-v1', is_active: true },
      { upsert: true, new: true }
    );

    // Mark face_registered flag on the member
    await Member.updateOne({ member_id }, { face_registered: true });

    return res.status(201).json({
      success: true,
      message: 'Face activated successfully.',
      data: {
        id:         record._id,
        member_id,
        createdAt:  record.createdAt,
        updatedAt:  record.updatedAt,
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

    const memberIds = stored.map((s) => s.employee_id);
    const members   = await Member.find({ member_id: { $in: memberIds }, is_active: true }).lean();
    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.member_id, m));

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const row of stored) {
      const member = memberMap.get(row.employee_id);
      if (!member) continue;

      const score = cosineSimilarity(embedding, row.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...row, full_name: member.full_name, role: member.role };
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

    return res.json({
      success: true,
      message: `Face recognized: ${bestMatch.full_name}`,
      data: {
        member_id:   bestMatch.employee_id,
        member_name: bestMatch.full_name,
        role:        bestMatch.role,
        confidence,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { activateFace, verifyFace };

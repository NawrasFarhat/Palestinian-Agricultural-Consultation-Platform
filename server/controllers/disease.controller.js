import db from '../models/index.js';

// List all diseases
export const getAllDiseases = async (req, res) => {
  try {
    const diseases = await db.Disease.findAll({
      include: [{ model: db.User, attributes: ['id', 'username', 'role'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(diseases);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diseases', error });
  }
};

// Get a single disease by ID
export const getDiseaseById = async (req, res) => {
  try {
    const disease = await db.Disease.findByPk(req.params.id, {
      include: [{ model: db.User, attributes: ['id', 'username', 'role'] }]
    });
    if (!disease) return res.status(404).json({ message: 'Disease not found' });
    res.json(disease);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch disease', error });
  }
};

// Create a new disease (engineer or manager)
export const createDisease = async (req, res) => {
  try {
    const { name, symptoms, solution } = req.body;
    if (!name || !symptoms || !solution) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // created_by from JWT
    const created_by = req.user.id;
    const disease = await db.Disease.create({ name, symptoms, solution, created_by });
    res.status(201).json(disease);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create disease', error });
  }
};

// Update a disease (engineer or manager)
export const updateDisease = async (req, res) => {
  try {
    const { name, symptoms, solution } = req.body;
    const disease = await db.Disease.findByPk(req.params.id);
    if (!disease) return res.status(404).json({ message: 'Disease not found' });
    // Only creator, manager, or IT can update
    if (req.user.role !== 'manager' && req.user.role !== 'it' && req.user.id !== disease.created_by) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await disease.update({ name, symptoms, solution });
    res.json(disease);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update disease', error });
  }
};

// Delete a disease (manager or IT)
export const deleteDisease = async (req, res) => {
  try {
    const disease = await db.Disease.findByPk(req.params.id);
    if (!disease) return res.status(404).json({ message: 'Disease not found' });
    if (req.user.role !== 'manager' && req.user.role !== 'it') {
      return res.status(403).json({ message: 'Only manager or IT can delete diseases' });
    }
    await disease.destroy();
    res.json({ message: 'Disease deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete disease', error });
  }
}; 
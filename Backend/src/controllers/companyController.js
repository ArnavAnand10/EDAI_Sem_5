const prisma = require('../config/prisma');

// Get all companies
async function getCompanies(req, res) {
  try {
    const companies = await prisma.company.findMany({ include: { employees: true } });
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get company by ID
async function getCompany(req, res) {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: { employees: true },
    });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create company
async function createCompany(req, res) {
  try {
    const { name, industry, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const company = await prisma.company.create({
      data: { name, industry, location },
    });

    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update company
async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete company
async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    await prisma.company.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};

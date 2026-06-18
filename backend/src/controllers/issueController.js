const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fetch all issues
const getIssues = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      // Include the name of the assigned user so our frontend can display it
      include: { assignee: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new issue
const createIssue = async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const userId = req.user.id; // This comes from our authMiddleware!

    // 1. Ensure a project exists (Create a default one if needed)
    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({
        data: { title: 'Main Workspace', createdBy: userId }
      });
    }

    // 2. Create the issue in the database
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'OPEN',
        projectId: project.id,
        createdBy: userId,
      }
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an issue's details (status, title, or priority)
const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priority, status } = req.body;

    // Only update the fields that are actually sent in the request
    const issue = await prisma.issue.update({
      where: { id: id },
      data: {
        ...(title !== undefined && { title }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status })
      }
    });

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an issue
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.issue.delete({
      where: { id: id }
    });

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update your exports to include the new function!
module.exports = { getIssues, createIssue, updateIssue, deleteIssue };
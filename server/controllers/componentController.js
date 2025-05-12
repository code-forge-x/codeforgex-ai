import Component from '../models/Component.js';

// Get all components with pagination and filtering
export const getAllComponents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { active: true };
    
    // Add filters
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const components = await Component.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const count = await Component.countDocuments(query);

    res.json({
      components,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalComponents: count
    });
  } catch (error) {
    console.error('Get all components error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get component by ID
export const getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ 
        success: false,
        message: 'Component not found' 
      });
    }
    res.json({
      success: true,
      component
    });
  } catch (error) {
    console.error('Get component error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new component
export const createComponent = async (req, res) => {
  try {
    const { name, description, content, category, tags, metadata } = req.body;
    
    if (!req.user || !req.user.email) {
      return res.status(401).json({ 
        success: false,
        message: 'User information is required to create a component' 
      });
    }

    // Check if component with this name already exists
    const existingComponent = await Component.findOne({ name });
    if (existingComponent) {
      return res.status(400).json({
        success: false,
        message: `A component with the name "${name}" already exists. Please use a different name.`
      });
    }

    const component = new Component({
      name,
      description,
      content,
      category,
      tags: tags || [],
      metadata: metadata || {},
      createdBy: req.user.email,
      updatedBy: req.user.email
    });

    await component.save();

    res.status(201).json({
      success: true,
      message: 'Component created successfully',
      component
    });
  } catch (error) {
    console.error('Create component error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'A component with this name already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update component
export const updateComponent = async (req, res) => {
  try {
    const { description, content, category, tags, metadata } = req.body;
    
    if (!req.user || !req.user.email) {
      return res.status(401).json({ 
        success: false,
        message: 'User information is required to update a component' 
      });
    }

    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ 
        success: false,
        message: 'Component not found' 
      });
    }

    // Update fields
    component.description = description || component.description;
    component.content = content || component.content;
    component.category = category || component.category;
    component.tags = tags || component.tags;
    component.metadata = metadata || component.metadata;
    component.updatedBy = req.user.email;
    component.version += 1;

    await component.save();

    res.json({
      success: true,
      message: 'Component updated successfully',
      component
    });
  } catch (error) {
    console.error('Update component error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete component (soft delete)
export const deleteComponent = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ 
        success: false,
        message: 'User information is required to delete a component' 
      });
    }

    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ 
        success: false,
        message: 'Component not found' 
      });
    }

    // Check if component is in use
    if (component.usageCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete component that is currently in use by templates'
      });
    }

    // Soft delete
    component.active = false;
    component.updatedBy = req.user.email;
    await component.save();

    res.json({
      success: true,
      message: 'Component deleted successfully'
    });
  } catch (error) {
    console.error('Delete component error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get component usage statistics
export const getComponentStats = async (req, res) => {
  try {
    const stats = await Component.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get component stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

export default {
  getAllComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
  getComponentStats
}; 
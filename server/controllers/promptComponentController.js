import Component from '../models/Component.js';

// Get all components
export const getAllComponents = async (req, res) => {
  try {
    const components = await Component.find({ active: true })
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(components);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ message: 'Error fetching components', error: error.message });
  }
};

// Get component by ID
export const getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id).select('-__v');
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }
    res.json(component);
  } catch (error) {
    console.error('Error fetching component:', error);
    res.status(500).json({ message: 'Error fetching component', error: error.message });
  }
};

// Get component by name
export const getComponentByName = async (req, res) => {
  try {
    const components = await Component.find({ name: req.params.name })
      .sort({ version: -1 })
      .select('-__v');
    if (!components.length) {
      return res.status(404).json({ message: 'No components found with this name' });
    }
    res.json(components);
  } catch (error) {
    console.error('Error fetching components by name:', error);
    res.status(500).json({ message: 'Error fetching components', error: error.message });
  }
};

// Get active component by name
export const getActiveComponentByName = async (req, res) => {
  try {
    const component = await Component.findOne({ 
      name: req.params.name,
      active: true 
    }).select('-__v');
    
    if (!component) {
      return res.status(404).json({ message: 'No active component found with this name' });
    }
    res.json(component);
  } catch (error) {
    console.error('Error fetching active component:', error);
    res.status(500).json({ message: 'Error fetching active component', error: error.message });
  }
};

// Create new component
export const createComponent = async (req, res) => {
  try {
    const { name, description, content, category, tags } = req.body;
    
    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }

    // Check if component with same name and version exists
    const existingComponent = await Component.findOne({ name });
    const version = existingComponent ? existingComponent.version + 1 : 1;

    const component = new Component({
      name,
      description,
      content,
      category,
      tags,
      version,
      active: true,
      createdBy: req.user.email,
      updatedBy: req.user.email
    });

    await component.save();
    res.status(201).json(component);
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ message: 'Error creating component', error: error.message });
  }
};

// Update component
export const updateComponent = async (req, res) => {
  try {
    const { name, description, content, category, tags } = req.body;
    
    // Find the component by ID
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ 
        success: false,
        message: 'Component not found' 
      });
    }

    // Update the fields
    const updateData = {
      description: description || component.description,
      content: content || component.content,
      category: category || component.category,
      tags: tags || component.tags,
      updatedBy: req.user.email
    };

    // Only update name if it's different
    if (name && name !== component.name) {
      updateData.name = name;
    }

    // Use findByIdAndUpdate to update the document directly
    const updatedComponent = await Component.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedComponent) {
      return res.status(404).json({ 
        success: false,
        message: 'Component not found' 
      });
    }

    res.json({
      success: true,
      message: 'Component updated successfully',
      component: updatedComponent
    });
  } catch (error) {
    console.error('Error updating component:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'A component with this name already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error updating component', 
      error: error.message 
    });
  }
};

// Activate component version
export const activateComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    // Deactivate all versions of this component
    await Component.updateMany(
      { name: component.name },
      { active: false }
    );

    // Activate the selected version
    component.active = true;
    component.updatedBy = req.user.email;
    await component.save();

    res.json(component);
  } catch (error) {
    console.error('Error activating component:', error);
    res.status(500).json({ message: 'Error activating component', error: error.message });
  }
};

// Get component usage statistics
export const getComponentUsage = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    const usageStats = {
      totalUsage: component.usageCount,
      lastUsed: component.lastUsed,
      usageByTemplate: component.usageByTemplate || {}
    };

    res.json(usageStats);
  } catch (error) {
    console.error('Error fetching component usage:', error);
    res.status(500).json({ message: 'Error fetching component usage', error: error.message });
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

export default {
  getAllComponents,
  getComponentById,
  getComponentByName,
  getActiveComponentByName,
  createComponent,
  updateComponent,
  activateComponent,
  getComponentUsage,
  deleteComponent
};
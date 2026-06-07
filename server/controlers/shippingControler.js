import shippingCosts from "../models/shippingcostModel.js";

/**
 * Get shipping settings (global)
 */
const getShippingCost = async (req, res) => {
  try {
    const settings = await shippingCosts.findOne();

    if (!settings) {
      return res.json({
        freeShippingAbove: 0,
        shippingRules: [],
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shipping settings" });
  }
};

/**
 * Add state shipping cost
 */
const addStateShipping = async (req, res) => {
  try {
    const { state, cost } = req.body;

    if (!state || cost == null) {
      return res.status(400).json({ message: "State and cost are required" });
    }

    let settings = await shippingCosts.findOne();

    if (!settings) {
      settings = new shippingCosts({
        freeShippingAbove: 0,
        shippingRules: [],
      });
    }

    // prevent duplicate state
    const exists = settings.shippingRules.find(
      (s) => s.state.toLowerCase() === state.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ message: "State already exists" });
    }

    settings.shippingRules.push({ state, cost });
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to add state" });
  }
};

/**
 * Update state shipping cost
 */
const updateStateShipping = async (req, res) => {
  try {
    const { cost } = req.body;
    const { id } = req.params;

    if (cost == null) {
      return res.status(400).json({ message: "Cost is required" });
    }

    const settings = await shippingCosts.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Shipping settings not found" });
    }

    const stateRule = settings.shippingRules.id(id);

    if (!stateRule) {
      return res.status(404).json({ message: "State not found" });
    }

    stateRule.cost = cost;
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update state cost" });
  }
};

/**
 * Update free shipping amount
 */
const updateFreeShipping = async (req, res) => {
  try {
    const { freeShippingAbove } = req.body;

    if (freeShippingAbove == null || freeShippingAbove < 0) {
      return res.status(400).json({ message: "Invalid free shipping amount" });
    }

    const settings = await shippingCosts.findOneAndUpdate(
      {},
      { freeShippingAbove },
      { upsert: true, new: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update free shipping cost" });
  }
};

const deleteStateShipping = async (req, res) => {
  try {
    const { id } = req.params;

    const settings = await shippingCosts.findOne();

    if (!settings) {
      return res.status(404).json({ message: "Shipping settings not found" });
    }

    const stateRule = settings.shippingRules.id(id);

    if (!stateRule) {
      return res.status(404).json({ message: "State not found" });
    }

    // Mongoose-safe removal
    settings.shippingRules.pull({ _id: id });
    await settings.save();

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete state" });
  }
};

/**
 * Get shipping cost based on state & free shipping rule
 * GET /api/shipping/getshippingcost?state=Tamil Nadu
 */
const getShippingCostByState = async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({ message: "State is required" });
    }

    // Use the correct model name (lowercase as imported)
    const shippingSettings = await shippingCosts.findOne();

    if (!shippingSettings) {
      return res.status(404).json({ message: "Shipping settings not found" });
    }

    const stateRule = shippingSettings.shippingRules.find(
      (rule) => rule.state.toLowerCase() === state.toLowerCase()
    );

    if (!stateRule) {
      return res.status(404).json({
        message: `Shipping not available for ${state}`,
      });
    }

    res.json({
      shippingCost: stateRule.cost,
      freeShippingAbove: shippingSettings.freeShippingAbove,
      state: stateRule.state,
    });
  } catch (error) {
    console.error("Error fetching shipping cost:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export {
  getShippingCost,
  addStateShipping,
  updateStateShipping,
  updateFreeShipping,
  deleteStateShipping,
  getShippingCostByState,
};

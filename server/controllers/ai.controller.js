import db from "../models/index.js";

export const diagnose = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: "Symptoms are required" });
    }

    // Simple rule-based diagnosis (no external AI)
    const diagnosis = await performRuleBasedDiagnosis(symptoms);

    return res.status(200).json({
      diagnosis,
      confidence: diagnosis.confidence,
      recommendations: diagnosis.recommendations
    });
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    return res.status(500).json({ message: "Diagnosis failed" });
  }
};

// Simple rule-based diagnosis function
const performRuleBasedDiagnosis = async (symptoms) => {
  // Convert symptoms to lowercase for matching
  const symptomsLower = symptoms.toLowerCase();
  
  // Simple rule-based matching
  if (symptomsLower.includes('yellow') || symptomsLower.includes('أصفر')) {
    return {
      disease: "Yellow Leaf Disease",
      confidence: 0.8,
      recommendations: [
        "Check soil pH levels",
        "Apply nitrogen-rich fertilizer",
        "Ensure proper drainage"
      ]
    };
  } else if (symptomsLower.includes('brown') || symptomsLower.includes('بني')) {
    return {
      disease: "Brown Spot Disease",
      confidence: 0.75,
      recommendations: [
        "Remove infected leaves",
        "Apply fungicide",
        "Improve air circulation"
      ]
    };
  } else if (symptomsLower.includes('wilting') || symptomsLower.includes('ذبول')) {
    return {
      disease: "Root Rot",
      confidence: 0.85,
      recommendations: [
        "Check root system",
        "Improve drainage",
        "Reduce watering frequency"
      ]
    };
  } else {
    return {
      disease: "Unknown Condition",
      confidence: 0.3,
      recommendations: [
        "Consult with agricultural expert",
        "Take photos for detailed analysis",
        "Monitor symptoms progression"
      ]
    };
  }
};

export const getDiseaseSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const diseases = await db.Disease.findAll({
      where: {
        name: {
          [db.Sequelize.Op.like]: `%${query}%`
        }
      },
      limit: 10
    });

    return res.status(200).json({
      suggestions: diseases.map(disease => ({
        id: disease.id,
        name: disease.name,
        symptoms: disease.symptoms
      }))
    });
  } catch (error) {
    console.error("Disease Suggestions Error:", error);
    return res.status(500).json({ message: "Failed to get suggestions" });
  }
};

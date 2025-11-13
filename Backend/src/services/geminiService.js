const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');

/**
 * Analyze project requirements and extract skills with weights using Gemini AI
 * @param {string} projectRequirements - Natural language project description
 * @returns {Promise<Array>} - Array of {skillName, weight} objects
 */
async function analyzeProjectRequirements(projectRequirements) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a technical project analyzer. Analyze the following project requirements and extract:
1. All technical skills needed
2. Assign importance weight (1-100) to each skill based on how critical it is for the project

Project Requirements:
${projectRequirements}

IMPORTANT: Respond ONLY with a valid JSON array. No explanations, no markdown, just the JSON array.
Format: [{"skillName": "skill_name", "weight": number}]

Example response:
[{"skillName": "ReactJS", "weight": 90}, {"skillName": "Node.js", "weight": 85}]

Your response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    const skills = JSON.parse(text);

    // Validate format
    if (!Array.isArray(skills)) {
      throw new Error('Invalid response format: Expected array');
    }

    // Validate each skill object
    const validatedSkills = skills.map(skill => {
      if (!skill.skillName || typeof skill.weight !== 'number') {
        throw new Error('Invalid skill format: Missing skillName or weight');
      }
      
      // Ensure weight is within range
      const weight = Math.max(1, Math.min(100, skill.weight));
      
      return {
        skillName: skill.skillName.trim(),
        weight: weight
      };
    });

    return validatedSkills;

  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    // If Gemini fails, return empty array or throw
    if (error.message.includes('API key')) {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file');
    }
    
    throw new Error(`Failed to analyze project requirements: ${error.message}`);
  }
}

/**
 * Match Gemini skill names to database skills with fuzzy matching
 * @param {string} geminiSkillName - Skill name from Gemini
 * @param {Array} dbSkills - Array of skill objects from database
 * @returns {Object|null} - Matched skill object or null
 */
function matchSkillToDatabase(geminiSkillName, dbSkills) {
  const normalizedGeminiSkill = geminiSkillName.toLowerCase().trim();

  // 1. Exact match (case-insensitive)
  let match = dbSkills.find(
    skill => skill.name.toLowerCase() === normalizedGeminiSkill
  );
  if (match) return match;

  // 2. Partial match - check if DB skill contains Gemini skill
  match = dbSkills.find(
    skill => skill.name.toLowerCase().includes(normalizedGeminiSkill)
  );
  if (match) return match;

  // 3. Reverse - check if Gemini skill contains DB skill
  match = dbSkills.find(
    skill => normalizedGeminiSkill.includes(skill.name.toLowerCase())
  );
  if (match) return match;

  // 4. Common abbreviations and variations
  const variations = {
    'js': 'javascript',
    'ts': 'typescript',
    'reactjs': 'react',
    'react.js': 'react',
    'nodejs': 'node.js',
    'node': 'node.js',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'angular.js': 'angular',
    'angularjs': 'angular',
    'mongo': 'mongodb',
    'postgresql': 'postgres',
    'psql': 'postgres',
    'py': 'python',
    'c++': 'cpp',
    'c#': 'csharp',
    'css3': 'css',
    'html5': 'html',
    'mysql': 'sql',
    'mssql': 'sql server',
    'aws': 'amazon web services',
    'gcp': 'google cloud platform',
    'k8s': 'kubernetes',
    'docker': 'containerization',
    'ci/cd': 'continuous integration',
    'ml': 'machine learning',
    'ai': 'artificial intelligence',
    'rest': 'restful api',
    'graphql': 'graph ql'
  };

  // Try variations of Gemini skill
  const geminiVariation = variations[normalizedGeminiSkill];
  if (geminiVariation) {
    match = dbSkills.find(
      skill => skill.name.toLowerCase() === geminiVariation ||
               skill.name.toLowerCase().includes(geminiVariation) ||
               geminiVariation.includes(skill.name.toLowerCase())
    );
    if (match) return match;
  }

  // Try reverse variations (check if DB skill has variation that matches)
  match = dbSkills.find(skill => {
    const dbSkillNormalized = skill.name.toLowerCase();
    const dbVariation = variations[dbSkillNormalized];
    return dbVariation === normalizedGeminiSkill ||
           normalizedGeminiSkill.includes(dbVariation || '');
  });
  if (match) return match;

  // No match found
  return null;
}

module.exports = {
  analyzeProjectRequirements,
  matchSkillToDatabase
};

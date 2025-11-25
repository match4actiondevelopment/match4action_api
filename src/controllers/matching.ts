import { NextFunction, Request, Response } from "express";
import { Initiative } from "../models/Initiatives";
import { IkigaiResponse } from "../models/IkigaiResponse";
import { createError } from "../utils/createError";

// Mapping of Ikigai categories to initiative tags
const ikigaiToTagsMapping = {
  passion: [
    "Creative expression", "Innovation and creativity", "Being creative and innovative",
    "Outdoor activities", "Personal growth and development", "Travel and adventure",
    "Calm and peaceful environment", "Focusing mainly on personal life",
    "Irregular and varied schedule", "Flexible schedule"
  ],
  mission: [
    "Helping others", "Helping others and making a difference", "Meaningful work",
    "Helping others and making a positive impact", "Working with others towards a common goal",
    "Seeing the positive impact of your work", "Community Building", "Social Justice",
    "Working with others in a team environment", "Environmental Protection",
    "Education Equality", "Youth Empowerment", "Senior Care", "Food Security",
    "Mental Health", "Climate Action"
  ],
  profession: [
    "Financial stability", "Flexibility and autonomy", "Advancing in your career",
    "Achieving goals and targets", "Regular 9 to 5 schedule", "Focusing mainly on work",
    "Balancing work and personal life equally", "Work from home schedule"
  ],
  vocation: [
    "Learning new things", "Communication and people skills", "Technical skills",
    "Organizational and planning skills", "Problem-solving skills", "Solving complex problems",
    "Meeting new people and building relationships", "Analyzing complex data and information",
    "Managing multiple projects and tasks", "Accomplishing difficult tasks and challenges",
    "Working independently", "Fast-paced and dynamic environment"
  ]
};

// Semantic keywords for better matching
const semanticKeywords = {
  environmental: ["environment", "green", "sustainability", "climate", "nature", "conservation", "ecology", "renewable", "carbon", "pollution"],
  education: ["teach", "learn", "education", "school", "student", "knowledge", "skill", "training", "mentor", "tutor"],
  community: ["community", "local", "neighborhood", "social", "together", "collective", "group", "people", "support"],
  technology: ["tech", "digital", "computer", "software", "coding", "programming", "online", "virtual", "data", "app"],
  health: ["health", "wellness", "medical", "care", "therapy", "mental", "physical", "fitness", "nutrition", "senior"],
  arts: ["art", "creative", "music", "culture", "design", "painting", "theater", "dance", "literature", "performance"]
};

interface MatchingScore {
  initiativeId: string;
  score: number;
  reasons: string[];
}

export const getRecommendedInitiatives = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    // Get user's latest Ikigai response
    const ikigaiResponse = await IkigaiResponse.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('answers.questionId');

    if (!ikigaiResponse) {
      return res.status(200).send({
        data: [],
        success: true,
        message: "No Ikigai test results found. Please take the test first.",
      });
    }

    // Get all initiatives
    const initiatives = await Initiative.find()
      .populate('userId', 'name email')
      .populate('goals', 'name');

    if (initiatives.length === 0) {
      return res.status(200).send({
        data: [],
        success: true,
        message: "No initiatives available for matching.",
      });
    }

    // Calculate matching scores
    const matchingScores: MatchingScore[] = initiatives.map(initiative => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Tag-based matching (40% weight)
      const tagScore = calculateTagMatchingScore(ikigaiResponse, initiative);
      score += tagScore * 0.4;
      if (tagScore > 0) {
        reasons.push(`Matches your interests based on Ikigai categories`);
      }

      // 2. Semantic matching (35% weight)
      const semanticScore = calculateSemanticMatchingScore(ikigaiResponse, initiative);
      score += semanticScore * 0.35;
      if (semanticScore > 0) {
        reasons.push(`Content aligns with your preferences`);
      }

      // 3. Location preference (15% weight)
      const locationScore = calculateLocationScore(initiative);
      score += locationScore * 0.15;
      if (locationScore > 0) {
        reasons.push(`Location matches your preferences`);
      }

      // 4. Initiative popularity/activity (10% weight)
      const popularityScore = calculatePopularityScore(initiative);
      score += popularityScore * 0.1;
      if (popularityScore > 0) {
        reasons.push(`Active and popular initiative`);
      }

      return {
        initiativeId: initiative._id.toString(),
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        reasons
      };
    });

    // Sort by score (highest first) and get top recommendations
    const sortedScores = matchingScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 recommendations

    // Get full initiative details for recommendations
    const recommendedInitiatives = sortedScores.map(score => {
      const initiative = initiatives.find(init => init._id.toString() === score.initiativeId);
      return {
        ...initiative?.toObject(),
        matchingScore: score.score,
        matchingReasons: score.reasons
      };
    });

    return res.status(200).send({
      data: recommendedInitiatives,
      success: true,
      message: "Recommended initiatives retrieved successfully.",
    });

  } catch (error) {
    next(error);
  }
};

// Helper function to calculate tag-based matching score
function calculateTagMatchingScore(ikigaiResponse: any, initiative: any): number {
  let score = 0;
  const userCategories = ikigaiResponse.totalScores;
  
  // Get the user's strongest category
  const strongestCategory = Object.keys(userCategories).reduce((a, b) => 
    userCategories[a] > userCategories[b] ? a : b
  );

  // Check matching tags in motivations
  if (initiative.whatMovesThisInitiative) {
    const matchingTags = initiative.whatMovesThisInitiative.filter((tag: string) =>
      ikigaiToTagsMapping[strongestCategory as keyof typeof ikigaiToTagsMapping]?.includes(tag)
    );
    score += matchingTags.length * 2;
  }

  // Check matching tags in areas covered
  if (initiative.whichAreasAreCoveredByThisInitiative) {
    const matchingAreas = initiative.whichAreasAreCoveredByThisInitiative.filter((area: string) =>
      ikigaiToTagsMapping[strongestCategory as keyof typeof ikigaiToTagsMapping]?.includes(area)
    );
    score += matchingAreas.length * 1.5;
  }

  // Check matching tags in services needed
  if (initiative.servicesNeeded) {
    const matchingServices = initiative.servicesNeeded.filter((service: string) =>
      ikigaiToTagsMapping[strongestCategory as keyof typeof ikigaiToTagsMapping]?.includes(service)
    );
    score += matchingServices.length * 1;
  }

  return Math.min(score, 10); // Cap at 10 points
}

// Helper function to calculate semantic matching score
function calculateSemanticMatchingScore(ikigaiResponse: any, initiative: any): number {
  let score = 0;
  const userCategories = ikigaiResponse.totalScores;
  const strongestCategory = Object.keys(userCategories).reduce((a, b) => 
    userCategories[a] > userCategories[b] ? a : b
  );

  // Combine initiative text for analysis
  const initiativeText = [
    initiative.initiativeName || '',
    initiative.description || '',
    ...(initiative.whatMovesThisInitiative || []),
    ...(initiative.whichAreasAreCoveredByThisInitiative || []),
    ...(initiative.servicesNeeded || [])
  ].join(' ').toLowerCase();

  // Check semantic keywords based on user's strongest category
  if (strongestCategory === 'passion') {
    score += checkSemanticKeywords(initiativeText, ['arts', 'environmental']);
  } else if (strongestCategory === 'mission') {
    score += checkSemanticKeywords(initiativeText, ['community', 'health', 'environmental']);
  } else if (strongestCategory === 'profession') {
    score += checkSemanticKeywords(initiativeText, ['technology', 'education']);
  } else if (strongestCategory === 'vocation') {
    score += checkSemanticKeywords(initiativeText, ['technology', 'education', 'community']);
  }

  return Math.min(score, 10); // Cap at 10 points
}

// Helper function to check semantic keywords
function checkSemanticKeywords(text: string, categories: string[]): number {
  let score = 0;
  categories.forEach(category => {
    const keywords = semanticKeywords[category as keyof typeof semanticKeywords] || [];
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 1;
      }
    });
  });
  return score;
}

// Helper function to calculate location score (placeholder - could be enhanced with user location)
function calculateLocationScore(initiative: any): number {
  // For now, give all initiatives the same location score
  // In the future, this could be enhanced to match user's location
  return 5; // Neutral score
}

// Helper function to calculate popularity score
function calculatePopularityScore(initiative: any): number {
  const applicantCount = initiative.applicants?.length || 0;
  const daysSinceCreated = Math.floor((Date.now() - new Date(initiative.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  // Score based on applicants and recency
  let score = Math.min(applicantCount * 0.5, 5); // Max 5 points for applicants
  if (daysSinceCreated < 30) {
    score += 2; // Bonus for recent initiatives
  } else if (daysSinceCreated > 180) {
    score -= 1; // Slight penalty for very old initiatives
  }
  
  return Math.max(0, Math.min(score, 10)); // Keep between 0 and 10
}

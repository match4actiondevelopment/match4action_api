// scripts/seedIkigaiQuestions.ts
import mongoose from "mongoose";
import { IkigaiQuestion } from "../models/IkigaiQuestion";

const questions = [
  {
    text: "What are you passionate about?",
    options: [
      { text: "Helping others", value: 1, category: "mission" },
      { text: "Creative expression", value: 1, category: "passion" },
      { text: "Learning new things", value: 1, category: "vocation" },
      { text: "Outdoor activities", value: 1, category: "passion" },
    ],
  },
  {
    text: "What are your skills?",
    options: [
      { text: "Communication and people skills", value: 1, category: "mission" },
      { text: "Technical skills", value: 1, category: "profession" },
      { text: "Organizational and planning skills", value: 1, category: "profession" },
      { text: "Problem-solving skills", value: 1, category: "vocation" },
    ],
  },
  {
    text: "What do you value most?",
    options: [
      { text: "Financial stability", value: 1, category: "profession" },
      { text: "Flexibility and autonomy", value: 1, category: "profession" },
      { text: "Meaningful work", value: 1, category: "mission" },
      { text: "Innovation and creativity", value: 1, category: "passion" },
    ],
  },
  {
    text: "What are your personal goals?",
    options: [
      { text: "Helping others and making a positive impact", value: 1, category: "mission" },
      { text: "Advancing in your career", value: 1, category: "profession" },
      { text: "Personal growth and development", value: 1, category: "vocation" },
      { text: "Travel and adventure", value: 1, category: "passion" },
    ],
  },
  {
    text: "What type of environment do you prefer?",
    options: [
      { text: "Working with others in a team environment", value: 1, category: "mission" },
      { text: "Working independently", value: 1, category: "profession" },
      { text: "Fast-paced and dynamic environment", value: 1, category: "vocation" },
      { text: "Calm and peaceful environment", value: 1, category: "passion" },
    ],
  },
  {
    text: "What motivates you?",
    options: [
      { text: "Helping others and making a difference", value: 1, category: "mission" },
      { text: "Solving complex problems", value: 1, category: "profession" },
      { text: "Achieving goals and targets", value: 1, category: "profession" },
      { text: "Being creative and innovative", value: 1, category: "passion" },
    ],
  },
  {
    text: "What do you find challenging?",
    options: [
      { text: "Meeting new people and building relationships", value: 1, category: "mission" },
      { text: "Analyzing complex data and information", value: 1, category: "profession" },
      { text: "Managing multiple projects and tasks", value: 1, category: "profession" },
      { text: "Creatively solving problems", value: 1, category: "passion" },
    ],
  },
  {
    text: "What do you find fulfilling?",
    options: [
      { text: "Working with others towards a common goal", value: 1, category: "mission" },
      { text: "Accomplishing difficult tasks and challenges", value: 1, category: "profession" },
      { text: "Seeing the positive impact of your work", value: 1, category: "mission" },
      { text: "Being creative and innovative", value: 1, category: "passion" },
    ],
  },
  {
    text: "What type of work/volunteer schedule do you prefer?",
    options: [
      { text: "Regular 9 to 5 schedule", value: 1, category: "profession" },
      { text: "Flexible schedule", value: 1, category: "profession" },
      { text: "Irregular and varied schedule", value: 1, category: "passion" },
      { text: "Work from home schedule", value: 1, category: "profession" },
    ],
  },
  {
    text: "What is your ideal work-life balance?",
    options: [
      { text: "Focusing mainly on work", value: 1, category: "profession" },
      { text: "Balancing work and personal life equally", value: 1, category: "profession" },
      { text: "Focusing mainly on personal life", value: 1, category: "passion" },
      { text: "A flexible work-life balance based on current needs", value: 1, category: "profession" },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect("mongodb://localhost:27017/match4action");
    console.log("Connected to MongoDB.");

    // Clear existing questions if any
    await IkigaiQuestion.deleteMany({});

    // Insert questions
    await IkigaiQuestion.insertMany(questions);
    console.log("Ikigai questions inserted successfully.");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Error seeding Ikigai questions:", err);
    await mongoose.disconnect();
  }
}

seed();

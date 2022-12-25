import { model, Schema } from 'mongoose';

export enum GoalsEnum {
  'GOAL_1' = 'No Poverty',
  'GOAL_2' = 'Zero Hunger',
  'GOAL_3' = 'Good Health and Well-being',
  'GOAL_4' = 'Quality Education',
  'GOAL_5' = 'Gender Equality',
  'GOAL_6' = 'Clean Water and Sanitation',
  'GOAL_7' = 'Affordable and Clean Energy',
  'GOAL_8' = 'Decent Work and Economic Growth',
  'GOAL_9' = 'Industry, Innovation and Infrastructure',
  'GOAL_10' = 'Reduced Inequality',
  'GOAL_11' = 'Sustainable Cities and Communities',
  'GOAL_12' = 'Responsible Consumption and Production',
  'GOAL_13' = 'Climate Action',
  'GOAL_14' = 'Life Below Water',
  'GOAL_15' = 'Life on Land',
  'GOAL_16' = 'Peace and Justice Strong Institutions',
  'GOAL_17' = 'Partnerships to achieve the Goal',
}

export interface GoalI {
  orderId: number;
  name: string;
}

export const Goal = model(
  'Goal',
  new Schema<GoalI>({
    name: {
      type: String,
      enum: Object.values(GoalsEnum),
      required: true,
      unique: true,
    },
    orderId: {
      type: Number,
      required: true,
      unique: true,
    },
  })
);

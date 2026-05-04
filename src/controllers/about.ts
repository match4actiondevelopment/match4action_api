import { NextFunction, Request, Response } from "express";
import { AboutUsInfo } from "../models/AboutUsInfo";

export const getAboutUs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let about = await AboutUsInfo.findOne();
    if (!about) {
      about = await AboutUsInfo.create({});
    }
    return res.status(200).send({
      success: true,
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAboutUs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentHtml } = req.body;
    let about = await AboutUsInfo.findOne();
    if (!about) {
      about = await AboutUsInfo.create({ contentHtml });
    } else {
      about.contentHtml = contentHtml;
      await about.save();
    }
    return res.status(200).send({
      success: true,
      data: about,
      message: "About Us content updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAbout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AboutUsInfo.deleteMany({});
    return res.status(200).send({ success: true, message: "About Us content deleted" });
  } catch (error) {
    next(error);
  }
};

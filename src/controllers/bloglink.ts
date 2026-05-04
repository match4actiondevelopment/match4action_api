import { Request, Response, NextFunction } from "express";
import { BlogLink } from "../models/BlogLink";

export const getBlogLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let blogLink = await BlogLink.findOne();
    if (!blogLink) {
      blogLink = await BlogLink.create({ url: "https://medium.com/@info_66495" });
    }
    return res.status(200).send({
      success: true,
      data: blogLink,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlogLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    let blogLink = await BlogLink.findOne();
    if (!blogLink) {
      blogLink = await BlogLink.create({ url });
    } else {
      blogLink.url = url;
      await blogLink.save();
    }
    return res.status(200).send({
      success: true,
      data: blogLink,
      message: "Blog Link updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

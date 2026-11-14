import type { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({
      message: 'No image upload.'
    });
    return;
  }

  res.status(201).json({
    message: 'Image uploaded successfully.',
    imagePath: `/images/${req.file.filename}`
  });
}
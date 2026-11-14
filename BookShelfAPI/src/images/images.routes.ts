import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.ts';
import { uploadImage } from './images.controller.ts';

const router = Router();

router.post('/images/upload', upload.single('coverImage'), uploadImage);

export default router;
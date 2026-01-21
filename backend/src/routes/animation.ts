import express from 'express';
import { convertTextToSign } from '../controllers/animationController';

const router = express.Router();

router.post('/convert', convertTextToSign);

export default router;

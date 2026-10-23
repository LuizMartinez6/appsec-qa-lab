import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

export const adminRouter = Router();
adminRouter.use(requireAuthentication)
adminRouter.use(requireRole('admin'))

adminRouter.get('/dashboard', (req, res) => {
    return res.json({
        message: 'Area administrativa'
    })
})
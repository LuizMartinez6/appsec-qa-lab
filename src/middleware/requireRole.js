export function requireRole(requiredRole) {
  return (req, res, next) => {

    if (!req.currentUser) {
      return res.status(401).json({
        error: 'Autenticação necessária'
      });
    }
    
    if(req.currentUser?.role !== requiredRole) {
        return res.status(403).json({ 
            error: 'Você não tem permissões necessárias'
        })
    }
    
    next();
  };
}
import { useState, useEffect } from 'react';
import { hasWritePermission, canApprove, isReadOnly } from '@/lib/permissions';

export function usePermissions(module: string) {
  const [userRole, setUserRole] = useState<string>('');
  const [canWrite, setCanWrite] = useState(true);
  const [canApproveDoc, setCanApproveDoc] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [module]);

  const checkPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const role = data.user.role;
        
        setUserRole(role);
        setCanWrite(hasWritePermission(role, module));
        setReadOnly(isReadOnly(role, module));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setLoading(false);
    }
  };

  const checkApprovalPermission = (documentType: string) => {
    return canApprove(userRole as any, documentType);
  };

  return {
    userRole,
    canWrite,
    canApproveDoc: checkApprovalPermission,
    readOnly,
    loading,
  };
}

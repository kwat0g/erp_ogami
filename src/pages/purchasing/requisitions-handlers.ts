// Handler functions for PR operations
export const handleEdit = (pr: any, setEditingPR: any, setFormData: any, setPrItems: any, setShowForm: any) => {
  setEditingPR(pr);
  setFormData({
    prDate: pr.prDate,
    department: pr.department,
    requiredDate: pr.requiredDate || '',
    notes: pr.notes || '',
    sourceType: pr.sourceType || 'MANUAL',
    sourceReference: pr.sourceReference || '',
  });
  
  // Fetch PR items
  const token = localStorage.getItem('token');
  fetch(`/api/purchasing/requisitions/${pr.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (data.requisition && data.requisition.items) {
        setPrItems(data.requisition.items.map((item: any) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          estimatedUnitPrice: item.estimatedUnitPrice,
          estimatedTotalPrice: item.estimatedTotalPrice,
          requiredDate: item.requiredDate || '',
          purpose: item.purpose || '',
        })));
      }
      setShowForm(true);
    })
    .catch(error => console.error('Error fetching PR details:', error));
};

export const handleDelete = async (id: string, fetchRequisitions: any) => {
  if (!confirm('Are you sure you want to delete this PR? This action cannot be undone.')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/purchasing/requisitions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert('PR deleted successfully');
      fetchRequisitions();
    } else {
      const data = await response.json();
      alert(data.message || 'Error deleting PR');
    }
  } catch (error) {
    console.error('Error deleting PR:', error);
    alert('Error deleting PR');
  }
};

export const handleConvertToPO = (prId: string, setSelectedPRForConvert: any, setShowConvertModal: any) => {
  setSelectedPRForConvert(prId);
  setShowConvertModal(true);
};

export const convertToPO = async (
  selectedPRForConvert: string | null,
  convertFormData: any,
  fetchRequisitions: any,
  setShowConvertModal: any,
  setConvertFormData: any,
  router: any
) => {
  if (!selectedPRForConvert) return;

  if (!convertFormData.supplierId) {
    alert('Please select a supplier');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/purchasing/orders/convert-from-pr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        prId: selectedPRForConvert,
        supplierId: convertFormData.supplierId,
        deliveryDate: convertFormData.deliveryDate || null,
        deliveryAddress: convertFormData.deliveryAddress || null,
        paymentTerms: convertFormData.paymentTerms || null,
        notes: convertFormData.notes || null,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert('PO created successfully from PR');
      setShowConvertModal(false);
      setConvertFormData({
        supplierId: '',
        deliveryDate: '',
        deliveryAddress: '',
        paymentTerms: '',
        notes: '',
      });
      fetchRequisitions();
      // Optionally navigate to PO page
      if (router && data.poId) {
        router.push(`/purchasing/orders`);
      }
    } else {
      const data = await response.json();
      alert(data.message || 'Error converting PR to PO');
    }
  } catch (error) {
    console.error('Error converting PR to PO:', error);
    alert('Error converting PR to PO');
  }
};

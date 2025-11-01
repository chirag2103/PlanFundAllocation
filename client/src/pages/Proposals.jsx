import React, { useState } from 'react';
import axios from 'axios';
function ProposalForm({ user }) {
  const [proposal, setProposal] = useState({
    item: '',
    amount: '',
    description: '',
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('/api/proposals', {
        ...proposal,
        faculty: user._id,
        department: user.department,
      })
      .then(() => alert('Proposal submitted!'));
  };
  return (
    <form className='container' onSubmit={handleSubmit}>
      {/* Select item, enter amount/desc, submit */}
    </form>
  );
}
export default ProposalForm;

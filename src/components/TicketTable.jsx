import React, { useState } from 'react';
import PolishedTicketCard from './PolishedTicketCard';

const TicketTable = ({ tickets, onViewDetails, onStatusChange,onChat }) => {
  if (!tickets || tickets.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No tickets found in this category.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tickets.map((ticket) => (
        <PolishedTicketCard key={ticket._id} ticket={ticket} onViewDetails={onViewDetails} onStatusChange={onStatusChange} onChat={onChat} />
      ))}
    </div>
  );
};

export default TicketTable;
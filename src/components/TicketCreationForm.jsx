import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const TicketCreationForm = ({ onSubmit, onCancel, userRole, companyId }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    siteAddress: "",
    workDescription: "",
    amount: "",
    expertiseRequired: [],
    requiredEngineers: 1, // Default to 1
  });

  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExpertiseChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      expertiseRequired: prev.expertiseRequired.includes(value)
        ? prev.expertiseRequired.filter((ex) => ex !== value)
        : [...prev.expertiseRequired, value],
    }));
  };

  const handlePlaceSelect = ({ address, latitude, longitude }) => {
    setFormData((prev) => ({ ...prev, siteAddress: address }));
    setCoordinates({ latitude, longitude });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { companyName, siteAddress, workDescription, amount, expertiseRequired, requiredEngineers } = formData;

    if (
      !companyName.trim() ||
      !siteAddress.trim() ||
      !workDescription.trim() ||
      !amount ||
      !coordinates.latitude ||
      expertiseRequired.length === 0 ||
      !requiredEngineers ||
      requiredEngineers < 1
    ) {
      toast.error("Please fill all fields, select a valid address, and specify at least one required engineer.");
      setIsSubmitting(false);
      return;
    }

    const ticket = {
      ...formData,
      amount: parseFloat(amount),
      coordinates,
      requiredEngineers: parseInt(requiredEngineers),
    };

    if (userRole === 'Company Admin' && companyId) {
      ticket.companyId = companyId;
    }

    onSubmit(ticket);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground p-6 rounded-lg shadow-xl">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">Create New Ticket</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details and select an address from suggestions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-base">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="h-10 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteAddress" className="text-base">Site Address</Label>
            <AddressAutocomplete
              value={formData.siteAddress}
              onChange={(val) => setFormData((prev) => ({ ...prev, siteAddress: val }))}
              onSelect={handlePlaceSelect}
              placeholder="Start typing site address..."
              className="h-10 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workDescription" className="text-base">Work Description</Label>
            <Textarea
              id="workDescription"
              name="workDescription"
              value={formData.workDescription}
              onChange={handleChange}
              className="min-h-[80px] text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              className="h-10 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredEngineers" className="text-base">Required Engineers</Label>
            <Input
              id="requiredEngineers"
              name="requiredEngineers"
              type="number"
              value={formData.requiredEngineers}
              onChange={handleChange}
              className="h-10 text-base"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Expertise</Label>
            <div className="flex items-center space-x-6 pt-2">
              <label className="flex items-center space-x-2 text-base cursor-pointer">
                <input
                  type="checkbox"
                  value="Networking"
                  checked={formData.expertiseRequired.includes("Networking")}
                  onChange={() => handleExpertiseChange("Networking")}
                  className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <span>Networking</span>
              </label>
              <label className="flex items-center space-x-2 text-base cursor-pointer">
                <input
                  type="checkbox"
                  value="CCTV"
                  checked={formData.expertiseRequired.includes("CCTV")}
                  onChange={() => handleExpertiseChange("CCTV")}
                  className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <span>CCTV</span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketCreationForm;

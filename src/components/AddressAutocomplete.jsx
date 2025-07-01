// src/components/AddressAutocomplete.jsx
import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

const AddressAutocomplete = ({ value, onChange, onSelect, placeholder }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      componentRestrictions: { country: "in" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.formatted_address) {
        return;
      }

      const address = place.formatted_address;
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      onChange(address);
      onSelect({ address, latitude, longitude });
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onSelect]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Enter address..."}
      name="siteAddress"
    />
  );
};

export default AddressAutocomplete;

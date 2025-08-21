import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";

const SubCategorySelect = ({
  control,
  errors,
  selectedCategory,
  prevSubCategory,
  setSubcategories,
  subcategories,
}) => {

  useEffect(() => {
    axiosInstance
      .get("subcategory/get")
      .then((res) => setSubcategories(res.data.subcategories))
      .catch((err) => console.error("Failed to fetch subcategories:", err));
  }, []);

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category === selectedCategory
  );

  return (
    <div>
      <Label className="block mb-2">Sub Category *</Label>
      <Controller
        name="subcategory"
        control={control}
        defaultValue={prevSubCategory || ""}
        render={({ field }) => (
          <Select
            // disabled={!selectedCategory}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Select sub category" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubcategories.map((value) => (
                <SelectItem key={value._id} value={value._id}>
                  {value.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors?.subcategory && (
        <p className="text-xs text-red-500 mt-1">
          {errors.subcategory.message}
        </p>
      )}
    </div>
  );
};

export default SubCategorySelect;

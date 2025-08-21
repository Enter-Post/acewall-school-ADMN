import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/AxiosInstance";
import { sub } from "date-fns";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";

const CategorySelect = ({
  control,
  errors,
  onCategoryChange,
  prevCategory,
  categories,
  setCategories,
}) => {

  useEffect(() => {
    const fetchCategoriesWithSubcategories = async () => {
      try {
        const res = await axiosInstance.get("/category/get");
        const allCategories = res.data?.categories || [];
        const validCategories = [];

        await Promise.allSettled(
          allCategories.map(async (cat) => {
            if (!cat._id) return;
            try {
              const sub = await axiosInstance.get(
                `/category/subcategories/${cat._id}`
              );
              if (sub.data?.subcategories?.length > 0)
                validCategories.push(cat);
            } catch {}
          })
        );

        setCategories(validCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err.message);
      }
    };

    fetchCategoriesWithSubcategories();
  }, []);

  console.log(categories, "categories");


  return
  // Ensure defaultValue is set only once, and update value if prevCategory changes
  return (
    <div>
      <Label className="block mb-2">Category *</Label>
      <Controller
        name="category"
        control={control}
        // defaultValue={"f6840e263cacb34164983440b"}
        shouldUnregister={false}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={(value) => {
              console.log(value, "value in select");
              field.onChange(value);
              onCategoryChange?.(value);
            }}
          >
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.length > 0 ? (
                categories?.map((value) => (
                  <SelectItem key={value._id} value={value._id}>
                    {value.title}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  No categories with subcategories
                </div>
              )}
            </SelectContent>
          </Select>
        )}
      />
      {errors?.category && (
        <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
      )}
    </div>
  );
};

export default CategorySelect;

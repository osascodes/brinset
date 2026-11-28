import { z } from "zod";

export const businessCategories = [
  "Fashion",
  "Electronics",
  "Supermarket/Grocery",
  "Beauty & Cosmetics",
  "Food & Drinks",
  "Other",
  "Retail",
  "Gadgets",
  "Cosmetics",
  "Food",
  "WhatsApp seller",
] as const;

export const onboardingSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  category: z.enum(businessCategories),
});

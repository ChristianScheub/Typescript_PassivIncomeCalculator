import { useForm, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";

export function useAssetForm<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  defaultValues?: DefaultValues<T>
) {
  const { t } = useTranslation();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const formUtils = {
    handleSubmit,
    watch,
    setValue,
    errors,
    reset,
    t,
  };

  return formUtils;
}

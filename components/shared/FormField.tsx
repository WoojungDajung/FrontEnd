import { cn } from "@/utils/cn";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  inputId?: string;
  required?: boolean;
  description?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  children?: ReactNode
}

const FormField = ({
  label,
  inputId,
  required,
  description,
  labelClassName,
  wrapperClassName,
  children
}: FormFieldProps) => {
  return (
    <div className={cn("flex flex-col gap-8", wrapperClassName)}>
      <div className="flex typo-14-medium ml-8">
        <label htmlFor={inputId} className={cn("", labelClassName)}>
          {label}
        </label>
        {required && <p className="text-error-500">*</p>}
      </div>
      {children}
      <p className="typo-14-regular text-gray-500 ml-8">{description}</p>
    </div>
  );
};

export default FormField;

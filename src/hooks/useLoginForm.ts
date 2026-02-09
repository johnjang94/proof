import { useForm, useWatch } from "react-hook-form";

export type LoginFormValues = {
  email: string;
  password: string;
};

export const isStrongPassword = (password: string) => {
  const hasLength = password.length >= 8;
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasLength && hasDigit && hasSpecial;
};

export default function useLoginForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const email = useWatch({ control, name: "email" }) ?? "";
  const password = useWatch({ control, name: "password" }) ?? "";

  const emailOk = email.trim().length > 0;
  const passwordOk = isStrongPassword(password);
  const canLogin = emailOk && passwordOk;

  const emailRegister = register("email", {
    required: "Email is required",
    validate: (v) => v.trim().length > 0 || "Email is required",
  });

  const passwordRegister = register("password", {
    required: "Password is required",
    validate: (v) =>
      isStrongPassword(v) ||
      "Password must be 8+ chars and include a number + special character",
  });

  return {
    handleSubmit,
    errors,
    isSubmitting,
    canLogin,
    emailOk,
    passwordOk,
    emailRegister,
    passwordRegister,
  };
}

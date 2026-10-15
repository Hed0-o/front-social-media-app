import { Link } from "react-router-dom";
import {
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";

import { useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpService } from "../services/auth.service";

// Validation schema
export const signUpSchema = zod
  .object({
    fullname: zod
      .string()
      .min(3, { message: "Full name must be at least 3 characters" })
      .max(20, { message: "Full name cannot exceed 20 characters" }),

    email: zod
      .string()
      .email({ message: "Please enter a valid email address" }),

    password: zod
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        },
      ),

    cPassword: zod.string().min(1, { message: "Please confirm your password" }),

    birthDate: zod.string().min(1, { message: "Birth date is required" }),

    gender: zod.enum(["Male", "Female"], {
      error: "Please select a valid gender",
    }),
  })
  .refine((data) => data.password === data.cPassword, {
    message: "Passwords do not match",
    path: ["cPassword"],
  });

// Derive the TypeScript type from the schema
type SignUpInputs = zod.infer<typeof signUpSchema>;

// Submit handler
async function signUpHandler(values: SignUpInputs) {
  try {
    const response = await signUpService(values);

    console.log("Response Data:", response);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      console.log("Response Error:", error.response);
    } else {
      console.error("Sign up failed:", error);
    }
  }
}

export default function SignUp() {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<SignUpInputs>({
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      cPassword: "",
      birthDate: "",
      gender: "Male",
    },
    resolver: zodResolver(signUpSchema),
  });

  return (
    <div className="space-y-7">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-lg shadow-primary/20">
          S
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>

        <p className="mt-2 text-sm leading-6 text-default-500">
          Join Social and start connecting with others
        </p>
      </div>

      <form onSubmit={handleSubmit(signUpHandler)} className="space-y-5">
        <TextField isInvalid={!!errors.fullname}>
          <Label className="mb-1.5 text-sm font-semibold text-foreground">
            Full name
          </Label>
          <Input
            {...register("fullname")}
            placeholder="Enter your full name"
            className="h-12 w-full"
          />
          <FieldError>{errors.fullname?.message}</FieldError>
        </TextField>

        <TextField isInvalid={!!errors.email}>
          <Label className="mb-1.5 text-sm font-semibold text-foreground">
            Email
          </Label>
          <Input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className="h-12 w-full"
          />
          <FieldError>{errors.email?.message}</FieldError>
        </TextField>

        <TextField isInvalid={!!errors.password}>
          <Label className="mb-1.5 text-sm font-semibold text-foreground">
            Password
          </Label>
          <Input
            type="password"
            {...register("password")}
            placeholder="Create a password"
            className="h-12 w-full"
          />
          <FieldError>{errors.password?.message}</FieldError>
        </TextField>

        <TextField isInvalid={!!errors.cPassword}>
          <Label className="mb-1.5 text-sm font-semibold text-foreground">
            Confirm password
          </Label>
          <Input
            type="password"
            {...register("cPassword")}
            placeholder="Confirm your password"
            className="h-12 w-full"
          />
          <FieldError>{errors.cPassword?.message}</FieldError>
        </TextField>

        <TextField isInvalid={!!errors.birthDate}>
          <Label className="mb-1.5 text-sm font-semibold text-foreground">
            Date of birth
          </Label>
          <Input
            type="date"
            {...register("birthDate")}
            className="h-12 w-full"
          />
          <FieldError>{errors.birthDate?.message}</FieldError>
        </TextField>

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              className="w-full"
              placeholder="Select your gender"
              selectedKey={field.value}
              onSelectionChange={(key) => {
                if (key === "Male" || key === "Female") {
                  field.onChange(key);
                }
              }}
              onBlur={field.onBlur}
              isInvalid={!!errors.gender}
            >
              <Label className="mb-1.5 text-sm font-semibold text-foreground">
                Gender
              </Label>

              <Select.Trigger className="h-12 w-full">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>

              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="Male" textValue="Male">
                    Male
                    <ListBox.ItemIndicator />
                  </ListBox.Item>

                  <ListBox.Item id="Female" textValue="Female">
                    Female
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>

              <FieldError>{errors.gender?.message}</FieldError>
            </Select>
          )}
        />

        <Button
          type="submit"
          variant="primary"
          className="h-12 w-full text-sm font-bold shadow-lg shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5"
        >
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm text-default-500">
        Already have an account?{" "}
        <Link
          to="/auth/signin"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

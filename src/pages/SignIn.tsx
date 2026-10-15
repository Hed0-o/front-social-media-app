import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Label, TextField, FieldError } from "@heroui/react";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { signinService } from "../services/auth.service";
import { AuthContext } from "../context/AuthContext";

type SignInInputs = {
  email: string;
  password: string;
};

const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),

  password: zod.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export default function SignIn() {
  const [serverError, setServerError] = useState("");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignInInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(SignInSchema),
    mode: "onTouched",
  });

  const { setAuthUser, setIsLoggedIn } = useContext(AuthContext)!;
  const navigate = useNavigate();

  async function signInHandler(values: SignInInputs) {
    setServerError("");

    try {
      const response = await signinService(values);
      const { token, user } = response.data;

      if (!token || !user) {
        setServerError(
          "The server returned an invalid response. Please try again.",
        );
        return;
      }

      localStorage.setItem("token", token);

      setAuthUser(user);
      setIsLoggedIn(true);

      navigate("/social");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        const message =
          responseData?.message ||
          responseData?.error ||
          responseData?.errors?.[0]?.message ||
          responseData?.errors?.[0] ||
          (error.response?.status === 401
            ? "Incorrect email or password."
            : error.response?.status === 404
              ? "No account was found with these details."
              : error.response?.status === 429
                ? "Too many attempts. Please wait and try again."
                : !error.response
                  ? "Unable to connect to the server. Check your internet connection."
                  : "Sign in failed. Please try again.");

        setServerError(
          typeof message === "string"
            ? message
            : "Sign in failed. Please try again.",
        );
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="space-y-7">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-lg shadow-primary/20">
          S
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-default-500">
          Sign in to continue to your Social account
        </p>
      </div>

      <form onSubmit={handleSubmit(signInHandler)} className="space-y-5">
        <TextField isInvalid={!!errors.email}>
          <Label className="mb-1.5 text-sm font-semibold text-foreground">
            Email
          </Label>

          <Input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="h-12 w-full"
            onChange={() => setServerError("")}
          />

          <FieldError>{errors.email?.message}</FieldError>
        </TextField>

        <TextField isInvalid={!!errors.password}>
          <Label className="mb-1.5 text-sm font-semibold text-foreground">
            Password
          </Label>

          <Input
            {...register("password")}
            type="password"
            placeholder="Enter your password"
            className="h-12 w-full"
            onChange={() => setServerError("")}
          />

          <FieldError>{errors.password?.message}</FieldError>
        </TextField>

        {serverError && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
          >
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          isDisabled={isSubmitting}
          className="h-12 w-full text-sm font-bold shadow-lg shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-default-200" />

        <span className="text-xs font-medium text-default-400">
          New to Social?
        </span>

        <div className="h-px flex-1 bg-default-200" />
      </div>

      <Link
        to="/auth/signup"
        className="flex h-12 w-full items-center justify-center rounded-xl border border-default-200 bg-background text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      >
        Create an account
      </Link>
    </div>
  );
}

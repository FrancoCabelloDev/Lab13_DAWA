'use client';

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";

const parseSignInError = (error?: string | null) => {
  if (!error) return null;
  if (error.startsWith("ACCOUNT_LOCKED:")) {
    const [, dateString] = error.split(":");
    const lockedUntil = new Date(dateString);
    return `Cuenta bloqueada hasta ${lockedUntil.toLocaleTimeString()}.`;
  }
  if (error === "INVALID_CREDENTIALS" || error === "CredentialsSignin") {
    return "Correo o contraseña incorrectos.";
  }
  return "No se pudo iniciar sesión. Inténtalo otra vez.";
};

export default function LoginPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsSignin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/dashboard",
      email: formValues.email,
      password: formValues.password,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setErrorMessage(parseSignInError(result.error));
      return;
    }

    router.push("/dashboard");
  };

  const handleProviderSignin = (provider: "google" | "github") => {
    setErrorMessage(null);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-gray-800 font-bold mb-6 text-center">
          Iniciar sesión
        </h1>

        <form className="space-y-4" onSubmit={handleCredentialsSignin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={formValues.email}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formValues.password}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            />
          </div>
          {errorMessage && (
            <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-70"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleProviderSignin("google")}
            className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            <FaGoogle />
            Continuar con Google
          </button>
          <button
            onClick={() => handleProviderSignin("github")}
            className="flex items-center justify-center gap-2 w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 transition"
          >
            <FaGithub />
            Continuar con GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-black underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

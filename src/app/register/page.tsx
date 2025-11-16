'use client';

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialForm = { name: "", email: "", password: "" };

export default function RegisterPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error ?? "No se pudo registrar la cuenta.");
      } else {
        setSuccessMessage("Registro exitoso. Redirigiendo al inicio de sesión.");
        setFormValues(initialForm);
        setTimeout(() => router.push("/signin"), 800);
      }
    } catch (error) {
      setErrorMessage("No se pudo contactar al servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-gray-800 font-bold mb-6 text-center">
          Crear cuenta
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={formValues.name}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
            />
          </div>
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
              minLength={6}
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
          {successMessage && (
            <p className="rounded bg-green-100 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800 transition disabled:opacity-70"
          >
            {isSubmitting ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/signin" className="font-semibold text-black underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

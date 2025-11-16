import { NextResponse } from "next/server";

import { registerUser, UserExistsError } from "@/lib/userStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body ?? {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    await registerUser({ name, email, password });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UserExistsError) {
      return NextResponse.json(
        { error: "El correo ya está registrado." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo completar el registro. Inténtalo más tarde." },
      { status: 500 }
    );
  }
}

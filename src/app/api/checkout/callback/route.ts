import { redirect } from "next/navigation";

export async function GET() {
  redirect("/checkout?pagamento=autenticado");
}

export async function POST() {
  redirect("/checkout?pagamento=autenticado");
}

import { redirect } from "next/navigation"
import { getSessao } from "@/lib/auth/server"

export default async function Home() {
  const sessao = await getSessao()

  if (!sessao) {
    redirect("/login")
  }

  switch (sessao.role) {
    case "professor":
      redirect("/dashboard/professor")
    case "coordenador":
      redirect("/dashboard/coordenador")
    case "aluno":
      redirect("/dashboard/aluno")
    default:
      redirect("/login")
  }
}
